"""
FastAPI Web service for Polymarket Bot
"""
import os
from typing import List, Optional
from decimal import Decimal
from datetime import datetime

from fastapi import FastAPI, HTTPException, WebSocket, WebSocketDisconnect, Depends, Query
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from loguru import logger

from ..models import (
    Market, Order, OrderRequest, Position, Trade, 
    BotStatus, StrategyConfig, Signal
)
from ..api import PolymarketAPI
from ..wallet import WalletManager
from ..strategies import Strategy
from ..risk import RiskManager, RiskLimits
from ..execution import OrderExecutor
from ..portfolio import PositionManager


# Pydantic models for API requests/responses
class OrderCreateRequest(BaseModel):
    market_id: str
    side: str
    order_type: str = "limit"
    size: float
    price: Optional[float] = None
    time_in_force: str = "GTC"


class StrategyUpdateRequest(BaseModel):
    enabled: Optional[bool] = None
    parameters: Optional[dict] = None


class RiskLimitsUpdate(BaseModel):
    max_position_size: Optional[float] = None
    max_daily_loss: Optional[float] = None
    max_positions: Optional[int] = None
    stop_loss_pct: Optional[float] = None
    take_profit_pct: Optional[float] = None


class WalletImportRequest(BaseModel):
    private_key: str
    name: Optional[str] = "default"


# Create FastAPI app
app = FastAPI(
    title="Polymarket Bot API",
    description="API for managing Polymarket trading bot",
    version="0.1.0"
)

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Configure appropriately for production
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# Global state (will be initialized in main)
class BotState:
    def __init__(self):
        self.api: Optional[PolymarketAPI] = None
        self.wallet: Optional[WalletManager] = None
        self.risk_manager: Optional[RiskManager] = None
        self.executor: Optional[OrderExecutor] = None
        self.portfolio: Optional[PositionManager] = None
        self.strategies: List[Strategy] = []
        self.status: str = "stopped"
        self.start_time: Optional[datetime] = None


bot_state = BotState()


# Dependency to check bot is initialized
async def get_initialized_bot():
    if bot_state.api is None:
        raise HTTPException(status_code=503, detail="Bot not initialized")
    return bot_state


# HTTP Routes

@app.get("/")
async def root():
    """API root"""
    return {
        "name": "Polymarket Bot API",
        "version": "0.1.0",
        "status": bot_state.status,
        "docs": "/docs"
    }


@app.get("/health")
async def health():
    """Health check"""
    return {
        "status": "healthy",
        "bot_status": bot_state.status,
        "timestamp": datetime.utcnow().isoformat()
    }


