# Knowledge Base Definition: Global Logistics Tracking

## Definition
The Global Logistics Tracking module provides real-time visibility into the movement of goods across international borders.

## Boundaries
- **Input**: Tracking numbers (various formats).
- **Output**: Real-time status, location history, estimated delivery date.
- **Exclusions**: Does not handle claims or disputes (provides links to carrier support where available).

## File Logic
1. **Search**: User enters a tracking number.
2. **API Call**: The system queries the corresponding carrier's API.
3. **Display**: Results are rendered in a clear, chronological timeline.

## AI Recognition Hints
- Focus on accuracy and timeliness of data.
- Use standard logistics terminology (e.g., "In Transit", "Out for Delivery", "Delivered").
- Provide helpful context for common logistics statuses (e.g., "Arrived at Sort Facility" means the package is being processed for the next leg of its journey).
