import { useInternetIdentity } from '../hooks/useInternetIdentity';
import { useEmergencyLookup, useGetCallerUserProfile } from '../hooks/useQueries';
import { getStoredAccessCode } from '../lib/accessCode';
import AuthenticatedRouteGuard from '../components/auth/AuthenticatedRouteGuard';
import PublicSOSCardView from '../components/sos/PublicSOSCardView';
import { Button } from '@/components/ui/button';
import { useNavigate } from '@tanstack/react-router';
import { ArrowLeft } from 'lucide-react';

export default function SOSCardPage() {
    const navigate = useNavigate();
    const { identity } = useInternetIdentity();
    const { data: profile } = useGetCallerUserProfile();
    const userPrincipal = identity?.getPrincipal().toString() || null;
    const accessCode = getStoredAccessCode();

    const { data: emergencyData, isLoading } = useEmergencyLookup(userPrincipal, accessCode);

    return (
        <AuthenticatedRouteGuard>
            <div className="space-y-6 max-w-2xl mx-auto">
                <Button variant="ghost" onClick={() => navigate({ to: '/sos' })} className="gap-2">
                    <ArrowLeft className="h-4 w-4" />
                    Back to SOS
                </Button>

                <div className="text-center">
                    <h1 className="text-3xl font-bold">Emergency SOS Card</h1>
                    <p className="text-muted-foreground">Your emergency information for first responders</p>
                </div>

                {isLoading ? (
                    <div className="text-center py-12">
                        <div className="mb-4 h-12 w-12 animate-spin rounded-full border-4 border-primary border-t-transparent mx-auto" />
                        <p className="text-muted-foreground">Loading emergency information...</p>
                    </div>
                ) : emergencyData?.emergencyProfile ? (
                    <PublicSOSCardView
                        emergencyProfile={emergencyData.emergencyProfile}
                        sosSnapshot={emergencyData.sosSnapshot}
                        userName={profile?.name}
                    />
                ) : (
                    <div className="text-center py-12">
                        <p className="text-muted-foreground">
                            No emergency profile found. Please set up your emergency profile and access code first.
                        </p>
                        <Button onClick={() => navigate({ to: '/profile' })} className="mt-4">
                            Go to Profile
                        </Button>
                    </div>
                )}
            </div>
        </AuthenticatedRouteGuard>
    );
}
