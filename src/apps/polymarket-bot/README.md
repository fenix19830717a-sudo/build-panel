# Polymarket Trading Bot Application

## Overview
The Polymarket Trading Bot is an automated trading platform for Polymarket. It supports whale tracking, copy-trading, and AI-driven strategy generation. It features both "Paper Trading" (simulation) and "Live Trading" modes.

## Architecture
- **Frontend**: React component located in `PolymarketBot.tsx`.
- **Backend**: 
  - `/api/polymarket/scrape`: Scrapes market data and whale movements.
  - `/api/polymarket/orders`: Manages trade execution (Polygon network).
  - `/api/polymarket/strategies`: Manages trading strategies.
- **AI Integration**: Uses AI to analyze market trends and generate custom trading strategies based on user descriptions.

## File Structure
- `PolymarketBot.tsx`: Main UI and logic.
- `types.ts`: Application specific types.
- `api.ts`: API client wrappers.
- `README.md`: This documentation.
- `kb.md`: Knowledge base definition for AI.

## Database Tables (Platform Level)
- `polymarket_strategies`: Stores user-defined and built-in strategies.
- `polymarket_orders`: Records all trade history (paper and live).
- `user_stats`: Tracks PnL and usage.
