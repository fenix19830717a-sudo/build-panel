# Cloud Anti-Detect Browser Application

## Overview
The Cloud Browser application provides isolated browser environments with dedicated proxies and unique fingerprints. It is designed to prevent account bans on platforms like TikTok, Facebook, and LinkedIn by ensuring complete session and cookie isolation.

## Architecture
- **Frontend**: React component located in `CloudBrowser.tsx`.
- **Backend**: 
  - Manages browser profile configurations.
  - Integrates with proxy providers (e.g., AWS, residential proxy networks).
- **Security**: Implements fingerprint spoofing and session persistence.

## File Structure
- `CloudBrowser.tsx`: Main UI and logic.
- `types.ts`: Application specific types.
- `api.ts`: API client wrappers.
- `README.md`: This documentation.
- `kb.md`: Knowledge base definition for AI.

## Database Tables (Platform Level)
- `browser_profiles`: Stores profile settings (OS, browser version, proxy).
- `user_stats`: Tracks usage and subscription for premium IPs.
