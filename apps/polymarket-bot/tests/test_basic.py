"""
Basic tests for Polymarket Bot
"""
import pytest
from decimal import Decimal
from datetime import datetime

from src.models import (
    Market, Order, OrderRequest, OrderSide, OrderType, 
    OrderStatus, Position, Trade, Signal
)
from src.utils import (
    format_decimal, decimal_to_wei, wei_to_decimal,
    calculate_pnl, validate_address, generate_id
)
from src.strategies.base import Strategy, StrategyConfig
from src.risk.manager import RiskManager, RiskLimits, RiskLevel


def test_decimal_utils():
    """Test decimal utility functions"""
    d = Decimal("1.23456789")
    assert format_decimal(d, 2) == "1.23"
    assert format_decimal(d, 4) == "1.2346"
    
    # Test wei conversion
    assert decimal_to_wei(Decimal("1")) == 1000000  # USDC has 6 decimals
    assert wei_to_decimal(1000000) == Decimal("1")


def test_pnl_calculation():
    """Test P&L calculation"""
    # Long position
    pnl = calculate_pnl(Decimal("100"), Decimal("110"), Decimal("10"), "buy")
    assert pnl == Decimal("100")  # (110-100) * 10 = 100
    
    # Short position
    pnl = calculate_pnl(Decimal("110"), Decimal("100"), Decimal("10"), "sell")
    assert pnl == Decimal("100")  # (110-100) * 10 = 100


def test_address_validation():
    """Test Ethereum address validation"""
    assert validate_address("0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb") == False  # Too short
    assert validate_address("0x742d35Cc6634C0532925a3b844Bc9e7595f0bEbD") == True  # Valid
    assert validate_address("invalid") == False
    assert validate_address("") == False


def test_generate_id():
    """Test ID generation"""
    id1 = generate_id()
    id2 = generate_id()
    assert id1 != id2
    assert len(id1) > 0


def test_market_model():
    """Test Market model"""
    market = Market(
        id="test-123",
        slug="test-market",
        question="Will it rain?",
        outcomes=["Yes", "No"],
        outcome_prices=[Decimal("0.6"), Decimal("0.4")],
        volume=Decimal("10000"),
        liquidity=Decimal("5000"),
        status="active"
    )
    assert market.id == "test-123"
    assert market.question == "Will it rain?"


def test_order_model():
    """Test Order model"""
    order = Order(
        id="order-123",
        market_id="market-123",
        side=OrderSide.BUY,
        order_type=OrderType.LIMIT,
        status=OrderStatus.OPEN,
        size=Decimal("100"),
        price=Decimal("0.5"),
        remaining_size=Decimal("100"),
        created_at=datetime.utcnow(),
        updated_at=datetime.utcnow()
    )
    assert order.side == OrderSide.BUY
    assert order.status == OrderStatus.OPEN


def test_strategy_config():
    """Test strategy configuration"""
    config = StrategyConfig(
        name="test_strategy",
        enabled=True,
        min_confidence=0.5,
        max_position_size=Decimal("100")
    )
    assert config.name == "test_strategy"
    assert config.enabled == True
    assert config.min_confidence == 0.5


def test_risk_limits():
    """Test risk limits"""
    limits = RiskLimits(
        max_position_size=Decimal("1000"),
        max_positions=5,
        stop_loss_pct=Decimal("0.05")
    )
    assert limits.max_position_size == Decimal("1000")
    assert limits.max_positions == 5


def test_risk_manager():
    """Test risk manager"""
    limits = RiskLimits(max_daily_loss=Decimal("100"))
    manager = RiskManager(limits)
    
    # Test daily P&L tracking
    manager.update_daily_pnl(Decimal("-50"))
    report = manager.get_risk_report()
    assert report["daily_pnl"] == -50.0


# Integration tests (require configuration)
@pytest.mark.skip(reason="Requires API credentials")
def test_polymarket_api():
    """Test Polymarket API client"""
    from src.api import PolymarketAPI
    
    api = PolymarketAPI(
        api_key="test_key",
        api_secret="test_secret"
    )
    # Add API tests here


@pytest.mark.skip(reason="Requires wallet setup")
def test_wallet_manager():
    """Test wallet manager"""
    from src.wallet import WalletManager
    
    wallet = WalletManager(rpc_url="https://polygon-rpc.com")
    # Add wallet tests here


if __name__ == "__main__":
    pytest.main([__file__, "-v"])
