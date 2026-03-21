# B2B Leads CRM Application

## Overview
The B2B Leads CRM application provides tools for mining potential customers from various sources (Google Maps, LinkedIn, Customs Data) and managing them in a centralized CRM. It also includes an AI-powered email marketing module.

## Architecture
- **Frontend**: React component located in `B2BLeads.tsx`.
- **Backend**: 
  - `/api/saas/linkedin/search`: Proxies to LinkedIn helper.
  - `/api/saas/customs/search`: Proxies to Customs Data API.
  - `/api/saas/crm/sync`: Syncs leads to external CRM (e.g., HubSpot).
- **AI Integration**: Uses AI to generate persuasive cold emails based on knowledge base assets.

## File Structure
- `B2BLeads.tsx`: Main UI and logic.
- `types.ts`: Application specific types.
- `api.ts`: API client wrappers.
- `README.md`: This documentation.
- `kb.md`: Knowledge base definition for AI.

## Database Tables (Platform Level)
- `user_stats`: Tracks credits used for lead mining.
- `third_party_saas_configs`: Stores API keys for external services.
