# Specification

## Summary
**Goal:** Fix flyer PNG exporting so it reliably downloads on mobile (iOS Safari and Android Chrome) without tainted-canvas errors, while preserving the full flyer content including the QR code.

**Planned changes:**
- Replace the current flyer PNG export in `frontend/src/lib/flyerExport.ts` to avoid using SVG `<foreignObject>` and use a cross-browser DOM-to-image approach that works on iOS/Android.
- Ensure the export reliably captures the rendered QR code and avoids/handles any assets (images/fonts) that could taint the canvas.
- Update flyer-download error messaging to be clear, English, and user-actionable (e.g., retry or use “Copy Link”), without exposing raw browser exception text.
- Perform a focused production smoke-test pass for both download entry points: the Flyer page “Download Flyer” and the Share dialog auto-export “Download Flyer” flow (verify non-blank PNG output and no regressions to QR/URL/copy-link).

**User-visible outcome:** Tapping “Download Flyer” (from the Flyer page or Share dialog flow) downloads a readable PNG on mobile that includes the full flyer content and QR code, and failures show a friendly English message with next steps.
