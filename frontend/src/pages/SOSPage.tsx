import { useState } from 'react';
import { useNavigate } from '@tanstack/react-router';
import { useCreateSOSSnapshot } from '../hooks/useQueries';
import { getCurrentLocation } from '../lib/geolocation';
import AuthenticatedRouteGuard from '../components/auth/AuthenticatedRouteGuard';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { toast } from 'sonner';
import { AlertTriangle, MapPin, FileText } from 'lucide-react';

export default function SOSPage() {
    const navigate = useNavigate();
    const createSnapshot = useCreateSOSSnapshot();
    const [isCapturing, setIsCapturing] = useState(false);

    const handleCaptureLocation = async () => {
        setIsCapturing(true);
        try {
            const location = await getCurrentLocation();
            await createSnapshot.mutateAsync(location);
            toast.success('SOS location captured successfully');
        } catch (error: any) {
            toast.error(error.message || 'Failed to capture location');
        } finally {
            setIsCapturing(false);
        }
    };

    return (
        <AuthenticatedRouteGuard>
            <div className="space-y-6 max-w-2xl mx-auto">
                <div className="text-center">
                    <h1 className="text-3xl font-bold">Emergency SOS</h1>
                    <p className="text-muted-foreground">Capture your location for emergency situations</p>
                </div>

                <Alert variant="destructive">
                    <AlertTriangle className="h-4 w-4" />
                    <AlertDescription>
                        This captures a one-time location snapshot, not real-time tracking. Anyone with your Principal ID + Emergency Access Code can view it via Emergency Lookup.
                    </AlertDescription>
                </Alert>

                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <MapPin className="h-5 w-5" />
                            Capture SOS Location
                        </CardTitle>
                        <CardDescription>
                            Press the button below to capture your current location
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <Button
                            onClick={handleCaptureLocation}
                            disabled={isCapturing || createSnapshot.isPending}
                            size="lg"
                            className="w-full gap-2"
                            variant="destructive"
                        >
                            <AlertTriangle className="h-5 w-5" />
                            {isCapturing || createSnapshot.isPending ? 'Capturing Location...' : 'Capture SOS Location'}
                        </Button>

                        <p className="text-sm text-muted-foreground text-center">
                            You will be prompted to allow location access
                        </p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <FileText className="h-5 w-5" />
                            View SOS Card
                        </CardTitle>
                        <CardDescription>
                            View your emergency information card
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <Button onClick={() => navigate({ to: '/sos/card' })} variant="outline" className="w-full">
                            View SOS Card
                        </Button>
                    </CardContent>
                </Card>
            </div>
        </AuthenticatedRouteGuard>
    );
}
