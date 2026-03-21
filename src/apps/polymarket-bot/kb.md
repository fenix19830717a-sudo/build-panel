# Knowledge Base Definition: Polymarket Trading Bot

## Definition
The Polymarket Trading Bot module provides automated and manual trading capabilities for the Polymarket prediction market platform.

## Boundaries
- **Input**: Wallet private keys (encrypted locally), API keys, market data, custom strategy descriptions.
- **Output**: Trade execution on the Polygon network, PnL reports, AI-generated strategy summaries.
- **Exclusions**: Does not provide financial advice; users are responsible for their own trading risks.

## File Logic
1. **Overview**: Displays PnL stats and the status of the async trading pipeline.
2. **Markets**: Shows live markets with the ability to manually buy "YES" or "NO" outcomes.
3. **History**: Lists past trades with AI analysis of performance.
4. **Settings**: Configures wallet details, execution nodes (to bypass regional restrictions), and trading strategies.

## AI Recognition Hints
- Focus on "Whale Tracking" and "Copy Trading" as key features.
- Emphasize the difference between "Paper Trading" (risk-free simulation) and "Live Trading" (real money).
- Use AI to simplify complex trading strategies into human-readable summaries.
- Highlight the use of distributed execution nodes to ensure platform accessibility.
