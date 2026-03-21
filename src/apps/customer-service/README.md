# Customer Service & AI Reply Application

## Overview
The Customer Service application provides real-time translation for manual chat assistance and automated AI responses for independent sites. It also includes a Chrome extension for cross-platform support.

## Architecture
- **Frontend**: React component located in `CustomerService.tsx`.
- **Backend**: 
  - Uses the platform's AI generation endpoint for translation and reply suggestions.
  - Chat logs are retrieved from the platform's database.
- **AI Integration**: Uses AI to translate messages and generate context-aware replies based on the project's knowledge base.

## File Structure
- `CustomerService.tsx`: Main UI and logic.
- `types.ts`: Application specific types.
- `api.ts`: API client wrappers.
- `README.md`: This documentation.
- `kb.md`: Knowledge base definition for AI.

## Database Tables (Platform Level)
- `kb_files`: Used as the source of truth for AI auto-replies.
- `user_stats`: Tracks usage and rate limits.
