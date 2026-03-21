# Site Generator & Knowledge Base Application

## Overview
The Site Generator & Knowledge Base application allows users to build a multilingual independent site and an AI customer service knowledge base from company assets. It automates site generation, SEO blog creation, and store synchronization.

## Architecture
- **Frontend**: React component located in `SiteGenerator.tsx`.
- **Backend**:
  - `/api/kb/*`: Manages knowledge base file uploads and parsing.
  - `/api/stores/*`: Handles store binding (Shopify, WordPress, etc.) and content synchronization.
- **AI Integration**: Uses AI to extract company information from uploaded documents and generate SEO-optimized blog posts.

## File Structure
- `SiteGenerator.tsx`: Main UI and multi-step workflow.
- `types.ts`: Application specific types.
- `api.ts`: API client wrappers.
- `README.md`: This documentation.
- `kb.md`: Knowledge base definition for AI.

## Database Tables (Platform Level)
- `kb_files`: Stores metadata for uploaded documents.
- `stores`: Stores connected store credentials and settings.
- `seo_articles`: Records generated blog posts.
