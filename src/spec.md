# Specification

## Summary
**Goal:** Fix QR code generation so the Share dialog and Flyer page produce a standards-compliant, reliably scannable QR that encodes the canonical app share URL.

**Planned changes:**
- Ensure the QR content always encodes the canonical URL from `getShareUrl()` and matches the URL shown in the “App Link” input in both the Share dialog and Flyer page.
- Adjust QR generation settings/rendering to be standards-compliant and include an adequate quiet zone so common phone camera scanners reliably detect and resolve the URL (including when printed or viewed on another screen).
- Make QR generation trigger only after the canvas is mounted/available, so opening/closing the Share dialog and navigating to `/flyer` consistently renders a scannable QR without refresh.
- Add clear English error toasts/status handling when QR generation or QR-dependent actions (e.g., Download QR) fail or the QR is not ready, guiding the user to wait, retry, or use Copy Link.

**User-visible outcome:** Users can open Share or the Flyer page and scan the displayed QR with a standard phone camera to reliably open the same app link shown in the UI; if something goes wrong, they see clear English guidance on what to do next.
