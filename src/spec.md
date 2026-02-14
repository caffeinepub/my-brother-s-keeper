# Specification

## Summary
**Goal:** Add a one-tap “Quick Share” option in the existing Share dialog to share the app’s URL using the browser’s native share sheet.

**Planned changes:**
- Add a clearly labeled “Quick Share” action to `frontend/src/components/share/ShareDialog.tsx`, placed alongside the existing download actions.
- Implement Web Share API behavior to share the current share URL (the same URL displayed in the dialog).
- Add a graceful fallback when `navigator.share` is unavailable or sharing fails (e.g., copy link to clipboard) and show an English toast message describing the result.

**User-visible outcome:** In the Share dialog, users can tap “Quick Share” to open the native share sheet and share the current link; if sharing isn’t supported or fails, the link is copied and a toast explains what happened.
