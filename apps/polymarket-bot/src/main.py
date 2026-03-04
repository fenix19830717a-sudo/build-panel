#!/usr/bin/env python3
"""
Polymarket Trading Bot - Main Entry Point
"""
import asyncio
import signal
import sys
from datetime import datetime
from typing import List

from loguru import logger

from src.utils import load_config, setup_logging
from src.api import PolymarketAPI
from src.wallet import WalletManager, WalletStorage
from src.strategies import TrendFollowingStrategy, ArbitrageStrategy, TrendConfig, ArbitrageConfig
from src.risk import RiskManager, RiskLimits
from src.execution import OrderExecutor, ExecutionConfig, ExecutionStrategy
from src.portfolio import PositionManager
from src.web.api import bot_state


class PolymarketBot:
    """Main trading bot class"""
    
    def __init__(self, config_path: str = "config.yaml"):
        self.config = load_config(config_path)
        setup_logging(self.config)
        
        self.running = False
        self.shutdown_event = asyncio.Event()
        
        # Initialize components
        self.api: PolymarketAPI = None
        self.wallet: WalletManager = None
        self.risk_manager: RiskManager = None
        self.executor: OrderExecutor = None
        self.portfolio: PositionManager = None
        self.strategies: List = []
        
        logger.info("Polymarket Bot initialized")
    
    async def initialize(self):
        """Initialize all components"""
        logger.info("Initializing components...")
        
        # Initialize API client
        api_config = self.config.get("api", {})
        self.api = PolymarketAPI(
            api_key=api_config.get("api_key", ""),
            api_secret=api_config.get("api_secret", ""),
            base_url=api_config.get("base_url", "https://api.polymarket.com"),
            timeout=api_config.get("timeout", 30)
        )
        
        # Initialize wallet
        wallet_config = self.config.get("wallet", {})
        self.wallet = WalletManager(
            rpc_url=wallet_config.get("rpc_url", "https://polygon-rpc.com"),
            encryption_key_path=wallet_config.get("encryption_key_path", "./.keys/encryption.key")
        )
        
        # Try to load existing wallet
        storage = WalletStorage()
        wallet_data = storage.load("default")
        if wallet_data:
            self.wallet.load_wallet(wallet_data)
            logger.info(f"Wallet loaded: {self.wallet.address}")
        else:
            logger.warning("No wallet found. Please import a wallet using the API.")
        
        # Initialize risk manager
        risk_config = self.config.get("risk", {})
        limits = RiskLimits(
            max_position_size=risk_config.get("max_position_size", 1000),
            max_positions=risk_config.get("max_positions", 10),
            max_daily_loss=risk_config.get("max_daily_loss", 500),
            stop_loss_pct=risk_config.get("stop_loss_pct", 0.05),
            take_profit_pct=risk_config.get("take_profit_pct", 0.10)
        )
        self.risk_manager = RiskManager(limits)
        
        # Initialize order executor
        trading_config = self.config.get("trading", {})
        exec_config = ExecutionConfig(
            strategy=ExecutionStrategy.LIMIT,
            max_slippage=trading_config.get("default_slippage", 0.01)
        )
        self.executor = OrderExecutor(
            api=self.api,
            risk_manager=self.risk_manager,
            config=exec_config,
            dry_run=trading_config.get("dry_run", True)
        )
        
        # Initialize portfolio manager
        self.portfolio = PositionManager(self.api)
        
        # Initialize strategies
        await self._initialize_strategies()
        
        # Update bot state for web API
        bot_state.api = self.api
        bot_state.wallet = self.wallet
        bot_state.risk_manager = self.risk_manager
        bot_state.executor = self.executor
        bot_state.portfolio = self.portfolio
        bot_state.strategies = self.strategies
        
        logger.info("Components initialized successfully")
    
    async def _initialize_strategies(self):
        """Initialize trading strategies"""
        strategies_config = self.config.get("strategies", {})
        
        # Trend following strategy
        trend_config = strategies_config.get("trend_following", {})
        if trend_config.get("enabled", True):
            config = TrendConfig(
                name="trend_following",
                enabled=True,
                min_confidence=trend_config.get("min_confidence", 0.6),
                rsi_period=trend_config.get("rsi_period", 14),
                rsi_overbought=trend_config.get("rsi_overbought", 70),
                rsi_oversold=trend_config.get("rsi_oversold", 30),
                macd_fast=trend_config.get("macd_fast", 12),
                macd_slow=trend_config.get("macd_slow", 26),
                macd_signal=trend_config.get("macd_signal", 9),
                max_position_size=self.config.get("trading", {}).get("max_position_size", 1000)
            )
            strategy = TrendFollowingStrategy(config)
            self.strategies.append(strategy)
            logger.info("Trend following strategy initialized")
        
        # Arbitrage strategy
        arb_config = strategies_config.get("arbitrage", {})
        if arb_config.get("enabled", True):
            config = ArbitrageConfig(
                name="arbitrage",
                enabled=True,
                min_spread=arb_config.get("min_spread", 0.02),
                max_hold_time=arb_config.get("max_hold_time", 300),
                max_position_size=self.config.get("trading", {}).get("max_position_size", 1000)
            )
            strategy = ArbitrageStrategy(config)
            self.strategies.append(strategy)
            logger.info("Arbitrage strategy initialized")
    
    async def run_strategy_cycle(self):
        """Run one cycle of strategy analysis"""
        try:
            # Get markets
            markets = await self.api.get_markets(limit=50, active=True)
            
            if not markets:
                logger.warning("No markets available")
                return
            
            # Get wallet balance if available
            available_balance = Decimal("10000")  # Default for dry run
            if self.wallet and self.wallet.is_loaded:
                try:
                    wallet_info = self.wallet.get_wallet_info()
                    for balance in wallet_info.balances:
                        if balance.asset == "USDC":
                            available_balance = balance.free
                            break
                except Exception as e:
                    logger.warning(f"Failed to get wallet balance: {e}")
            
            # Get current exposure
            await self.portfolio.sync_positions()
            current_exposure = self.portfolio.get_exposure()
            open_positions = self.portfolio.get_open_positions()
            
            # Run each strategy
            for market in markets[:10]:  # Limit to top 10 markets
                try:
                    # Get order book
                    orderbook = await self.api.get_orderbook(market.id)
                    if not orderbook:
                        continue
                    
                    # Update market price for P&L
                    mid_price = (orderbook.bids[0].price + orderbook.asks[0].price) / 2 if orderbook.bids and orderbook.asks else Decimal("0.5")
                    self.portfolio.update_market_price(market.id, mid_price)
                    
                    # Run strategies
                    for strategy in self.strategies:
                        if not strategy.enabled:
                            continue
                        
                        signal = await strategy.analyze(market, orderbook)
                        
                        if signal:
                            logger.info(f"Signal generated: {signal.side.value} {market.id} "
                                       f"confidence={signal.confidence:.2f}")
                            
                            # Risk check
                            risk_result = self.risk_manager.check_signal(
                                signal, open_positions, available_balance, current_exposure
                            )
                            
                            if not risk_result.allowed:
                                logger.warning(f"Signal blocked by risk manager: {risk_result.reason}")
                                continue
                            
                            # Adjust size if needed
                            if risk_result.adjusted_size:
                                signal.size = risk_result.adjusted_size
                            
                            # Execute order
                            from src.models import OrderRequest, OrderType
                            
                            order_request = OrderRequest(
                                market_id=market.id,
                                side=signal.side,
                                order_type=OrderType.LIMIT,
                                size=signal.size,
                                price=None,  # Market order for now
                                client_order_id=f"strategy_{strategy.name}_{datetime.utcnow().timestamp()}"
                            )
                            
                            order = await self.executor.execute(order_request)
                            
                            if order:
                                logger.info(f"Order placed: {order.id}")
                                self.risk_manager.record_trade()
                            
                except Exception as e:
                    logger.error(f"Error processing market {market.id}: {e}")
                    continue
            
            # Check for position exits (stop loss / take profit)
            for position in open_positions:
                exit_reason = self.risk_manager.check_position_exit(
                    position, 
                    self.portfolio._market_prices.get(position.market_id, position.current_price)
                )
                
                if exit_reason:
                    logger.info(f"Exit triggered for {position.id}: {exit_reason}")
                    # Place exit order
                    exit_side = OrderSide.SELL if position.side == OrderSide.BUY else OrderSide.BUY
                    exit_order = OrderRequest(
                        market_id=position.market_id,
                        side=exit_side,
                        order_type=OrderType.MARKET,
                        size=position.size,
                        client_order_id=f"exit_{position.id}"
                    )
                    await self.executor.execute(exit_order)
            
        except Exception as e:
            logger.error(f"Strategy cycle error: {e}")
    
    async def run(self):
        """Main bot loop"""
        logger.info("Starting Polymarket Bot...")
        
        await self.initialize()
        
        self.running = True
        bot_state.status = "running"
        bot_state.start_time = datetime.utcnow()
        
        logger.info("Bot is running. Press Ctrl+C to stop.")
        
        try:
            while self.running and not self.shutdown_event.is_set():
                await self.run_strategy_cycle()
                
                # Wait for next cycle (every 30 seconds)
                try:
                    await asyncio.wait_for(
                        self.shutdown_event.wait(), 
                        timeout=30
                    )
                except asyncio.TimeoutError:
                    pass
                    
        except asyncio.CancelledError:
            logger.info("Bot loop cancelled")
        finally:
            await self.shutdown()
    
    async def shutdown(self):
        """Shutdown the bot gracefully"""
        logger.info("Shutting down...")
        
        self.running = False
        bot_state.status = "stopped"
        
        # Cancel all pending orders
        if self.executor:
            cancelled = await self.executor.cancel_all_orders()
            logger.info(f"Cancelled {cancelled} orders")
        
        # Close API client
        if self.api:
            await self.api.close()
        
        logger.info("Shutdown complete")
    
    def signal_handler(self, signum, frame):
        """Handle shutdown signals"""
        logger.info(f"Received signal {signum}")
        self.shutdown_event.set()


async def main():
    """Main entry point"""
    bot = PolymarketBot()
    
    # Setup signal handlers
    signal.signal(signal.SIGINT, bot.signal_handler)
    signal.signal(signal.SIGTERM, bot.signal_handler)
    
    try:
        await bot.run()
    except Exception as e:
        logger.exception("Fatal error in bot")
        sys.exit(1)


if __name__ == "__main__":
    asyncio.run(main())
