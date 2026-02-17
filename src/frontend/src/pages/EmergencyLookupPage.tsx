import { useState } from 'react';
import { useEmergencyLookup } from '../hooks/useQueries';
import PublicSOSCardView from '../components/sos/PublicSOSCardView';
import LastKnownLocationCard from '../components/sos/LastKnownLocationCard';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { toast } from 'sonner';
import { Search, AlertTriangle, XCircle } from 'lucide-react';

export default function EmergencyLookupPage() {
    const [principalInput, setPrincipalInput] = useState('');
    const [accessCodeInput, setAccessCodeInput] = useState('');
    const [lookupPrincipal, setLookupPrincipal] = useState<string | null>(null);
    const [lookupAccessCode, setLookupAccessCode] = useState<string | null>(null);

    const { data: emergencyData, isLoading, error } = useEmergencyLookup(lookupPrincipal, lookupAccessCode);

    const handleLookup = () => {
        if (!principalInput.trim() || !accessCodeInput.trim()) {
            toast.error('Please enter both Principal ID and Access Code');
            return;
        }
        setLookupPrincipal(principalInput.trim());
        setLookupAccessCode(accessCodeInput.trim());
    };

    // Determine if we have valid authorized data
    const hasValidData = emergencyData && (emergencyData.emergencyProfile || emergencyData.sosSnapshot);
    const hasInvalidCredentials = lookupPrincipal && lookupAccessCode && !isLoading && !hasValidData && !error;

    return (
        <div className="space-y-6 max-w-2xl mx-auto">
            <div className="text-center">
                <h1 className="text-3xl font-bold">Emergency Lookup</h1>
                <p className="text-muted-foreground">Access emergency information for first responders</p>
            </div>

            <Alert>
                <AlertTriangle className="h-4 w-4" />
                <AlertDescription>
                    This page is for emergency use only. You need both the driver's Principal ID and their Emergency Access Code.
                </AlertDescription>
            </Alert>

            <Card>
                <CardHeader>
                    <CardTitle>Enter Emergency Credentials</CardTitle>
                    <CardDescription>
                        Both the Principal ID and Access Code are required
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="space-y-2">
                        <Label htmlFor="principal">Driver's Principal ID</Label>
                        <Input
                            id="principal"
                            value={principalInput}
                            onChange={(e) => setPrincipalInput(e.target.value)}
                            placeholder="Enter Principal ID..."
                        />
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="accessCode">Emergency Access Code</Label>
                        <Input
                            id="accessCode"
                            value={accessCodeInput}
                            onChange={(e) => setAccessCodeInput(e.target.value)}
                            placeholder="e.g., XXXX-XXXX-XXXX"
                        />
                    </div>

                    <Button onClick={handleLookup} className="w-full gap-2">
                        <Search className="h-4 w-4" />
                        Lookup Emergency Information
                    </Button>
                </CardContent>
            </Card>

            {isLoading && (
                <div className="text-center py-12">
                    <div className="mb-4 h-12 w-12 animate-spin rounded-full border-4 border-primary border-t-transparent mx-auto" />
                    <p className="text-muted-foreground">Looking up emergency information...</p>
                </div>
            )}

            {error && (
                <Card>
                    <CardContent className="py-12 text-center space-y-3">
                        <XCircle className="h-12 w-12 text-destructive mx-auto" />
                        <p className="text-muted-foreground">
                            An error occurred while looking up emergency information. Please try again.
                        </p>
                    </CardContent>
                </Card>
            )}

            {hasInvalidCredentials && (
                <Card>
                    <CardContent className="py-12 text-center space-y-3">
                        <XCircle className="h-12 w-12 text-muted-foreground mx-auto" />
                        <p className="font-semibold">Invalid Credentials</p>
                        <p className="text-muted-foreground">
                            No emergency information found. Please verify the Principal ID and Access Code are correct.
                        </p>
                    </CardContent>
                </Card>
            )}

            {hasValidData && emergencyData.emergencyProfile && (
                <PublicSOSCardView
                    emergencyProfile={emergencyData.emergencyProfile}
                    sosSnapshot={emergencyData.sosSnapshot}
                    userName={emergencyData.userName}
                />
            )}

            {hasValidData && !emergencyData.emergencyProfile && emergencyData.sosSnapshot && (
                <div className="space-y-4">
                    <Alert variant="destructive">
                        <AlertTriangle className="h-4 w-4" />
                        <AlertDescription className="font-semibold">
                            EMERGENCY INFORMATION - FOR FIRST RESPONDERS
                        </AlertDescription>
                    </Alert>

                    {emergencyData.userName && (
                        <Card>
                            <CardHeader>
                                <CardTitle>Driver Information</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div>
                                    <p className="text-sm font-medium text-muted-foreground">Driver Name</p>
                                    <p className="text-lg font-semibold">{emergencyData.userName}</p>
                                </div>
                            </CardContent>
                        </Card>
                    )}

                    <LastKnownLocationCard sosSnapshot={emergencyData.sosSnapshot} />
                </div>
            )}
        </div>
    );
}
