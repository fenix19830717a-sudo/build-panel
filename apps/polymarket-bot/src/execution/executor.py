"""
Order execution module with slippage control
"""
from decimal import Decimal, ROUND_HALF_UP
from typing import Optional, List, Dict
from datetime import datetime
from enum import Enum
from dataclasses import dataclass

from loguru import logger

from ..models import Order, OrderRequest, OrderStatus, OrderSide, OrderType
from ..api import PolymarketAPI
from ..risk import RiskManager


class ExecutionStrategy(Enum):
    MARKET = "market"  # Execute at market price
    LIMIT = "limit"    # Use limit orders
    TWAP = "twap"      # Time-weighted average price
    ICEBERG = "iceberg"  # Hide order size


@dataclass
class ExecutionConfig:
    """Execution configuration"""
    strategy: ExecutionStrategy = ExecutionStrategy.LIMIT
    max_slippage: Decimal = Decimal("0.01")  # 1%
    timeout_seconds: int = 60
    retry_attempts: int = 3
    twap_intervals: int = 5
    iceberg_display_size: Optional[Decimal] = None


class OrderExecutor:
    """Executes orders with slippage control"""
    
    def __init__(self, api: PolymarketAPI, risk_manager: RiskManager,
                 config: ExecutionConfig, dry_run: bool = False):
        self.api = api
        self.risk_manager = risk_manager
        self.config = config
        self.dry_run = dry_run
        self._active_orders: Dict[str, Order] = {}
        self._order_history: List[Order] = []
    
    async def execute(self, order_request: OrderRequest, 
                     expected_price: Optional[Decimal] = None) -> Optional[Order]:
        """
        Execute an order with slippage control
        
        Args:
            order_request: Order to execute
            expected_price: Expected execution price for slippage check
            
        Returns:
            Executed order or None if failed
        """
        if self.dry_run:
            logger.info(f"[DRY RUN] Executing order: {order_request}")
            order = await self.api.place_order(order_request, dry_run=True)
            if order:
                self._active_orders[order.id] = order
            return order
        
        # Apply execution strategy
        if self.config.strategy == ExecutionStrategy.TWAP:
            return await self._execute_twap(order_request)
        elif self.config.strategy == ExecutionStrategy.ICEBERG:
            return await self._execute_iceberg(order_request)
        else:
            return await self._execute_single(order_request, expected_price)
    
    async def _execute_single(self, order_request: OrderRequest,
                             expected_price: Optional[Decimal]) -> Optional[Order]:
        """Execute a single order"""
        # Validate price if expected price provided
        if expected_price and order_request.price:
            slippage = abs(order_request.price - expected_price) / expected_price
            if slippage > self.config.max_slippage:
                logger.warning(
                    f"Price slippage {slippage:.2%} exceeds max {self.config.max_slippage:.2%}"
                )
                # Adjust limit price
                if order_request.side == OrderSide.BUY:
                    order_request.price = expected_price * (Decimal("1") + self.config.max_slippage)
                else:
                    order_request.price = expected_price * (Decimal("1") - self.config.max_slippage)
                logger.info(f"Adjusted limit price to {order_request.price}")
        
        # Place order
        for attempt in range(self.config.retry_attempts):
            try:
                order = await self.api.place_order(order_request)
                if order:
                    self._active_orders[order.id] = order
                    logger.info(f"Order placed: {order.id}")
                    return order
            except Exception as e:
                logger.error(f"Order placement failed (attempt {attempt + 1}): {e}")
                if attempt == self.config.retry_attempts - 1:
                    return None
        
        return None
    
    async def _execute_twap(self, order_request: OrderRequest) -> Optional[Order]:
        """Execute order using TWAP strategy"""
        total_size = order_request.size
        interval_size = total_size / Decimal(self.config.twap_intervals)
        interval_size = interval_size.quantize(Decimal("0.01"), rounding=ROUND_HALF_UP)
        
        logger.info(f"TWAP execution: {self.config.twap_intervals} intervals of {interval_size}")
        
        executed_orders = []
        remaining_size = total_size
        
        for i in range(self.config.twap_intervals):
            if remaining_size <= 0:
                break
            
            size = min(interval_size, remaining_size)
            sub_request = OrderRequest(
                market_id=order_request.market_id,
                side=order_request.side,
                order_type=OrderType.LIMIT,
                size=size,
                price=order_request.price,
                time_in_force=order_request.time_in_force
            )
            
            order = await self.api.place_order(sub_request)
            if order:
                executed_orders.append(order)
                remaining_size -= size
            
            # Wait between intervals (except for last)
            if i < self.config.twap_intervals - 1:
                import asyncio
                await asyncio.sleep(self.config.timeout_seconds / self.config.twap_intervals)
        
        # Return combined order info
        if executed_orders:
            # Create virtual order representing TWAP execution
            return Order(
                id=f"twap_{executed_orders[0].id}",
                market_id=order_request.market_id,
                side=order_request.side,
                order_type=OrderType.LIMIT,
                status=OrderStatus.FILLED if remaining_size == 0 else OrderStatus.PARTIAL,
                size=total_size,
                price=order_request.price,
                filled_size=total_size - remaining_size,
                remaining_size=remaining_size,
                created_at=datetime.utcnow(),
                updated_at=datetime.utcnow()
            )
        
        return None
    
    async def _execute_iceberg(self, order_request: OrderRequest) -> Optional[Order]:
        """Execute order using iceberg strategy (hide true size)"""
        display_size = self.config.iceberg_display_size or order_request.size / Decimal("10")
        display_size = display_size.quantize(Decimal("0.01"), rounding=ROUND_HALF_UP)
        
        logger.info(f"Iceberg execution: display={display_size}, total={order_request.size}")
        
        # For iceberg, we just use the display size
        # In real implementation, would refresh order as each piece fills
        iceberg_request = OrderRequest(
            market_id=order_request.market_id,
            side=order_request.side,
            order_type=OrderType.LIMIT,
            size=display_size,
            price=order_request.price,
            time_in_force=order_request.time_in_force
        )
        
        return await self.api.place_order(iceberg_request)
    
    async def cancel_order(self, order_id: str) -> bool:
        """Cancel an active order"""
        if order_id not in self._active_orders:
            logger.warning(f"Order {order_id} not found in active orders")
            return False
        
        success = await self.api.cancel_order(order_id, dry_run=self.dry_run)
        if success:
            order = self._active_orders[order_id]
            order.status = OrderStatus.CANCELLED
            self._order_history.append(order)
            del self._active_orders[order_id]
            logger.info(f"Order cancelled: {order_id}")
        
        return success
    
    async def update_order_status(self, order_id: str) -> Optional[Order]:
        """Update status of an order from API"""
        orders = await self.api.get_orders()
        for order in orders:
            if order.id == order_id:
                if order_id in self._active_orders:
                    self._active_orders[order_id] = order
                return order
        return None
    
    async def sync_orders(self):
        """Sync all active orders with API"""
        api_orders = await self.api.get_orders()
        api_order_map = {o.id: o for o in api_orders}
        
        # Update active orders
        for order_id in list(self._active_orders.keys()):
            if order_id in api_order_map:
                self._active_orders[order_id] = api_order_map[order_id]
            else:
                # Order no longer active on API
                del self._active_orders[order_id]
    
    def get_active_orders(self) -> List[Order]:
        """Get list of active orders"""
        return list(self._active_orders.values())
    
    def get_order_history(self) -> List[Order]:
        """Get order history"""
        return self._order_history.copy()
    
    async def cancel_all_orders(self, market_id: Optional[str] = None) -> int:
        """Cancel all orders, optionally filtered by market"""
        cancelled = 0
        
        for order_id in list(self._active_orders.keys()):
            order = self._active_orders[order_id]
            if market_id and order.market_id != market_id:
                continue
            
            if await self.cancel_order(order_id):
                cancelled += 1
        
        return cancelled
