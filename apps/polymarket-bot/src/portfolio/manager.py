"""
Portfolio and position management module
"""
from decimal import Decimal
from typing import List, Dict, Optional
from datetime import datetime
from dataclasses import dataclass
from collections import defaultdict

from loguru import logger

from ..models import Position, Trade, OrderSide, PositionStatus
from ..api import PolymarketAPI
from ..utils import calculate_pnl


@dataclass
class PortfolioMetrics:
    """Portfolio performance metrics"""
    total_value: Decimal
    available_balance: Decimal
    total_exposure: Decimal
    unrealized_pnl: Decimal
    realized_pnl: Decimal
    total_pnl: Decimal
    margin_usage: float
    sharpe_ratio: Optional[float] = None
    max_drawdown: Optional[float] = None


class PositionManager:
    """Manages positions and calculates P&L"""
    
    def __init__(self, api: PolymarketAPI):
        self.api = api
        self._positions: Dict[str, Position] = {}
        self._trades: List[Trade] = []
        self._market_prices: Dict[str, Decimal] = {}
        self._daily_pnl_history: Dict[str, Decimal] = defaultdict(Decimal)
    
    async def sync_positions(self):
        """Sync positions from API"""
        api_positions = await self.api.get_positions()
        
        for position in api_positions:
            self._positions[position.id] = position
        
        logger.info(f"Synced {len(api_positions)} positions")
    
    async def sync_trades(self, limit: int = 100):
        """Sync trade history from API"""
        self._trades = await self.api.get_trades(limit=limit)
        logger.info(f"Synced {len(self._trades)} trades")
    
    def get_position(self, position_id: str) -> Optional[Position]:
        """Get position by ID"""
        return self._positions.get(position_id)
    
    def get_position_by_market(self, market_id: str) -> Optional[Position]:
        """Get open position by market ID"""
        for position in self._positions.values():
            if position.market_id == market_id and position.status == PositionStatus.OPEN:
                return position
        return None
    
    def get_all_positions(self, status: Optional[PositionStatus] = None) -> List[Position]:
        """Get all positions, optionally filtered by status"""
        positions = list(self._positions.values())
        if status:
            positions = [p for p in positions if p.status == status]
        return positions
    
    def get_open_positions(self) -> List[Position]:
        """Get all open positions"""
        return self.get_all_positions(PositionStatus.OPEN)
    
    def update_market_price(self, market_id: str, price: Decimal):
        """Update market price for P&L calculation"""
        self._market_prices[market_id] = price
        
        # Update unrealized P&L for affected positions
        for position in self._positions.values():
            if position.market_id == market_id and position.status == PositionStatus.OPEN:
                position.current_price = price
                position.unrealized_pnl = self._calculate_unrealized_pnl(position)
    
    def _calculate_unrealized_pnl(self, position: Position) -> Decimal:
        """Calculate unrealized P&L for a position"""
        if position.avg_entry_price == 0:
            return Decimal("0")
        
        price_diff = position.current_price - position.avg_entry_price
        
        if position.side == OrderSide.BUY:
            return price_diff * position.size
        else:
            return -price_diff * position.size
    
    def get_total_unrealized_pnl(self) -> Decimal:
        """Get total unrealized P&L"""
        return sum(
            p.unrealized_pnl 
            for p in self._positions.values() 
            if p.status == PositionStatus.OPEN
        )
    
    def get_total_realized_pnl(self) -> Decimal:
        """Get total realized P&L"""
        return sum(
            p.realized_pnl 
            for p in self._positions.values()
        )
    
    def get_total_pnl(self) -> Decimal:
        """Get total P&L (realized + unrealized)"""
        return self.get_total_realized_pnl() + self.get_total_unrealized_pnl()
    
    def get_daily_pnl(self, date: Optional[str] = None) -> Decimal:
        """Get P&L for a specific date (YYYY-MM-DD)"""
        if date is None:
            date = datetime.utcnow().strftime("%Y-%m-%d")
        return self._daily_pnl_history.get(date, Decimal("0"))
    
    def get_exposure(self) -> Decimal:
        """Get total position exposure"""
        return sum(
            p.size * p.current_price
            for p in self._positions.values()
            if p.status == PositionStatus.OPEN
        )
    
    def get_metrics(self, available_balance: Decimal) -> PortfolioMetrics:
        """Calculate portfolio metrics"""
        exposure = self.get_exposure()
        unrealized = self.get_total_unrealized_pnl()
        realized = self.get_total_realized_pnl()
        
        margin_usage = 0.0
        if available_balance > 0:
            margin_usage = float(exposure / available_balance)
        
        return PortfolioMetrics(
            total_value=available_balance + exposure,
            available_balance=available_balance,
            total_exposure=exposure,
            unrealized_pnl=unrealized,
            realized_pnl=realized,
            total_pnl=unrealized + realized,
            margin_usage=margin_usage
        )
    
    def get_position_summary(self, position_id: str) -> Optional[Dict]:
        """Get detailed summary of a position"""
        position = self._positions.get(position_id)
        if not position:
            return None
        
        # Get trades for this position
        position_trades = [
            t for t in self._trades 
            if t.market_id == position.market_id
        ]
        
        return {
            "position_id": position.id,
            "market_id": position.market_id,
            "market_question": position.market_question,
            "outcome": position.outcome,
            "side": position.side.value,
            "size": float(position.size),
            "avg_entry_price": float(position.avg_entry_price),
            "current_price": float(position.current_price),
            "unrealized_pnl": float(position.unrealized_pnl),
            "realized_pnl": float(position.realized_pnl),
            "status": position.status.value,
            "opened_at": position.opened_at.isoformat(),
            "trades_count": len(position_trades),
            "roi_pct": float(
                (position.current_price - position.avg_entry_price) / position.avg_entry_price * 100
            ) if position.avg_entry_price > 0 else 0
        }
    
    def get_portfolio_summary(self) -> Dict:
        """Get complete portfolio summary"""
        open_positions = self.get_open_positions()
        
        return {
            "open_positions_count": len(open_positions),
            "total_positions_count": len(self._positions),
            "total_unrealized_pnl": float(self.get_total_unrealized_pnl()),
            "total_realized_pnl": float(self.get_total_realized_pnl()),
            "total_pnl": float(self.get_total_pnl()),
            "total_exposure": float(self.get_exposure()),
            "positions": [
                self.get_position_summary(p.id) 
                for p in open_positions
            ]
        }
    
    def record_trade(self, trade: Trade):
        """Record a trade and update positions"""
        self._trades.append(trade)
        
        # Update realized P&L if trade has P&L
        if trade.pnl:
            date_key = trade.timestamp.strftime("%Y-%m-%d")
            self._daily_pnl_history[date_key] += trade.pnl
            
            # Find and update position
            for position in self._positions.values():
                if position.market_id == trade.market_id and position.status == PositionStatus.OPEN:
                    position.realized_pnl += trade.pnl
                    break
        
        logger.info(f"Trade recorded: {trade.id} P&L={trade.pnl}")
    
    def close_position(self, position_id: str, close_price: Decimal):
        """Mark a position as closed"""
        position = self._positions.get(position_id)
        if not position:
            logger.warning(f"Position {position_id} not found")
            return
        
        position.status = PositionStatus.CLOSED
        position.closed_at = datetime.utcnow()
        position.current_price = close_price
        
        # Calculate final realized P&L
        position.realized_pnl += self._calculate_unrealized_pnl(position)
        position.unrealized_pnl = Decimal("0")
        
        logger.info(
            f"Position closed: {position_id} "
            f"Realized P&L: {position.realized_pnl}"
        )
    
    def get_trade_history(self, market_id: Optional[str] = None,
                         limit: int = 100) -> List[Trade]:
        """Get trade history, optionally filtered by market"""
        trades = self._trades
        if market_id:
            trades = [t for t in trades if t.market_id == market_id]
        return trades[-limit:]
    
    def get_performance_report(self, days: int = 30) -> Dict:
        """Generate performance report"""
        # Aggregate daily P&L
        daily_pnl = {}
        for date, pnl in self._daily_pnl_history.items():
            daily_pnl[date] = float(pnl)
        
        # Calculate win rate
        winning_days = sum(1 for pnl in daily_pnl.values() if pnl > 0)
        total_days = len(daily_pnl) or 1
        
        return {
            "period_days": days,
            "daily_pnl": daily_pnl,
            "total_realized_pnl": float(self.get_total_realized_pnl()),
            "total_unrealized_pnl": float(self.get_total_unrealized_pnl()),
            "winning_days": winning_days,
            "losing_days": total_days - winning_days,
            "win_rate": winning_days / total_days,
            "best_day": max(daily_pnl.values()) if daily_pnl else 0,
            "worst_day": min(daily_pnl.values()) if daily_pnl else 0,
            "avg_daily_pnl": sum(daily_pnl.values()) / total_days if daily_pnl else 0
        }
