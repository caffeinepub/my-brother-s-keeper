import { useState } from 'react';
import { useGetAllUserProfiles, useGetUserProfile, useReviewVerification, useGetAllLatestSOSLocations } from '../hooks/useQueries';
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
import { Shield, CheckCircle, XCircle, Search, Users, MapPin, ExternalLink, AlertTriangle } from 'lucide-react';

export default function AdminDashboardPage() {
    const [activeTab, setActiveTab] = useState('registrations');
    
    // Registrations tab state
    const { data: allProfiles, isLoading: isLoadingProfiles, error: profilesError } = useGetAllUserProfiles();
    
    // Verification Review tab state
    const [principalInput, setPrincipalInput] = useState('');
    const [lookupPrincipal, setLookupPrincipal] = useState<string | null>(null);
    const { data: userProfile, isLoading: isLoadingUser } = useGetUserProfile(lookupPrincipal);
    const reviewVerification = useReviewVerification();

    // SOS Locations tab state
    const { data: sosLocations, isLoading: isLoadingSOSLocations } = useGetAllLatestSOSLocations();

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

    const getMapUrl = (lat: number, lng: number) => {
        return `https://www.google.com/maps?q=${lat},${lng}&z=15`;
    };

    const truncatePrincipal = (principal: string) => {
        if (principal.length <= 20) return principal;
        return `${principal.slice(0, 10)}...${principal.slice(-10)}`;
    };

    return (
        <AuthenticatedRouteGuard>
            <AdminRouteGuard>
                <div className="space-y-6 max-w-6xl">
                    <div className="flex items-center gap-3">
                        <Shield className="h-8 w-8" />
                        <div>
                            <h1 className="text-3xl font-bold">Admin Dashboard</h1>
                            <p className="text-muted-foreground">Manage user registrations, verification, and emergency data</p>
                        </div>
                    </div>

                    <Tabs value={activeTab} onValueChange={setActiveTab}>
                        <TabsList className="grid w-full max-w-2xl grid-cols-3">
                            <TabsTrigger value="registrations" className="gap-2">
                                <Users className="h-4 w-4" />
                                Registrations
                            </TabsTrigger>
                            <TabsTrigger value="verification" className="gap-2">
                                <Shield className="h-4 w-4" />
                                Verification Review
                            </TabsTrigger>
                            <TabsTrigger value="sos-locations" className="gap-2">
                                <AlertTriangle className="h-4 w-4" />
                                SOS Locations
                            </TabsTrigger>
                        </TabsList>

                        {/* Registrations Tab */}
                        <TabsContent value="registrations" className="space-y-4">
                            <Card>
                                <CardHeader>
                                    <CardTitle>User Registrations</CardTitle>
                                    <CardDescription>
                                        All registered users and their verification status
                                    </CardDescription>
                                </CardHeader>
                                <CardContent>
                                    {isLoadingProfiles ? (
                                        <div className="text-center py-8 text-muted-foreground">
                                            Loading registrations...
                                        </div>
                                    ) : profilesError ? (
                                        <div className="text-center py-8 text-destructive">
                                            Failed to load registrations
                                        </div>
                                    ) : !allProfiles || allProfiles.length === 0 ? (
                                        <div className="text-center py-8 text-muted-foreground">
                                            No registrations found
                                        </div>
                                    ) : (
                                        <div className="rounded-md border">
                                            <Table>
                                                <TableHeader>
                                                    <TableRow>
                                                        <TableHead>Name</TableHead>
                                                        <TableHead>Principal ID</TableHead>
                                                        <TableHead>Status</TableHead>
                                                        <TableHead>Documents</TableHead>
                                                    </TableRow>
                                                </TableHeader>
                                                <TableBody>
                                                    {allProfiles.map(([principal, profile]) => (
                                                        <TableRow key={principal.toString()}>
                                                            <TableCell className="font-medium">
                                                                {profile.name}
                                                            </TableCell>
                                                            <TableCell className="font-mono text-sm">
                                                                {truncatePrincipal(principal.toString())}
                                                            </TableCell>
                                                            <TableCell>
                                                                <Badge variant={profile.isVerified ? 'default' : 'secondary'}>
                                                                    {profile.isVerified ? 'Verified' : 'Pending'}
                                                                </Badge>
                                                            </TableCell>
                                                            <TableCell>
                                                                <div className="flex gap-2 text-xs">
                                                                    {profile.licenseProof && (
                                                                        <Badge variant="outline">License</Badge>
                                                                    )}
                                                                    {profile.idProof && (
                                                                        <Badge variant="outline">ID</Badge>
                                                                    )}
                                                                    {!profile.licenseProof && !profile.idProof && (
                                                                        <span className="text-muted-foreground">None</span>
                                                                    )}
                                                                </div>
                                                            </TableCell>
                                                        </TableRow>
                                                    ))}
                                                </TableBody>
                                            </Table>
                                        </div>
                                    )}
                                </CardContent>
                            </Card>
                        </TabsContent>

                        {/* Verification Review Tab */}
                        <TabsContent value="verification" className="space-y-4">
                            <Card>
                                <CardHeader>
                                    <CardTitle>Verification Review</CardTitle>
                                    <CardDescription>
                                        Look up a user by Principal ID to review their verification documents
                                    </CardDescription>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    <div className="flex gap-2">
                                        <div className="flex-1">
                                            <Label htmlFor="principal-lookup">Principal ID</Label>
                                            <Input
                                                id="principal-lookup"
                                                value={principalInput}
                                                onChange={(e) => setPrincipalInput(e.target.value)}
                                                placeholder="Enter Principal ID"
                                                className="font-mono"
                                            />
                                        </div>
                                        <div className="flex items-end">
                                            <Button
                                                onClick={handleLookup}
                                                disabled={isLoadingUser}
                                                className="gap-2"
                                            >
                                                <Search className="h-4 w-4" />
                                                Lookup
                                            </Button>
                                        </div>
                                    </div>

                                    {lookupPrincipal && userProfile && (
                                        <Card className="border-accent/20">
                                            <CardHeader>
                                                <div className="flex items-center justify-between">
                                                    <div>
                                                        <CardTitle>{userProfile.name}</CardTitle>
                                                        <CardDescription className="font-mono text-xs">
                                                            {lookupPrincipal}
                                                        </CardDescription>
                                                    </div>
                                                    <Badge variant={userProfile.isVerified ? 'default' : 'secondary'}>
                                                        {userProfile.isVerified ? 'Verified' : 'Pending'}
                                                    </Badge>
                                                </div>
                                            </CardHeader>
                                            <CardContent className="space-y-4">
                                                <div className="space-y-2">
                                                    <Label>Trucking License</Label>
                                                    {userProfile.licenseProof ? (
                                                        <div className="border rounded-lg p-2">
                                                            <img
                                                                src={userProfile.licenseProof.getDirectURL()}
                                                                alt="License"
                                                                className="max-w-full h-auto rounded"
                                                            />
                                                        </div>
                                                    ) : (
                                                        <p className="text-sm text-muted-foreground">No license uploaded</p>
                                                    )}
                                                </div>

                                                <div className="space-y-2">
                                                    <Label>ID Proof</Label>
                                                    {userProfile.idProof ? (
                                                        <div className="border rounded-lg p-2">
                                                            <img
                                                                src={userProfile.idProof.getDirectURL()}
                                                                alt="ID"
                                                                className="max-w-full h-auto rounded"
                                                            />
                                                        </div>
                                                    ) : (
                                                        <p className="text-sm text-muted-foreground">No ID uploaded</p>
                                                    )}
                                                </div>

                                                <Separator />

                                                <div className="flex gap-2">
                                                    <Button
                                                        onClick={() => handleReview(true)}
                                                        disabled={reviewVerification.isPending || userProfile.isVerified}
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
                                            </CardContent>
                                        </Card>
                                    )}

                                    {lookupPrincipal && !userProfile && !isLoadingUser && (
                                        <div className="text-center py-8 text-muted-foreground">
                                            No user found with this Principal ID
                                        </div>
                                    )}
                                </CardContent>
                            </Card>
                        </TabsContent>

                        {/* SOS Locations Tab */}
                        <TabsContent value="sos-locations" className="space-y-4">
                            <Card>
                                <CardHeader>
                                    <CardTitle className="flex items-center gap-2">
                                        <AlertTriangle className="h-5 w-5 text-destructive" />
                                        SOS Locations
                                    </CardTitle>
                                    <CardDescription>
                                        Recent SOS snapshots from all users for emergency management
                                    </CardDescription>
                                </CardHeader>
                                <CardContent>
                                    {isLoadingSOSLocations ? (
                                        <div className="text-center py-8 text-muted-foreground">
                                            Loading SOS locations...
                                        </div>
                                    ) : !sosLocations || sosLocations.length === 0 ? (
                                        <div className="text-center py-8 text-muted-foreground">
                                            No SOS snapshots found
                                        </div>
                                    ) : (
                                        <div className="rounded-md border">
                                            <Table>
                                                <TableHeader>
                                                    <TableRow>
                                                        <TableHead>User Principal</TableHead>
                                                        <TableHead>Timestamp</TableHead>
                                                        <TableHead>Latitude</TableHead>
                                                        <TableHead>Longitude</TableHead>
                                                        <TableHead>Map</TableHead>
                                                    </TableRow>
                                                </TableHeader>
                                                <TableBody>
                                                    {sosLocations.map((snapshot) => (
                                                        <TableRow key={snapshot.user.toString()}>
                                                            <TableCell className="font-mono text-sm">
                                                                {truncatePrincipal(snapshot.user.toString())}
                                                            </TableCell>
                                                            <TableCell className="text-sm">
                                                                {new Date(Number(snapshot.timestamp) / 1000000).toLocaleString()}
                                                            </TableCell>
                                                            <TableCell className="font-mono text-sm">
                                                                {snapshot.latitude.toFixed(6)}
                                                            </TableCell>
                                                            <TableCell className="font-mono text-sm">
                                                                {snapshot.longitude.toFixed(6)}
                                                            </TableCell>
                                                            <TableCell>
                                                                <Button
                                                                    asChild
                                                                    variant="outline"
                                                                    size="sm"
                                                                    className="gap-2"
                                                                >
                                                                    <a
                                                                        href={getMapUrl(snapshot.latitude, snapshot.longitude)}
                                                                        target="_blank"
                                                                        rel="noopener noreferrer"
                                                                    >
                                                                        <ExternalLink className="h-3 w-3" />
                                                                        View
                                                                    </a>
                                                                </Button>
                                                            </TableCell>
                                                        </TableRow>
                                                    ))}
                                                </TableBody>
                                            </Table>
                                        </div>
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
