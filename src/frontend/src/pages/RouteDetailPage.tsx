import { useNavigate } from '@tanstack/react-router';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';

export default function RouteDetailPage() {
    const navigate = useNavigate();

    return (
        <div className="space-y-6">
            <Button variant="ghost" onClick={() => navigate({ to: '/routes' })} className="gap-2">
                <ArrowLeft className="h-4 w-4" />
                Back to Routes
            </Button>
            <p className="text-muted-foreground">Route detail view (placeholder)</p>
        </div>
    );
}
