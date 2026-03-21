# Global Logistics Tracking Application

## Overview
The Global Logistics Tracking application allows users to track international shipments in real-time. It supports major carriers like DHL, FedEx, and UPS.

## Architecture
- **Frontend**: React component located in `LogisticsTracking.tsx`.
- **Backend**: 
  - Proxies to third-party logistics APIs (e.g., 17track, AfterShip).
- **Functionality**: Provides a timeline view of the package's journey.

## File Structure
- `LogisticsTracking.tsx`: Main UI and logic.
- `types.ts`: Application specific types.
- `api.ts`: API client wrappers.
- `README.md`: This documentation.
- `kb.md`: Knowledge base definition for AI.

## Database Tables (Platform Level)
- `user_stats`: Tracks usage and rate limits.
