import { ReactNode } from 'react';
import { Loader2 } from 'lucide-react';
import { useIsCallerAdmin } from '../../hooks/useQueries';
import { useActor } from '../../hooks/useActor';
import { useInternetIdentity } from '../../hooks/useInternetIdentity';
import AccessDeniedScreen from './AccessDeniedScreen';

interface AdminRouteGuardProps {
  children: ReactNode;
}

/**
 * AdminRouteGuard
 *
 * Shows a loading spinner while identity/actor are initializing or while the
 * admin status query is in-flight. Once settled, renders children if the caller
 * is admin, or AccessDeniedScreen otherwise.
 *
 * No navigation is performed here — no redirect loops possible.
 * Bootstrap admin status is determined directly by isCallerAdmin() on the backend.
 */
export default function AdminRouteGuard({ children }: AdminRouteGuardProps) {
  const { isInitializing } = useInternetIdentity();
  const { isFetching: actorFetching } = useActor();
  const { data: isAdmin, isLoading, isFetched } = useIsCallerAdmin();

  // Show loading while:
  // 1. Internet Identity is still initializing
  // 2. The actor is being set up
  // 3. The admin query is actively loading or hasn't fetched yet
  const isStillLoading = isInitializing || actorFetching || isLoading || !isFetched;

  if (isStillLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="flex flex-col items-center gap-3 text-muted-foreground">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <p className="text-sm">Checking admin permissions...</p>
        </div>
      </div>
    );
  }

  if (!isAdmin) {
    return <AccessDeniedScreen />;
  }

  return <>{children}</>;
}
