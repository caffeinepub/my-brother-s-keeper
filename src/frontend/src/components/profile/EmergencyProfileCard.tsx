import { useState, useEffect } from 'react';
import { useCreateOrUpdateEmergencyProfile } from '../../hooks/useQueries';
import { getStoredAccessCode } from '../../lib/accessCode';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { toast } from 'sonner';
import { Heart, AlertTriangle } from 'lucide-react';

export default function EmergencyProfileCard() {
    const updateProfile = useCreateOrUpdateEmergencyProfile();
    const [nextOfKin, setNextOfKin] = useState('');
    const [healthConditions, setHealthConditions] = useState('');

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!nextOfKin.trim()) {
            toast.error('Please enter next of kin information');
            return;
        }

        const accessCode = getStoredAccessCode();
        if (!accessCode) {
            toast.error('Please generate an Emergency Access Code first');
            return;
        }

        try {
            await updateProfile.mutateAsync({
                nextOfKin: nextOfKin.trim(),
                healthConditions: healthConditions.trim(),
                accessCode
            });
            toast.success('Emergency profile saved successfully');
        } catch (error: any) {
            toast.error(error.message || 'Failed to save emergency profile');
        }
    };

    return (
        <Card>
            <CardHeader>
                <div className="flex items-center gap-2">
                    <Heart className="h-5 w-5 text-destructive" />
                    <div>
                        <CardTitle>Emergency Profile</CardTitle>
                        <CardDescription>
                            Sensitive information for first responders
                        </CardDescription>
                    </div>
                </div>
            </CardHeader>
            <CardContent>
                <Alert className="mb-4">
                    <AlertTriangle className="h-4 w-4" />
                    <AlertDescription>
                        This information is private by default and only accessible via your Emergency Access Code.
                    </AlertDescription>
                </Alert>

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="space-y-2">
                        <Label htmlFor="nextOfKin">Next of Kin (Name & Phone) *</Label>
                        <Input
                            id="nextOfKin"
                            value={nextOfKin}
                            onChange={(e) => setNextOfKin(e.target.value)}
                            placeholder="e.g., Jane Doe - (555) 123-4567"
                            required
                        />
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="healthConditions">Health Conditions & Allergies</Label>
                        <Textarea
                            id="healthConditions"
                            value={healthConditions}
                            onChange={(e) => setHealthConditions(e.target.value)}
                            placeholder="List any important medical conditions, allergies, or medications..."
                            rows={4}
                        />
                    </div>

                    <Button type="submit" className="w-full" disabled={updateProfile.isPending}>
                        {updateProfile.isPending ? 'Saving...' : 'Save Emergency Profile'}
                    </Button>
                </form>
            </CardContent>
        </Card>
    );
}
