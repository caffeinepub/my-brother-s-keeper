import { ReactNode } from 'react';
import { Loader2 } from 'lucide-react';
import { useIsCallerAdmin } from '../../hooks/useQueries';
import { useActor } from '../../hooks/useActor';
import AccessDeniedScreen from './AccessDeniedScreen';

interface AdminRouteGuardProps {
  children: ReactNode;
}

export default function AdminRouteGuard({ children }: AdminRouteGuardProps) {
  const { isFetching: actorFetching } = useActor();
  const { data: isAdmin, isLoading, isFetched } = useIsCallerAdmin();

  // Show loading while actor is initializing or admin check is in progress
  if (actorFetching || isLoading || !isFetched) {
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
