# Social Media Account Management (Account Sets)

## Overview
The Social Media module allows users to manage multiple sets of social media accounts organized by target country and core contact information (Phone/Email). It emphasizes the "Account Set" (成套账号) logic to prevent cross-account association and maintain clear operational boundaries.

## Core Features
- **Account Set Management (成套账号)**: Group accounts by phone/email identity and target country.
- **Environment Isolation**: Each set runs in a dedicated fingerprint browser environment (Cookies, UA, Canvas, etc.).
- **IP Management**:
  - **Platform Server**: Default shared IP (hidden), stable marketing environment.
  - **Dedicated IP**: $40/year residential IP for specific regions.
- **Login Persistence**: Save session data for one-click access to social platforms.
- **Whitelist Security**: Browser access is restricted to social media and e-commerce domains to prevent environment leakage.
- **Batch Posting**: Integrated API authorization for scheduled and bulk publishing within the same environment.

## Architecture
- **Frontend**: React component located in `SocialMedia.tsx`.
- **Logic**: 
  - Each set is centered around a unique phone number and email.
  - Recommended flow: Phone -> Google (Gmail) -> Other Platforms (TikTok, X, FB, etc.).
  - Integration with Cloud Browser for environment isolation.

## File Structure
- `SocialMedia.tsx`: Main UI for managing account sets and registration status.
- `README.md`: This documentation.
- `kb.md`: Knowledge base definition for AI.

## Database Tables (Platform Level)
- `social_account_sets`: Stores metadata for each set (name, country, phone, email).
- `social_platform_accounts`: Stores individual platform credentials and status linked to a set.
- `browser_profiles`: Linked profiles from the Cloud Browser module.
