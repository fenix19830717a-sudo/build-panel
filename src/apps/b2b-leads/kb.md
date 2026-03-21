# Knowledge Base Definition: B2B Leads CRM

## Definition
The B2B Leads CRM is a module for lead generation and relationship management. It integrates with external data providers and provides AI-driven communication tools.

## Boundaries
- **Input**: Search keywords, locations, HS codes, corporate assets (for email generation).
- **Output**: Lead lists, CRM sync status, generated cold emails.
- **Exclusions**: Does not provide direct legal advice on GDPR/CAN-SPAM (only provides suggestions).

## File Logic
1. **Mining**: Users search for leads via Google Maps, LinkedIn, or Customs Data.
2. **Import**: Leads are imported into the internal CRM (simulated in UI).
3. **Email Generation**: AI reads selected files from the global knowledge base to craft personalized cold emails.
4. **Sync**: Leads can be synced to external CRM platforms via `/api/saas/crm/sync`.

## AI Recognition Hints
- When generating emails, focus on the "Value Proposition" extracted from the knowledge base.
- Personalize emails using lead-specific data (name, company, location).
- Follow anti-spam best practices in all generated content.
