import { useParams, useNavigate } from '@tanstack/react-router';
import { useSearchPlaces } from '../hooks/useQueries';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, MapPin } from 'lucide-react';
import { getCategoryLabel } from '../lib/placeCategory';

export default function PlaceDetailPage() {
    const navigate = useNavigate();
    const { placeId } = useParams({ from: '/places/$placeId' });
    const { data: places = [] } = useSearchPlaces(null);

    const place = places.find(p => encodeURIComponent(p.name) === placeId);

    if (!place) {
        return (
            <div className="space-y-6 max-w-2xl mx-auto">
                <Button variant="ghost" onClick={() => navigate({ to: '/places' })} className="gap-2">
                    <ArrowLeft className="h-4 w-4" />
                    Back to Places
                </Button>
                <Card>
                    <CardContent className="py-12 text-center">
                        <MapPin className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                        <p className="text-muted-foreground">Place not found</p>
                    </CardContent>
                </Card>
            </div>
        );
    }

    return (
        <div className="space-y-6 max-w-2xl mx-auto">
            <Button variant="ghost" onClick={() => navigate({ to: '/places' })} className="gap-2">
                <ArrowLeft className="h-4 w-4" />
                Back to Places
            </Button>

            <Card>
                <CardHeader>
                    <div className="flex items-start justify-between">
                        <div>
                            <CardTitle className="text-2xl">{place.name}</CardTitle>
                            <CardDescription className="mt-2">
                                <Badge variant="secondary">{getCategoryLabel(place.category)}</Badge>
                            </CardDescription>
                        </div>
                    </div>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div>
                        <h3 className="font-semibold mb-2">Location</h3>
                        <p className="text-muted-foreground">{place.location}</p>
                    </div>

                    {place.description && (
                        <div>
                            <h3 className="font-semibold mb-2">Description</h3>
                            <p className="text-muted-foreground">{place.description}</p>
                        </div>
                    )}

                    <div>
                        <h3 className="font-semibold mb-2">Submitted By</h3>
                        <p className="text-xs font-mono text-muted-foreground">
                            {place.submittedBy.toString()}
                        </p>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
