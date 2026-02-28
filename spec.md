# Specification

## Summary
**Goal:** Fix the end-to-end admin promotion flow so that entering a valid admin token reliably grants admin privileges.

**Planned changes:**
- Ensure the admin token is correctly persisted to localStorage before the Internet Identity login redirect
- Fix AdminPromotionHandler to reliably read and submit the token after login, then clear it from localStorage regardless of outcome
- Fix the backend `promoteToAdmin` call to return a success variant for a valid token
- Fix AdminRouteGuard to correctly reflect updated admin status and grant access to protected routes
- If the user is already logged in, entering a valid token in AdminAccessDialog immediately promotes them without re-login
- Show an appropriate error toast when an invalid token is used

**User-visible outcome:** A user who enters a valid admin token is successfully promoted and can access admin-protected routes (e.g., /admin dashboard) without seeing the AccessDeniedScreen.
