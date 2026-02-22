import { useState, useMemo } from 'react';
import { useGetAllUserProfiles, useGetUserProfile, useReviewVerification, useGetAllLatestSOSLocations, useGetAllMembers, useGetActivityLogs, useGetHardcodedAdminPrincipal } from '../hooks/useQueries';
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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { toast } from 'sonner';
import { Shield, CheckCircle, XCircle, Search, Users, MapPin, ExternalLink, AlertTriangle, FileText, Calendar, User, Copy, Check, Info } from 'lucide-react';
import { formatDateTime } from '../lib/time';
import { getEventTypeLabel, eventTypeOptions } from '../lib/eventType';
import { EventType } from '../backend';

export default function AdminDashboardPage() {
    const [activeTab, setActiveTab] = useState('registrations');
    
    // Hardcoded admin principal
    const { data: hardcodedAdminPrincipal } = useGetHardcodedAdminPrincipal();
    const [copiedAdmin, setCopiedAdmin] = useState(false);
    
    // Registrations tab state
    const { data: allProfiles, isLoading: isLoadingProfiles, error: profilesError } = useGetAllUserProfiles();
    
    // Verification Review tab state
    const [principalInput, setPrincipalInput] = useState('');
    const [lookupPrincipal, setLookupPrincipal] = useState<string | null>(null);
    const { data: userProfile, isLoading: isLoadingUser } = useGetUserProfile(lookupPrincipal);
    const reviewVerification = useReviewVerification();

    // SOS Locations tab state
    const { data: sosLocations, isLoading: isLoadingSOSLocations } = useGetAllLatestSOSLocations();

    // Members tab state
    const { data: allMembers, isLoading: isLoadingMembers } = useGetAllMembers();
    const [memberSearchQuery, setMemberSearchQuery] = useState('');

    // Logs tab state
    const { data: activityLogs, isLoading: isLoadingLogs } = useGetActivityLogs();
    const [logEventTypeFilter, setLogEventTypeFilter] = useState<string>('all');
    const [logSearchQuery, setLogSearchQuery] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    const logsPerPage = 20;

    const handleCopyAdminPrincipal = async () => {
        if (!hardcodedAdminPrincipal) return;
        try {
            await navigator.clipboard.writeText(hardcodedAdminPrincipal);
            setCopiedAdmin(true);
            toast.success('Admin Principal ID copied to clipboard');
            setTimeout(() => setCopiedAdmin(false), 2000);
        } catch (error) {
            console.error('Failed to copy:', error);
            toast.error('Failed to copy Principal ID');
        }
    };

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

    // Filter and search members
    const filteredMembers = useMemo(() => {
        if (!allMembers) return [];
        
        return allMembers.filter(([principal, profile]) => {
            const principalStr = principal.toString().toLowerCase();
            const nameStr = profile.name.toLowerCase();
            const query = memberSearchQuery.toLowerCase();
            
            return principalStr.includes(query) || nameStr.includes(query);
        });
    }, [allMembers, memberSearchQuery]);

    // Sort members by registration time (newest first)
    const sortedMembers = useMemo(() => {
        return [...filteredMembers].sort((a, b) => {
            return Number(b[1].registrationTime - a[1].registrationTime);
        });
    }, [filteredMembers]);

    // Filter and paginate logs
    const filteredLogs = useMemo(() => {
        if (!activityLogs) return [];
        
        return activityLogs.filter((log) => {
            // Filter by event type
            if (logEventTypeFilter !== 'all' && log.eventType !== logEventTypeFilter) {
                return false;
            }
            
            // Filter by search query (description or principal)
            if (logSearchQuery) {
                const query = logSearchQuery.toLowerCase();
                const descriptionMatch = log.description.toLowerCase().includes(query);
                const principalMatch = log.initiatedBy.toString().toLowerCase().includes(query);
                return descriptionMatch || principalMatch;
            }
            
            return true;
        });
    }, [activityLogs, logEventTypeFilter, logSearchQuery]);

    // Sort logs by timestamp (newest first)
    const sortedLogs = useMemo(() => {
        return [...filteredLogs].sort((a, b) => {
            return Number(b.timestamp - a.timestamp);
        });
    }, [filteredLogs]);

    // Paginate logs
    const paginatedLogs = useMemo(() => {
        const startIndex = (currentPage - 1) * logsPerPage;
        const endIndex = startIndex + logsPerPage;
        return sortedLogs.slice(startIndex, endIndex);
    }, [sortedLogs, currentPage]);

    const totalPages = Math.ceil(sortedLogs.length / logsPerPage);

    return (
        <AuthenticatedRouteGuard>
            <AdminRouteGuard>
                <div className="space-y-6 max-w-6xl">
                    <div className="flex items-center gap-3">
                        <Shield className="h-8 w-8" />
                        <div>
                            <h1 className="text-3xl font-bold">Admin Dashboard</h1>
                            <p className="text-muted-foreground">Manage user registrations, verifications, members, and system logs</p>
                        </div>
                    </div>

                    {/* Hardcoded Admin Principal Alert */}
                    {hardcodedAdminPrincipal && (
                        <Alert>
                            <Info className="h-4 w-4" />
                            <AlertTitle>Hardcoded Admin Principal ID</AlertTitle>
                            <AlertDescription>
                                <p className="mb-2">
                                    The following Principal ID has permanent admin access. Log in with this identity to access admin features:
                                </p>
                                <div className="flex items-center gap-2 mt-2">
                                    <code className="flex-1 px-3 py-2 bg-muted rounded-md text-sm font-mono break-all">
                                        {hardcodedAdminPrincipal}
                                    </code>
                                    <Button
                                        variant="outline"
                                        size="icon"
                                        onClick={handleCopyAdminPrincipal}
                                        className="shrink-0"
                                    >
                                        {copiedAdmin ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                                    </Button>
                                </div>
                            </AlertDescription>
                        </Alert>
                    )}

                    <Tabs value={activeTab} onValueChange={setActiveTab}>
                        <TabsList className="grid w-full grid-cols-5">
                            <TabsTrigger value="registrations">
                                <Users className="h-4 w-4 mr-2" />
                                Registrations
                            </TabsTrigger>
                            <TabsTrigger value="verification">
                                <Search className="h-4 w-4 mr-2" />
                                Verification
                            </TabsTrigger>
                            <TabsTrigger value="sos">
                                <MapPin className="h-4 w-4 mr-2" />
                                SOS Locations
                            </TabsTrigger>
                            <TabsTrigger value="members">
                                <Users className="h-4 w-4 mr-2" />
                                Members
                            </TabsTrigger>
                            <TabsTrigger value="logs">
                                <FileText className="h-4 w-4 mr-2" />
                                Logs
                            </TabsTrigger>
                        </TabsList>

                        {/* Registrations Tab */}
                        <TabsContent value="registrations" className="space-y-4">
                            <Card>
                                <CardHeader>
                                    <CardTitle>User Registrations</CardTitle>
                                    <CardDescription>
                                        All registered users in the system
                                    </CardDescription>
                                </CardHeader>
                                <CardContent>
                                    {isLoadingProfiles ? (
                                        <div className="text-center py-8">
                                            <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent mx-auto mb-2" />
                                            <p className="text-sm text-muted-foreground">Loading registrations...</p>
                                        </div>
                                    ) : profilesError ? (
                                        <div className="text-center py-8">
                                            <AlertTriangle className="h-12 w-12 text-destructive mx-auto mb-2" />
                                            <p className="text-sm text-muted-foreground">Failed to load registrations</p>
                                        </div>
                                    ) : !allProfiles || allProfiles.length === 0 ? (
                                        <div className="text-center py-8">
                                            <Users className="h-12 w-12 text-muted-foreground mx-auto mb-2" />
                                            <p className="text-sm text-muted-foreground">No registered users yet</p>
                                        </div>
                                    ) : (
                                        <div className="overflow-x-auto">
                                            <Table>
                                                <TableHeader>
                                                    <TableRow>
                                                        <TableHead>Name</TableHead>
                                                        <TableHead>Principal ID</TableHead>
                                                        <TableHead>Status</TableHead>
                                                        <TableHead>Registration Date</TableHead>
                                                    </TableRow>
                                                </TableHeader>
                                                <TableBody>
                                                    {allProfiles.map(([principal, profile]) => (
                                                        <TableRow key={principal.toString()}>
                                                            <TableCell className="font-medium">{profile.name}</TableCell>
                                                            <TableCell className="font-mono text-xs">
                                                                {truncatePrincipal(principal.toString())}
                                                            </TableCell>
                                                            <TableCell>
                                                                {profile.isVerified ? (
                                                                    <Badge variant="default" className="gap-1">
                                                                        <CheckCircle className="h-3 w-3" />
                                                                        Verified
                                                                    </Badge>
                                                                ) : (
                                                                    <Badge variant="secondary" className="gap-1">
                                                                        <XCircle className="h-3 w-3" />
                                                                        Unverified
                                                                    </Badge>
                                                                )}
                                                            </TableCell>
                                                            <TableCell className="text-sm text-muted-foreground">
                                                                {formatDateTime(profile.registrationTime)}
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
                                    <CardTitle>Review User Verification</CardTitle>
                                    <CardDescription>
                                        Look up a user by Principal ID to review their verification documents
                                    </CardDescription>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    <div className="flex gap-2">
                                        <div className="flex-1">
                                            <Label htmlFor="principal-input">Principal ID</Label>
                                            <Input
                                                id="principal-input"
                                                placeholder="Enter Principal ID..."
                                                value={principalInput}
                                                onChange={(e) => setPrincipalInput(e.target.value)}
                                                onKeyDown={(e) => e.key === 'Enter' && handleLookup()}
                                            />
                                        </div>
                                        <div className="flex items-end">
                                            <Button onClick={handleLookup} disabled={isLoadingUser}>
                                                <Search className="h-4 w-4 mr-2" />
                                                Look Up
                                            </Button>
                                        </div>
                                    </div>

                                    {isLoadingUser && (
                                        <div className="text-center py-8">
                                            <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent mx-auto mb-2" />
                                            <p className="text-sm text-muted-foreground">Loading user profile...</p>
                                        </div>
                                    )}

                                    {!isLoadingUser && lookupPrincipal && !userProfile && (
                                        <div className="text-center py-8">
                                            <AlertTriangle className="h-12 w-12 text-muted-foreground mx-auto mb-2" />
                                            <p className="text-sm text-muted-foreground">User not found</p>
                                        </div>
                                    )}

                                    {userProfile && (
                                        <div className="space-y-4">
                                            <Separator />
                                            <div className="space-y-2">
                                                <h3 className="font-semibold">User Information</h3>
                                                <div className="grid gap-2 text-sm">
                                                    <div className="flex justify-between">
                                                        <span className="text-muted-foreground">Name:</span>
                                                        <span className="font-medium">{userProfile.name}</span>
                                                    </div>
                                                    <div className="flex justify-between">
                                                        <span className="text-muted-foreground">Status:</span>
                                                        {userProfile.isVerified ? (
                                                            <Badge variant="default" className="gap-1">
                                                                <CheckCircle className="h-3 w-3" />
                                                                Verified
                                                            </Badge>
                                                        ) : (
                                                            <Badge variant="secondary" className="gap-1">
                                                                <XCircle className="h-3 w-3" />
                                                                Unverified
                                                            </Badge>
                                                        )}
                                                    </div>
                                                    <div className="flex justify-between">
                                                        <span className="text-muted-foreground">Registration:</span>
                                                        <span className="font-medium">{formatDateTime(userProfile.registrationTime)}</span>
                                                    </div>
                                                </div>
                                            </div>

                                            {(userProfile.licenseProof || userProfile.idProof) && (
                                                <>
                                                    <Separator />
                                                    <div className="space-y-2">
                                                        <h3 className="font-semibold">Verification Documents</h3>
                                                        <div className="grid gap-4 md:grid-cols-2">
                                                            {userProfile.licenseProof && (
                                                                <div className="space-y-2">
                                                                    <Label>Trucking License</Label>
                                                                    <img
                                                                        src={userProfile.licenseProof.getDirectURL()}
                                                                        alt="License proof"
                                                                        className="w-full rounded-lg border"
                                                                    />
                                                                </div>
                                                            )}
                                                            {userProfile.idProof && (
                                                                <div className="space-y-2">
                                                                    <Label>ID Proof</Label>
                                                                    <img
                                                                        src={userProfile.idProof.getDirectURL()}
                                                                        alt="ID proof"
                                                                        className="w-full rounded-lg border"
                                                                    />
                                                                </div>
                                                            )}
                                                        </div>
                                                    </div>
                                                </>
                                            )}

                                            <Separator />
                                            <div className="flex gap-2">
                                                <Button
                                                    onClick={() => handleReview(true)}
                                                    disabled={reviewVerification.isPending || userProfile.isVerified}
                                                    className="flex-1"
                                                >
                                                    <CheckCircle className="h-4 w-4 mr-2" />
                                                    Approve
                                                </Button>
                                                <Button
                                                    variant="destructive"
                                                    onClick={() => handleReview(false)}
                                                    disabled={reviewVerification.isPending}
                                                    className="flex-1"
                                                >
                                                    <XCircle className="h-4 w-4 mr-2" />
                                                    Reject
                                                </Button>
                                            </div>
                                        </div>
                                    )}
                                </CardContent>
                            </Card>
                        </TabsContent>

                        {/* SOS Locations Tab */}
                        <TabsContent value="sos" className="space-y-4">
                            <Card>
                                <CardHeader>
                                    <CardTitle>SOS Location Snapshots</CardTitle>
                                    <CardDescription>
                                        Latest emergency location snapshots from all users
                                    </CardDescription>
                                </CardHeader>
                                <CardContent>
                                    {isLoadingSOSLocations ? (
                                        <div className="text-center py-8">
                                            <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent mx-auto mb-2" />
                                            <p className="text-sm text-muted-foreground">Loading SOS locations...</p>
                                        </div>
                                    ) : !sosLocations || sosLocations.length === 0 ? (
                                        <div className="text-center py-8">
                                            <MapPin className="h-12 w-12 text-muted-foreground mx-auto mb-2" />
                                            <p className="text-sm text-muted-foreground">No SOS snapshots recorded yet</p>
                                        </div>
                                    ) : (
                                        <div className="overflow-x-auto">
                                            <Table>
                                                <TableHeader>
                                                    <TableRow>
                                                        <TableHead>User Principal</TableHead>
                                                        <TableHead>Timestamp</TableHead>
                                                        <TableHead>Coordinates</TableHead>
                                                        <TableHead>Map</TableHead>
                                                    </TableRow>
                                                </TableHeader>
                                                <TableBody>
                                                    {sosLocations.map((snapshot, index) => (
                                                        <TableRow key={`${snapshot.user.toString()}-${index}`}>
                                                            <TableCell className="font-mono text-xs">
                                                                {truncatePrincipal(snapshot.user.toString())}
                                                            </TableCell>
                                                            <TableCell className="text-sm">
                                                                {formatDateTime(snapshot.timestamp)}
                                                            </TableCell>
                                                            <TableCell className="font-mono text-xs">
                                                                {snapshot.latitude.toFixed(6)}, {snapshot.longitude.toFixed(6)}
                                                            </TableCell>
                                                            <TableCell>
                                                                <Button
                                                                    variant="outline"
                                                                    size="sm"
                                                                    asChild
                                                                >
                                                                    <a
                                                                        href={getMapUrl(snapshot.latitude, snapshot.longitude)}
                                                                        target="_blank"
                                                                        rel="noopener noreferrer"
                                                                    >
                                                                        <ExternalLink className="h-4 w-4 mr-2" />
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

                        {/* Members Tab */}
                        <TabsContent value="members" className="space-y-4">
                            <Card>
                                <CardHeader>
                                    <CardTitle>Registered Members</CardTitle>
                                    <CardDescription>
                                        All members registered in the system
                                    </CardDescription>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    <div>
                                        <Label htmlFor="member-search">Search Members</Label>
                                        <Input
                                            id="member-search"
                                            placeholder="Search by name or Principal ID..."
                                            value={memberSearchQuery}
                                            onChange={(e) => setMemberSearchQuery(e.target.value)}
                                        />
                                    </div>

                                    {isLoadingMembers ? (
                                        <div className="text-center py-8">
                                            <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent mx-auto mb-2" />
                                            <p className="text-sm text-muted-foreground">Loading members...</p>
                                        </div>
                                    ) : sortedMembers.length === 0 ? (
                                        <div className="text-center py-8">
                                            <Users className="h-12 w-12 text-muted-foreground mx-auto mb-2" />
                                            <p className="text-sm text-muted-foreground">
                                                {memberSearchQuery ? 'No members found matching your search' : 'No registered members yet'}
                                            </p>
                                        </div>
                                    ) : (
                                        <div className="overflow-x-auto">
                                            <Table>
                                                <TableHeader>
                                                    <TableRow>
                                                        <TableHead>Name</TableHead>
                                                        <TableHead>Principal ID</TableHead>
                                                        <TableHead>Status</TableHead>
                                                        <TableHead>Registered</TableHead>
                                                    </TableRow>
                                                </TableHeader>
                                                <TableBody>
                                                    {sortedMembers.map(([principal, profile]) => (
                                                        <TableRow key={principal.toString()}>
                                                            <TableCell className="font-medium">{profile.name}</TableCell>
                                                            <TableCell className="font-mono text-xs">
                                                                {truncatePrincipal(principal.toString())}
                                                            </TableCell>
                                                            <TableCell>
                                                                {profile.isVerified ? (
                                                                    <Badge variant="default" className="gap-1">
                                                                        <CheckCircle className="h-3 w-3" />
                                                                        Verified
                                                                    </Badge>
                                                                ) : (
                                                                    <Badge variant="secondary" className="gap-1">
                                                                        <XCircle className="h-3 w-3" />
                                                                        Unverified
                                                                    </Badge>
                                                                )}
                                                            </TableCell>
                                                            <TableCell className="text-sm text-muted-foreground">
                                                                {formatDateTime(profile.registrationTime)}
                                                            </TableCell>
                                                        </TableRow>
                                                    ))}
                                                </TableBody>
                                            </Table>
                                        </div>
                                    )}

                                    {sortedMembers.length > 0 && (
                                        <div className="text-sm text-muted-foreground text-center">
                                            Showing {sortedMembers.length} of {allMembers?.length || 0} members
                                        </div>
                                    )}
                                </CardContent>
                            </Card>
                        </TabsContent>

                        {/* Logs Tab */}
                        <TabsContent value="logs" className="space-y-4">
                            <Card>
                                <CardHeader>
                                    <CardTitle>Activity Logs</CardTitle>
                                    <CardDescription>
                                        System activity and user actions
                                    </CardDescription>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    <div className="grid gap-4 md:grid-cols-2">
                                        <div>
                                            <Label htmlFor="event-type-filter">Event Type</Label>
                                            <Select value={logEventTypeFilter} onValueChange={setLogEventTypeFilter}>
                                                <SelectTrigger id="event-type-filter">
                                                    <SelectValue placeholder="All events" />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    <SelectItem value="all">All Events</SelectItem>
                                                    {eventTypeOptions.map((option) => (
                                                        <SelectItem key={option.value} value={option.value}>
                                                            {option.label}
                                                        </SelectItem>
                                                    ))}
                                                </SelectContent>
                                            </Select>
                                        </div>
                                        <div>
                                            <Label htmlFor="log-search">Search Logs</Label>
                                            <Input
                                                id="log-search"
                                                placeholder="Search description or principal..."
                                                value={logSearchQuery}
                                                onChange={(e) => setLogSearchQuery(e.target.value)}
                                            />
                                        </div>
                                    </div>

                                    {isLoadingLogs ? (
                                        <div className="text-center py-8">
                                            <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent mx-auto mb-2" />
                                            <p className="text-sm text-muted-foreground">Loading activity logs...</p>
                                        </div>
                                    ) : paginatedLogs.length === 0 ? (
                                        <div className="text-center py-8">
                                            <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-2" />
                                            <p className="text-sm text-muted-foreground">
                                                {logSearchQuery || logEventTypeFilter !== 'all' ? 'No logs found matching your filters' : 'No activity logs yet'}
                                            </p>
                                        </div>
                                    ) : (
                                        <>
                                            <div className="overflow-x-auto">
                                                <Table>
                                                    <TableHeader>
                                                        <TableRow>
                                                            <TableHead>Timestamp</TableHead>
                                                            <TableHead>Event Type</TableHead>
                                                            <TableHead>Description</TableHead>
                                                            <TableHead>Initiated By</TableHead>
                                                        </TableRow>
                                                    </TableHeader>
                                                    <TableBody>
                                                        {paginatedLogs.map((log, index) => (
                                                            <TableRow key={`${log.timestamp}-${index}`}>
                                                                <TableCell className="text-sm whitespace-nowrap">
                                                                    {formatDateTime(log.timestamp)}
                                                                </TableCell>
                                                                <TableCell>
                                                                    <Badge variant="outline">
                                                                        {getEventTypeLabel(log.eventType)}
                                                                    </Badge>
                                                                </TableCell>
                                                                <TableCell className="max-w-md">
                                                                    {log.description}
                                                                </TableCell>
                                                                <TableCell className="font-mono text-xs">
                                                                    {truncatePrincipal(log.initiatedBy.toString())}
                                                                </TableCell>
                                                            </TableRow>
                                                        ))}
                                                    </TableBody>
                                                </Table>
                                            </div>

                                            {totalPages > 1 && (
                                                <div className="flex items-center justify-between">
                                                    <div className="text-sm text-muted-foreground">
                                                        Page {currentPage} of {totalPages} ({sortedLogs.length} total logs)
                                                    </div>
                                                    <div className="flex gap-2">
                                                        <Button
                                                            variant="outline"
                                                            size="sm"
                                                            onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                                                            disabled={currentPage === 1}
                                                        >
                                                            Previous
                                                        </Button>
                                                        <Button
                                                            variant="outline"
                                                            size="sm"
                                                            onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                                                            disabled={currentPage === totalPages}
                                                        >
                                                            Next
                                                        </Button>
                                                    </div>
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
