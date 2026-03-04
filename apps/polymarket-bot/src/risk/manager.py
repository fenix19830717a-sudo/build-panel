"""
Risk management module for Polymarket Bot
"""
from decimal import Decimal
from typing import Optional, Dict, List
from datetime import datetime, timedelta
from dataclasses import dataclass, field
from enum import Enum

from loguru import logger

from ..models import Order, Position, OrderSide, Signal


class RiskLevel(Enum):
    LOW = "low"
    MEDIUM = "medium"
    HIGH = "high"
    CRITICAL = "critical"


@dataclass
class RiskLimits:
    """Risk limits configuration"""
    # Position limits
    max_position_size: Decimal = Decimal("1000")
    max_positions: int = 10
    max_margin_usage: Decimal = Decimal("0.8")
    
    # Loss limits
    max_daily_loss: Decimal = Decimal("500")
    max_trade_loss: Decimal = Decimal("100")
    
    # Price protection
    stop_loss_pct: Decimal = Decimal("0.05")  # 5%
    take_profit_pct: Decimal = Decimal("0.10")  # 10%
    max_slippage: Decimal = Decimal("0.01")  # 1%
    
    # Risk scoring
    max_risk_score: float = 0.7
    
    # Time-based limits
    cooldown_minutes: int = 5


@dataclass
class RiskCheckResult:
    """Result of risk check"""
    allowed: bool
    risk_level: RiskLevel
    reason: str
    adjusted_size: Optional[Decimal] = None
    
    @property
    def blocked(self) -> bool:
        return not self.allowed


