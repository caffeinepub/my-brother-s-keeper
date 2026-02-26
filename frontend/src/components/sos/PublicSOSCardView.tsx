import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Separator } from '@/components/ui/separator';
import LastKnownLocationCard from './LastKnownLocationCard';
import { AlertTriangle, Heart } from 'lucide-react';
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

            <LastKnownLocationCard sosSnapshot={sosSnapshot} />
        </div>
    );
}
