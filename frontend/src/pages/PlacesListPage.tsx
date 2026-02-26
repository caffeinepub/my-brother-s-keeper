import { useState, useMemo } from 'react';
import { useNavigate } from '@tanstack/react-router';
import { useSearchPlaces } from '../hooks/useQueries';
import { PlaceCategory } from '../backend';
import { placeCategoryOptions, getCategoryLabel } from '../lib/placeCategory';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Plus, Search, MapPin } from 'lucide-react';
import AuthenticatedRouteGuard from '../components/auth/AuthenticatedRouteGuard';

export default function PlacesListPage() {
    const navigate = useNavigate();
    const [selectedCategory, setSelectedCategory] = useState<PlaceCategory | null>(null);
    const [searchText, setSearchText] = useState('');
    const { data: places = [], isLoading } = useSearchPlaces(selectedCategory);

    const filteredPlaces = useMemo(() => {
        if (!searchText) return places;
        const lower = searchText.toLowerCase();
        return places.filter(
            (p) =>
                p.name.toLowerCase().includes(lower) ||
                p.location.toLowerCase().includes(lower) ||
                p.description.toLowerCase().includes(lower)
        );
    }, [places, searchText]);

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold">Safe Places</h1>
                    <p className="text-muted-foreground">Find trusted locations recommended by fellow truckers</p>
                </div>
                <AuthenticatedRouteGuard>
                    <Button onClick={() => navigate({ to: '/places/add' })} className="gap-2">
                        <Plus className="h-4 w-4" />
                        Add Place
                    </Button>
                </AuthenticatedRouteGuard>
            </div>

            <div className="flex flex-col sm:flex-row gap-4">
                <div className="flex-1 relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                        placeholder="Search places..."
                        value={searchText}
                        onChange={(e) => setSearchText(e.target.value)}
                        className="pl-10"
                    />
                </div>
                <Select
                    value={selectedCategory || 'all'}
                    onValueChange={(value) => setSelectedCategory(value === 'all' ? null : (value as PlaceCategory))}
                >
                    <SelectTrigger className="w-full sm:w-48">
                        <SelectValue placeholder="All Categories" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="all">All Categories</SelectItem>
                        {placeCategoryOptions.map((option) => (
                            <SelectItem key={option.value} value={option.value}>
                                {option.label}
                            </SelectItem>
                        ))}
                    </SelectContent>
                </Select>
            </div>

            {isLoading ? (
                <div className="text-center py-12">
                    <div className="mb-4 h-12 w-12 animate-spin rounded-full border-4 border-primary border-t-transparent mx-auto" />
                    <p className="text-muted-foreground">Loading places...</p>
                </div>
            ) : filteredPlaces.length === 0 ? (
                <Card>
                    <CardContent className="py-12 text-center">
                        <MapPin className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                        <p className="text-muted-foreground">No places found. Be the first to add one!</p>
                    </CardContent>
                </Card>
            ) : (
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {filteredPlaces.map((place) => (
                        <Card
                            key={place.name}
                            className="cursor-pointer hover:shadow-lg transition-shadow"
                            onClick={() => navigate({ to: `/places/${encodeURIComponent(place.name)}` })}
                        >
                            <CardHeader>
                                <div className="flex items-start justify-between gap-2">
                                    <CardTitle className="text-lg">{place.name}</CardTitle>
                                    <Badge variant="secondary">{getCategoryLabel(place.category)}</Badge>
                                </div>
                                <CardDescription className="flex items-center gap-1">
                                    <MapPin className="h-3 w-3" />
                                    {place.location}
                                </CardDescription>
                            </CardHeader>
                            <CardContent>
                                <p className="text-sm text-muted-foreground line-clamp-2">{place.description}</p>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            )}
        </div>
    );
}
