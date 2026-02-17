import { useState } from 'react';
import { useGetAllUserProfiles, useGetUserProfile, useReviewVerification } from '../hooks/useQueries';
import AdminRouteGuard from '../components/auth/AdminRouteGuard';
import AuthenticatedRouteGuard from '../components/auth/AuthenticatedRouteGuard';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { toast } from 'sonner';
import { Shield, CheckCircle, XCircle, Search, Users } from 'lucide-react';

export default function AdminDashboardPage() {
    const [activeTab, setActiveTab] = useState('registrations');
    
    // Registrations tab state
    const { data: allProfiles, isLoading: isLoadingProfiles, error: profilesError } = useGetAllUserProfiles();
    
    // Verification Review tab state
    const [principalInput, setPrincipalInput] = useState('');
    const [lookupPrincipal, setLookupPrincipal] = useState<string | null>(null);
    const { data: userProfile, isLoading: isLoadingUser } = useGetUserProfile(lookupPrincipal);
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
                <div className="space-y-6 max-w-6xl">
                    <div className="flex items-center gap-3">
                        <Shield className="h-8 w-8" />
                        <div>
                            <h1 className="text-3xl font-bold">Admin Dashboard</h1>
                            <p className="text-muted-foreground">Manage user registrations and verification</p>
                        </div>
                    </div>

                    <Tabs value={activeTab} onValueChange={setActiveTab}>
                        <TabsList className="grid w-full max-w-md grid-cols-2">
                            <TabsTrigger value="registrations" className="gap-2">
                                <Users className="h-4 w-4" />
                                Registrations
                            </TabsTrigger>
                            <TabsTrigger value="verification" className="gap-2">
                                <Shield className="h-4 w-4" />
                                Verification Review
                            </TabsTrigger>
                        </TabsList>

                        {/* Registrations Tab */}
                        <TabsContent value="registrations" className="space-y-4">
                            <Card>
                                <CardHeader>
                                    <CardTitle>User Registrations</CardTitle>
                                    <CardDescription>View all registered users and their verification status</CardDescription>
                                </CardHeader>
                                <CardContent>
                                    {isLoadingProfiles && (
                                        <div className="text-center py-8">
                                            <div className="mb-4 h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent mx-auto" />
                                            <p className="text-sm text-muted-foreground">Loading registrations...</p>
                                        </div>
                                    )}

                                    {profilesError && (
                                        <div className="text-center py-8">
                                            <p className="text-sm text-destructive">
                                                Failed to load registrations. {profilesError instanceof Error ? profilesError.message : 'Please try again.'}
                                            </p>
                                        </div>
                                    )}

                                    {!isLoadingProfiles && !profilesError && allProfiles && (
                                        <>
                                            {allProfiles.length === 0 ? (
                                                <div className="text-center py-8">
                                                    <Users className="h-12 w-12 mx-auto mb-3 text-muted-foreground" />
                                                    <p className="text-sm text-muted-foreground">No registered users yet</p>
                                                </div>
                                            ) : (
                                                <div className="rounded-md border">
                                                    <Table>
                                                        <TableHeader>
                                                            <TableRow>
                                                                <TableHead>Name</TableHead>
                                                                <TableHead>Principal ID</TableHead>
                                                                <TableHead>Status</TableHead>
                                                            </TableRow>
                                                        </TableHeader>
                                                        <TableBody>
                                                            {allProfiles.map(([principal, profile]) => (
                                                                <TableRow key={principal.toString()}>
                                                                    <TableCell className="font-medium">
                                                                        {profile.name || 'Anonymous'}
                                                                    </TableCell>
                                                                    <TableCell className="font-mono text-xs">
                                                                        {principal.toString().slice(0, 20)}...
                                                                    </TableCell>
                                                                    <TableCell>
                                                                        <Badge variant={profile.isVerified ? 'default' : 'secondary'}>
                                                                            {profile.isVerified ? 'Verified' : 'Pending'}
                                                                        </Badge>
                                                                    </TableCell>
                                                                </TableRow>
                                                            ))}
                                                        </TableBody>
                                                    </Table>
                                                </div>
                                            )}
                                        </>
                                    )}
                                </CardContent>
                            </Card>
                        </TabsContent>

                        {/* Verification Review Tab */}
                        <TabsContent value="verification" className="space-y-4">
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

                                    {isLoadingUser && (
                                        <div className="text-center py-8">
                                            <div className="mb-4 h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent mx-auto" />
                                        </div>
                                    )}

                                    {lookupPrincipal && !isLoadingUser && (
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

                                                        {!userProfile.isVerified && (userProfile.licenseProof || userProfile.idProof) && (
                                                            <>
                                                                <Separator />
                                                                <div className="flex gap-2">
                                                                    <Button
                                                                        onClick={() => handleReview(true)}
                                                                        disabled={reviewVerification.isPending}
                                                                        className="flex-1 gap-2"
                                                                    >
                                                                        <CheckCircle className="h-4 w-4" />
                                                                        {reviewVerification.isPending ? 'Processing...' : 'Approve'}
                                                                    </Button>
                                                                    <Button
                                                                        variant="destructive"
                                                                        onClick={() => handleReview(false)}
                                                                        disabled={reviewVerification.isPending}
                                                                        className="flex-1 gap-2"
                                                                    >
                                                                        <XCircle className="h-4 w-4" />
                                                                        {reviewVerification.isPending ? 'Processing...' : 'Reject'}
                                                                    </Button>
                                                                </div>
                                                            </>
                                                        )}
                                                    </div>
                                                </div>
                                            ) : (
                                                <div className="text-center py-8">
                                                    <p className="text-sm text-muted-foreground">User not found</p>
                                                </div>
                                            )}
                                        </>
                                    )}
                                </CardContent>
                            </Card>
                        </TabsContent>
                    </Tabs>
                </div>
            </AdminRouteGuard>
        </AuthenticatedRouteGuard>
    );
}
