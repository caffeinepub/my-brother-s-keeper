import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useNavigate } from '@tanstack/react-router';
import { ShieldAlert, RefreshCw } from 'lucide-react';
import { useRequestAdminAccess } from '@/hooks/useQueries';
import { toast } from 'sonner';

interface AccessDeniedScreenProps {
    onRetry?: () => Promise<void>;
}

export default function AccessDeniedScreen({ onRetry }: AccessDeniedScreenProps) {
    const navigate = useNavigate();
    const requestAdminMutation = useRequestAdminAccess();

    const handleRequestAccess = async () => {
        try {
            await requestAdminMutation.mutateAsync();
            toast.success('Admin access granted!');
            
            // Trigger the retry callback to refetch user role
            if (onRetry) {
                await onRetry();
            }
        } catch (error: any) {
            console.error('Request admin access failed:', error);
            const errorMessage = error?.message || 'Failed to request admin access';
            toast.error(errorMessage);
        }
    };

    const isRequesting = requestAdminMutation.isPending;

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
                        {onRetry && ' If you believe you should have admin access, try requesting it below.'}
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-3">
                    {onRetry && (
                        <Button 
                            onClick={handleRequestAccess} 
                            className="w-full"
                            disabled={isRequesting}
                        >
                            {isRequesting ? (
                                <>
                                    <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                                    Requesting...
                                </>
                            ) : (
                                <>
                                    <RefreshCw className="mr-2 h-4 w-4" />
                                    Request Admin Access
                                </>
                            )}
                        </Button>
                    )}
                    <Button 
                        onClick={() => navigate({ to: '/' })} 
                        variant="outline" 
                        className="w-full"
                    >
                        Go to Home
                    </Button>
                </CardContent>
            </Card>
        </div>
    );
}
