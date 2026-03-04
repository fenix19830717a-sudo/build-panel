"""
Strategy base class for Polymarket Bot
"""
from abc import ABC, abstractmethod
from decimal import Decimal
from typing import Optional, List, Dict, Any
from datetime import datetime
from dataclasses import dataclass

from loguru import logger

from ..models import Signal, OrderSide, Market, OrderBook


@dataclass
class StrategyConfig:
    """Base strategy configuration"""
    name: str
    enabled: bool = True
    min_confidence: float = 0.5
    max_position_size: Decimal = Decimal("100")
    parameters: Dict[str, Any] = None
    
    def __post_init__(self):
        if self.parameters is None:
            self.parameters = {}


class Strategy(ABC):
    """Base class for all trading strategies"""
    
    def __init__(self, config: StrategyConfig):
        self.config = config
        self.name = config.name
        self.enabled = config.enabled
        self._state: Dict[str, Any] = {}
        self._last_update: Optional[datetime] = None
        
    @abstractmethod
    async def analyze(self, market: Market, orderbook: OrderBook) -> Optional[Signal]:
        """
        Analyze market data and generate trading signal
        
        Args:
            market: Market data
            orderbook: Order book data
            
        Returns:
            Signal if opportunity found, None otherwise
        """
        pass
    
    @abstractmethod
    def calculate_position_size(self, signal: Signal, 
                                available_balance: Decimal) -> Decimal:
        """
        Calculate position size for a signal
        
        Args:
            signal: Trading signal
            available_balance: Available balance
            
        Returns:
            Position size in USDC
        """
        pass
    
    def enable(self):
        """Enable strategy"""
        self.enabled = True
        logger.info(f"Strategy {self.name} enabled")
    
    def disable(self):
        """Disable strategy"""
        self.enabled = False
        logger.info(f"Strategy {self.name} disabled")
    
    def update_state(self, key: str, value: Any):
        """Update strategy state"""
        self._state[key] = value
        self._last_update = datetime.utcnow()
    
    def get_state(self, key: str, default: Any = None) -> Any:
        """Get strategy state"""
        return self._state.get(key, default)
    
    def reset_state(self):
        """Reset strategy state"""
        self._state = {}
        self._last_update = None
    
    def validate_signal(self, signal: Signal) -> bool:
        """
        Validate generated signal
        
        Args:
            signal: Signal to validate
            
        Returns:
            True if signal is valid
        """
        if signal.confidence < self.config.min_confidence:
            logger.debug(f"Signal confidence {signal.confidence} below threshold {self.config.min_confidence}")
            return False
        
        if signal.size <= 0:
            logger.debug(f"Signal size {signal.size} must be positive")
            return False
        
        if signal.size > self.config.max_position_size:
            logger.debug(f"Signal size {signal.size} exceeds max {self.config.max_position_size}")
            return False
        
        return True
    
    def to_dict(self) -> Dict[str, Any]:
        """Convert strategy to dictionary"""
        return {
            "name": self.name,
            "enabled": self.enabled,
            "config": {
                "min_confidence": self.config.min_confidence,
                "max_position_size": str(self.config.max_position_size),
                "parameters": self.config.parameters
            },
            "state": self._state,
            "last_update": self._last_update.isoformat() if self._last_update else None
        }


class CompositeStrategy(Strategy):
    """Strategy that combines multiple strategies"""
    
    def __init__(self, config: StrategyConfig):
        super().__init__(config)
        self.strategies: List[Strategy] = []
        self.weights: Dict[str, float] = {}
    
    def add_strategy(self, strategy: Strategy, weight: float = 1.0):
        """Add a strategy with weight"""
        self.strategies.append(strategy)
        self.weights[strategy.name] = weight
        logger.info(f"Added strategy {strategy.name} with weight {weight}")
    
    def remove_strategy(self, name: str):
        """Remove a strategy by name"""
        self.strategies = [s for s in self.strategies if s.name != name]
        self.weights.pop(name, None)
        logger.info(f"Removed strategy {name}")
    
    async def analyze(self, market: Market, orderbook: OrderBook) -> Optional[Signal]:
        """Combine signals from all strategies"""
        signals = []
        
        for strategy in self.strategies:
            if not strategy.enabled:
                continue
            
            try:
                signal = await strategy.analyze(market, orderbook)
                if signal and strategy.validate_signal(signal):
                    weight = self.weights.get(strategy.name, 1.0)
                    signals.append((signal, weight))
            except Exception as e:
                logger.error(f"Strategy {strategy.name} failed: {e}")
                continue
        
        if not signals:
            return None
        
        # Weighted average of signals
        total_weight = sum(w for _, w in signals)
        avg_confidence = sum(s.confidence * w for s, w in signals) / total_weight
        
        # Use signal with highest confidence if above threshold
        best_signal = max(signals, key=lambda x: x[0].confidence)[0]
        
        if avg_confidence >= self.config.min_confidence:
            return Signal(
                strategy_id=self.name,
                market_id=best_signal.market_id,
                side=best_signal.side,
                confidence=avg_confidence,
                size=best_signal.size,
                reason=f"Composite: {best_signal.reason}",
                timestamp=datetime.utcnow(),
                metadata={
                    "component_signals": [
                        {"strategy": s.strategy_id, "confidence": s.confidence}
                        for s, _ in signals
                    ]
                }
            )
        
        return None
    
    def calculate_position_size(self, signal: Signal, 
                               available_balance: Decimal) -> Decimal:
        """Calculate position size based on composite confidence"""
        # Scale size by confidence
        size = min(
            signal.size,
            available_balance * Decimal("0.1"),  # Max 10% of balance
            self.config.max_position_size
        )
        return size
