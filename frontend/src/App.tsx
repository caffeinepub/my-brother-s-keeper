import React, { useEffect, useRef } from 'react';
import { RouterProvider, createRouter, createRoute, createRootRoute, Outlet } from '@tanstack/react-router';
import { ThemeProvider } from 'next-themes';
import { useInternetIdentity } from './hooks/useInternetIdentity';
import { usePromoteToAdmin } from './hooks/useQueries';
import { getPendingAdminToken, clearPendingAdminToken, clearAdminTokenFromUrl } from './lib/adminPromotion';
import { UserRole } from './backend';

import AppLayout from './components/layout/AppLayout';
import LandingPage from './pages/LandingPage';
import PlacesListPage from './pages/PlacesListPage';
import PlaceDetailPage from './pages/PlaceDetailPage';
import AddPlacePage from './pages/AddPlacePage';
import RoutesListPage from './pages/RoutesListPage';
import RouteDetailPage from './pages/RouteDetailPage';
import AddRoutePage from './pages/AddRoutePage';
import ProfilePage from './pages/ProfilePage';
import SOSPage from './pages/SOSPage';
import SOSCardPage from './pages/SOSCardPage';
import AdminDashboardPage from './pages/AdminDashboardPage';
import EmergencyLookupPage from './pages/EmergencyLookupPage';
import MeetupPage from './pages/MeetupPage';
import FlyerPage from './pages/FlyerPage';
import UserAccountDetailsPage from './pages/UserAccountDetailsPage';

// ─── Admin Promotion Handler ──────────────────────────────────────────────────
// Runs after authentication to attempt admin promotion using a saved token.
function AdminPromotionHandler() {
  const { identity } = useInternetIdentity();
  const promoteMutation = usePromoteToAdmin();
  const hasAttempted = useRef(false);

  useEffect(() => {
    if (!identity || hasAttempted.current) return;

    const token = getPendingAdminToken();
    if (!token) return;

    hasAttempted.current = true;

    // Clear the token from URL immediately
    clearAdminTokenFromUrl();

    const principal = identity.getPrincipal();

    // Don't attempt for anonymous principals
    if (principal.isAnonymous()) {
      clearPendingAdminToken();
      return;
    }

    promoteMutation.mutate(
      { principal, role: UserRole.admin },
      {
        onSettled: () => {
          clearPendingAdminToken();
        },
      }
    );
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [identity]);

  return null;
}

// ─── Routes ──────────────────────────────────────────────────────────────────

const rootRoute = createRootRoute({
  component: () => (
    <AppLayout>
      <AdminPromotionHandler />
      <Outlet />
    </AppLayout>
  ),
});

const indexRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/',
  component: LandingPage,
});

const placesRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/places',
  component: PlacesListPage,
});

const placeDetailRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/places/$placeId',
  component: PlaceDetailPage,
});

const addPlaceRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/places/add',
  component: AddPlacePage,
});

const routesRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/routes',
  component: RoutesListPage,
});

const routeDetailRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/routes/$routeId',
  component: RouteDetailPage,
});

const addRouteRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/routes/add',
  component: AddRoutePage,
});

const profileRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/profile',
  component: ProfilePage,
});

const sosRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/sos',
  component: SOSPage,
});

const sosCardRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/sos-card',
  component: SOSCardPage,
});

const adminDashboardRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/admin/dashboard',
  component: AdminDashboardPage,
});

const adminUserDetailsRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/admin/users/$userId',
  component: UserAccountDetailsPage,
});

const emergencyLookupRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/emergency-lookup',
  component: EmergencyLookupPage,
});

const meetupRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/meetup',
  component: MeetupPage,
});

const flyerRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/flyer',
  component: FlyerPage,
});

const routeTree = rootRoute.addChildren([
  indexRoute,
  placesRoute,
  placeDetailRoute,
  addPlaceRoute,
  routesRoute,
  routeDetailRoute,
  addRouteRoute,
  profileRoute,
  sosRoute,
  sosCardRoute,
  adminDashboardRoute,
  adminUserDetailsRoute,
  emergencyLookupRoute,
  meetupRoute,
  flyerRoute,
]);

const router = createRouter({ routeTree });

declare module '@tanstack/react-router' {
  interface Register {
    router: typeof router;
  }
}

// ─── App ─────────────────────────────────────────────────────────────────────

export default function App() {
  return (
    <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
      <RouterProvider router={router} />
    </ThemeProvider>
  );
}
