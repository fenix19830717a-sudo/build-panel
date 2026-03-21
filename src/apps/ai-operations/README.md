# AI Site Operations Application

## Overview
The AI Site Operations application provides a comprehensive suite of tools for managing and optimizing independent e-commerce sites. It includes features for traffic analysis, SEO optimization, image enhancement, product scraping, and AI-driven blog writing.

## Architecture
- **Frontend**: React component located in `AIOperations.tsx`.
- **Backend**: 
  - `/api/ai/generate`: Used for blog writing and content optimization.
  - `/api/stores`: Manages store connections and sync.
  - `/api/ads`: Manages ad account integrations.
- **AI Integration**: Uses AI to analyze store data, optimize product listings, and generate marketing content.

## File Structure
- `AIOperations.tsx`: Main UI and logic.
- `types.ts`: Application specific types.
- `api.ts`: API client wrappers.
- `README.md`: This documentation.
- `kb.md`: Knowledge base definition for AI.

## Database Tables (Platform Level)
- `stores`: Stores connection details for Shopify, WordPress, etc.
- `user_stats`: Tracks credit usage for AI features.
- `crawler_tasks`: Manages product scraping jobs.
