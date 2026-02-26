import { useParams, useNavigate } from '@tanstack/react-router';
import { Principal } from '@dfinity/principal';
import { useGetUserAccountDetails } from '../hooks/useQueries';
import AdminRouteGuard from '../components/auth/AdminRouteGuard';
import AuthenticatedRouteGuard from '../components/auth/AuthenticatedRouteGuard';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import {
  ArrowLeft,
  User,
  Shield,
  CheckCircle,
  XCircle,
  MapPin,
  Route as RouteIcon,
  Calendar,
  FileText,
  AlertTriangle,
  Info,
} from 'lucide-react';
import { formatDateTime } from '../lib/time';
import { getCategoryLabel } from '../lib/placeCategory';
import { getEventTypeLabel } from '../lib/eventType';

export default function UserAccountDetailsPage() {
  const navigate = useNavigate();
  const { userId } = useParams({ strict: false }) as { userId: string };

  let principal: Principal | null = null;
  let principalError = false;

  try {
    principal = Principal.fromText(userId);
  } catch {
    principalError = true;
  }

  const { data: accountDetails, isLoading, error } = useGetUserAccountDetails(principal);

  const handleBack = () => {
    navigate({ to: '/admin/dashboard' });
  };

  if (principalError) {
    return (
      <AuthenticatedRouteGuard>
        <AdminRouteGuard>
          <div className="space-y-6 max-w-6xl">
            <Button variant="ghost" onClick={handleBack} className="gap-2">
              <ArrowLeft className="h-4 w-4" />
              Back to Admin Dashboard
            </Button>
            <Alert variant="destructive">
              <AlertTriangle className="h-4 w-4" />
              <AlertTitle>Invalid Principal ID</AlertTitle>
              <AlertDescription>
                The provided user ID is not a valid Principal ID format.
              </AlertDescription>
            </Alert>
          </div>
        </AdminRouteGuard>
      </AuthenticatedRouteGuard>
    );
  }

  if (isLoading) {
    return (
      <AuthenticatedRouteGuard>
        <AdminRouteGuard>
          <div className="space-y-6 max-w-6xl">
            <Button variant="ghost" onClick={handleBack} className="gap-2">
              <ArrowLeft className="h-4 w-4" />
              Back to Admin Dashboard
            </Button>
            <div className="text-center py-12">
              <div className="h-12 w-12 animate-spin rounded-full border-4 border-primary border-t-transparent mx-auto mb-4" />
              <p className="text-muted-foreground">Loading user account details...</p>
            </div>
          </div>
        </AdminRouteGuard>
      </AuthenticatedRouteGuard>
    );
  }

  if (error || !accountDetails) {
    return (
      <AuthenticatedRouteGuard>
        <AdminRouteGuard>
          <div className="space-y-6 max-w-6xl">
            <Button variant="ghost" onClick={handleBack} className="gap-2">
              <ArrowLeft className="h-4 w-4" />
              Back to Admin Dashboard
            </Button>
            <Alert variant="destructive">
              <AlertTriangle className="h-4 w-4" />
              <AlertTitle>Error Loading User</AlertTitle>
              <AlertDescription>
                {error?.message || 'Failed to load user account details. The user may not exist.'}
              </AlertDescription>
            </Alert>
          </div>
        </AdminRouteGuard>
      </AuthenticatedRouteGuard>
    );
  }

  const {
    profile,
    emergencyProfile,
    recentRoutes,
    placesAdded,
    lastLocations,
    activityLog,
    accountCreated,
  } = accountDetails;

  const getVerificationStatusBadge = () => {
    if (profile.isVerified) {
      return (
        <Badge variant="default" className="gap-1">
          <CheckCircle className="h-3 w-3" />
          Approved
        </Badge>
      );
    }
    if (profile.licenseProof || profile.idProof) {
      return (
        <Badge
          variant="secondary"
          className="gap-1 bg-yellow-500/10 text-yellow-700 dark:text-yellow-400"
        >
          <AlertTriangle className="h-3 w-3" />
          Pending Verification
        </Badge>
      );
    }
    return (
      <Badge variant="outline" className="gap-1">
        <XCircle className="h-3 w-3" />
        Not Submitted
      </Badge>
    );
  };

  return (
    <AuthenticatedRouteGuard>
      <AdminRouteGuard>
        <div className="space-y-6 max-w-6xl">
          <Button variant="ghost" onClick={handleBack} className="gap-2">
            <ArrowLeft className="h-4 w-4" />
            Back to Admin Dashboard
          </Button>

          <div className="flex items-center gap-3">
            <User className="h-8 w-8" />
            <div>
              <h1 className="text-3xl font-bold">{profile.name}</h1>
              <p className="text-sm text-muted-foreground font-mono">{userId}</p>
            </div>
          </div>

          {/* User Profile Section */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="h-5 w-5" />
                User Profile
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-muted-foreground">Name</p>
                  <p className="font-medium">{profile.name}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Verification Status</p>
                  <div className="mt-1">{getVerificationStatusBadge()}</div>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Registration Date</p>
                  <p className="font-medium">{formatDateTime(profile.registrationTime)}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Account Created</p>
                  <p className="font-medium">{formatDateTime(accountCreated)}</p>
                </div>
              </div>

              {(profile.licenseProof || profile.idProof) && (
                <>
                  <Separator />
                  <div>
                    <p className="text-sm font-medium mb-2">Verification Documents</p>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {profile.licenseProof && (
                        <div>
                          <p className="text-xs text-muted-foreground mb-1">Trucking License</p>
                          <a
                            href={profile.licenseProof.getDirectURL()}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="block"
                          >
                            <img
                              src={profile.licenseProof.getDirectURL()}
                              alt="License Proof"
                              className="w-full h-48 object-cover rounded-md border hover:opacity-80 transition-opacity"
                            />
                          </a>
                        </div>
                      )}
                      {profile.idProof && (
                        <div>
                          <p className="text-xs text-muted-foreground mb-1">ID Proof</p>
                          <a
                            href={profile.idProof.getDirectURL()}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="block"
                          >
                            <img
                              src={profile.idProof.getDirectURL()}
                              alt="ID Proof"
                              className="w-full h-48 object-cover rounded-md border hover:opacity-80 transition-opacity"
                            />
                          </a>
                        </div>
                      )}
                    </div>
                  </div>
                </>
              )}
            </CardContent>
          </Card>

          {/* Emergency Profile Section */}
          {emergencyProfile && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <AlertTriangle className="h-5 w-5" />
                  Emergency Profile
                </CardTitle>
                <CardDescription>
                  This information is accessible via Emergency Lookup with the user's access code
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <Alert>
                  <Info className="h-4 w-4" />
                  <AlertDescription>
                    Access code has been generated. Emergency contacts can view this information
                    using the user's Principal ID and access code.
                  </AlertDescription>
                </Alert>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-muted-foreground">Next of Kin</p>
                    <p className="font-medium">{emergencyProfile.nextOfKin}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Health Conditions</p>
                    <p className="font-medium">{emergencyProfile.healthConditions}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Places Added Section */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MapPin className="h-5 w-5" />
                Places Added ({placesAdded.length})
              </CardTitle>
              <CardDescription>Safe places contributed by this user</CardDescription>
            </CardHeader>
            <CardContent>
              {placesAdded.length === 0 ? (
                <div className="text-center py-8">
                  <MapPin className="h-12 w-12 text-muted-foreground mx-auto mb-2" />
                  <p className="text-sm text-muted-foreground">No places added yet</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {placesAdded.map((place, index) => (
                    <div key={index} className="border rounded-lg p-4 space-y-2">
                      <div className="flex items-start justify-between">
                        <div>
                          <h4 className="font-semibold">{place.name}</h4>
                          <Badge variant="secondary" className="mt-1">
                            {getCategoryLabel(place.category)}
                          </Badge>
                        </div>
                      </div>
                      <p className="text-sm text-muted-foreground">{place.location}</p>
                      {place.description && (
                        <p className="text-sm">{place.description}</p>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Recent Routes Section */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <RouteIcon className="h-5 w-5" />
                Recent Routes ({recentRoutes.length})
              </CardTitle>
              <CardDescription>Routes shared by this user</CardDescription>
            </CardHeader>
            <CardContent>
              {recentRoutes.length === 0 ? (
                <div className="text-center py-8">
                  <RouteIcon className="h-12 w-12 text-muted-foreground mx-auto mb-2" />
                  <p className="text-sm text-muted-foreground">No routes shared yet</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {recentRoutes.map((route, index) => (
                    <div key={index} className="border rounded-lg p-4 space-y-1">
                      <div className="flex items-center gap-2">
                        <Calendar className="h-4 w-4 text-muted-foreground" />
                        <span className="text-sm text-muted-foreground">
                          {formatDateTime(route.dateTime)}
                        </span>
                      </div>
                      <p className="font-medium">
                        {route.start} → {route.destination}
                      </p>
                      {route.waypoints.length > 0 && (
                        <p className="text-sm text-muted-foreground">
                          Via: {route.waypoints.join(', ')}
                        </p>
                      )}
                      {route.notes && (
                        <p className="text-sm italic text-muted-foreground">{route.notes}</p>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Last Known Locations Section */}
          {lastLocations.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <MapPin className="h-5 w-5" />
                  Last Known Meetup Locations ({lastLocations.length})
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="rounded-md border">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Name</TableHead>
                        <TableHead>Coordinates</TableHead>
                        <TableHead>Time</TableHead>
                        <TableHead>Status</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {lastLocations.map((loc, idx) => (
                        <TableRow key={idx}>
                          <TableCell className="font-medium">{loc.name}</TableCell>
                          <TableCell className="text-sm text-muted-foreground">
                            {loc.latitude.toFixed(4)}, {loc.longitude.toFixed(4)}
                          </TableCell>
                          <TableCell className="text-sm text-muted-foreground">
                            {formatDateTime(loc.timestamp)}
                          </TableCell>
                          <TableCell>
                            <Badge variant={loc.isActive ? 'default' : 'secondary'}>
                              {loc.isActive ? 'Active' : 'Inactive'}
                            </Badge>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Activity Log Section */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5" />
                Activity Log ({activityLog.length})
              </CardTitle>
              <CardDescription>Recent actions performed by this user</CardDescription>
            </CardHeader>
            <CardContent>
              {activityLog.length === 0 ? (
                <div className="text-center py-8">
                  <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-2" />
                  <p className="text-sm text-muted-foreground">No activity recorded yet</p>
                </div>
              ) : (
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
                      {activityLog.map((entry, idx) => (
                        <TableRow key={idx}>
                          <TableCell>
                            <Badge variant="outline">
                              {getEventTypeLabel(entry.eventType)}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-sm">{entry.description}</TableCell>
                          <TableCell className="text-sm text-muted-foreground">
                            {formatDateTime(entry.timestamp)}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </AdminRouteGuard>
    </AuthenticatedRouteGuard>
  );
}
