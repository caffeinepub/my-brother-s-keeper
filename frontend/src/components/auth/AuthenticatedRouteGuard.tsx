import { ReactNode } from 'react';
import { ShieldAlert, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { useInternetIdentity } from '../../hooks/useInternetIdentity';
import LoginButton from './LoginButton';

interface AuthenticatedRouteGuardProps {
  children: ReactNode;
}

export default function AuthenticatedRouteGuard({ children }: AuthenticatedRouteGuardProps) {
  const { identity, isInitializing } = useInternetIdentity();

  if (isInitializing) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="flex flex-col items-center gap-3 text-muted-foreground">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <p className="text-sm">Loading...</p>
        </div>
      </div>
    );
  }

  if (!identity) {
    return (
      <div className="flex items-center justify-center min-h-[60vh] px-4">
        <Card className="w-full max-w-sm text-center">
          <CardHeader>
            <div className="flex justify-center mb-2">
              <ShieldAlert className="h-10 w-10 text-primary" />
            </div>
            <CardTitle>Login Required</CardTitle>
            <CardDescription>
              You need to be logged in to access this page. Please sign in to continue.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <LoginButton />
          </CardContent>
        </Card>
      </div>
    );
  }

  return <>{children}</>;
}
