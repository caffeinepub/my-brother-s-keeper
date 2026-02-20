import { useEffect } from 'react';
import { useGetCallerUserRole } from '../../hooks/useQueries';
import { useActor } from '../../hooks/useActor';
import { useInternetIdentity } from '../../hooks/useInternetIdentity';
import { useQueryClient } from '@tanstack/react-query';
import { UserRole } from '../../backend';
import AccessDeniedScreen from './AccessDeniedScreen';

export default function AdminRouteGuard({ children }: { children: React.ReactNode }) {
    const { actor } = useActor();
    const { identity } = useInternetIdentity();
    const { data: userRole, isLoading, isFetched, error, refetch } = useGetCallerUserRole();
    const queryClient = useQueryClient();

    useEffect(() => {
        console.log('[AdminRouteGuard] Component state:', {
            actorAvailable: !!actor,
            identityAvailable: !!identity,
            principalId: identity?.getPrincipal().toString(),
            isLoading,
            isFetched,
            userRole,
            error
        });
    }, [actor, identity, isLoading, isFetched, userRole, error]);

    // Show loading state while actor is initializing or role is being fetched
    if (isLoading) {
        console.log('[AdminRouteGuard] Showing loading state');
        return (
            <div className="flex items-center justify-center min-h-[60vh]">
                <div className="text-center">
                    <div className="mb-4 h-12 w-12 animate-spin rounded-full border-4 border-primary border-t-transparent mx-auto" />
                    <p className="text-muted-foreground">Checking permissions...</p>
                </div>
            </div>
        );
    }

    // If there's an error fetching the role, deny access
    if (error) {
        console.error('[AdminRouteGuard] Error fetching role, denying access:', error);
        return <AccessDeniedScreen onRetry={async () => {
            console.log('[AdminRouteGuard] Retry requested - invalidating role query');
            await queryClient.invalidateQueries({ queryKey: ['currentUserRole'] });
            await refetch();
        }} />;
    }

    // Only allow access if user is explicitly an admin
    if (userRole !== UserRole.admin) {
        console.log('[AdminRouteGuard] Access denied - user role:', userRole);
        return <AccessDeniedScreen onRetry={async () => {
            console.log('[AdminRouteGuard] Retry requested - refetching role');
            await queryClient.invalidateQueries({ queryKey: ['currentUserRole'] });
            const result = await refetch();
            console.log('[AdminRouteGuard] Refetch result:', result.data);
        }} />;
    }

    console.log('[AdminRouteGuard] Access granted - user is admin');
    return <>{children}</>;
}
