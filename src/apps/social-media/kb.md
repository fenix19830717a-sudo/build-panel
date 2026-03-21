# Knowledge Base Definition: Social Media Account Management

## Definition
The Social Media module manages "Account Sets" (成套账号), which are groups of social media accounts (Google, Facebook, TikTok, X, etc.) organized by a single core contact (Phone/Email) and target country.

## Core Concepts
- **Account Set (成套账号)**: A logical group of social media accounts (one per platform) sharing a single browser environment and IP.
- **Environment Isolation**: The use of unique fingerprints (User-Agent, WebGL, etc.) and dedicated IPs to prevent platform-level account association.
- **Whitelist Restriction**: A security feature limiting browser navigation to approved social and e-commerce domains.
- **API Authorization**: The process of linking platform APIs for automated posting within the same isolated environment.

## Boundaries
- **Input**: Phone numbers, emails, target countries, platform credentials.
- **Output**: Organized account sets, registration status tracking, browser profile links for isolated access.
- **Exclusions**: Does not provide the actual browser environment (handled by Cloud Browser) or the phone numbers themselves (external SMS services).

## File Logic
1. **Account Set Creation**: Define a set with a name, country, and core contact (Phone/Email).
2. **IP Selection**: Choose between platform-recommended servers or dedicated residential IPs ($40/yr).
3. **Registration Tracking**: Track which platforms have been registered for each set.
4. **Registration Assistant**: Suggests the "Phone -> Google -> All" registration flow to maintain logical consistency.
5. **Environment Link**: Connect each set to a unique browser profile to prevent account association and bans.
6. **Whitelist Enforcement**: Restrict browser access to social media and e-commerce domains.

## AI Recognition Hints
- Focus on "Account Sets" (成套账号) as the primary organizational unit.
- Emphasize the "Phone -> Google -> All" registration logic as a best practice.
- Highlight the importance of "Proxy/Profile Isolation" for multi-account management.
- Use AI to help users track registration progress and suggest next steps for each set.
