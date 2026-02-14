import { useState } from 'react';
import { useNavigate } from '@tanstack/react-router';
import { useAddPlace } from '../hooks/useQueries';
import { PlaceCategory } from '../backend';
import { placeCategoryOptions } from '../lib/placeCategory';
import AuthenticatedRouteGuard from '../components/auth/AuthenticatedRouteGuard';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { toast } from 'sonner';
import { ArrowLeft } from 'lucide-react';

export default function AddPlacePage() {
    const navigate = useNavigate();
    const addPlace = useAddPlace();
    const [name, setName] = useState('');
    const [category, setCategory] = useState<PlaceCategory | ''>('');
    const [location, setLocation] = useState('');
    const [description, setDescription] = useState('');

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!name.trim() || !category || !location.trim() || !description.trim()) {
            toast.error('Please fill in all required fields');
            return;
        }

        try {
            await addPlace.mutateAsync({
                name: name.trim(),
                category: category as PlaceCategory,
                location: location.trim(),
                description: description.trim()
            });
            toast.success('Place added successfully');
            navigate({ to: '/places' });
        } catch (error: any) {
            toast.error(error.message || 'Failed to add place');
        }
    };

    return (
        <AuthenticatedRouteGuard>
            <div className="space-y-6 max-w-2xl">
                <Button variant="ghost" onClick={() => navigate({ to: '/places' })} className="gap-2">
                    <ArrowLeft className="h-4 w-4" />
                    Back to Places
                </Button>

                <Card>
                    <CardHeader>
                        <CardTitle>Add a Safe Place</CardTitle>
                        <CardDescription>
                            Share a trusted location with fellow truckers
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div className="space-y-2">
                                <Label htmlFor="name">Place Name *</Label>
                                <Input
                                    id="name"
                                    value={name}
                                    onChange={(e) => setName(e.target.value)}
                                    placeholder="e.g., Joe's Truck Stop"
                                    required
                                />
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="category">Category *</Label>
                                <Select value={category} onValueChange={(value) => setCategory(value as PlaceCategory)}>
                                    <SelectTrigger id="category">
                                        <SelectValue placeholder="Select a category" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {placeCategoryOptions.map((option) => (
                                            <SelectItem key={option.value} value={option.value}>
                                                {option.label}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="location">Location / Address *</Label>
                                <Input
                                    id="location"
                                    value={location}
                                    onChange={(e) => setLocation(e.target.value)}
                                    placeholder="e.g., Exit 42, I-80, Nebraska"
                                    required
                                />
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="description">Description *</Label>
                                <Textarea
                                    id="description"
                                    value={description}
                                    onChange={(e) => setDescription(e.target.value)}
                                    placeholder="Share details about this place..."
                                    rows={4}
                                    required
                                />
                            </div>

                            <div className="flex gap-3">
                                <Button type="submit" disabled={addPlace.isPending} className="flex-1">
                                    {addPlace.isPending ? 'Adding...' : 'Add Place'}
                                </Button>
                                <Button
                                    type="button"
                                    variant="outline"
                                    onClick={() => navigate({ to: '/places' })}
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
