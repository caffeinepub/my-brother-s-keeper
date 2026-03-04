import { Toaster } from "@/components/ui/sonner";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import {
  Outlet,
  RouterProvider,
  createRootRoute,
  createRoute,
  createRouter,
  redirect,
} from "@tanstack/react-router";
import { ThemeProvider } from "next-themes";

import AdminPromotionHandler from "./components/AdminPromotionHandler";
import AppLayout from "./components/layout/AppLayout";
import { BootstrapAdminProvider } from "./contexts/BootstrapAdminContext";

import AddPlacePage from "./pages/AddPlacePage";
import AddRoutePage from "./pages/AddRoutePage";
import AdminDashboardPage from "./pages/AdminDashboardPage";
import EmergencyLookupPage from "./pages/EmergencyLookupPage";
import FlyerPage from "./pages/FlyerPage";
import LandingPage from "./pages/LandingPage";
import MeetupPage from "./pages/MeetupPage";
import PlaceDetailPage from "./pages/PlaceDetailPage";
import PlacesListPage from "./pages/PlacesListPage";
import ProfilePage from "./pages/ProfilePage";
import RouteDetailPage from "./pages/RouteDetailPage";
import RoutesListPage from "./pages/RoutesListPage";
import SOSCardPage from "./pages/SOSCardPage";
import SOSPage from "./pages/SOSPage";
import UserAccountDetailsPage from "./pages/UserAccountDetailsPage";

import AdminRouteGuard from "./components/auth/AdminRouteGuard";
import AuthenticatedRouteGuard from "./components/auth/AuthenticatedRouteGuard";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5,
      retry: 1,
    },
  },
});

// Root layout with AppLayout wrapper
const rootRoute = createRootRoute({
  component: () => (
    <BootstrapAdminProvider>
      <AppLayout>
        <AdminPromotionHandler />
        <Outlet />
      </AppLayout>
    </BootstrapAdminProvider>
  ),
});

// Public routes
const indexRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/",
  component: LandingPage,
});

const placesRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/places",
  component: PlacesListPage,
});

const placeDetailRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/places/$placeId",
  component: PlaceDetailPage,
});

const emergencyLookupRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/emergency-lookup",
  component: EmergencyLookupPage,
});

const flyerRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/flyer",
  component: FlyerPage,
});

// Authenticated routes
const addPlaceRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/places/add",
  component: () => (
    <AuthenticatedRouteGuard>
      <AddPlacePage />
    </AuthenticatedRouteGuard>
  ),
});

const routesRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/routes",
  component: () => (
    <AuthenticatedRouteGuard>
      <RoutesListPage />
    </AuthenticatedRouteGuard>
  ),
});

const routeDetailRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/routes/$routeId",
  component: () => (
    <AuthenticatedRouteGuard>
      <RouteDetailPage />
    </AuthenticatedRouteGuard>
  ),
});

const addRouteRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/routes/add",
  component: () => (
    <AuthenticatedRouteGuard>
      <AddRoutePage />
    </AuthenticatedRouteGuard>
  ),
});

const profileRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/profile",
  component: () => (
    <AuthenticatedRouteGuard>
      <ProfilePage />
    </AuthenticatedRouteGuard>
  ),
});

const sosRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/sos",
  component: () => (
    <AuthenticatedRouteGuard>
      <SOSPage />
    </AuthenticatedRouteGuard>
  ),
});

const sosCardRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/sos/card",
  component: () => (
    <AuthenticatedRouteGuard>
      <SOSCardPage />
    </AuthenticatedRouteGuard>
  ),
});

const meetupRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/meetup",
  component: () => (
    <AuthenticatedRouteGuard>
      <MeetupPage />
    </AuthenticatedRouteGuard>
  ),
});

// Admin redirect: /admin → /admin/dashboard
const adminRedirectRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/admin",
  beforeLoad: () => {
    throw redirect({ to: "/admin/dashboard" });
  },
});

// Admin routes
const adminDashboardRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/admin/dashboard",
  component: () => (
    <AuthenticatedRouteGuard>
      <AdminRouteGuard>
        <AdminDashboardPage />
      </AdminRouteGuard>
    </AuthenticatedRouteGuard>
  ),
});

const userAccountDetailsRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/admin/users/$userId",
  component: () => (
    <AuthenticatedRouteGuard>
      <AdminRouteGuard>
        <UserAccountDetailsPage />
      </AdminRouteGuard>
    </AuthenticatedRouteGuard>
  ),
});

const routeTree = rootRoute.addChildren([
  indexRoute,
  placesRoute,
  placeDetailRoute,
  addPlaceRoute,
  emergencyLookupRoute,
  flyerRoute,
  routesRoute,
  routeDetailRoute,
  addRouteRoute,
  profileRoute,
  sosRoute,
  sosCardRoute,
  meetupRoute,
  adminRedirectRoute,
  adminDashboardRoute,
  userAccountDetailsRoute,
]);

const router = createRouter({ routeTree });

declare module "@tanstack/react-router" {
  interface Register {
    router: typeof router;
  }
}

export default function App() {
  return (
    <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
      <QueryClientProvider client={queryClient}>
        <RouterProvider router={router} />
        <Toaster richColors position="top-right" />
      </QueryClientProvider>
    </ThemeProvider>
  );
}
