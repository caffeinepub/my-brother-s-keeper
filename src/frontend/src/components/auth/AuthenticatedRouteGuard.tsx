import { useInternetIdentity } from '../../hooks/useInternetIdentity';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { LogIn } from 'lucide-react';

export default function AuthenticatedRouteGuard({ children }: { children: React.ReactNode }) {
    const { identity, login, isLoggingIn } = useInternetIdentity();

    if (!identity) {
        return (
            <div className="flex items-center justify-center min-h-[60vh]">
                <Card className="max-w-md">
                    <CardHeader>
                        <CardTitle>Login Required</CardTitle>
                        <CardDescription>
                            You need to be logged in to access this page.
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <Button onClick={login} disabled={isLoggingIn} className="w-full gap-2">
                            <LogIn className="h-4 w-4" />
                            {isLoggingIn ? 'Logging in...' : 'Login with Internet Identity'}
                        </Button>
                    </CardContent>
                </Card>
            </div>
        );
    }

    return <>{children}</>;
}
