import { useState } from 'react';
import { useInternetIdentity } from '../../hooks/useInternetIdentity';
import { useGetCallerUserProfile, useCreateUserProfile } from '../../hooks/useQueries';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';

export default function ProfileSetupDialog() {
    const { identity } = useInternetIdentity();
    const { data: userProfile, isLoading: profileLoading, isFetched } = useGetCallerUserProfile();
    const createProfile = useCreateUserProfile();
    const [name, setName] = useState('');

    const isAuthenticated = !!identity;
    const showDialog = isAuthenticated && !profileLoading && isFetched && userProfile === null;

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!name.trim()) {
            toast.error('Please enter your name');
            return;
        }

        try {
            const newProfile = {
                name: name.trim(),
                licenseProof: undefined,
                idProof: undefined,
                isVerified: false,
                registrationTime: BigInt(Date.now()) * BigInt(1000000)
            };
            await createProfile.mutateAsync(newProfile);
            toast.success('Profile created successfully');
        } catch (error: any) {
            toast.error(error.message || 'Failed to create profile');
        }
    };

    return (
        <Dialog open={showDialog}>
            <DialogContent className="sm:max-w-md" onPointerDownOutside={(e) => e.preventDefault()} onEscapeKeyDown={(e) => e.preventDefault()}>
                <DialogHeader>
                    <DialogTitle>Welcome to My Brother's Keeper</DialogTitle>
                    <DialogDescription>
                        Let's set up your profile. Please enter your name to get started.
                    </DialogDescription>
                </DialogHeader>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="space-y-2">
                        <Label htmlFor="name">Your Name</Label>
                        <Input
                            id="name"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            placeholder="Enter your full name"
                            autoFocus
                        />
                    </div>
                    <Button type="submit" className="w-full" disabled={createProfile.isPending}>
                        {createProfile.isPending ? 'Creating Profile...' : 'Continue'}
                    </Button>
                </form>
            </DialogContent>
        </Dialog>
    );
}
