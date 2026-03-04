# My Brother's Keeper

## Current State
The app is a trucker safety network with routes, safe places, emergency profiles, SOS, meetup locations, and an admin dashboard. The backend has a `bootstrapAdminPrincipalText` hardcoded as `"2yscf-yuwfq-4lml4-t6ujy-r3ogj-ajbkj-rmiih-uyk25-o34ky-6jpe6-gae"`. The `isAdmin()` query correctly checks both the bootstrap principal AND AccessControl state. However, `isCallerAdmin()` comes from the MixinAuthorization and ONLY checks AccessControl state — it never checks the bootstrap principal. This means the bootstrap admin always gets "Access Denied" when visiting `/admin/dashboard`, because `isCallerAdmin()` returns false for them.

## Requested Changes (Diff)

### Add
- A public `isCallerAdmin()` override in `main.mo` (after the mixin include) that checks BOTH `bootstrapAdminPrincipalText` AND `AccessControl.isAdmin()`, exactly matching the existing `isAdmin()` logic but for the caller.

### Modify
- The backend `main.mo` to include the `isCallerAdmin()` override so the frontend's AdminRouteGuard correctly recognizes the bootstrap admin.

### Remove
- Nothing.

## Implementation Plan
1. Regenerate backend Motoko with an explicit `isCallerAdmin()` function in the actor that overrides the mixin version and checks both the bootstrap principal text AND AccessControl.isAdmin(). The function signature must be: `public query ({ caller }) func isCallerAdmin() : async Bool { caller.toText() == bootstrapAdminPrincipalText or AccessControl.isAdmin(accessControlState, caller) }`.
2. No frontend changes are needed — the frontend already calls `actor.isCallerAdmin()` correctly.
3. Deploy.
