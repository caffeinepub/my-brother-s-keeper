import { useState } from 'react';
import { useGetCallerUserProfile, useIsCallerAdmin } from '../hooks/useQueries';
import { useInternetIdentity } from '../hooks/useInternetIdentity';
import AuthenticatedRouteGuard from '../components/auth/AuthenticatedRouteGuard';
import VerificationUploadsCard from '../components/profile/VerificationUploadsCard';
import EmergencyProfileCard from '../components/profile/EmergencyProfileCard';
import EmergencyAccessCodeCard from '../components/profile/EmergencyAccessCodeCard';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { CheckCircle, XCircle, Copy, Check, Shield } from 'lucide-react';

export default function ProfilePage() {
    const { identity } = useInternetIdentity();
    const { data: profile, isLoading } = useGetCallerUserProfile();
    const { data: isAdmin } = useIsCallerAdmin();
    const [copied, setCopied] = useState(false);

    const principalId = identity?.getPrincipal().toString() || '';

    const handleCopy = async () => {
        try {
            await navigator.clipboard.writeText(principalId);
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        } catch (error) {
            console.error('Failed to copy:', error);
        }
    };

    if (isLoading) {
        return (
            <AuthenticatedRouteGuard>
                <div className="flex items-center justify-center min-h-[60vh]">
                    <div className="text-center">
                        <div className="mb-4 h-12 w-12 animate-spin rounded-full border-4 border-primary border-t-transparent mx-auto" />
                        <p className="text-muted-foreground">Loading profile...</p>
                    </div>
                </div>
            </AuthenticatedRouteGuard>
        );
    }

    return (
        <AuthenticatedRouteGuard>
            <div className="container mx-auto px-4 py-8 max-w-4xl">
                <div className="mb-8">
                    <h1 className="text-3xl font-bold mb-2">My Profile</h1>
                    <p className="text-muted-foreground">Manage your account and emergency information</p>
                </div>

                <div className="space-y-6">
                    {/* Profile Info Card */}
                    <Card>
                        <CardHeader>
                            <CardTitle>Profile Information</CardTitle>
                            <CardDescription>Your basic account details</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div>
                                <label className="text-sm font-medium text-muted-foreground">Name</label>
                                <p className="text-lg font-semibold">{profile?.name || 'Not set'}</p>
                            </div>
                            <div>
                                <label className="text-sm font-medium text-muted-foreground">Verification Status</label>
                                <div className="flex items-center gap-2 mt-1">
                                    {profile?.isVerified ? (
                                        <>
                                            <CheckCircle className="h-5 w-5 text-green-600" />
                                            <Badge variant="default" className="bg-green-600">Verified</Badge>
                                        </>
                                    ) : (
                                        <>
                                            <XCircle className="h-5 w-5 text-yellow-600" />
                                            <Badge variant="secondary">Pending Verification</Badge>
                                        </>
                                    )}
                                </div>
                            </div>
                            {isAdmin && (
                                <div>
                                    <label className="text-sm font-medium text-muted-foreground">Admin Status</label>
                                    <div className="flex items-center gap-2 mt-1">
                                        <Shield className="h-5 w-5 text-primary" />
                                        <Badge variant="default" className="bg-primary">Administrator</Badge>
                                    </div>
                                    <p className="text-sm text-muted-foreground mt-1">
                                        You have administrative privileges and can access the admin dashboard.
                                    </p>
                                </div>
                            )}
                        </CardContent>
                    </Card>

                    {/* Login Credentials Card */}
                    <Card>
                        <CardHeader>
                            <CardTitle>Login Credentials</CardTitle>
                            <CardDescription>Your Internet Identity principal ID</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-2">
                                <label className="text-sm font-medium text-muted-foreground">Principal ID</label>
                                <div className="flex items-center gap-2">
                                    <code className="flex-1 px-3 py-2 bg-muted rounded-md text-sm font-mono break-all">
                                        {principalId}
                                    </code>
                                    <Button
                                        variant="outline"
                                        size="icon"
                                        onClick={handleCopy}
                                        className="shrink-0"
                                    >
                                        {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                                    </Button>
                                </div>
                                <p className="text-sm text-muted-foreground">
                                    This is your unique identifier on the Internet Computer. Keep it safe and share it only with trusted contacts.
                                </p>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Verification Documents */}
                    <VerificationUploadsCard />

                    {/* Emergency Access Code */}
                    <EmergencyAccessCodeCard />

                    {/* Emergency Profile */}
                    <EmergencyProfileCard />
                </div>
            </div>
        </AuthenticatedRouteGuard>
    );
}
