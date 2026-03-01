import { useState } from 'react';
import { useNavigate } from '@tanstack/react-router';
import {
  useGetAllUserProfiles,
  useGetActivityLogs,
  useGetAllLatestSOSLocations,
  useGetAllMembers,
  useReviewVerification,
} from '../hooks/useQueries';
import { parsePrincipal } from '../lib/principal';
import { formatDateTime } from '../lib/time';
import { getEventTypeLabel } from '../lib/eventType';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Users,
  FileCheck,
  MapPin,
  Activity,
  Search,
  CheckCircle,
  XCircle,
  Clock,
  ExternalLink,
  Shield,
} from 'lucide-react';
import AdminRouteGuard from '../components/auth/AdminRouteGuard';
import { buildGoogleMapsUrl } from '../lib/googleMapsUrl';
import { getMapZoomPreference } from '../lib/mapZoomPreference';
import GenerateAdminTokenCard from '../components/admin/GenerateAdminTokenCard';
import type { UserProfile } from '../backend';
import { Principal } from '@dfinity/principal';

function RegistrationsTab() {
  const { data: profiles, isLoading, error } = useGetAllUserProfiles();
  const [searchTerm, setSearchTerm] = useState('');

  const filtered = profiles?.filter(([, profile]) =>
    profile.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (isLoading) return <Skeleton className="h-64 w-full" />;
  if (error)
    return (
      <Alert variant="destructive">
        <AlertDescription>Failed to load registrations.</AlertDescription>
      </Alert>
    );

  return (
    <div className="space-y-4">
      <Input
        placeholder="Search by name..."
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
      />
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Registered</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filtered?.length === 0 ? (
              <TableRow>
                <TableCell colSpan={3} className="text-center text-muted-foreground">
                  No registrations found.
                </TableCell>
              </TableRow>
            ) : (
              filtered?.map(([principal, profile]) => (
                <TableRow key={principal.toString()}>
                  <TableCell className="font-medium">{profile.name}</TableCell>
                  <TableCell>
                    {profile.isVerified ? (
                      <Badge variant="default" className="gap-1">
                        <CheckCircle className="h-3 w-3" />
                        Verified
                      </Badge>
                    ) : (
                      <Badge variant="secondary">Pending</Badge>
                    )}
                  </TableCell>
                  <TableCell className="text-sm text-muted-foreground">
                    {formatDateTime(profile.registrationTime)}
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}

function VerificationTab() {
  const { data: profiles, isLoading, error } = useGetAllUserProfiles();
  const reviewMutation = useReviewVerification();
  const [reviewingId, setReviewingId] = useState<string | null>(null);

  const pendingVerification = profiles?.filter(
    ([, profile]) =>
      (profile.licenseProof !== undefined || profile.idProof !== undefined) && !profile.isVerified
  );

  if (isLoading) return <Skeleton className="h-64 w-full" />;
  if (error)
    return (
      <Alert variant="destructive">
        <AlertDescription>Failed to load verification requests.</AlertDescription>
      </Alert>
    );

  const handleReview = async (principal: Principal, _profile: UserProfile, approved: boolean) => {
    const id = principal.toString();
    setReviewingId(id);
    try {
      await reviewMutation.mutateAsync({ user: principal, approved });
    } finally {
      setReviewingId(null);
    }
  };

  return (
    <div className="space-y-4">
      <p className="text-sm text-muted-foreground">
        {pendingVerification?.length ?? 0} pending verification request
        {pendingVerification?.length !== 1 ? 's' : ''}
      </p>
      {pendingVerification?.length === 0 ? (
        <Card>
          <CardContent className="py-8 text-center">
            <FileCheck className="mx-auto mb-3 h-10 w-10 text-muted-foreground/50" />
            <p className="text-muted-foreground">No pending verification requests.</p>
          </CardContent>
        </Card>
      ) : (
        pendingVerification?.map(([principal, profile]) => (
          <Card key={principal.toString()}>
            <CardContent className="p-4">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="font-medium">{profile.name}</p>
                  <p className="font-mono text-xs text-muted-foreground">
                    {principal.toString()}
                  </p>
                  <div className="mt-2 flex gap-2">
                    {profile.licenseProof && (
                      <Badge variant="outline" className="gap-1">
                        <FileCheck className="h-3 w-3" />
                        License
                      </Badge>
                    )}
                    {profile.idProof && (
                      <Badge variant="outline" className="gap-1">
                        <FileCheck className="h-3 w-3" />
                        ID Proof
                      </Badge>
                    )}
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button
                    size="sm"
                    variant="outline"
                    className="gap-1 text-destructive hover:text-destructive"
                    disabled={reviewingId === principal.toString()}
                    onClick={() => handleReview(principal, profile, false)}
                  >
                    <XCircle className="h-4 w-4" />
                    Reject
                  </Button>
                  <Button
                    size="sm"
                    className="gap-1"
                    disabled={reviewingId === principal.toString()}
                    onClick={() => handleReview(principal, profile, true)}
                  >
                    <CheckCircle className="h-4 w-4" />
                    Approve
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))
      )}
    </div>
  );
}

function SOSLocationsTab() {
  const { data: sosLocations, isLoading, error } = useGetAllLatestSOSLocations();
  const zoom = getMapZoomPreference();

  if (isLoading) return <Skeleton className="h-64 w-full" />;
  if (error)
    return (
      <Alert variant="destructive">
        <AlertDescription>Failed to load SOS locations.</AlertDescription>
      </Alert>
    );

  return (
    <div className="space-y-4">
      <p className="text-sm text-muted-foreground">
        {sosLocations?.length ?? 0} SOS snapshot{sosLocations?.length !== 1 ? 's' : ''} on record
      </p>
      {sosLocations?.length === 0 ? (
        <Card>
          <CardContent className="py-8 text-center">
            <MapPin className="mx-auto mb-3 h-10 w-10 text-muted-foreground/50" />
            <p className="text-muted-foreground">No SOS snapshots recorded.</p>
          </CardContent>
        </Card>
      ) : (
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>User</TableHead>
                <TableHead>Coordinates</TableHead>
                <TableHead>Timestamp</TableHead>
                <TableHead>Map</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {sosLocations?.map((snap, idx) => (
                <TableRow key={idx}>
                  <TableCell className="font-mono text-xs">{snap.user.toString()}</TableCell>
                  <TableCell className="text-sm">
                    {snap.latitude.toFixed(4)}, {snap.longitude.toFixed(4)}
                  </TableCell>
                  <TableCell className="text-sm text-muted-foreground">
                    {formatDateTime(snap.timestamp)}
                  </TableCell>
                  <TableCell>
                    <a
                      href={buildGoogleMapsUrl(snap.latitude, snap.longitude, zoom)}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-1 text-primary hover:underline"
                    >
                      <ExternalLink className="h-3 w-3" />
                      View
                    </a>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}
    </div>
  );
}

function MembersTab() {
  const { data: members, isLoading, error } = useGetAllMembers();
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [principalSearch, setPrincipalSearch] = useState('');
  const [principalError, setPrincipalError] = useState<string | null>(null);

  const filtered = members?.filter(
    (m) =>
      m.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      m.userId.toString().includes(searchTerm)
  );

  const handlePrincipalNavigate = () => {
    setPrincipalError(null);
    const principal = parsePrincipal(principalSearch.trim());
    if (!principal) {
      setPrincipalError('Invalid Principal ID format.');
      return;
    }
    navigate({ to: '/admin/users/$userId', params: { userId: principal.toString() } });
  };

  if (isLoading) return <Skeleton className="h-64 w-full" />;
  if (error)
    return (
      <Alert variant="destructive">
        <AlertDescription>Failed to load members.</AlertDescription>
      </Alert>
    );

  return (
    <div className="space-y-4">
      {/* Principal ID direct navigation */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-medium">Navigate to User Account</CardTitle>
          <CardDescription className="text-xs">
            Enter a Principal ID to view detailed account information.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-2">
          <div className="space-y-1">
            <Label htmlFor="principalNav" className="text-xs">
              Principal ID
            </Label>
            <Input
              id="principalNav"
              type="text"
              placeholder="e.g. 2yscf-yuwfq-41ml4-t6ujy-r3ogj-ajbkj-rmiih-uyk25-o34ky-6jpe6-gae"
              value={principalSearch}
              onChange={(e) => setPrincipalSearch(e.target.value)}
              className="font-mono text-xs"
              autoComplete="off"
              autoCorrect="off"
              autoCapitalize="off"
              spellCheck={false}
              onKeyDown={(e) => e.key === 'Enter' && handlePrincipalNavigate()}
            />
          </div>
          {principalError && (
            <p className="text-xs text-destructive">{principalError}</p>
          )}
          <Button
            size="sm"
            onClick={handlePrincipalNavigate}
            disabled={!principalSearch.trim()}
            className="w-full"
          >
            <Search className="mr-1 h-3 w-3" />
            View Account
          </Button>
        </CardContent>
      </Card>

      <Input
        placeholder="Search members by name or Principal ID..."
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
      />
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Registered</TableHead>
              <TableHead></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filtered?.length === 0 ? (
              <TableRow>
                <TableCell colSpan={4} className="text-center text-muted-foreground">
                  No members found.
                </TableCell>
              </TableRow>
            ) : (
              filtered?.map((member) => (
                <TableRow
                  key={member.userId.toString()}
                  className="cursor-pointer hover:bg-muted/50"
                  onClick={() =>
                    navigate({
                      to: '/admin/users/$userId',
                      params: { userId: member.userId.toString() },
                    })
                  }
                >
                  <TableCell className="font-medium">{member.name}</TableCell>
                  <TableCell>
                    {member.isVerified ? (
                      <Badge variant="default" className="gap-1">
                        <CheckCircle className="h-3 w-3" />
                        Verified
                      </Badge>
                    ) : (
                      <Badge variant="secondary" className="gap-1">
                        <Clock className="h-3 w-3" />
                        Pending
                      </Badge>
                    )}
                  </TableCell>
                  <TableCell className="text-sm text-muted-foreground">
                    {formatDateTime(member.registrationTime)}
                  </TableCell>
                  <TableCell>
                    <ExternalLink className="h-4 w-4 text-muted-foreground" />
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}

function ActivityLogsTab() {
  const { data: logs, isLoading, error } = useGetActivityLogs();
  const [searchTerm, setSearchTerm] = useState('');

  const filtered = logs?.filter(
    (log) =>
      log.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      getEventTypeLabel(log.eventType).toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (isLoading) return <Skeleton className="h-64 w-full" />;
  if (error)
    return (
      <Alert variant="destructive">
        <AlertDescription>Failed to load activity logs.</AlertDescription>
      </Alert>
    );

  return (
    <div className="space-y-4">
      <Input
        placeholder="Search logs..."
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
      />
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Event</TableHead>
              <TableHead>Description</TableHead>
              <TableHead>Time</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filtered?.length === 0 ? (
              <TableRow>
                <TableCell colSpan={3} className="text-center text-muted-foreground">
                  No logs found.
                </TableCell>
              </TableRow>
            ) : (
              filtered?.map((log, idx) => (
                <TableRow key={idx}>
                  <TableCell>
                    <Badge variant="outline">{getEventTypeLabel(log.eventType)}</Badge>
                  </TableCell>
                  <TableCell className="text-sm">{log.description}</TableCell>
                  <TableCell className="text-sm text-muted-foreground">
                    {formatDateTime(log.timestamp)}
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}

function AdminDashboardContent() {
  return (
    <div className="container mx-auto max-w-4xl px-4 py-8">
      <div className="mb-6 flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10">
          <Shield className="h-5 w-5 text-primary" />
        </div>
        <div>
          <h1 className="text-3xl font-bold">Admin Dashboard</h1>
          <p className="text-sm text-muted-foreground">Manage members, verifications, and more.</p>
        </div>
      </div>

      {/* Generate Admin Token — always visible to admins */}
      <div className="mb-6">
        <GenerateAdminTokenCard />
      </div>

      <Tabs defaultValue="members">
        <TabsList className="mb-6 grid w-full grid-cols-5">
          <TabsTrigger value="registrations" className="gap-1">
            <Users className="h-4 w-4" />
            <span className="hidden sm:inline">Registrations</span>
          </TabsTrigger>
          <TabsTrigger value="verification" className="gap-1">
            <FileCheck className="h-4 w-4" />
            <span className="hidden sm:inline">Verification</span>
          </TabsTrigger>
          <TabsTrigger value="sos" className="gap-1">
            <MapPin className="h-4 w-4" />
            <span className="hidden sm:inline">SOS</span>
          </TabsTrigger>
          <TabsTrigger value="members" className="gap-1">
            <Users className="h-4 w-4" />
            <span className="hidden sm:inline">Members</span>
          </TabsTrigger>
          <TabsTrigger value="logs" className="gap-1">
            <Activity className="h-4 w-4" />
            <span className="hidden sm:inline">Logs</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="registrations">
          <RegistrationsTab />
        </TabsContent>
        <TabsContent value="verification">
          <VerificationTab />
        </TabsContent>
        <TabsContent value="sos">
          <SOSLocationsTab />
        </TabsContent>
        <TabsContent value="members">
          <MembersTab />
        </TabsContent>
        <TabsContent value="logs">
          <ActivityLogsTab />
        </TabsContent>
      </Tabs>
    </div>
  );
}

export default function AdminDashboardPage() {
  return (
    <AdminRouteGuard>
      <AdminDashboardContent />
    </AdminRouteGuard>
  );
}
