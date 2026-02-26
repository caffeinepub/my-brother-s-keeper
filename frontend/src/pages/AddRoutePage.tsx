import { useState } from 'react';
import { useNavigate } from '@tanstack/react-router';
import { useCreateRoute } from '../hooks/useQueries';
import { dateToTime } from '../lib/time';
import AuthenticatedRouteGuard from '../components/auth/AuthenticatedRouteGuard';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { toast } from 'sonner';
import { ArrowLeft } from 'lucide-react';

export default function AddRoutePage() {
    const navigate = useNavigate();
    const createRoute = useCreateRoute();
    const [start, setStart] = useState('');
    const [destination, setDestination] = useState('');
    const [waypoints, setWaypoints] = useState('');
    const [dateTime, setDateTime] = useState('');
    const [notes, setNotes] = useState('');

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!start.trim() || !destination.trim() || !dateTime) {
            toast.error('Please fill in all required fields');
            return;
        }

        try {
            const waypointsArray = waypoints
                .split(',')
                .map((w) => w.trim())
                .filter((w) => w.length > 0);

            await createRoute.mutateAsync({
                start: start.trim(),
                destination: destination.trim(),
                waypoints: waypointsArray,
                dateTime: dateToTime(new Date(dateTime)),
                notes: notes.trim() || null
            });
            toast.success('Route created successfully');
            navigate({ to: '/routes' });
        } catch (error: any) {
            toast.error(error.message || 'Failed to create route');
        }
    };

    return (
        <AuthenticatedRouteGuard>
            <div className="space-y-6 max-w-2xl">
                <Button variant="ghost" onClick={() => navigate({ to: '/routes' })} className="gap-2">
                    <ArrowLeft className="h-4 w-4" />
                    Back to Routes
                </Button>

                <Card>
                    <CardHeader>
                        <CardTitle>Share a Route</CardTitle>
                        <CardDescription>
                            Let other drivers know your planned route
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div className="space-y-2">
                                <Label htmlFor="start">Starting Point *</Label>
                                <Input
                                    id="start"
                                    value={start}
                                    onChange={(e) => setStart(e.target.value)}
                                    placeholder="e.g., Denver, CO"
                                    required
                                />
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="destination">Destination *</Label>
                                <Input
                                    id="destination"
                                    value={destination}
                                    onChange={(e) => setDestination(e.target.value)}
                                    placeholder="e.g., Chicago, IL"
                                    required
                                />
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="waypoints">Waypoints (optional)</Label>
                                <Input
                                    id="waypoints"
                                    value={waypoints}
                                    onChange={(e) => setWaypoints(e.target.value)}
                                    placeholder="Comma-separated, e.g., Omaha NE, Des Moines IA"
                                />
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="dateTime">Departure Date & Time *</Label>
                                <Input
                                    id="dateTime"
                                    type="datetime-local"
                                    value={dateTime}
                                    onChange={(e) => setDateTime(e.target.value)}
                                    required
                                />
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="notes">Notes (optional)</Label>
                                <Textarea
                                    id="notes"
                                    value={notes}
                                    onChange={(e) => setNotes(e.target.value)}
                                    placeholder="Any additional details about this route..."
                                    rows={3}
                                />
                            </div>

                            <div className="flex gap-3">
                                <Button type="submit" disabled={createRoute.isPending} className="flex-1">
                                    {createRoute.isPending ? 'Creating...' : 'Create Route'}
                                </Button>
                                <Button
                                    type="button"
                                    variant="outline"
                                    onClick={() => navigate({ to: '/routes' })}
                                >
                                    Cancel
                                </Button>
                            </div>
                        </form>
                    </CardContent>
                </Card>
            </div>
        </AuthenticatedRouteGuard>
    );
}