@app.get("/markets", response_model=List[Market])
async def get_markets(
    limit: int = Query(100, ge=1, le=1000),
    active: bool = True,
    bot=Depends(get_initialized_bot)
):
    """Get list of markets"""
    try:
        markets = await bot.api.get_markets(limit=limit, active=active)
        return markets
    except Exception as e:
        logger.error(f"Failed to get markets: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@app.get("/markets/{market_id}")
async def get_market(market_id: str, bot=Depends(get_initialized_bot)):
    """Get market details"""
    market = await bot.api.get_market(market_id)
    if not market:
        raise HTTPException(status_code=404, detail="Market not found")
    return market


@app.get("/markets/{market_id}/orderbook")
async def get_orderbook(market_id: str, bot=Depends(get_initialized_bot)):
    """Get market order book"""
    orderbook = await bot.api.get_orderbook(market_id)
    if not orderbook:
        raise HTTPException(status_code=404, detail="Order book not found")
    return orderbook


@app.get("/positions")
async def get_positions(
    status: Optional[str] = None,
    bot=Depends(get_initialized_bot)
):
    """Get current positions"""
    if bot.portfolio is None:
        raise HTTPException(status_code=503, detail="Portfolio manager not initialized")
    
    await bot.portfolio.sync_positions()
    
    from ..models import PositionStatus
    if status:
        positions = bot.portfolio.get_all_positions(PositionStatus(status))
    else:
        positions = bot.portfolio.get_all_positions()
    
    return positions


@app.get("/positions/{position_id}")
async def get_position(position_id: str, bot=Depends(get_initialized_bot)):
    """Get position details"""
    if bot.portfolio is None:
        raise HTTPException(status_code=503, detail="Portfolio manager not initialized")
    
    summary = bot.portfolio.get_position_summary(position_id)
    if not summary:
        raise HTTPException(status_code=404, detail="Position not found")
    
    return summary


@app.post("/orders")
async def create_order(order_req: OrderCreateRequest, bot=Depends(get_initialized_bot)):
    """Place a new order"""
    if bot.executor is None:
        raise HTTPException(status_code=503, detail="Order executor not initialized")
    
    try:
        order_request = OrderRequest(
            market_id=order_req.market_id,
            side=order_req.side,
            order_type=order_req.order_type,
            size=Decimal(str(order_req.size)),
            price=Decimal(str(order_req.price)) if order_req.price else None,
            time_in_force=order_req.time_in_force,
            client_order_id=f"manual_{datetime.utcnow().timestamp()}"
        )
        
        order = await bot.executor.execute(order_request)
        
        if not order:
            raise HTTPException(status_code=400, detail="Order placement failed")
        
        return order
        
    except Exception as e:
        logger.error(f"Failed to place order: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@app.get("/orders")
async def get_orders(
    market_id: Optional[str] = None,
    status: Optional[str] = None,
    bot=Depends(get_initialized_bot)
):
    """Get orders"""
    orders = await bot.api.get_orders(market_id=market_id, status=status)
    return orders


@app.delete("/orders/{order_id}")
async def cancel_order(order_id: str, bot=Depends(get_initialized_bot)):
    """Cancel an order"""
    if bot.executor is None:
        raise HTTPException(status_code=503, detail="Order executor not initialized")
    
    success = await bot.executor.cancel_order(order_id)
    
    if not success:
        raise HTTPException(status_code=400, detail="Failed to cancel order")
    
    return {"success": True, "order_id": order_id}


@app.get("/trades")
async def get_trades(
    limit: int = Query(100, ge=1, le=1000),
    bot=Depends(get_initialized_bot)
):
    """Get trade history"""
    trades = await bot.api.get_trades(limit=limit)
    return trades


@app.get("/balance")
async def get_balance(bot=Depends(get_initialized_bot)):
    """Get wallet balance"""
    if bot.wallet is None or not bot.wallet.is_loaded:
        raise HTTPException(status_code=503, detail="Wallet not loaded")
    
    try:
        balance = bot.wallet.get_wallet_info()
        return balance
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.get("/config")
async def get_config(bot=Depends(get_initialized_bot)):
    """Get bot configuration and status"""
    strategies = [s.to_dict() for s in bot.strategies]
    
    risk_report = {}
    if bot.risk_manager:
        risk_report = bot.risk_manager.get_risk_report()
    
    portfolio_summary = {}
    if bot.portfolio:
        portfolio_summary = bot.portfolio.get_portfolio_summary()
    
    uptime = 0
    if bot.start_time:
        uptime = (datetime.utcnow() - bot.start_time).total_seconds()
    
    return BotStatus(
        status=bot.status,
        uptime=uptime,
        active_strategies=len([s for s in bot.strategies if s.enabled]),
        open_positions=len(portfolio_summary.get("positions", [])),
        pending_orders=len(bot.executor.get_active_orders()) if bot.executor else 0,
        total_pnl=Decimal(str(portfolio_summary.get("total_pnl", 0))),
        daily_pnl=Decimal(str(risk_report.get("daily_pnl", 0))),
        last_update=datetime.utcnow()
    )


@app.get("/strategies")
async def get_strategies(bot=Depends(get_initialized_bot)):
    """Get strategy configurations"""
    return [s.to_dict() for s in bot.strategies]


@app.patch("/strategies/{strategy_name}")
async def update_strategy(
    strategy_name: str,
    update: StrategyUpdateRequest,
    bot=Depends(get_initialized_bot)
):
    """Update strategy configuration"""
    strategy = None
    for s in bot.strategies:
        if s.name == strategy_name:
            strategy = s
            break
    
    if not strategy:
        raise HTTPException(status_code=404, detail="Strategy not found")
    
    if update.enabled is not None:
        if update.enabled:
            strategy.enable()
        else:
            strategy.disable()
    
    if update.parameters:
        strategy.config.parameters.update(update.parameters)
    
    return strategy.to_dict()


@app.get("/risk")
async def get_risk_status(bot=Depends(get_initialized_bot)):
    """Get risk management status"""
    if bot.risk_manager is None:
        raise HTTPException(status_code=503, detail="Risk manager not initialized")
    
    return bot.risk_manager.get_risk_report()


@app.post("/risk/limits")
async def update_risk_limits(limits: RiskLimitsUpdate, bot=Depends(get_initialized_bot)):
    """Update risk limits"""
    if bot.risk_manager is None:
        raise HTTPException(status_code=503, detail="Risk manager not initialized")
    
    if limits.max_position_size is not None:
        bot.risk_manager.limits.max_position_size = Decimal(str(limits.max_position_size))
    if limits.max_daily_loss is not None:
        bot.risk_manager.limits.max_daily_loss = Decimal(str(limits.max_daily_loss))
    if limits.max_positions is not None:
        bot.risk_manager.limits.max_positions = limits.max_positions
    if limits.stop_loss_pct is not None:
        bot.risk_manager.limits.stop_loss_pct = Decimal(str(limits.stop_loss_pct)) / 100
    if limits.take_profit_pct is not None:
        bot.risk_manager.limits.take_profit_pct = Decimal(str(limits.take_profit_pct)) / 100
    
    return bot.risk_manager.get_risk_report()


@app.post("/wallet/import")
async def import_wallet(request: WalletImportRequest, bot=Depends(get_initialized_bot)):
    """Import wallet from private key"""
    if bot.wallet is None:
        raise HTTPException(status_code=503, detail="Wallet manager not initialized")
    
    try:
        encrypted_key = bot.wallet.import_wallet(request.private_key)
        
        # Save to storage
        from ..wallet import WalletStorage
        storage = WalletStorage()
        storage.save(encrypted_key, name=request.name)
        
        # Load the wallet
        wallet_data = storage.load(name=request.name)
        bot.wallet.load_wallet(wallet_data)
        
        return {
            "success": True,
            "address": encrypted_key.address
        }
        
    except Exception as e:
        logger.error(f"Failed to import wallet: {e}")
        raise HTTPException(status_code=400, detail=str(e))


@app.get("/portfolio")
async def get_portfolio_summary(bot=Depends(get_initialized_bot)):
    """Get portfolio summary"""
    if bot.portfolio is None:
        raise HTTPException(status_code=503, detail="Portfolio manager not initialized")
    
    await bot.portfolio.sync_positions()
    
    return bot.portfolio.get_portfolio_summary()


@app.get("/performance")
async def get_performance_report(days: int = 30, bot=Depends(get_initialized_bot)):
    """Get performance report"""
    if bot.portfolio is None:
        raise HTTPException(status_code=503, detail="Portfolio manager not initialized")
    
    return bot.portfolio.get_performance_report(days=days)


# WebSocket for real-time updates
class ConnectionManager:
    def __init__(self):
        self.active_connections: List[WebSocket] = []
    
    async def connect(self, websocket: WebSocket):
        await websocket.accept()
        self.active_connections.append(websocket)
    
    def disconnect(self, websocket: WebSocket):
        self.active_connections.remove(websocket)
    
    async def broadcast(self, message: dict):
        for connection in self.active_connections:
            try:
                await connection.send_json(message)
            except:
                pass


ws_manager = ConnectionManager()


@app.websocket("/ws")
async def websocket_endpoint(websocket: WebSocket):
    """WebSocket endpoint for real-time updates"""
    await ws_manager.connect(websocket)
    try:
        while True:
            # Receive client messages (subscriptions, etc.)
            data = await websocket.receive_text()
            # Echo back or process commands
            await websocket.send_json({
                "type": "ack",
                "data": data,
                "timestamp": datetime.utcnow().isoformat()
            })
    except WebSocketDisconnect:
        ws_manager.disconnect(websocket)


# Startup and shutdown events
@app.on_event("startup")
async def startup_event():
    """Initialize bot on startup"""
    logger.info("Polymarket Bot API starting up...")


@app.on_event("shutdown")
async def shutdown_event():
    """Cleanup on shutdown"""
    logger.info("Polymarket Bot API shutting down...")
    if bot_state.api:
        await bot_state.api.close()
