# Specification

## Summary
**Goal:** Make the "Request Admin Access" button immediately grant admin privileges to the authenticated user.

**Planned changes:**
- Create a backend function that allows an authenticated user to self-grant admin privileges
- Wire the "Request Admin Access" button to call the backend function and refresh user role on success
- Add loading, success, and error states to the button with appropriate toast messages

**User-visible outcome:** Users can click "Request Admin Access" on the Access Denied screen and immediately gain admin privileges without manual approval, allowing them to access admin routes.
