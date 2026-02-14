import { useGetCallerUserProfile } from '../hooks/useQueries';
import AuthenticatedRouteGuard from '../components/auth/AuthenticatedRouteGuard';
import VerificationUploadsCard from '../components/profile/VerificationUploadsCard';
import EmergencyProfileCard from '../components/profile/EmergencyProfileCard';
import EmergencyAccessCodeCard from '../components/profile/EmergencyAccessCodeCard';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { User } from 'lucide-react';

export default function ProfilePage() {
    const { data: profile, isLoading } = useGetCallerUserProfile();

    return (
        <AuthenticatedRouteGuard>
            <div className="space-y-6 max-w-4xl">
                <div>
                    <h1 className="text-3xl font-bold">Profile</h1>
                    <p className="text-muted-foreground">Manage your account and emergency information</p>
                </div>

                {isLoading ? (
                    <div className="text-center py-12">
                        <div className="mb-4 h-12 w-12 animate-spin rounded-full border-4 border-primary border-t-transparent mx-auto" />
                        <p className="text-muted-foreground">Loading profile...</p>
                    </div>
                ) : (
                    <div className="space-y-6">
                        <Card>
                            <CardHeader>
                                <div className="flex items-center gap-3">
                                    <div className="flex items-center justify-center h-12 w-12 rounded-full bg-primary/10 text-primary">
                                        <User className="h-6 w-6" />
                                    </div>
                                    <div>
                                        <CardTitle>{profile?.name || 'Anonymous'}</CardTitle>
                                        <CardDescription>Trucker Safety Network Member</CardDescription>
                                    </div>
                                </div>
                            </CardHeader>
                        </Card>

                        <VerificationUploadsCard />
                        <EmergencyAccessCodeCard />
                        <EmergencyProfileCard />
                    </div>
                )}
            </div>
        </AuthenticatedRouteGuard>
    );
}
