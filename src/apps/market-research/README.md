# Market Research Report Application

## Overview
The Market Research Report application enables users to generate structured market research reports for specific industries and regions. It provides both high-level outlines and detailed reports including market size, competitors, and customer personas.

## Architecture
- **Frontend**: React component located in `MarketResearch.tsx`.
- **Backend**:
  - `/api/ai/generate`: Used to generate report content via AI models.
- **AI Integration**: Leverages AI to synthesize market data into professional markdown reports.

## File Structure
- `MarketResearch.tsx`: Main UI for report configuration and preview.
- `types.ts`: Application specific types.
- `api.ts`: API client wrappers.
- `README.md`: This documentation.
- `kb.md`: Knowledge base definition for AI.

## Database Tables (Platform Level)
- `market_reports`: Stores history of generated reports.
- `user_stats`: Tracks credit usage for deep analysis.
