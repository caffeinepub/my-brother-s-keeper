# Specification

## Summary
**Goal:** Grant immediate admin access to the Principal ID '2yscf-yuwfq-41ml4-t6ujy-r3ogj-ajbkj-rmiih-uyk25-o34ky-6jpe6-gae' by hardcoding it in the backend.

**Planned changes:**
- Add the Principal ID '2yscf-yuwfq-41ml4-t6ujy-r3ogj-ajbkj-rmiih-uyk25-o34ky-6jpe6-gae' as a hardcoded admin in backend/main.mo
- Ensure the useIsCallerAdmin hook correctly identifies this Principal ID as an admin
- Allow the AdminRouteGuard component to grant access to /admin/* routes for this Principal ID

**User-visible outcome:** The user with Principal ID '2yscf-yuwfq-41ml4-t6ujy-r3ogj-ajbkj-rmiih-uyk25-o34ky-6jpe6-gae' can immediately access the Admin Dashboard and all admin features without requiring promotion from another administrator.
