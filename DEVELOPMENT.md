# Platform Development & Logic Documentation

## 1. Overview
This platform is a comprehensive automation and trading suite designed for high-performance operations on Polymarket and other web-based platforms. It integrates advanced browser fingerprinting, dedicated residential proxy management, and server-side bot execution to ensure security, stability, and bypass regional restrictions.

---

## 2. Core Modules

### A. Polymarket Trading Bot (Poly Bot)
The Poly Bot is the flagship module, providing both simulation and live trading capabilities.

#### Logic Flow:
1. **Market Discovery**: The platform uses "Market Robots" to scrape Polymarket data via multi-threaded processes.
2. **Strategy Engine**:
   - **Simulation (Paper)**: Trades are tracked locally in the database. Users can test strategies with virtual funds.
   - **Live Trading**: Trades are executed on platform-deployed servers.
3. **Authentication**:
   - **Wallet Connection**: For session authorization.
   - **Private Key**: Encrypted and used by the server-side bot for on-chain execution.
4. **Execution Constraints**:
   - **Concurrency**: Live trades are restricted to `Concurrency: 1` to prevent account flags. Paper trades allow up to `Concurrency: 10`.
   - **Server-Side**: All live trades are marked `isServerSide: true` and processed via dedicated infrastructure.

### B. System & Resource Management (Admin)
Ensures the underlying infrastructure is healthy and resources are allocated correctly.

#### Key Features:
1. **Server Monitoring**: Real-time tracking of CPU, RAM, and active bot processes.
2. **Dedicated IP Management**:
   - **Residential IPs**: Sourced at $40/year per IP.
   - **Assignment**: IPs are bound to specific user accounts and fingerprint environments.
3. **Fingerprint Environments**:
   - Each user has a "Cloud Browser" environment.
   - Environments store Cookies, User-Agent, and are tied to a Dedicated IP to prevent detection.

### C. Account Sets & Cloud Browser (Fingerprint Isolation)
The platform provides a "Cloud Browser" tool that allows users to manage multiple social media or e-commerce accounts without detection.

#### Logic Flow:
1.  **Account Set Creation**: Users create a "Group" (Account Set).
2.  **Environment Generation**: The platform generates a unique browser fingerprint (UA, WebGL, Canvas, etc.) for each environment.
3.  **IP Binding**:
    -   **Default**: Uses the platform's shared server IP.
    -   **Dedicated**: Users can purchase a dedicated residential IP ($40/year). Once purchased, the environment is permanently bound to this IP.
4.  **One-Click Launch**: Users launch the environment via a "Cloud Browser" interface.
5.  **Session Persistence**: Cookies and login authorizations for platforms like TikTok, FB, Amazon, etc., are saved within the environment. Subsequent launches restore the session instantly.
6.  **Whitelisting & Security**:
    -   **Domain Restriction**: Environments are restricted to a "Whitelist" of domains (e.g., `*.tiktok.com`, `*.facebook.com`, `*.amazon.com`) to prevent data leakage and ensure the environment is used only for its intended purpose.
    -   **IP Leak Protection**: WebRTC is disabled or proxied to prevent real IP exposure.

### D. Proxy & Whitelist Implementation
To ensure account safety and prevent "cross-contamination" between account sets, the platform implements a strict proxy and whitelisting layer.

#### Technical Details:
1.  **Proxy Layer**: Every browser environment is routed through a dedicated `SOCKS5` or `HTTP` proxy server.
    -   **IP Rotation**: For shared IPs, rotation occurs every 24 hours.
    -   **Static IPs**: Dedicated residential IPs remain static for the duration of the subscription.
2.  **DNS Filtering**: The host server uses `CoreDNS` or similar to intercept DNS requests.
    -   **Whitelist**: Only domains matching the whitelist (e.g., `*.tiktok.com`, `*.facebook.com`, `*.google.com`, `*.polymarket.com`) are resolved.
    -   **Blacklist**: All other requests (e.g., tracking pixels, unrelated sites) are blocked or redirected to a local sinkhole.
3.  **Browser Fingerprint Spoofing**:
    -   **Canvas/WebGL**: Noise is injected into rendering buffers to create unique hardware signatures.
    -   **WebRTC**: The `Local IP` and `Public IP` reported by WebRTC are spoofed to match the assigned proxy IP.
    -   **AudioContext**: Unique frequency response curves are generated for each environment.

---

## 3. User Roles & Permissions

### Regular User
- **Dashboard**: View personal PnL and active bots.
- **Poly Bot**: Configure and run trading strategies.
- **Billing**: Pay for node fees ($49/mo) and dedicated IPs.

### Administrator
- **User Management**: View and manage all user accounts.
- **System Management**: Monitor global server health.
- **IP Inventory**: Add and assign dedicated residential IPs to users.
- **Environment Audit**: View active fingerprint environments across the platform.

---

## 4. Technical Architecture

### Frontend
- **React + Tailwind CSS**: For a modern, responsive UI.
- **Lucide React**: For consistent iconography.
- **Framer Motion**: For smooth transitions and animations.

### Backend
- **Express.js**: Serving API routes and Vite middleware.
- **SQLite (Better-SQLite3)**: Lightweight, high-performance database for state persistence.
- **WebSocket (Planned)**: For real-time market data streaming.

### Security
- **Encrypted Storage**: Sensitive data like private keys are handled with care.
- **Isolation**: Fingerprint environments ensure that user activities are isolated at the browser level.

---

## 5. Usage Logic Simulation

### Step 1: Onboarding
User registers and logs in. They are prompted to set up their "Trading Node" by paying the monthly fee.

### Step 2: Resource Allocation
The Admin assigns a **Dedicated Residential IP** to the user. The user sees this IP active in their "Server Deployment" settings.

### Step 3: Strategy Setup
The user describes a strategy: *"Follow whale 0x123... and buy YES if they buy > 1000 USDC."* AI generates the strategy logic.

### Step 4: Execution
The user enables "Live Trading" and starts the bot. The platform spawns a server-side process that monitors the target whale and executes trades via the user's dedicated IP.

### Step 5: Monitoring
The user tracks the bot's performance in the "History" tab, seeing real-time PnL updates.
