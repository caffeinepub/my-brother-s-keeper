# Specification

## Summary
**Goal:** Fix the admin authentication loop by hardcoding the bootstrap admin Principal ID in the backend and removing the broken auto-promotion and redirect logic in the frontend.

**Planned changes:**
- Hardcode the bootstrap admin Principal ID as a constant in `backend/main.mo` so it is unconditionally treated as admin without any state lookup or promotion flow
- Fix `AdminPromotionHandler.tsx` to be a no-op when no promotion token is in localStorage and to never trigger navigation or re-initialization loops
- Fix `AdminRouteGuard.tsx` to resolve admin status with a single backend query and render children or access denied without looping back to app start
- Audit and fix `useIsAdmin` in `useQueries.ts` to fetch admin status once after the actor is available and prevent circular query invalidation

**User-visible outcome:** The bootstrap admin can log in and access admin routes without encountering infinite redirect or initialization loops.
