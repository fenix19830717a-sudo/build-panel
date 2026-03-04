"""
Arbitrage strategy for Polymarket
"""
from decimal import Decimal
from typing import Optional, Dict, List, Tuple
from datetime import datetime, timedelta
from dataclasses import dataclass

from loguru import logger

from .base import Strategy, StrategyConfig
from ..models import Signal, OrderSide, Market, OrderBook


@dataclass
class ArbitrageConfig(StrategyConfig):
    """Arbitrage strategy configuration"""
    min_spread: float = 0.02  # Minimum 2% spread
    max_hold_time: int = 300  # Maximum hold time in seconds
    min_liquidity: Decimal = Decimal("1000")
    max_slippage: float = 0.01  # Maximum 1% slippage
    cross_market: bool = True  # Enable cross-market arbitrage


class ArbitrageOpportunity:
    """Represents an arbitrage opportunity"""
    
    def __init__(self, 
                 buy_market: str, sell_market: str,
                 buy_price: Decimal, sell_price: Decimal,
                 spread: float, size: Decimal):
        self.buy_market = buy_market
        self.sell_market = sell_market
        self.buy_price = buy_price
        self.sell_price = sell_price
        self.spread = spread
        self.size = size
        self.detected_at = datetime.utcnow()
    
    @property
    def profit(self) -> Decimal:
        """Calculate potential profit"""
        return (self.sell_price - self.buy_price) * self.size
    
    @property
    def profit_pct(self) -> float:
        """Calculate profit percentage"""
        if self.buy_price == 0:
            return 0.0
        return float((self.sell_price - self.buy_price) / self.buy_price)
    
    def is_expired(self, max_hold_time: int) -> bool:
        """Check if opportunity has expired"""
        return (datetime.utcnow() - self.detected_at).seconds > max_hold_time


