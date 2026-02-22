import { StrictMode } from 'react';
import { RouterProvider, createRouter, createRoute, createRootRoute, Outlet } from '@tanstack/react-router';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ThemeProvider } from 'next-themes';
import { Toaster } from '@/components/ui/sonner';

import AppLayout from './components/layout/AppLayout';
import LandingPage from './pages/LandingPage';
import PlacesListPage from './pages/PlacesListPage';
import PlaceDetailPage from './pages/PlaceDetailPage';
import AddPlacePage from './pages/AddPlacePage';
import RoutesListPage from './pages/RoutesListPage';
import AddRoutePage from './pages/AddRoutePage';
import ProfilePage from './pages/ProfilePage';
import SOSPage from './pages/SOSPage';
import SOSCardPage from './pages/SOSCardPage';
import EmergencyLookupPage from './pages/EmergencyLookupPage';
import FlyerPage from './pages/FlyerPage';
import AdminDashboardPage from './pages/AdminDashboardPage';
import MeetupPage from './pages/MeetupPage';

import AuthenticatedRouteGuard from './components/auth/AuthenticatedRouteGuard';
import AdminRouteGuard from './components/auth/AdminRouteGuard';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5,
      refetchOnWindowFocus: false,
    },
  },
});

const rootRoute = createRootRoute({
  component: () => (
    <AppLayout>
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
  path: '/places/$placeName',
  component: PlaceDetailPage,
});

const addPlaceRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/places/add',
  component: () => (
    <AuthenticatedRouteGuard>
      <AddPlacePage />
    </AuthenticatedRouteGuard>
  ),
});

const routesRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/routes',
  component: RoutesListPage,
});

const addRouteRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/routes/add',
  component: () => (
    <AuthenticatedRouteGuard>
      <AddRoutePage />
    </AuthenticatedRouteGuard>
  ),
});

const profileRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/profile',
  component: () => (
    <AuthenticatedRouteGuard>
      <ProfilePage />
    </AuthenticatedRouteGuard>
  ),
});

const sosRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/sos',
  component: () => (
    <AuthenticatedRouteGuard>
      <SOSPage />
    </AuthenticatedRouteGuard>
  ),
});

const sosCardRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/sos-card',
  component: () => (
    <AuthenticatedRouteGuard>
      <SOSCardPage />
    </AuthenticatedRouteGuard>
  ),
});

const adminDashboardRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/admin',
  component: () => (
    <AuthenticatedRouteGuard>
      <AdminRouteGuard>
        <AdminDashboardPage />
      </AdminRouteGuard>
    </AuthenticatedRouteGuard>
  ),
});

const emergencyLookupRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/emergency-lookup',
  component: EmergencyLookupPage,
});

const flyerRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/flyer',
  component: FlyerPage,
});

const meetupRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/meetup',
  component: () => (
    <AuthenticatedRouteGuard>
      <MeetupPage />
    </AuthenticatedRouteGuard>
  ),
});

const routeTree = rootRoute.addChildren([
  indexRoute,
  placesRoute,
  placeDetailRoute,
  addPlaceRoute,
  routesRoute,
  addRouteRoute,
  profileRoute,
  sosRoute,
  sosCardRoute,
  adminDashboardRoute,
  emergencyLookupRoute,
  flyerRoute,
  meetupRoute,
]);

const router = createRouter({ routeTree });

declare module '@tanstack/react-router' {
  interface Register {
    router: typeof router;
  }
}

export default function App() {
  return (
    <StrictMode>
      <QueryClientProvider client={queryClient}>
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
          <RouterProvider router={router} />
          <Toaster />
        </ThemeProvider>
      </QueryClientProvider>
    </StrictMode>
  );
}
