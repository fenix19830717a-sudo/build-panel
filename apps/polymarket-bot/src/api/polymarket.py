"""
Polymarket API Client
API documentation: https://docs.polymarket.com
"""
import time
import hmac
import hashlib
import base64
from decimal import Decimal
from typing import Optional, List, Dict, Any
from datetime import datetime

import httpx
from loguru import logger

from ..models import (
    Market, OrderBook, OrderBookLevel, Order, OrderRequest,
    OrderStatus, Trade, Position, OrderSide, OrderType
)
from ..utils import RateLimiter, retry_with_backoff, generate_id


class PolymarketAPI:
    """Polymarket API client"""
    
    def __init__(self, api_key: str, api_secret: str, 
                 base_url: str = "https://api.polymarket.com",
                 timeout: int = 30):
        self.api_key = api_key
        self.api_secret = api_secret
        self.base_url = base_url.rstrip("/")
        self.timeout = timeout
        
        # Rate limiter: 100 requests per second
        self.rate_limiter = RateLimiter(max_requests=100, time_window=1.0)
        
        # HTTP client
        self.client = httpx.AsyncClient(timeout=timeout)
    
    def _generate_signature(self, timestamp: str, method: str, path: str, 
                           body: str = "") -> str:
        """Generate API request signature"""
        message = f"{timestamp}{method.upper()}{path}{body}"
        signature = hmac.new(
            self.api_secret.encode(),
            message.encode(),
            hashlib.sha256
        ).hexdigest()
        return signature
    
    def _get_headers(self, method: str, path: str, body: str = "") -> Dict[str, str]:
        """Get request headers with authentication"""
        timestamp = str(int(time.time() * 1000))
        signature = self._generate_signature(timestamp, method, path, body)
        
        return {
            "POLYMARKET-API-KEY": self.api_key,
            "POLYMARKET-SIGNATURE": signature,
            "POLYMARKET-TIMESTAMP": timestamp,
            "Content-Type": "application/json"
        }
    
    async def _request(self, method: str, path: str, 
                      params: Optional[Dict] = None,
                      json_data: Optional[Dict] = None) -> Any:
        """Make authenticated request"""
        # Rate limiting
        if not self.rate_limiter.can_proceed():
            wait_time = self.rate_limiter.wait_time()
            logger.warning(f"Rate limit reached, waiting {wait_time:.2f}s")
            await time.sleep(wait_time)
        
        url = f"{self.base_url}{path}"
        body = json.dumps(json_data) if json_data else ""
        headers = self._get_headers(method, path, body)
        
        try:
            response = await self.client.request(
                method=method,
                url=url,
                headers=headers,
                params=params,
                json=json_data
            )
            response.raise_for_status()
            return response.json()
            
        except httpx.HTTPStatusError as e:
            logger.error(f"HTTP error: {e.response.status_code} - {e.response.text}")
            raise
        except Exception as e:
            logger.error(f"Request error: {e}")
            raise
    
    async def close(self):
        """Close HTTP client"""
        await self.client.aclose()
    
    # Market Data Endpoints
    
    @retry_with_backoff(max_retries=3)
    async def get_markets(self, limit: int = 100, offset: int = 0,
                         active: bool = True, 
                         condition_id: Optional[str] = None) -> List[Market]:
        """Get list of markets"""
        params = {
            "limit": limit,
            "offset": offset,
            "active": active
        }
        if condition_id:
            params["conditionId"] = condition_id
        
        data = await self._request("GET", "/markets", params=params)
        
        markets = []
        for item in data.get("markets", []):
            try:
                market = Market(
                    id=item.get("conditionId"),
                    slug=item.get("slug", ""),
                    question=item.get("question", ""),
                    description=item.get("description"),
                    category=item.get("category"),
                    outcomes=item.get("outcomes", []),
                    outcome_prices=[Decimal(str(p)) for p in item.get("outcomePrices", [])],
                    volume=Decimal(str(item.get("volume", 0))),
                    liquidity=Decimal(str(item.get("liquidity", 0))),
                    expiration_date=datetime.fromisoformat(item["endDateIso"]) if item.get("endDateIso") else None,
                    resolution_date=datetime.fromisoformat(item["resolutionDate"]) if item.get("resolutionDate") else None,
                    status=item.get("active", False) and "active" or "closed",
                    image_url=item.get("imageUrl"),
                    icon=item.get("icon")
                )
                markets.append(market)
            except Exception as e:
                logger.warning(f"Failed to parse market: {e}")
                continue
        
        return markets
    
    @retry_with_backoff(max_retries=3)
    async def get_market(self, condition_id: str) -> Optional[Market]:
        """Get market details by condition ID"""
        try:
            data = await self._request("GET", f"/markets/{condition_id}")
            
            return Market(
                id=data.get("conditionId"),
                slug=data.get("slug", ""),
                question=data.get("question", ""),
                description=data.get("description"),
                category=data.get("category"),
                outcomes=data.get("outcomes", []),
                outcome_prices=[Decimal(str(p)) for p in data.get("outcomePrices", [])],
                volume=Decimal(str(data.get("volume", 0))),
                liquidity=Decimal(str(data.get("liquidity", 0))),
                expiration_date=datetime.fromisoformat(data["endDateIso"]) if data.get("endDateIso") else None,
                resolution_date=datetime.fromisoformat(data["resolutionDate"]) if data.get("resolutionDate") else None,
                status=data.get("active", False) and "active" or "closed",
                image_url=data.get("imageUrl"),
                icon=data.get("icon")
            )
        except Exception as e:
            logger.error(f"Failed to get market {condition_id}: {e}")
            return None
    
    @retry_with_backoff(max_retries=3)
    async def get_orderbook(self, condition_id: str) -> Optional[OrderBook]:
        """Get order book for a market"""
        try:
            data = await self._request("GET", f"/markets/{condition_id}/orderbook")
            
            bids = [
                OrderBookLevel(price=Decimal(str(b["price"])), size=Decimal(str(b["size"])))
                for b in data.get("bids", [])
            ]
            asks = [
                OrderBookLevel(price=Decimal(str(a["price"])), size=Decimal(str(a["size"])))
                for a in data.get("asks", [])
            ]
            
            return OrderBook(
                market_id=condition_id,
                bids=bids,
                asks=asks,
                timestamp=datetime.utcnow()
            )
        except Exception as e:
            logger.error(f"Failed to get orderbook for {condition_id}: {e}")
            return None
    
    # Order Management
    
    @retry_with_backoff(max_retries=3)
    async def place_order(self, order: OrderRequest, dry_run: bool = False) -> Optional[Order]:
        """Place a new order"""
        if dry_run:
            logger.info(f"[DRY RUN] Would place order: {order}")
            return Order(
                id=generate_id(),
                client_order_id=order.client_order_id,
                market_id=order.market_id,
                side=order.side,
                order_type=order.order_type,
                status=OrderStatus.PENDING,
                size=order.size,
                price=order.price,
                remaining_size=order.size,
                created_at=datetime.utcnow(),
                updated_at=datetime.utcnow()
            )
        
        payload = {
            "conditionId": order.market_id,
            "side": order.side.value.upper(),
            "size": str(order.size),
            "type": order.order_type.value.upper(),
            "timeInForce": order.time_in_force
        }
        
        if order.price:
            payload["price"] = str(order.price)
        if order.client_order_id:
            payload["clientOrderId"] = order.client_order_id
        
        try:
            data = await self._request("POST", "/orders", json_data=payload)
            
            return Order(
                id=data.get("orderId"),
                client_order_id=data.get("clientOrderId"),
                market_id=order.market_id,
                side=order.side,
                order_type=order.order_type,
                status=OrderStatus(data.get("status", "pending").lower()),
                size=Decimal(str(data.get("size", 0))),
                price=Decimal(str(data["price"])) if data.get("price") else None,
                filled_size=Decimal(str(data.get("filledSize", 0))),
                remaining_size=Decimal(str(data.get("remainingSize", 0))),
                avg_fill_price=Decimal(str(data["avgFillPrice"])) if data.get("avgFillPrice") else None,
                created_at=datetime.utcnow(),
                updated_at=datetime.utcnow()
            )
        except Exception as e:
            logger.error(f"Failed to place order: {e}")
            return None
    
    @retry_with_backoff(max_retries=3)
    async def cancel_order(self, order_id: str, dry_run: bool = False) -> bool:
        """Cancel an order"""
        if dry_run:
            logger.info(f"[DRY RUN] Would cancel order: {order_id}")
            return True
        
        try:
            await self._request("DELETE", f"/orders/{order_id}")
            return True
        except Exception as e:
            logger.error(f"Failed to cancel order {order_id}: {e}")
            return False
    
    @retry_with_backoff(max_retries=3)
    async def get_orders(self, market_id: Optional[str] = None,
                        status: Optional[str] = None) -> List[Order]:
        """Get list of orders"""
        params = {}
        if market_id:
            params["conditionId"] = market_id
        if status:
            params["status"] = status
        
        try:
            data = await self._request("GET", "/orders", params=params)
            
            orders = []
            for item in data.get("orders", []):
                try:
                    order = Order(
                        id=item.get("orderId"),
                        client_order_id=item.get("clientOrderId"),
                        market_id=item.get("conditionId"),
                        side=OrderSide(item.get("side", "buy").lower()),
                        order_type=OrderType(item.get("type", "limit").lower()),
                        status=OrderStatus(item.get("status", "pending").lower()),
                        size=Decimal(str(item.get("size", 0))),
                        price=Decimal(str(item["price"])) if item.get("price") else None,
                        filled_size=Decimal(str(item.get("filledSize", 0))),
                        remaining_size=Decimal(str(item.get("remainingSize", 0))),
                        avg_fill_price=Decimal(str(item["avgFillPrice"])) if item.get("avgFillPrice") else None,
                        created_at=datetime.fromisoformat(item["createdAt"]) if item.get("createdAt") else datetime.utcnow(),
                        updated_at=datetime.fromisoformat(item["updatedAt"]) if item.get("updatedAt") else datetime.utcnow()
                    )
                    orders.append(order)
                except Exception as e:
                    logger.warning(f"Failed to parse order: {e}")
                    continue
            
            return orders
        except Exception as e:
            logger.error(f"Failed to get orders: {e}")
            return []
    
    # Portfolio / Positions
    
    @retry_with_backoff(max_retries=3)
    async def get_positions(self) -> List[Position]:
        """Get current positions"""
        try:
            data = await self._request("GET", "/portfolio/positions")
            
            positions = []
            for item in data.get("positions", []):
                try:
                    position = Position(
                        id=item.get("positionId", generate_id()),
                        market_id=item.get("conditionId"),
                        market_question=item.get("question"),
                        outcome=item.get("outcome", ""),
                        side=OrderSide(item.get("side", "buy").lower()),
                        size=Decimal(str(item.get("size", 0))),
                        avg_entry_price=Decimal(str(item.get("avgPrice", 0))),
                        current_price=Decimal(str(item.get("currentPrice", 0))),
                        unrealized_pnl=Decimal(str(item.get("unrealizedPnl", 0))),
                        realized_pnl=Decimal(str(item.get("realizedPnl", 0))),
                        status=PositionStatus(item.get("status", "open").lower()),
                        opened_at=datetime.fromisoformat(item["createdAt"]) if item.get("createdAt") else datetime.utcnow(),
                        closed_at=datetime.fromisoformat(item["closedAt"]) if item.get("closedAt") else None
                    )
                    positions.append(position)
                except Exception as e:
                    logger.warning(f"Failed to parse position: {e}")
                    continue
            
            return positions
        except Exception as e:
            logger.error(f"Failed to get positions: {e}")
            return []
    
    @retry_with_backoff(max_retries=3)
    async def get_trades(self, limit: int = 100, offset: int = 0) -> List[Trade]:
        """Get trade history"""
        try:
            params = {"limit": limit, "offset": offset}
            data = await self._request("GET", "/portfolio/trades", params=params)
            
            trades = []
            for item in data.get("trades", []):
                try:
                    trade = Trade(
                        id=item.get("tradeId"),
                        order_id=item.get("orderId", ""),
                        market_id=item.get("conditionId"),
                        side=OrderSide(item.get("side", "buy").lower()),
                        size=Decimal(str(item.get("size", 0))),
                        price=Decimal(str(item.get("price", 0))),
                        fee=Decimal(str(item.get("fee", 0))),
                        fee_asset=item.get("feeAsset", "USDC"),
                        pnl=Decimal(str(item["pnl"])) if item.get("pnl") else None,
                        timestamp=datetime.fromisoformat(item["timestamp"]) if item.get("timestamp") else datetime.utcnow()
                    )
                    trades.append(trade)
                except Exception as e:
                    logger.warning(f"Failed to parse trade: {e}")
                    continue
            
            return trades
        except Exception as e:
            logger.error(f"Failed to get trades: {e}")
            return []
    
    @retry_with_backoff(max_retries=3)
    async def get_balance(self) -> Decimal:
        """Get account balance"""
        try:
            data = await self._request("GET", "/portfolio/balance")
            return Decimal(str(data.get("balance", 0)))
        except Exception as e:
            logger.error(f"Failed to get balance: {e}")
            return Decimal("0")
