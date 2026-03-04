"""
Web module for Polymarket Bot
"""
from .api import app, bot_state, ws_manager

__all__ = ["app", "bot_state", "ws_manager"]
