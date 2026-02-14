import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { formatDateTime } from '../../lib/time';
import { AlertTriangle, Heart, MapPin, Clock } from 'lucide-react';
import type { EmergencyProfile, SOSSnapshot } from '../../backend';

interface PublicSOSCardViewProps {
    emergencyProfile: EmergencyProfile;
    sosSnapshot?: SOSSnapshot;
    userName?: string;
}

export default function PublicSOSCardView({ emergencyProfile, sosSnapshot, userName }: PublicSOSCardViewProps) {
    return (
        <div className="space-y-4">
            <Alert variant="destructive">
                <AlertTriangle className="h-4 w-4" />
                <AlertDescription className="font-semibold">
                    EMERGENCY INFORMATION - FOR FIRST RESPONDERS
                </AlertDescription>
            </Alert>

            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Heart className="h-5 w-5 text-destructive" />
                        Emergency Contacts
                    </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                    {userName && (
                        <div>
                            <p className="text-sm font-medium text-muted-foreground">Driver Name</p>
                            <p className="text-lg font-semibold">{userName}</p>
                        </div>
                    )}
                    <div>
                        <p className="text-sm font-medium text-muted-foreground">Next of Kin</p>
                        <p className="text-lg">{emergencyProfile.nextOfKin}</p>
                    </div>
                    {emergencyProfile.healthConditions && (
                        <>
                            <Separator />
                            <div>
                                <p className="text-sm font-medium text-muted-foreground">Health Conditions & Allergies</p>
                                <p className="whitespace-pre-wrap">{emergencyProfile.healthConditions}</p>
                            </div>
                        </>
                    )}
                </CardContent>
            </Card>

            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <MapPin className="h-5 w-5" />
                        Last Known Location
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    {sosSnapshot ? (
                        <div className="space-y-3">
                            <div className="flex items-center gap-2">
                                <Clock className="h-4 w-4 text-muted-foreground" />
                                <span className="text-sm text-muted-foreground">
                                    {formatDateTime(sosSnapshot.timestamp)}
                                </span>
                            </div>
                            <div className="rounded-lg bg-muted p-4 font-mono text-sm">
                                <p>Latitude: {sosSnapshot.latitude.toFixed(6)}</p>
                                <p>Longitude: {sosSnapshot.longitude.toFixed(6)}</p>
                            </div>
                            <a
                                href={`https://www.google.com/maps?q=${sosSnapshot.latitude},${sosSnapshot.longitude}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-block text-sm text-primary hover:underline"
                            >
                                View on Google Maps →
                            </a>
                            <Alert>
                                <AlertDescription className="text-xs">
                                    ⚠️ This is a snapshot, not real-time tracking. Location was captured at the time shown above.
                                </AlertDescription>
                            </Alert>
                        </div>
                    ) : (
                        <p className="text-muted-foreground">No SOS location captured yet</p>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}
