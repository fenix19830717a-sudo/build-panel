"""
Strategies module for Polymarket Bot
"""
from .base import Strategy, StrategyConfig, CompositeStrategy
from .trend import TrendFollowingStrategy, TrendConfig
from .arbitrage import ArbitrageStrategy, ArbitrageConfig

__all__ = [
    "Strategy",
    "StrategyConfig", 
    "CompositeStrategy",
    "TrendFollowingStrategy",
    "TrendConfig",
    "ArbitrageStrategy",
    "ArbitrageConfig"
]
