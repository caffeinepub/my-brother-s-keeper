import { useState } from 'react';
import { useGetUserProfile, useReviewVerification } from '../hooks/useQueries';
import AdminRouteGuard from '../components/auth/AdminRouteGuard';
import AuthenticatedRouteGuard from '../components/auth/AuthenticatedRouteGuard';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { toast } from 'sonner';
import { Shield, CheckCircle, XCircle, Search } from 'lucide-react';

export default function AdminReviewPage() {
    const [principalInput, setPrincipalInput] = useState('');
    const [lookupPrincipal, setLookupPrincipal] = useState<string | null>(null);
    const { data: userProfile, isLoading } = useGetUserProfile(lookupPrincipal);
    const reviewVerification = useReviewVerification();

    const handleLookup = () => {
        if (!principalInput.trim()) {
            toast.error('Please enter a Principal ID');
            return;
        }
        setLookupPrincipal(principalInput.trim());
    };

    const handleReview = async (approved: boolean) => {
        if (!lookupPrincipal) return;

        try {
            await reviewVerification.mutateAsync({ user: lookupPrincipal, approved });
            toast.success(approved ? 'User verified successfully' : 'Verification rejected');
        } catch (error: any) {
            toast.error(error.message || 'Failed to review verification');
        }
    };

    return (
        <AuthenticatedRouteGuard>
            <AdminRouteGuard>
                <div className="space-y-6 max-w-4xl">
                    <div className="flex items-center gap-3">
                        <Shield className="h-8 w-8" />
                        <div>
                            <h1 className="text-3xl font-bold">Admin Review</h1>
                            <p className="text-muted-foreground">Review user verification documents</p>
                        </div>
                    </div>

                    <Card>
                        <CardHeader>
                            <CardTitle>Lookup User</CardTitle>
                            <CardDescription>Enter a user's Principal ID to review their verification</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="flex gap-2">
                                <div className="flex-1 space-y-2">
                                    <Label htmlFor="principal">Principal ID</Label>
                                    <Input
                                        id="principal"
                                        value={principalInput}
                                        onChange={(e) => setPrincipalInput(e.target.value)}
                                        placeholder="Enter Principal ID..."
                                    />
                                </div>
                                <Button onClick={handleLookup} className="mt-auto gap-2">
                                    <Search className="h-4 w-4" />
                                    Lookup
                                </Button>
                            </div>

                            {isLoading && (
                                <div className="text-center py-8">
                                    <div className="mb-4 h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent mx-auto" />
                                </div>
                            )}

                            {lookupPrincipal && !isLoading && (
                                <>
                                    {userProfile ? (
                                        <div className="space-y-4">
                                            <Separator />
                                            <div className="space-y-3">
                                                <div className="flex items-center justify-between">
                                                    <div>
                                                        <p className="font-semibold">{userProfile.name}</p>
                                                        <p className="text-sm text-muted-foreground">
                                                            {lookupPrincipal.slice(0, 16)}...
                                                        </p>
                                                    </div>
                                                    <Badge variant={userProfile.isVerified ? 'default' : 'secondary'}>
                                                        {userProfile.isVerified ? 'Verified' : 'Pending'}
                                                    </Badge>
                                                </div>

                                                <Separator />

                                                <div className="space-y-3">
                                                    <div>
                                                        <p className="text-sm font-medium mb-2">Trucking License</p>
                                                        {userProfile.licenseProof ? (
                                                            <a
                                                                href={userProfile.licenseProof.getDirectURL()}
                                                                target="_blank"
                                                                rel="noopener noreferrer"
                                                                className="text-sm text-primary hover:underline"
                                                            >
                                                                View License Document →
                                                            </a>
                                                        ) : (
                                                            <p className="text-sm text-muted-foreground">Not uploaded</p>
                                                        )}
                                                    </div>

                                                    <div>
                                                        <p className="text-sm font-medium mb-2">ID Proof</p>
                                                        {userProfile.idProof ? (
                                                            <a
                                                                href={userProfile.idProof.getDirectURL()}
                                                                target="_blank"
                                                                rel="noopener noreferrer"
                                                                className="text-sm text-primary hover:underline"
                                                            >
                                                                View ID Document →
                                                            </a>
                                                        ) : (
                                                            <p className="text-sm text-muted-foreground">Not uploaded</p>
                                                        )}
                                                    </div>
                                                </div>

                                                {(userProfile.licenseProof || userProfile.idProof) && !userProfile.isVerified && (
                                                    <>
                                                        <Separator />
                                                        <div className="flex gap-3">
                                                            <Button
                                                                onClick={() => handleReview(true)}
                                                                disabled={reviewVerification.isPending}
                                                                className="flex-1 gap-2"
                                                            >
                                                                <CheckCircle className="h-4 w-4" />
                                                                Approve
                                                            </Button>
                                                            <Button
                                                                onClick={() => handleReview(false)}
                                                                disabled={reviewVerification.isPending}
                                                                variant="destructive"
                                                                className="flex-1 gap-2"
                                                            >
                                                                <XCircle className="h-4 w-4" />
                                                                Reject
                                                            </Button>
                                                        </div>
                                                    </>
                                                )}
                                            </div>
                                        </div>
                                    ) : (
                                        <p className="text-center text-muted-foreground py-8">User not found</p>
                                    )}
                                </>
                            )}
                        </CardContent>
                    </Card>
                </div>
            </AdminRouteGuard>
        </AuthenticatedRouteGuard>
    );
}
