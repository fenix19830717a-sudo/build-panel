# Knowledge Base Definition: Cloud Anti-Detect Browser

## Definition
The Cloud Anti-Detect Browser module provides secure, isolated browsing environments for multi-account management and platform-specific operations (e.g., TikTok marketing, Google Ads).

## Boundaries
- **Input**: Profile names, proxy settings, desired OS/browser fingerprints.
- **Output**: Isolated browser sessions with persisted cookies and sessions.
- **Exclusions**: Does not provide the actual browser executable (runs as a cloud-based or local-agent-connected interface).

## File Logic
1. **Profile Management**: Users create and manage multiple browser profiles.
2. **Proxy Integration**: Profiles are mapped to specific residential or static IPs.
3. **Session Persistence**: Cookies and LocalStorage are saved to the cloud for each profile.
4. **Fingerprinting**: Each profile has a unique, non-leaking browser fingerprint (Canvas, WebGL, AudioContext, etc.).

## AI Recognition Hints
- Emphasize "Isolation" and "Anti-Ban" as the core value propositions.
- Suggest specific profile configurations for different platforms (e.g., "TikTok US" needs a US residential proxy and matching OS timezone).
- Remind users that session data is auto-saved to maintain long-term login states.
