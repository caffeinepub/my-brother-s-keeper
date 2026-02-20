import { useGetCallerUserProfile, useGetCallerUserRole, useRequestAdminAccess } from '../hooks/useQueries';
import { useInternetIdentity } from '../hooks/useInternetIdentity';
import AuthenticatedRouteGuard from '../components/auth/AuthenticatedRouteGuard';
import VerificationUploadsCard from '../components/profile/VerificationUploadsCard';
import EmergencyProfileCard from '../components/profile/EmergencyProfileCard';
import EmergencyAccessCodeCard from '../components/profile/EmergencyAccessCodeCard';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { User, Copy, CheckCircle2, ShieldCheck, RefreshCw } from 'lucide-react';
import { copyToClipboard } from '../lib/clipboard';
import { useState } from 'react';
import { toast } from 'sonner';
import { UserRole } from '../backend';

export default function ProfilePage() {
    const { data: profile, isLoading } = useGetCallerUserProfile();
    const { data: userRole, isLoading: roleLoading, refetch: refetchRole } = useGetCallerUserRole();
    const { identity } = useInternetIdentity();
    const [copied, setCopied] = useState(false);
    const requestAdminMutation = useRequestAdminAccess();

    const principalId = identity?.getPrincipal().toString() || '';
    const isAdmin = userRole === UserRole.admin;
    const isUser = userRole === UserRole.user;

    const handleCopyPrincipal = async () => {
        const success = await copyToClipboard(principalId);
        if (success) {
            setCopied(true);
            toast.success('Principal ID copied to clipboard');
            setTimeout(() => setCopied(false), 2000);
        } else {
            toast.error('Failed to copy Principal ID');
        }
    };

    const handleRequestAdminAccess = async () => {
        try {
            await requestAdminMutation.mutateAsync();
            toast.success('Admin access granted! You can now access admin features.');
            await refetchRole();
        } catch (error: any) {
            console.error('Request admin access failed:', error);
            const errorMessage = error?.message || 'Failed to request admin access';
            toast.error(errorMessage);
        }
    };

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

                        {/* Login Credentials Section */}
                        <Card>
                            <CardHeader>
                                <CardTitle>Login Credentials</CardTitle>
                                <CardDescription>
                                    Your unique Principal ID used for authentication
                                </CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div>
                                    <label className="text-sm font-medium text-muted-foreground mb-2 block">
                                        Principal ID
                                    </label>
                                    <div className="flex items-center gap-2">
                                        <div className="flex-1 p-3 bg-muted rounded-md font-mono text-sm break-all">
                                            {principalId}
                                        </div>
                                        <Button
                                            onClick={handleCopyPrincipal}
                                            variant="outline"
                                            size="icon"
                                            className="shrink-0"
                                        >
                                            {copied ? (
                                                <CheckCircle2 className="h-4 w-4 text-success" />
                                            ) : (
                                                <Copy className="h-4 w-4" />
                                            )}
                                        </Button>
                                    </div>
                                </div>
                                <div className="text-sm text-muted-foreground">
                                    <p className="font-medium mb-1">
                                        Authentication Status: <span className="text-success">Logged In</span>
                                    </p>
                                    <p className="text-xs">
                                        This Principal ID is your unique identifier on the Internet Computer network.
                                        Keep it safe and use it to access admin features if you have been granted admin privileges.
                                    </p>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Admin Access Section */}
                        {!roleLoading && (
                            <Card>
                                <CardHeader>
                                    <CardTitle>Admin Access</CardTitle>
                                    <CardDescription>
                                        {isAdmin 
                                            ? 'You have administrator privileges'
                                            : 'Request administrator access to manage users and review verifications'
                                        }
                                    </CardDescription>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    {isAdmin ? (
                                        <div className="flex items-center gap-3 p-4 bg-success/10 rounded-lg border border-success/20">
                                            <ShieldCheck className="h-6 w-6 text-success" />
                                            <div>
                                                <p className="font-medium text-success">Admin Privileges Active</p>
                                                <p className="text-sm text-muted-foreground">
                                                    You can access the Admin Dashboard to manage users and review verifications.
                                                </p>
                                            </div>
                                        </div>
                                    ) : isUser ? (
                                        <div className="space-y-3">
                                            <p className="text-sm text-muted-foreground">
                                                You currently have standard user access. Click below to request administrator privileges.
                                            </p>
                                            <Button 
                                                onClick={handleRequestAdminAccess}
                                                disabled={requestAdminMutation.isPending}
                                                className="w-full"
                                            >
                                                {requestAdminMutation.isPending ? (
                                                    <>
                                                        <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                                                        Requesting Access...
                                                    </>
                                                ) : (
                                                    <>
                                                        <ShieldCheck className="mr-2 h-4 w-4" />
                                                        Request Admin Access
                                                    </>
                                                )}
                                            </Button>
                                        </div>
                                    ) : null}
                                </CardContent>
                            </Card>
                        )}
                    </div>
                )}
            </div>
        </AuthenticatedRouteGuard>
    );
}
