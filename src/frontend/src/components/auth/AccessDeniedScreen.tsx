import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useNavigate } from '@tanstack/react-router';
import { ShieldAlert } from 'lucide-react';

export default function AccessDeniedScreen() {
    const navigate = useNavigate();

    return (
        <div className="flex items-center justify-center min-h-[60vh]">
            <Card className="max-w-md">
                <CardHeader className="text-center">
                    <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-destructive/10">
                        <ShieldAlert className="h-8 w-8 text-destructive" />
                    </div>
                    <CardTitle>Access Denied</CardTitle>
                    <CardDescription>
                        You don't have permission to access this page.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <Button onClick={() => navigate({ to: '/' })} className="w-full">
                        Go to Home
                    </Button>
                </CardContent>
            </Card>
        </div>
    );
}
