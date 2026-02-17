# Specification

## Summary
**Goal:** Refine the Meetup page location lookup and sharing panels so lookups validate against the entered meetup code, errors are clear, and found locations are easier to use.

**Planned changes:**
- Update the meetup location lookup flow to validate results using the user-entered Meetup Share Code (not any locally stored share code), and ensure the lookup cache key varies by both Principal ID and entered code.
- Add client-side validation and user-friendly error handling for lookup inputs (valid textual Principal required; Principal ID and share code both required) and show a clear “No active location found / code incorrect” state without console errors.
- Improve the location result panel to show last-updated time in a readable format, display coordinates, provide a “View on Google Maps” link that opens in a new tab, and add a copy-to-clipboard action with success confirmation.
- Improve the sharing status panel with a clear active/inactive indicator, last successful update time, and a stopped/error state when periodic updates fail (including stopping the update interval and showing actionable English error messages).

**User-visible outcome:** Users can reliably find a member’s active meetup location using the entered Principal ID + share code, understand and fix input/lookup issues via clear messages, quickly open the location in Google Maps or copy details, and clearly see whether sharing is active (including when it stops due to errors).