class ArbitrageStrategy(Strategy):
    """
    Arbitrage strategy that looks for price discrepancies
    
    Two types of arbitrage:
    1. Same-market: Buy Yes / Sell No (or vice versa) when prices don't sum to $1
    2. Cross-market: Buy in one market, sell in another with same underlying
    """
    
    def __init__(self, config: ArbitrageConfig):
        super().__init__(config)
        self.config = config
        self._orderbooks: Dict[str, OrderBook] = {}
        self._markets: Dict[str, Market] = {}
        self._active_opportunities: Dict[str, ArbitrageOpportunity] = {}
    
    def update_market_data(self, market: Market, orderbook: OrderBook):
        """Update stored market data"""
        self._markets[market.id] = market
        self._orderbooks[market.id] = orderbook
    
    def _find_same_market_arbitrage(self, market: Market, 
                                    orderbook: OrderBook) -> Optional[ArbitrageOpportunity]:
        """
        Find arbitrage within same market (Yes/No tokens)
        
        In binary markets, Yes + No should = $1
        If Yes price + No price < $1, buy both and wait for resolution
        """
        if len(market.outcomes) != 2:
            return None
        
        if not orderbook.bids or not orderbook.asks:
            return None
        
        # Get best prices
        best_bid_yes = orderbook.bids[0] if orderbook.bids else None
        best_ask_yes = orderbook.asks[0] if orderbook.asks else None
        
        # Check if we have complementary market data
        # For simplicity, assume Yes token is the primary
        yes_price = best_ask_yes.price if best_ask_yes else Decimal("0")
        no_price = Decimal("1") - yes_price
        
        if yes_price <= 0 or no_price <= 0:
            return None
        
        sum_price = yes_price + no_price
        
        # If sum < 1, there's an arbitrage opportunity
        if sum_price < Decimal("1") - Decimal(str(self.config.min_spread)):
            spread = float(Decimal("1") - sum_price)
            max_size = min(
                best_ask_yes.size if best_ask_yes else Decimal("0"),
                market.liquidity / 2
            )
            
            return ArbitrageOpportunity(
                buy_market=market.id,
                sell_market=market.id,
                buy_price=yes_price,
                sell_price=Decimal("1") - no_price,
                spread=spread,
                size=max_size
            )
        
        return None
    
    def _find_cross_market_arbitrage(self, market_id: str) -> Optional[ArbitrageOpportunity]:
        """
        Find arbitrage across related markets
        
        Example:
        - Market A: "Will Candidate X win?"
        - Market B: "Will Candidate Y win?" (mutually exclusive)
        If P(X) + P(Y) > 1, sell both
        If P(X) + P(Y) < 1, buy both
        """
        if not self.config.cross_market:
            return None
        
        # This requires related market detection
        # For now, look for markets with same category and overlapping timeframes
        base_market = self._markets.get(market_id)
        base_orderbook = self._orderbooks.get(market_id)
        
        if not base_market or not base_orderbook:
            return None
        
        best_opportunity = None
        best_spread = self.config.min_spread
        
        for other_id, other_market in self._markets.items():
            if other_id == market_id:
                continue
            
            other_orderbook = self._orderbooks.get(other_id)
            if not other_orderbook:
                continue
            
            # Look for price discrepancies
            # Simple case: buy low in one, sell high in another
            base_ask = base_orderbook.asks[0] if base_orderbook.asks else None
            other_bid = other_orderbook.bids[0] if other_orderbook.bids else None
            
            if not base_ask or not other_bid:
                continue
            
            # Check if profitable
            spread = float(other_bid.price - base_ask.price)
            
            if spread > best_spread:
                max_size = min(base_ask.size, other_bid.size)
                if max_size > 0:
                    best_spread = spread
                    best_opportunity = ArbitrageOpportunity(
                        buy_market=market_id,
                        sell_market=other_id,
                        buy_price=base_ask.price,
                        sell_price=other_bid.price,
                        spread=spread,
                        size=max_size
                    )
        
        return best_opportunity
    
    async def analyze(self, market: Market, orderbook: OrderBook) -> Optional[Signal]:
        """Analyze for arbitrage opportunities"""
        if not self.enabled:
            return None
        
        # Update market data
        self.update_market_data(market, orderbook)
        
        # Liquidity filter
        if market.liquidity < self.config.min_liquidity:
            return None
        
        # Clean up expired opportunities
        self._cleanup_expired_opportunities()
        
        # Look for same-market arbitrage
        opportunity = self._find_same_market_arbitrage(market, orderbook)
        
        # Look for cross-market arbitrage
        if not opportunity and self.config.cross_market:
            opportunity = self._find_cross_market_arbitrage(market.id)
        
        if not opportunity:
            return None
        
        # Check if opportunity already being acted upon
        opp_key = f"{opportunity.buy_market}_{opportunity.sell_market}"
        if opp_key in self._active_opportunities:
            return None
        
        # Store opportunity
        self._active_opportunities[opp_key] = opportunity
        
        # Calculate confidence based on spread
        confidence = min(1.0, opportunity.spread / (self.config.min_spread * 3))
        
        if confidence < self.config.min_confidence:
            return None
        
        # Create signal
        signal = Signal(
            strategy_id=self.name,
            market_id=opportunity.buy_market,
            side=OrderSide.BUY,
            confidence=confidence,
            size=opportunity.size,
            reason=f"Arbitrage: {opportunity.spread:.2%} spread "
                   f"(buy {opportunity.buy_market}, sell {opportunity.sell_market})",
            timestamp=datetime.utcnow(),
            metadata={
                "opportunity_type": "cross_market" if opportunity.buy_market != opportunity.sell_market else "same_market",
                "buy_market": opportunity.buy_market,
                "sell_market": opportunity.sell_market,
                "buy_price": float(opportunity.buy_price),
                "sell_price": float(opportunity.sell_price),
                "expected_profit": float(opportunity.profit),
                "expected_profit_pct": opportunity.profit_pct
            }
        )
        
        logger.info(f"Arbitrage signal: {opportunity.spread:.2%} spread "
                   f"between {opportunity.buy_market} and {opportunity.sell_market}")
        
        return signal
    
    def calculate_position_size(self, signal: Signal, 
                               available_balance: Decimal) -> Decimal:
        """Calculate position size for arbitrage"""
        # Use smaller size for arbitrage due to execution risk
        max_size = min(
            signal.size,
            available_balance * Decimal("0.05"),  # Max 5% per arbitrage
            self.config.max_position_size
        )
        
        return max_size.quantize(Decimal("0.01"))
    
    def _cleanup_expired_opportunities(self):
        """Remove expired opportunities"""
        expired = [
            key for key, opp in self._active_opportunities.items()
            if opp.is_expired(self.config.max_hold_time)
        ]
        for key in expired:
            del self._active_opportunities[key]
    
    def get_active_opportunities(self) -> List[Dict]:
        """Get list of active arbitrage opportunities"""
        return [
            {
                "buy_market": opp.buy_market,
                "sell_market": opp.sell_market,
                "spread": opp.spread,
                "expected_profit": float(opp.profit),
                "size": float(opp.size),
                "age_seconds": (datetime.utcnow() - opp.detected_at).seconds
            }
            for opp in self._active_opportunities.values()
        ]
