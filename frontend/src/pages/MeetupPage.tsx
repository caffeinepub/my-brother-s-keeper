import { useState, useEffect, useRef } from 'react';
import { useInternetIdentity } from '../hooks/useInternetIdentity';
import { useActor } from '../hooks/useActor';
import { parsePrincipal } from '../lib/principal';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Separator } from '@/components/ui/separator';
import {
  Loader2,
  MapPin,
  Share2,
  Search,
  Navigation,
  RefreshCw,
  X,
  ExternalLink,
} from 'lucide-react';
import AuthenticatedRouteGuard from '../components/auth/AuthenticatedRouteGuard';
import MapZoomControl from '../components/maps/MapZoomControl';
import { generateMeetupShareCode, getStoredMeetupShareCode } from '../lib/meetupShareCode';
import { getMapZoomPreference } from '../lib/mapZoomPreference';
import { buildGoogleMapsUrl } from '../lib/googleMapsUrl';
import type { MeetupLocation } from '../backend';

function MeetupPageContent() {
  const { actor } = useActor();
  const { identity } = useInternetIdentity();

  // My location state
  const [myLocation, setMyLocation] = useState<MeetupLocation | null>(null);
  const [isSharing, setIsSharing] = useState(false);
  const [isStopping, setIsStopping] = useState(false);
  const [shareError, setShareError] = useState<string | null>(null);
  const [locationName, setLocationName] = useState('');
  const [shareCode, setShareCode] = useState<string>(() => getStoredMeetupShareCode() || '');

  // Lookup state
  const [lookupPrincipalId, setLookupPrincipalId] = useState('');
  const [lookupCode, setLookupCode] = useState('');
  const [lookedUpLocation, setLookedUpLocation] = useState<MeetupLocation | null>(null);
  const [isLookingUp, setIsLookingUp] = useState(false);
  const [lookupError, setLookupError] = useState<string | null>(null);

  const refreshIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    if (identity && actor) {
      loadMyLocation();
    }
    return () => {
      if (refreshIntervalRef.current) clearInterval(refreshIntervalRef.current);
    };
  }, [identity, actor]);

  const loadMyLocation = async () => {
    if (!actor || !identity) return;
    try {
      const loc = await actor.getMeetupLocation(identity.getPrincipal());
      setMyLocation(loc ?? null);
    } catch {
      // ignore
    }
  };

  const handleShareLocation = async () => {
    if (!actor || !locationName.trim()) return;
    setShareError(null);
    setIsSharing(true);
    try {
      const position = await new Promise<GeolocationPosition>((resolve, reject) => {
        navigator.geolocation.getCurrentPosition(resolve, reject, {
          enableHighAccuracy: true,
          timeout: 10000,
        });
      });

      const code = generateMeetupShareCode();
      setShareCode(code);

      await actor.shareMeetupLocation({
        latitude: position.coords.latitude,
        longitude: position.coords.longitude,
        name: locationName.trim(),
      });

      await loadMyLocation();
    } catch (err: unknown) {
      if (err instanceof GeolocationPositionError) {
        setShareError('Could not get your location. Please enable location access.');
      } else {
        setShareError('Failed to share location. Please try again.');
      }
    } finally {
      setIsSharing(false);
    }
  };

  const handleUpdateLocation = async () => {
    if (!actor || !myLocation) return;
    setShareError(null);
    setIsSharing(true);
    try {
      const position = await new Promise<GeolocationPosition>((resolve, reject) => {
        navigator.geolocation.getCurrentPosition(resolve, reject, {
          enableHighAccuracy: true,
          timeout: 10000,
        });
      });

      await actor.updateMeetupLocation({
        latitude: position.coords.latitude,
        longitude: position.coords.longitude,
        name: myLocation.name,
      });

      await loadMyLocation();
    } catch (err: unknown) {
      if (err instanceof GeolocationPositionError) {
        setShareError('Could not get your location. Please enable location access.');
      } else {
        setShareError('Failed to update location. Please try again.');
      }
    } finally {
      setIsSharing(false);
    }
  };

  const handleStopSharing = async () => {
    if (!actor) return;
    setIsStopping(true);
    try {
      await actor.deactivateMeetupLocation();
      setMyLocation(null);
      setShareCode('');
      setLocationName('');
    } catch {
      setShareError('Failed to stop sharing. Please try again.');
    } finally {
      setIsStopping(false);
    }
  };

  const handleLookup = async () => {
    if (!actor) return;
    setLookupError(null);

    const principal = parsePrincipal(lookupPrincipalId.trim());
    if (!principal) {
      setLookupError('Invalid Principal ID format. Please check and try again.');
      return;
    }

    if (!lookupCode.trim()) {
      setLookupError('Please enter the meetup share code.');
      return;
    }

    setIsLookingUp(true);
    try {
      const loc = await actor.getMeetupLocation(principal);
      if (loc && loc.isActive) {
        setLookedUpLocation(loc);
      } else {
        setLookupError('No active meetup location found for this driver.');
        setLookedUpLocation(null);
      }
    } catch {
      setLookupError('Failed to look up location. Please try again.');
    } finally {
      setIsLookingUp(false);
    }
  };

  const zoom = getMapZoomPreference();

  return (
    <div className="container mx-auto max-w-2xl px-4 py-8">
      <div className="mb-6">
        <h1 className="text-3xl font-bold">Meetup</h1>
        <p className="mt-1 text-muted-foreground">
          Share your current location with other drivers for meetups and coordination.
        </p>
      </div>

      {/* My Location Section */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Navigation className="h-5 w-5 text-primary" />
            My Meetup Location
          </CardTitle>
          <CardDescription>
            Share your current location so other drivers can find you.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {!myLocation ? (
            <>
              <div className="space-y-2">
                <Label htmlFor="locationName">Location Name</Label>
                <Input
                  id="locationName"
                  placeholder="e.g. Truck Stop on I-40, Rest Area Mile 120"
                  value={locationName}
                  onChange={(e) => setLocationName(e.target.value)}
                />
              </div>
              {shareError && (
                <Alert variant="destructive">
                  <AlertDescription>{shareError}</AlertDescription>
                </Alert>
              )}
              <Button
                onClick={handleShareLocation}
                disabled={isSharing || !locationName.trim()}
                className="w-full"
              >
                {isSharing ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Sharing...
                  </>
                ) : (
                  <>
                    <Share2 className="mr-2 h-4 w-4" />
                    Share My Location
                  </>
                )}
              </Button>
            </>
          ) : (
            <>
              <div className="location-badge">
                <MapPin className="h-4 w-4 text-primary" />
                <div>
                  <p className="font-medium">{myLocation.name}</p>
                  <p className="text-sm text-muted-foreground">
                    {myLocation.latitude.toFixed(5)}, {myLocation.longitude.toFixed(5)}
                  </p>
                </div>
                <Badge variant="default" className="ml-auto">
                  Active
                </Badge>
              </div>

              {shareCode && (
                <div className="rounded-lg border bg-muted/50 p-3">
                  <p className="mb-1 text-sm font-medium">Your Share Code</p>
                  <p className="font-mono text-lg font-bold tracking-widest text-primary">
                    {shareCode}
                  </p>
                  <p className="mt-1 text-xs text-muted-foreground">
                    Share this code with drivers who need to find you.
                  </p>
                </div>
              )}

              <a
                href={buildGoogleMapsUrl(myLocation.latitude, myLocation.longitude, zoom)}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1 text-sm text-primary hover:underline"
              >
                <ExternalLink className="h-3 w-3" />
                View on Google Maps
              </a>

              {shareError && (
                <Alert variant="destructive">
                  <AlertDescription>{shareError}</AlertDescription>
                </Alert>
              )}

              <div className="flex gap-2">
                <Button
                  variant="outline"
                  onClick={handleUpdateLocation}
                  disabled={isSharing}
                  className="flex-1"
                >
                  {isSharing ? (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  ) : (
                    <RefreshCw className="mr-2 h-4 w-4" />
                  )}
                  Update
                </Button>
                <Button
                  variant="destructive"
                  onClick={handleStopSharing}
                  disabled={isStopping}
                  className="flex-1"
                >
                  {isStopping ? (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  ) : (
                    <X className="mr-2 h-4 w-4" />
                  )}
                  Stop Sharing
                </Button>
              </div>
            </>
          )}
        </CardContent>
      </Card>

      <MapZoomControl />

      <Separator className="my-6" />

      {/* Lookup Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Search className="h-5 w-5 text-primary" />
            Find a Driver
          </CardTitle>
          <CardDescription>
            Enter another driver's Principal ID and their share code to find their meetup location.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="lookupPrincipal">Driver's Principal ID</Label>
            <Input
              id="lookupPrincipal"
              type="text"
              placeholder="e.g. 2yscf-yuwfq-41ml4-t6ujy-r3ogj-ajbkj-rmiih-uyk25-o34ky-6jpe6-gae"
              value={lookupPrincipalId}
              onChange={(e) => setLookupPrincipalId(e.target.value)}
              className="font-mono text-sm"
              autoComplete="off"
              autoCorrect="off"
              autoCapitalize="off"
              spellCheck={false}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="lookupCode">Share Code</Label>
            <Input
              id="lookupCode"
              type="text"
              placeholder="Enter the driver's share code"
              value={lookupCode}
              onChange={(e) => setLookupCode(e.target.value)}
              autoComplete="off"
            />
          </div>

          {lookupError && (
            <Alert variant="destructive">
              <AlertDescription>{lookupError}</AlertDescription>
            </Alert>
          )}

          <Button
            onClick={handleLookup}
            disabled={isLookingUp || !lookupPrincipalId.trim() || !lookupCode.trim()}
            className="w-full"
          >
            {isLookingUp ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Looking up...
              </>
            ) : (
              <>
                <Search className="mr-2 h-4 w-4" />
                Find Driver
              </>
            )}
          </Button>

          {lookedUpLocation && (
            <div className="mt-4 space-y-3 rounded-lg border p-4">
              <div className="location-badge">
                <MapPin className="h-4 w-4 text-primary" />
                <div>
                  <p className="font-medium">{lookedUpLocation.name}</p>
                  <p className="text-sm text-muted-foreground">
                    {lookedUpLocation.latitude.toFixed(5)}, {lookedUpLocation.longitude.toFixed(5)}
                  </p>
                </div>
                <Badge variant="default" className="ml-auto">
                  Active
                </Badge>
              </div>
              <a
                href={buildGoogleMapsUrl(
                  lookedUpLocation.latitude,
                  lookedUpLocation.longitude,
                  zoom
                )}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1 text-sm text-primary hover:underline"
              >
                <ExternalLink className="h-3 w-3" />
                Open in Google Maps
              </a>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

export default function MeetupPage() {
  return (
    <AuthenticatedRouteGuard>
      <MeetupPageContent />
    </AuthenticatedRouteGuard>
  );
}
