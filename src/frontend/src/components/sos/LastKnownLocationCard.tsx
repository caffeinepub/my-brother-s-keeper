import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { formatDateTime } from '../../lib/time';
import { MapPin, Clock } from 'lucide-react';
import type { SOSSnapshot } from '../../backend';

interface LastKnownLocationCardProps {
    sosSnapshot?: SOSSnapshot;
}

export default function LastKnownLocationCard({ sosSnapshot }: LastKnownLocationCardProps) {
    return (
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
                                ⚠️ This is a one-time snapshot, not real-time tracking. Location was captured at the time shown above.
                            </AlertDescription>
                        </Alert>
                    </div>
                ) : (
                    <p className="text-muted-foreground">No SOS location captured yet</p>
                )}
            </CardContent>
        </Card>
    );
}
