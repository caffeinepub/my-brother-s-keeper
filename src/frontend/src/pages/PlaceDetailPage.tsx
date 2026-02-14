import { useNavigate, useParams } from '@tanstack/react-router';
import { useSearchPlaces } from '../hooks/useQueries';
import { getCategoryLabel } from '../lib/placeCategory';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { ArrowLeft, MapPin, User } from 'lucide-react';

export default function PlaceDetailPage() {
    const navigate = useNavigate();
    const { placeName } = useParams({ from: '/places/$placeName' });
    const { data: places = [] } = useSearchPlaces(null);

    const place = places.find((p) => p.name === decodeURIComponent(placeName));

    if (!place) {
        return (
            <div className="text-center py-12">
                <p className="text-muted-foreground">Place not found</p>
                <Button onClick={() => navigate({ to: '/places' })} className="mt-4">
                    Back to Places
                </Button>
            </div>
        );
    }

    return (
        <div className="space-y-6 max-w-3xl">
            <Button variant="ghost" onClick={() => navigate({ to: '/places' })} className="gap-2">
                <ArrowLeft className="h-4 w-4" />
                Back to Places
            </Button>

            <Card>
                <CardHeader>
                    <div className="flex items-start justify-between gap-4">
                        <div className="space-y-2">
                            <CardTitle className="text-2xl">{place.name}</CardTitle>
                            <CardDescription className="flex items-center gap-2 text-base">
                                <MapPin className="h-4 w-4" />
                                {place.location}
                            </CardDescription>
                        </div>
                        <Badge variant="secondary" className="text-sm">
                            {getCategoryLabel(place.category)}
                        </Badge>
                    </div>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div>
                        <h3 className="font-semibold mb-2">Description</h3>
                        <p className="text-muted-foreground whitespace-pre-wrap">{place.description}</p>
                    </div>

                    <Separator />

                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <User className="h-4 w-4" />
                        <span>Submitted by: {place.submittedBy.toString().slice(0, 8)}...</span>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
