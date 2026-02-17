# Specification

## Summary
**Goal:** Add an admin dashboard experience that includes a registrations overview, and clarify in sharing UI copy that recipients can use the same link without downloading another app.

**Planned changes:**
- Add an admin-only “Admin Dashboard” page/area in the app UI that includes a “Registrations” view showing a list/table of registered users.
- Implement an admin-gated backend API to retrieve registrations from stored user profiles with stable/deterministic ordering.
- Update the existing admin area labeling/navigation to read as “Admin Dashboard” while keeping the current Verification Review workflow available, and add an in-page switch between “Registrations” and “Verification Review”.
- Update the Share dialog and the Flyer page with user-facing copy stating recipients can open the shared link and do not need to download a separate app.

**User-visible outcome:** Admins can open an Admin Dashboard to view registrations and continue using Verification Review, while all users see clearer sharing guidance that shared links work directly without requiring another app download.
