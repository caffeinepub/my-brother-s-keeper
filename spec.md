# Specification

## Summary
**Goal:** Allow the first authenticated user who visits the app with a valid admin token in the URL to automatically become the admin, eliminating the need for a pre-configured hardcoded admin Principal ID.

**Planned changes:**
- Update backend admin authorization logic so that if no admin is currently stored, the first non-anonymous authenticated caller who presents a valid admin token is automatically stored as the admin principal
- Once an admin is set, subsequent calls with the admin token do not override the existing admin
- Update frontend to detect `#caffeineAdminToken=<token>` in the URL hash after Internet Identity sign-in and automatically call the backend admin promotion endpoint
- If promotion succeeds, immediately reflect admin role in the UI (e.g., show Admin Dashboard navigation link) without requiring a page reload
- Remove the admin token from the URL hash after the promotion attempt

**User-visible outcome:** The app owner can visit the app with the admin token URL, sign in with any Internet Identity, and instantly gain admin access — no pre-configured Principal ID required.
