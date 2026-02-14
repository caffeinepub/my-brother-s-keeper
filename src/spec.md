# Specification

## Summary
**Goal:** Make the app’s share link launch-ready by generating QR codes reliably client-side and ensuring the shared URL is correct and consistent.

**Planned changes:**
- Replace external QR Server API usage with fully client-side QR code generation for the Share dialog and Flyer page.
- Ensure QR generation failures show the existing English error toast (e.g., “Failed to generate QR code”) without blocking other share actions.
- Standardize the share link so the “App Link” shown in the Share dialog and Flyer page matches and uses a valid, absolute canonical app entry URL.

**User-visible outcome:** Opening Share or Flyer always shows a QR code without relying on third-party QR services, and users see a consistent, correct app link they can copy/share that opens to the app’s entry page.
