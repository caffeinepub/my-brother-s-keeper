import { useEffect } from 'react';
import { useIsCallerAdmin } from '../../hooks/useQueries';
import { useActor } from '../../hooks/useActor';
import { useInternetIdentity } from '../../hooks/useInternetIdentity';
import AccessDeniedScreen from './AccessDeniedScreen';

export default function AdminRouteGuard({ children }: { children: React.ReactNode }) {
    const { actor, isFetching: actorFetching } = useActor();
    const { identity } = useInternetIdentity();
    const { data: isAdmin, isLoading, isFetched, error, status } = useIsCallerAdmin();

    useEffect(() => {
        console.log('[AdminRouteGuard] 🔍 Component state:', {
            actorAvailable: !!actor,
            actorFetching,
            identityAvailable: !!identity,
            principalId: identity?.getPrincipal().toString(),
            isLoading,
            isFetched,
            isAdmin,
            status,
            error: error ? String(error) : null
        });
    }, [actor, actorFetching, identity, isLoading, isFetched, isAdmin, status, error]);

    // Show loading state while actor is initializing or admin status is being fetched
    if (actorFetching || isLoading || !isFetched) {
        console.log('[AdminRouteGuard] ⏳ Showing loading state', {
            actorFetching,
            isLoading,
            isFetched
        });
        return (
            <div className="flex items-center justify-center min-h-[60vh]">
                <div className="text-center">
                    <div className="mb-4 h-12 w-12 animate-spin rounded-full border-4 border-primary border-t-transparent mx-auto" />
                    <p className="text-muted-foreground">Checking admin permissions...</p>
                    <p className="text-xs text-muted-foreground mt-2">
                        {actorFetching && 'Initializing connection...'}
                        {!actorFetching && isLoading && 'Verifying credentials...'}
                    </p>
                </div>
            </div>
        );
    }

    // If there's an error fetching the admin status, deny access
    if (error) {
        console.error('[AdminRouteGuard] ❌ Error fetching admin status, denying access:', error);
        return <AccessDeniedScreen />;
    }

    // Only allow access if user is explicitly an admin
    if (!isAdmin) {
        console.log('[AdminRouteGuard] 🚫 Access denied - user is not admin. isAdmin value:', isAdmin);
        return <AccessDeniedScreen />;
    }

    console.log('[AdminRouteGuard] ✅ Access granted - rendering children');
    return <>{children}</>;
}
