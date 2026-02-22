import { useState, useEffect, useRef } from 'react';
import { useInternetIdentity } from '../hooks/useInternetIdentity';
import { useShareMeetupLocation, useDeactivateMeetupLocation, useGetLatestMeetupLocation } from '../hooks/useQueries';
import AuthenticatedRouteGuard from '../components/auth/AuthenticatedRouteGuard';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { toast } from 'sonner';
import { MapPin, Play, Square, Copy, ExternalLink, Info, Clock, AlertCircle } from 'lucide-react';
import { getCurrentLocation } from '../lib/geolocation';
import { generateMeetupShareCode, getStoredMeetupShareCode, storeMeetupShareCode } from '../lib/meetupShareCode';
import { isValidPrincipal } from '../lib/principal';
import { formatDateTime } from '../lib/time';
import { copyToClipboard } from '../lib/clipboard';
import { buildGoogleMapsUrl } from '../lib/googleMapsUrl';
import { getMapZoomPreference } from '../lib/mapZoomPreference';
import MapZoomControl from '../components/maps/MapZoomControl';

type SharingState = 'inactive' | 'active' | 'error';

export default function MeetupPage() {
    const { identity } = useInternetIdentity();
    const [sharingState, setSharingState] = useState<SharingState>('inactive');
    const [shareCode, setShareCode] = useState('');
    const [lastSuccessfulUpdate, setLastSuccessfulUpdate] = useState<Date | null>(null);
    const intervalRef = useRef<NodeJS.Timeout | null>(null);

    // Lookup state
    const [lookupPrincipal, setLookupPrincipal] = useState('');
    const [lookupCode, setLookupCode] = useState('');
    const [searchPrincipal, setSearchPrincipal] = useState<string | null>(null);
    const [expectedCode, setExpectedCode] = useState<string>('');
    const [principalError, setPrincipalError] = useState<string>('');

    const shareMutation = useShareMeetupLocation();
    const deactivateMutation = useDeactivateMeetupLocation();
    const { data: lookupLocation, isLoading: isLoadingLookup } = useGetLatestMeetupLocation(searchPrincipal);

    // Load stored share code on mount
    useEffect(() => {
        const stored = getStoredMeetupShareCode();
        if (stored) {
            setShareCode(stored);
        }
    }, []);

    const updateLocation = async () => {
        try {
            const location = await getCurrentLocation();
            await shareMutation.mutateAsync({
                latitude: location.latitude,
                longitude: location.longitude,
                name: shareCode
            });
            setLastSuccessfulUpdate(new Date());
            setSharingState('active');
        } catch (error: any) {
            console.error('Location update failed:', error);
            
            // Stop sharing immediately on error
            if (intervalRef.current) {
                clearInterval(intervalRef.current);
                intervalRef.current = null;
            }
            setSharingState('error');
            
            // Show user-friendly error message
            const errorMessage = error.message || 'Failed to update location';
            toast.error(errorMessage);
        }
    };

    const handleStartSharing = async () => {
        if (!shareCode.trim()) {
            toast.error('Please set a meetup share code first');
            return;
        }

        try {
            // Initial location update
            await updateLocation();
            setSharingState('active');
            toast.success('Location sharing started');

            // Set up periodic updates every 15 seconds
            intervalRef.current = setInterval(() => {
                updateLocation();
            }, 15000);
        } catch (error: any) {
            setSharingState('error');
            const errorMessage = error.message || 'Failed to start sharing';
            toast.error(errorMessage);
        }
    };

    const handleStopSharing = async () => {
        if (intervalRef.current) {
            clearInterval(intervalRef.current);
            intervalRef.current = null;
        }

        try {
            await deactivateMutation.mutateAsync();
            setSharingState('inactive');
            setLastSuccessfulUpdate(null);
            toast.success('Location sharing stopped');
        } catch (error: any) {
            toast.error(error.message || 'Failed to stop sharing');
        }
    };

    const handleGenerateCode = () => {
        const newCode = generateMeetupShareCode();
        setShareCode(newCode);
        storeMeetupShareCode(newCode);
        toast.success('New meetup code generated');
    };

    const handleCopyPrincipal = async () => {
        if (identity) {
            const principal = identity.getPrincipal().toString();
            const success = await copyToClipboard(principal);
            if (success) {
                toast.success('Principal ID copied');
            } else {
                toast.error('Failed to copy Principal ID');
            }
        }
    };

    const handleCopyCode = async () => {
        if (shareCode) {
            const success = await copyToClipboard(shareCode);
            if (success) {
                toast.success('Meetup code copied');
            } else {
                toast.error('Failed to copy meetup code');
            }
        }
    };

    const handleCopyCoordinates = async (lat: number, lng: number) => {
        const coords = `${lat.toFixed(6)}, ${lng.toFixed(6)}`;
        const success = await copyToClipboard(coords);
        if (success) {
            toast.success('Coordinates copied');
        } else {
            toast.error('Failed to copy coordinates');
        }
    };

    const handleCopyMapUrl = async (lat: number, lng: number) => {
        const zoom = getMapZoomPreference();
        const url = buildGoogleMapsUrl(lat, lng, zoom);
        const success = await copyToClipboard(url);
        if (success) {
            toast.success('Map URL copied');
        } else {
            toast.error('Failed to copy map URL');
        }
    };

    const handleLookup = () => {
        // Clear previous error
        setPrincipalError('');

        // Validate inputs
        if (!lookupPrincipal.trim()) {
            toast.error('Please enter a Principal ID');
            setPrincipalError('Principal ID is required');
            return;
        }

        if (!lookupCode.trim()) {
            toast.error('Please enter a meetup code');
            return;
        }

        // Validate Principal format
        if (!isValidPrincipal(lookupPrincipal)) {
            toast.error('Invalid Principal ID format');
            setPrincipalError('Invalid Principal ID format');
            return;
        }

        // Trigger lookup with principal and store expected code for verification
        setSearchPrincipal(lookupPrincipal.trim());
        setExpectedCode(lookupCode.trim());
    };

    const getMapUrl = (lat: number, lng: number) => {
        const zoom = getMapZoomPreference();
        return buildGoogleMapsUrl(lat, lng, zoom);
    };

    // Cleanup on unmount
    useEffect(() => {
        return () => {
            if (intervalRef.current) {
                clearInterval(intervalRef.current);
            }
        };
    }, []);

    const isSharing = sharingState === 'active';
    const hasError = sharingState === 'error';

    // Check if the lookup result matches the expected code
    const isCodeMatch = lookupLocation && lookupLocation.name === expectedCode;
    const showLocationResult = searchPrincipal && lookupLocation && isCodeMatch;
    const showCodeMismatch = searchPrincipal && lookupLocation && !isCodeMatch;
    const showNotFound = searchPrincipal && !lookupLocation && !isLoadingLookup;

    return (
        <AuthenticatedRouteGuard>
            <div className="space-y-6 max-w-4xl">
                <div className="flex items-center gap-3">
                    <MapPin className="h-8 w-8 text-accent" />
                    <div>
                        <h1 className="text-3xl font-bold">Meetup Location</h1>
                        <p className="text-muted-foreground">Share your location periodically to coordinate meetups</p>
                    </div>
                </div>

                <Alert>
                    <Info className="h-4 w-4" />
                    <AlertDescription>
                        This feature shares your location periodically (every 15 seconds) while active. It requires browser location permission and is not real-time tracking. Stop sharing when you're done to protect your privacy.
                    </AlertDescription>
                </Alert>

                {/* Share Panel */}
                <Card className="border-accent/20">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Play className="h-5 w-5" />
                            Share Your Location
                        </CardTitle>
                        <CardDescription>
                            Start sharing your location with other members using your meetup code
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="flex items-center gap-2 flex-wrap">
                            <Badge 
                                variant={isSharing ? 'default' : hasError ? 'destructive' : 'secondary'} 
                                className="text-sm"
                            >
                                {isSharing ? 'Sharing Active' : hasError ? 'Sharing Error' : 'Not Sharing'}
                            </Badge>
                            {lastSuccessfulUpdate && (
                                <span className="text-sm text-muted-foreground flex items-center gap-1">
                                    <Clock className="h-3 w-3" />
                                    Last update: {lastSuccessfulUpdate.toLocaleTimeString()}
                                </span>
                            )}
                        </div>

                        {hasError && (
                            <Alert variant="destructive">
                                <AlertCircle className="h-4 w-4" />
                                <AlertDescription>
                                    Location sharing stopped due to an error. Please check your location permissions and try again.
                                </AlertDescription>
                            </Alert>
                        )}

                        <div className="flex gap-2">
                            {!isSharing ? (
                                <Button
                                    onClick={handleStartSharing}
                                    disabled={shareMutation.isPending || !shareCode.trim()}
                                    className="gap-2"
                                >
                                    <Play className="h-4 w-4" />
                                    {shareMutation.isPending ? 'Starting...' : 'Start Sharing'}
                                </Button>
                            ) : (
                                <Button
                                    onClick={handleStopSharing}
                                    disabled={deactivateMutation.isPending}
                                    variant="destructive"
                                    className="gap-2"
                                >
                                    <Square className="h-4 w-4" />
                                    {deactivateMutation.isPending ? 'Stopping...' : 'Stop Sharing'}
                                </Button>
                            )}
                        </div>
                    </CardContent>
                </Card>

                {/* Share Code Panel */}
                <Card>
                    <CardHeader>
                        <CardTitle>Your Meetup Credentials</CardTitle>
                        <CardDescription>
                            Share these with the member you want to meet up with
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="space-y-2">
                            <Label>Your Principal ID</Label>
                            <div className="flex gap-2">
                                <Input
                                    value={identity?.getPrincipal().toString() || ''}
                                    readOnly
                                    className="font-mono text-sm"
                                />
                                <Button
                                    onClick={handleCopyPrincipal}
                                    variant="outline"
                                    size="icon"
                                >
                                    <Copy className="h-4 w-4" />
                                </Button>
                            </div>
                        </div>

                        <div className="space-y-2">
                            <Label>Meetup Share Code</Label>
                            <div className="flex gap-2">
                                <Input
                                    value={shareCode}
                                    onChange={(e) => {
                                        setShareCode(e.target.value);
                                        storeMeetupShareCode(e.target.value);
                                    }}
                                    placeholder="Enter or generate a code"
                                    disabled={isSharing}
                                />
                                <Button
                                    onClick={handleCopyCode}
                                    variant="outline"
                                    size="icon"
                                    disabled={!shareCode.trim()}
                                >
                                    <Copy className="h-4 w-4" />
                                </Button>
                                <Button
                                    onClick={handleGenerateCode}
                                    variant="outline"
                                    disabled={isSharing}
                                >
                                    Generate
                                </Button>
                            </div>
                            <p className="text-xs text-muted-foreground">
                                Cannot change code while sharing is active
                            </p>
                        </div>
                    </CardContent>
                </Card>

                <Separator />

                {/* Lookup Panel */}
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <MapPin className="h-5 w-5" />
                            Find a Member's Location
                        </CardTitle>
                        <CardDescription>
                            Enter their Principal ID and meetup code to see their latest location
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="space-y-2">
                            <Label>Member's Principal ID</Label>
                            <Input
                                value={lookupPrincipal}
                                onChange={(e) => {
                                    setLookupPrincipal(e.target.value);
                                    setPrincipalError('');
                                }}
                                placeholder="Enter Principal ID"
                                className={`font-mono text-sm ${principalError ? 'border-destructive' : ''}`}
                            />
                            {principalError && (
                                <p className="text-sm text-destructive">{principalError}</p>
                            )}
                        </div>

                        <div className="space-y-2">
                            <Label>Meetup Share Code</Label>
                            <Input
                                value={lookupCode}
                                onChange={(e) => setLookupCode(e.target.value)}
                                placeholder="Enter meetup code"
                            />
                        </div>

                        <Button
                            onClick={handleLookup}
                            disabled={isLoadingLookup}
                            className="w-full gap-2"
                        >
                            <MapPin className="h-4 w-4" />
                            {isLoadingLookup ? 'Looking up...' : 'Find Location'}
                        </Button>

                        {showLocationResult && (
                            <Card className="bg-accent/5 border-accent/20">
                                <CardHeader>
                                    <CardTitle className="text-lg">Location Found</CardTitle>
                                    <CardDescription>
                                        Last updated: {formatDateTime(lookupLocation.timestamp)}
                                    </CardDescription>
                                </CardHeader>
                                <CardContent className="space-y-3">
                                    <div className="grid grid-cols-2 gap-4 text-sm">
                                        <div>
                                            <span className="text-muted-foreground">Latitude:</span>
                                            <p className="font-mono">{lookupLocation.latitude.toFixed(6)}</p>
                                        </div>
                                        <div>
                                            <span className="text-muted-foreground">Longitude:</span>
                                            <p className="font-mono">{lookupLocation.longitude.toFixed(6)}</p>
                                        </div>
                                    </div>

                                    <Separator />

                                    <div className="space-y-2">
                                        <MapZoomControl />
                                    </div>

                                    <div className="flex flex-wrap gap-2">
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            onClick={() => handleCopyCoordinates(lookupLocation.latitude, lookupLocation.longitude)}
                                            className="gap-2"
                                        >
                                            <Copy className="h-4 w-4" />
                                            Copy Coordinates
                                        </Button>
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            onClick={() => handleCopyMapUrl(lookupLocation.latitude, lookupLocation.longitude)}
                                            className="gap-2"
                                        >
                                            <Copy className="h-4 w-4" />
                                            Copy Map URL
                                        </Button>
                                        <Button
                                            variant="default"
                                            size="sm"
                                            asChild
                                        >
                                            <a
                                                href={getMapUrl(lookupLocation.latitude, lookupLocation.longitude)}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="gap-2"
                                            >
                                                <ExternalLink className="h-4 w-4" />
                                                Open in Maps
                                            </a>
                                        </Button>
                                    </div>
                                </CardContent>
                            </Card>
                        )}

                        {showCodeMismatch && (
                            <Alert variant="destructive">
                                <AlertCircle className="h-4 w-4" />
                                <AlertDescription>
                                    The meetup code doesn't match. Please verify you have the correct code from this member.
                                </AlertDescription>
                            </Alert>
                        )}

                        {showNotFound && (
                            <Alert>
                                <Info className="h-4 w-4" />
                                <AlertDescription>
                                    No active location found for this member. They may not be sharing their location currently.
                                </AlertDescription>
                            </Alert>
                        )}
                    </CardContent>
                </Card>
            </div>
        </AuthenticatedRouteGuard>
    );
}
