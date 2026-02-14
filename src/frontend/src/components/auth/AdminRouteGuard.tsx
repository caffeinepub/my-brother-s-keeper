import { useGetCallerUserRole } from '../../hooks/useQueries';
import { UserRole } from '../../backend';
import AccessDeniedScreen from './AccessDeniedScreen';

export default function AdminRouteGuard({ children }: { children: React.ReactNode }) {
    const { data: userRole, isLoading } = useGetCallerUserRole();

    if (isLoading) {
        return (
            <div className="flex items-center justify-center min-h-[60vh]">
                <div className="text-center">
                    <div className="mb-4 h-12 w-12 animate-spin rounded-full border-4 border-primary border-t-transparent mx-auto" />
                    <p className="text-muted-foreground">Checking permissions...</p>
                </div>
            </div>
        );
    }

    if (userRole !== UserRole.admin) {
        return <AccessDeniedScreen />;
    }

    return <>{children}</>;
}
