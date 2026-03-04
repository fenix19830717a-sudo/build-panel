"""
Pydantic models for Polymarket Bot
"""
from datetime import datetime
from decimal import Decimal
from enum import Enum
from typing import Optional, List, Dict, Any
from pydantic import BaseModel, Field, ConfigDict


class OrderSide(str, Enum):
    BUY = "buy"
    SELL = "sell"


class OrderType(str, Enum):
    LIMIT = "limit"
    MARKET = "market"


class OrderStatus(str, Enum):
    PENDING = "pending"
    OPEN = "open"
    FILLED = "filled"
    PARTIAL = "partial"
    CANCELLED = "cancelled"
    FAILED = "failed"


class PositionStatus(str, Enum):
    OPEN = "open"
    CLOSED = "closed"


class Market(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    
    id: str
    slug: str
    question: str
    description: Optional[str] = None
    category: Optional[str] = None
    outcomes: List[str]
    outcome_prices: List[Decimal]
    volume: Decimal
    liquidity: Decimal
    expiration_date: Optional[datetime] = None
    resolution_date: Optional[datetime] = None
    status: str
    image_url: Optional[str] = None
    icon: Optional[str] = None


class OrderBookLevel(BaseModel):
    price: Decimal
    size: Decimal


class OrderBook(BaseModel):
    market_id: str
    bids: List[OrderBookLevel]
    asks: List[OrderBookLevel]
    timestamp: datetime


class OrderRequest(BaseModel):
    market_id: str
    side: OrderSide
    order_type: OrderType = OrderType.LIMIT
    size: Decimal = Field(..., gt=0)
    price: Optional[Decimal] = None
    time_in_force: str = "GTC"  # GTC, IOC, FOK
    client_order_id: Optional[str] = None


class Order(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    
    id: str
    client_order_id: Optional[str] = None
    market_id: str
    side: OrderSide
    order_type: OrderType
    status: OrderStatus
    size: Decimal
    price: Optional[Decimal] = None
    filled_size: Decimal = Decimal("0")
    remaining_size: Decimal
    avg_fill_price: Optional[Decimal] = None
    created_at: datetime
    updated_at: datetime
    strategy_id: Optional[str] = None


class Position(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    
    id: str
    market_id: str
    market_question: Optional[str] = None
    outcome: str
    side: OrderSide
    size: Decimal
    avg_entry_price: Decimal
    current_price: Decimal
    unrealized_pnl: Decimal
    realized_pnl: Decimal = Decimal("0")
    status: PositionStatus
    opened_at: datetime
    closed_at: Optional[datetime] = None
    strategy_id: Optional[str] = None


class Trade(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    
    id: str
    order_id: str
    market_id: str
    side: OrderSide
    size: Decimal
    price: Decimal
    fee: Decimal
    fee_asset: str = "USDC"
    pnl: Optional[Decimal] = None
    timestamp: datetime
    strategy_id: Optional[str] = None


class Balance(BaseModel):
    asset: str
    free: Decimal
    locked: Decimal
    total: Decimal


class WalletInfo(BaseModel):
    address: str
    balances: List[Balance]
    nonce: int
    chain_id: int


class StrategyConfig(BaseModel):
    name: str
    enabled: bool = True
    parameters: Dict[str, Any] = Field(default_factory=dict)


class RiskLimits(BaseModel):
    max_position_size: Decimal
    max_daily_loss: Decimal
    max_positions: int
    stop_loss_pct: Decimal
    take_profit_pct: Decimal


class Signal(BaseModel):
    strategy_id: str
    market_id: str
    side: OrderSide
    confidence: float = Field(..., ge=0, le=1)
    size: Decimal
    reason: str
    timestamp: datetime
    metadata: Dict[str, Any] = Field(default_factory=dict)


class BotStatus(BaseModel):
    status: str  # running, paused, stopped
    uptime: float
    active_strategies: int
    open_positions: int
    pending_orders: int
    total_pnl: Decimal
    daily_pnl: Decimal
    last_update: datetime


class WebSocketMessage(BaseModel):
    type: str
    channel: str
    data: Dict[str, Any]
    timestamp: datetime
