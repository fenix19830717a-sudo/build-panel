"""
Trend following strategy with RSI and MACD indicators
"""
from decimal import Decimal
from typing import Optional, List, Dict, Any
from datetime import datetime
from dataclasses import dataclass
from collections import deque

import numpy as np
from loguru import logger

from .base import Strategy, StrategyConfig
from ..models import Signal, OrderSide, Market, OrderBook


@dataclass
class TrendConfig(StrategyConfig):
    """Trend following strategy configuration"""
    # RSI parameters
    rsi_period: int = 14
    rsi_overbought: float = 70.0
    rsi_oversold: float = 30.0
    
    # MACD parameters
    macd_fast: int = 12
    macd_slow: int = 26
    macd_signal: int = 9
    
    # Additional filters
    min_volume: Decimal = Decimal("1000")
    trend_strength_threshold: float = 0.3


class TrendFollowingStrategy(Strategy):
    """
    Trend following strategy using RSI and MACD indicators
    
    Buy signals:
    - RSI below oversold threshold AND MACD crosses above signal line
    - Strong uptrend confirmed
    
    Sell signals:
    - RSI above overbought threshold AND MACD crosses below signal line
    - Strong downtrend confirmed
    """
    
    def __init__(self, config: TrendConfig):
        super().__init__(config)
        self.config = config
        # Store price history for calculations
        self._price_history: Dict[str, deque] = {}
        self._macd_history: Dict[str, Dict[str, List[float]]] = {}
    
    def _calculate_rsi(self, prices: List[float], period: int = 14) -> float:
        """Calculate RSI (Relative Strength Index)"""
        if len(prices) < period + 1:
            return 50.0  # Neutral
        
        prices_array = np.array(prices)
        deltas = np.diff(prices_array)
        
        gains = np.where(deltas > 0, deltas, 0)
        losses = np.where(deltas < 0, -deltas, 0)
        
        avg_gain = np.mean(gains[-period:])
        avg_loss = np.mean(losses[-period:])
        
        if avg_loss == 0:
            return 100.0
        
        rs = avg_gain / avg_loss
        rsi = 100 - (100 / (1 + rs))
        
        return float(rsi)
    
    def _calculate_ema(self, prices: List[float], period: int) -> float:
        """Calculate EMA (Exponential Moving Average)"""
        if len(prices) < period:
            return prices[-1] if prices else 0.0
        
        prices_array = np.array(prices[-period:])
        multiplier = 2 / (period + 1)
        ema = prices_array[0]
        
        for price in prices_array[1:]:
            ema = (price - ema) * multiplier + ema
        
        return float(ema)
    
    def _calculate_macd(self, prices: List[float], 
                       fast: int = 12, slow: int = 26, signal: int = 9) -> tuple:
        """
        Calculate MACD (Moving Average Convergence Divergence)
        
        Returns:
            (macd_line, signal_line, histogram)
        """
        if len(prices) < slow + signal:
            return 0.0, 0.0, 0.0
        
        # Calculate EMAs
        ema_fast = self._calculate_ema(prices, fast)
        ema_slow = self._calculate_ema(prices, slow)
        
        # MACD line
        macd_line = ema_fast - ema_slow
        
        # Calculate signal line (EMA of MACD)
        # Store MACD history for signal calculation
        macd_history = self._macd_history.get("macd_line", [])
        macd_history.append(macd_line)
        if len(macd_history) > signal + slow:
            macd_history = macd_history[-(signal + slow):]
        self._macd_history["macd_line"] = macd_history
        
        signal_line = self._calculate_ema(macd_history, signal)
        histogram = macd_line - signal_line
        
        return macd_line, signal_line, histogram
    
    def _update_price_history(self, market_id: str, price: float):
        """Update price history for a market"""
        if market_id not in self._price_history:
            max_periods = max(
                self.config.rsi_period * 3,
                self.config.macd_slow + self.config.macd_signal + 10
            )
            self._price_history[market_id] = deque(maxlen=max_periods)
        
        self._price_history[market_id].append(price)
    
    def _get_mid_price(self, orderbook: OrderBook) -> float:
        """Calculate mid price from orderbook"""
        if not orderbook.bids or not orderbook.asks:
            return 0.0
        
        best_bid = float(orderbook.bids[0].price)
        best_ask = float(orderbook.asks[0].price)
        return (best_bid + best_ask) / 2
    
    async def analyze(self, market: Market, orderbook: OrderBook) -> Optional[Signal]:
        """Analyze market and generate signal"""
        if not self.enabled:
            return None
        
        # Volume filter
        if market.volume < self.config.min_volume:
            logger.debug(f"Volume {market.volume} below threshold {self.config.min_volume}")
            return None
        
        # Get current price
        mid_price = self._get_mid_price(orderbook)
        if mid_price == 0:
            return None
        
        # Update price history
        self._update_price_history(market.id, mid_price)
        prices = list(self._price_history[market.id])
        
        # Need enough data
        min_required = max(self.config.rsi_period, self.config.macd_slow) + 5
        if len(prices) < min_required:
            logger.debug(f"Insufficient price history: {len(prices)}/{min_required}")
            return None
        
        # Calculate indicators
        rsi = self._calculate_rsi(prices, self.config.rsi_period)
        macd_line, signal_line, histogram = self._calculate_macd(
            prices,
            self.config.macd_fast,
            self.config.macd_slow,
            self.config.macd_signal
        )
        
        # Store previous MACD for crossover detection
        prev_macd_data = self._macd_history.get("prev", {})
        prev_macd = prev_macd_data.get("macd", macd_line)
        prev_signal = prev_macd_data.get("signal", signal_line)
        
        self._macd_history["prev"] = {"macd": macd_line, "signal": signal_line}
        
        # Detect MACD crossover
        macd_cross_up = prev_macd < prev_signal and macd_line >= signal_line
        macd_cross_down = prev_macd > prev_signal and macd_line <= signal_line
        
        # Trend strength (using histogram)
        trend_strength = abs(histogram)
        
        signal = None
        confidence = 0.0
        reason = ""
        side = None
        
        # Buy signal: RSI oversold + MACD cross up
        if rsi < self.config.rsi_oversold and macd_cross_up:
            if trend_strength >= self.config.trend_strength_threshold:
                confidence = min(1.0, (self.config.rsi_oversold - rsi) / 30 + trend_strength)
                side = OrderSide.BUY
                reason = f"RSI oversold ({rsi:.1f}) + MACD bullish crossover"
        
        # Sell signal: RSI overbought + MACD cross down
        elif rsi > self.config.rsi_overbought and macd_cross_down:
            if trend_strength >= self.config.trend_strength_threshold:
                confidence = min(1.0, (rsi - self.config.rsi_overbought) / 30 + trend_strength)
                side = OrderSide.SELL
                reason = f"RSI overbought ({rsi:.1f}) + MACD bearish crossover"
        
        if side and confidence >= self.config.min_confidence:
            signal = Signal(
                strategy_id=self.name,
                market_id=market.id,
                side=side,
                confidence=confidence,
                size=self.config.max_position_size,
                reason=reason,
                timestamp=datetime.utcnow(),
                metadata={
                    "rsi": rsi,
                    "macd_line": macd_line,
                    "macd_signal": signal_line,
                    "macd_histogram": histogram,
                    "mid_price": mid_price
                }
            )
            
            logger.info(f"Trend signal generated: {side.value} {market.id} "
                       f"confidence={confidence:.2f}, RSI={rsi:.1f}")
        
        return signal
    
    def calculate_position_size(self, signal: Signal, 
                               available_balance: Decimal) -> Decimal:
        """Calculate position size based on signal confidence"""
        # Scale position size by confidence
        confidence_factor = Decimal(str(signal.confidence))
        base_size = min(
            self.config.max_position_size,
            available_balance * Decimal("0.1")  # Max 10% per trade
        )
        
        size = base_size * confidence_factor
        
        # Ensure minimum size
        min_size = Decimal("1")
        if size < min_size:
            return Decimal("0")
        
        return size.quantize(Decimal("0.01"))
    
    def get_indicator_values(self, market_id: str) -> Dict[str, Any]:
        """Get current indicator values for a market"""
        prices = list(self._price_history.get(market_id, []))
        
        if len(prices) < self.config.rsi_period:
            return {"error": "Insufficient data"}
        
        rsi = self._calculate_rsi(prices, self.config.rsi_period)
        macd_line, signal_line, histogram = self._calculate_macd(
            prices,
            self.config.macd_fast,
            self.config.macd_slow,
            self.config.macd_signal
        )
        
        return {
            "rsi": rsi,
            "rsi_period": self.config.rsi_period,
            "macd_line": macd_line,
            "macd_signal": signal_line,
            "macd_histogram": histogram,
            "macd_params": {
                "fast": self.config.macd_fast,
                "slow": self.config.macd_slow,
                "signal": self.config.macd_signal
            },
            "data_points": len(prices)
        }
