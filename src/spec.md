# Specification

## Summary
**Goal:** Temporarily remove/disable QR code functionality from the Share dialog and Flyer flow while keeping link sharing and downloads working.

**Planned changes:**
- Update the Share dialog to remove QR canvas rendering and QR generation hook usage, remove/disable the “Download QR” action, and revise helper text to reference sharing via the app link (no QR scanning references).
- Update the Flyer page to remove QR generation/rendering and related UI states, ensure the preview still shows the share URL, and adjust flyer export so “Download Flyer” (including auto-export via `autoExportFlyer=1`) produces a non-empty PNG without requiring any QR canvas/state.

**User-visible outcome:** Users can share via the app link (copy/quick share) and download a flyer PNG that includes branding and the share URL, with no QR code shown or referenced anywhere in Share or Flyer screens.
