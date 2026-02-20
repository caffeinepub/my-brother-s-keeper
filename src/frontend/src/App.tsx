import { RouterProvider, createRouter, createRootRoute, createRoute, Outlet } from '@tanstack/react-router';
import { useInternetIdentity } from './hooks/useInternetIdentity';
import { ThemeProvider } from 'next-themes';
import { Toaster } from '@/components/ui/sonner';
import AppLayout from './components/layout/AppLayout';
import ProfileSetupDialog from './components/profile/ProfileSetupDialog';
import AuthenticatedRouteGuard from './components/auth/AuthenticatedRouteGuard';
import AdminRouteGuard from './components/auth/AdminRouteGuard';
import PlacesListPage from './pages/PlacesListPage';
import PlaceDetailPage from './pages/PlaceDetailPage';
import AddPlacePage from './pages/AddPlacePage';
import RoutesListPage from './pages/RoutesListPage';
import RouteDetailPage from './pages/RouteDetailPage';
import AddRoutePage from './pages/AddRoutePage';
import ProfilePage from './pages/ProfilePage';
import SOSPage from './pages/SOSPage';
import SOSCardPage from './pages/SOSCardPage';
import MeetupPage from './pages/MeetupPage';
import AdminDashboardPage from './pages/AdminDashboardPage';
import EmergencyLookupPage from './pages/EmergencyLookupPage';
import LandingPage from './pages/LandingPage';
import FlyerPage from './pages/FlyerPage';

const rootRoute = createRootRoute({
    component: () => (
        <>
            <AppLayout>
                <Outlet />
            </AppLayout>
            <ProfileSetupDialog />
        </>
    )
});

const indexRoute = createRoute({
    getParentRoute: () => rootRoute,
    path: '/',
    component: LandingPage
});

const placesRoute = createRoute({
    getParentRoute: () => rootRoute,
    path: '/places',
    component: PlacesListPage
});

const placeDetailRoute = createRoute({
    getParentRoute: () => rootRoute,
    path: '/places/$placeName',
    component: PlaceDetailPage
});

const addPlaceRoute = createRoute({
    getParentRoute: () => rootRoute,
    path: '/places/add',
    component: AddPlacePage
});

const routesRoute = createRoute({
    getParentRoute: () => rootRoute,
    path: '/routes',
    component: RoutesListPage
});

const routeDetailRoute = createRoute({
    getParentRoute: () => rootRoute,
    path: '/routes/$routeId',
    component: RouteDetailPage
});

const addRouteRoute = createRoute({
    getParentRoute: () => rootRoute,
    path: '/routes/add',
    component: AddRoutePage
});

const profileRoute = createRoute({
    getParentRoute: () => rootRoute,
    path: '/profile',
    component: ProfilePage
});

const sosRoute = createRoute({
    getParentRoute: () => rootRoute,
    path: '/sos',
    component: SOSPage
});

const sosCardRoute = createRoute({
    getParentRoute: () => rootRoute,
    path: '/sos-card',
    component: SOSCardPage
});

const meetupRoute = createRoute({
    getParentRoute: () => rootRoute,
    path: '/meetup',
    component: MeetupPage
});

const adminRoute = createRoute({
    getParentRoute: () => rootRoute,
    path: '/admin',
    component: () => (
        <AuthenticatedRouteGuard>
            <AdminRouteGuard>
                <AdminDashboardPage />
            </AdminRouteGuard>
        </AuthenticatedRouteGuard>
    )
});

const emergencyLookupRoute = createRoute({
    getParentRoute: () => rootRoute,
    path: '/emergency-lookup',
    component: EmergencyLookupPage
});

const flyerRoute = createRoute({
    getParentRoute: () => rootRoute,
    path: '/flyer',
    component: FlyerPage,
    validateSearch: (search: Record<string, unknown>): { autoExportFlyer?: string } => {
        return {
            autoExportFlyer: typeof search.autoExportFlyer === 'string' ? search.autoExportFlyer : undefined
        };
    }
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
    meetupRoute,
    adminRoute,
    emergencyLookupRoute,
    flyerRoute
]);

const router = createRouter({ routeTree });

declare module '@tanstack/react-router' {
    interface Register {
        router: typeof router;
    }
}

export default function App() {
    const { isInitializing } = useInternetIdentity();

    if (isInitializing) {
        return (
            <div className="flex h-screen items-center justify-center bg-background">
                <div className="text-center">
                    <div className="mb-4 h-12 w-12 animate-spin rounded-full border-4 border-primary border-t-transparent mx-auto" />
                    <p className="text-muted-foreground">Loading...</p>
                </div>
            </div>
        );
    }

    return (
        <ThemeProvider attribute="class" defaultTheme="dark" enableSystem>
            <RouterProvider router={router} />
            <Toaster />
        </ThemeProvider>
    );
}
