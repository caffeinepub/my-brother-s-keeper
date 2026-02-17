# Specification

## Summary
**Goal:** Let users fine-tune how Google Maps links open by choosing a preferred zoom level that is reused across sessions.

**Planned changes:**
- Add a user-facing zoom control alongside map links (at minimum on the Meetup location result panel), with a sensible default and English UI text.
- Persist the selected zoom level locally in the browser (e.g., localStorage) and apply it after reloads.
- Update all coordinate-based Google Maps links (including MeetupPage and the SOS last-known-location view) to include and reflect the preferred zoom parameter.
- Refactor Google Maps URL creation into a shared frontend utility used by all updated map-link locations.

**User-visible outcome:** Users can set a preferred map zoom once and all “View on Google Maps” links open at that zoom across the app, even after refreshing or returning later.