class RiskManager:
    """Manages trading risk"""
    
    def __init__(self, limits: RiskLimits):
        self.limits = limits
        self._daily_pnl: Decimal = Decimal("0")
        self._daily_loss_start: datetime = datetime.utcnow()
        self._last_trade_time: Optional[datetime] = None
        self._position_risk_scores: Dict[str, float] = {}
        self._stop_losses: Dict[str, Decimal] = {}
        self._take_profits: Dict[str, Decimal] = {}
        
    def _reset_daily_metrics(self):
        """Reset daily metrics if new day"""
        now = datetime.utcnow()
        if (now - self._daily_loss_start).days >= 1:
            self._daily_pnl = Decimal("0")
            self._daily_loss_start = now
            logger.info("Daily risk metrics reset")
    
    def check_signal(self, signal: Signal, 
                    open_positions: List[Position],
                    available_balance: Decimal,
                    current_exposure: Decimal) -> RiskCheckResult:
        """
        Check if a trading signal passes risk checks
        
        Returns:
            RiskCheckResult with approval status and any adjustments
        """
        self._reset_daily_metrics()
        
        # Check daily loss limit
        if self._daily_pnl < -self.limits.max_daily_loss:
            return RiskCheckResult(
                allowed=False,
                risk_level=RiskLevel.CRITICAL,
                reason=f"Daily loss limit exceeded: {self._daily_pnl}"
            )
        
        # Check cooldown
        if self._last_trade_time:
            time_since_last = datetime.utcnow() - self._last_trade_time
            if time_since_last < timedelta(minutes=self.limits.cooldown_minutes):
                return RiskCheckResult(
                    allowed=False,
                    risk_level=RiskLevel.LOW,
                    reason=f"Cooldown period: {self.limits.cooldown_minutes} minutes"
                )
        
        # Check max positions
        if len(open_positions) >= self.limits.max_positions:
            return RiskCheckResult(
                allowed=False,
                risk_level=RiskLevel.HIGH,
                reason=f"Max positions reached: {self.limits.max_positions}"
            )
        
        # Check position size
        if signal.size > self.limits.max_position_size:
            adjusted_size = self.limits.max_position_size
            logger.warning(f"Position size {signal.size} exceeds max, adjusting to {adjusted_size}")
        else:
            adjusted_size = signal.size
        
        # Check margin usage
        projected_exposure = current_exposure + adjusted_size
        if available_balance > 0:
            margin_usage = projected_exposure / available_balance
            if margin_usage > self.limits.max_margin_usage:
                # Adjust size to fit within margin limit
                max_allowed = available_balance * self.limits.max_margin_usage - current_exposure
                if max_allowed <= 0:
                    return RiskCheckResult(
                        allowed=False,
                        risk_level=RiskLevel.HIGH,
                        reason="Margin usage limit would be exceeded"
                    )
                adjusted_size = max_allowed
                logger.warning(f"Adjusted size to {adjusted_size} due to margin limits")
        
        # Calculate risk score
        risk_score = self._calculate_risk_score(signal, open_positions)
        
        if risk_score > self.limits.max_risk_score:
            return RiskCheckResult(
                allowed=False,
                risk_level=RiskLevel.HIGH,
                reason=f"Risk score {risk_score:.2f} exceeds limit {self.limits.max_risk_score}"
            )
        
        # Determine risk level
        if risk_score < 0.3:
            risk_level = RiskLevel.LOW
        elif risk_score < 0.5:
            risk_level = RiskLevel.MEDIUM
        else:
            risk_level = RiskLevel.HIGH
        
        self._position_risk_scores[signal.market_id] = risk_score
        
        return RiskCheckResult(
            allowed=True,
            risk_level=risk_level,
            reason="Signal approved",
            adjusted_size=adjusted_size
        )
    
    def _calculate_risk_score(self, signal: Signal, 
                              open_positions: List[Position]) -> float:
        """Calculate risk score for a signal"""
        score = 0.0
        
        # Confidence factor (lower confidence = higher risk)
        score += (1 - signal.confidence) * 0.3
        
        # Position concentration
        same_market_positions = [
            p for p in open_positions if p.market_id == signal.market_id
        ]
        score += len(same_market_positions) * 0.1
        
        # Time of day risk (higher during volatile periods)
        hour = datetime.utcnow().hour
        if hour in [0, 1, 2, 3, 4]:  # Low liquidity hours
            score += 0.1
        
        # Market conditions (can be extended)
        score += 0.1  # Base market risk
        
        return min(1.0, score)
    
    def check_position_exit(self, position: Position, 
                           current_price: Decimal) -> Optional[str]:
        """
        Check if position should be exited based on stop/take profit
        
        Returns:
            Exit reason if should exit, None otherwise
        """
        if position.avg_entry_price == 0:
            return None
        
        # Calculate P&L percentage
        if position.side == OrderSide.BUY:
            pnl_pct = (current_price - position.avg_entry_price) / position.avg_entry_price
        else:
            pnl_pct = (position.avg_entry_price - current_price) / position.avg_entry_price
        
        # Check stop loss
        stop_loss = self._stop_losses.get(position.id)
        if stop_loss is None:
            stop_loss = -self.limits.stop_loss_pct
        
        if pnl_pct <= stop_loss:
            return f"Stop loss triggered at {pnl_pct:.2%}"
        
        # Check take profit
        take_profit = self._take_profits.get(position.id)
        if take_profit is None:
            take_profit = self.limits.take_profit_pct
        
        if pnl_pct >= take_profit:
            return f"Take profit triggered at {pnl_pct:.2%}"
        
        return None
    
    def set_stop_loss(self, position_id: str, price: Decimal):
        """Set custom stop loss for a position"""
        self._stop_losses[position_id] = price
        logger.info(f"Stop loss set for {position_id}: {price}")
    
    def set_take_profit(self, position_id: str, price: Decimal):
        """Set custom take profit for a position"""
        self._take_profits[position_id] = price
        logger.info(f"Take profit set for {position_id}: {price}")
    
    def update_daily_pnl(self, pnl: Decimal):
        """Update daily P&L"""
        self._daily_pnl += pnl
        self._reset_daily_metrics()
        logger.info(f"Daily P&L updated: {self._daily_pnl}")
    
    def record_trade(self, pnl: Optional[Decimal] = None):
        """Record a trade for risk tracking"""
        self._last_trade_time = datetime.utcnow()
        if pnl:
            self.update_daily_pnl(pnl)
    
    def get_risk_report(self) -> Dict:
        """Get current risk metrics"""
        self._reset_daily_metrics()
        
        return {
            "daily_pnl": float(self._daily_pnl),
            "max_daily_loss": float(self.limits.max_daily_loss),
            "daily_loss_remaining": float(self.limits.max_daily_loss + self._daily_pnl),
            "position_risk_scores": self._position_risk_scores.copy(),
            "last_trade_time": self._last_trade_time.isoformat() if self._last_trade_time else None,
            "limits": {
                "max_position_size": float(self.limits.max_position_size),
                "max_positions": self.limits.max_positions,
                "max_margin_usage": float(self.limits.max_margin_usage),
                "stop_loss_pct": float(self.limits.stop_loss_pct),
                "take_profit_pct": float(self.limits.take_profit_pct)
            }
        }
    
    def validate_order(self, order: Order, available_balance: Decimal) -> RiskCheckResult:
        """Validate order against risk limits"""
        # Check order size
        order_value = order.size * (order.price or Decimal("0.5"))
        
        if order_value > self.limits.max_position_size:
            return RiskCheckResult(
                allowed=False,
                risk_level=RiskLevel.HIGH,
                reason=f"Order value {order_value} exceeds max position size"
            )
        
        if order_value > available_balance:
            return RiskCheckResult(
                allowed=False,
                risk_level=RiskLevel.CRITICAL,
                reason="Insufficient balance"
            )
        
        return RiskCheckResult(
            allowed=True,
            risk_level=RiskLevel.LOW,
            reason="Order validated"
        )
