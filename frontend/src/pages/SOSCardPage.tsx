import { useEffect } from 'react';
import { useInternetIdentity } from '../hooks/useInternetIdentity';
import { useEmergencyLookup } from '../hooks/useQueries';
import AuthenticatedRouteGuard from '../components/auth/AuthenticatedRouteGuard';
import PublicSOSCardView from '../components/sos/PublicSOSCardView';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AlertTriangle } from 'lucide-react';
import { getStoredAccessCode } from '../lib/accessCode';

export default function SOSCardPage() {
  const { identity } = useInternetIdentity();
  const accessCode = getStoredAccessCode();
  const userPrincipal = identity ? identity.getPrincipal() : null;

  const lookupMutation = useEmergencyLookup();

  // Trigger the lookup once we have both principal and access code
  useEffect(() => {
    if (userPrincipal && accessCode) {
      lookupMutation.mutate({ user: userPrincipal, accessCode });
    }
    // Only run when principal or accessCode changes
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userPrincipal?.toString(), accessCode]);

  const isLoading = lookupMutation.isPending;
  const emergencyData = lookupMutation.data;

  if (isLoading) {
    return (
      <AuthenticatedRouteGuard>
        <div className="text-center py-12">
          <div className="mb-4 h-12 w-12 animate-spin rounded-full border-4 border-primary border-t-transparent mx-auto" />
          <p className="text-muted-foreground">Loading your emergency card...</p>
        </div>
      </AuthenticatedRouteGuard>
    );
  }

  if (!accessCode || !emergencyData?.emergencyProfile) {
    return (
      <AuthenticatedRouteGuard>
        <div className="space-y-6 max-w-2xl mx-auto">
          <h1 className="text-3xl font-bold">My Emergency Card</h1>
          <Alert>
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>
              You need to set up your emergency profile first. Go to your profile page to create one.
            </AlertDescription>
          </Alert>
        </div>
      </AuthenticatedRouteGuard>
    );
  }

  return (
    <AuthenticatedRouteGuard>
      <div className="space-y-6 max-w-2xl mx-auto">
        <div>
          <h1 className="text-3xl font-bold">My Emergency Card</h1>
          <p className="text-muted-foreground">Preview of your emergency information</p>
        </div>

        <PublicSOSCardView
          emergencyProfile={emergencyData.emergencyProfile}
          sosSnapshot={emergencyData.sosSnapshot}
          userName={emergencyData.userName}
        />
      </div>
    </AuthenticatedRouteGuard>
  );
}
