# Specification

## Summary
**Goal:** Make the app’s client-side QR codes standards-compliant and reliably scannable on iOS and Android, and provide clear fallback guidance when scanning doesn’t work.

**Planned changes:**
- Fix QR code generation/rendering in the Share dialog and Flyer page so the encoded content is exactly the canonical URL returned by `getShareUrl()` and is reliably recognized as a tappable URL by common phone camera QR scanners (iOS and Android).
- Add English user-facing error states and recovery guidance in the Share dialog and Flyer page for cases where the QR code is present but not scannable, prominently directing users to use the displayed App Link / “Copy Link” as a fallback.
- Ensure the QR area always reaches either a ready state or an actionable error state (no infinite loading), without adding any external QR generation service dependency.

**User-visible outcome:** Users can scan QR codes from both the Share dialog and Flyer page with typical iPhone/Android camera QR scanners to see and open the app link, and if scanning fails they are clearly guided to use the App Link / Copy Link instead.
