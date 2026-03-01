import { ShieldX } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { useNavigate } from '@tanstack/react-router';

/**
 * AccessDeniedScreen
 *
 * Simple screen shown when a user does not have admin privileges.
 * Provides navigation back to safe pages.
 * Bootstrap admin access is handled automatically by the backend — no manual
 * verification UI is needed here.
 */
export default function AccessDeniedScreen() {
  const navigate = useNavigate();

  return (
    <div className="flex items-center justify-center min-h-[60vh] px-4">
      <div className="w-full max-w-md">
        <Card className="text-center">
          <CardHeader>
            <div className="flex justify-center mb-2">
              <ShieldX className="h-12 w-12 text-destructive" />
            </div>
            <CardTitle>Access Denied</CardTitle>
            <CardDescription>
              You don't have administrator privileges to access this page.
              If you believe this is an error, please contact an existing administrator.
            </CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col gap-3">
            <Button onClick={() => navigate({ to: '/' })} variant="default" className="w-full">
              Return Home
            </Button>
            <Button onClick={() => navigate({ to: '/places' })} variant="outline" className="w-full">
              Browse Safe Places
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
