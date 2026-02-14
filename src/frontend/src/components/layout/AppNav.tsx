import { useNavigate, useRouterState } from '@tanstack/react-router';
import { useGetCallerUserRole } from '../../hooks/useQueries';
import { UserRole } from '../../backend';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { MapPin, Route, User, AlertTriangle, Shield, Search } from 'lucide-react';

interface AppNavProps {
    onNavigate: () => void;
}

export default function AppNav({ onNavigate }: AppNavProps) {
    const navigate = useNavigate();
    const routerState = useRouterState();
    const { data: userRole } = useGetCallerUserRole();
    const currentPath = routerState.location.pathname;

    const navItems = [
        { path: '/places', label: 'Places', icon: MapPin },
        { path: '/routes', label: 'Routes', icon: Route },
        { path: '/profile', label: 'Profile', icon: User },
        { path: '/sos', label: 'SOS', icon: AlertTriangle }
    ];

    const handleNavigate = (path: string) => {
        navigate({ to: path });
        onNavigate();
    };

    return (
        <nav className="flex flex-col gap-2">
            {navItems.map((item) => {
                const Icon = item.icon;
                const isActive = currentPath.startsWith(item.path);
                return (
                    <Button
                        key={item.path}
                        variant={isActive ? 'default' : 'ghost'}
                        className="justify-start gap-3"
                        onClick={() => handleNavigate(item.path)}
                    >
                        <Icon className="h-5 w-5" />
                        {item.label}
                    </Button>
                );
            })}

            {userRole === UserRole.admin && (
                <>
                    <Separator className="my-2" />
                    <Button
                        variant={currentPath === '/admin' ? 'default' : 'ghost'}
                        className="justify-start gap-3"
                        onClick={() => handleNavigate('/admin')}
                    >
                        <Shield className="h-5 w-5" />
                        Admin Review
                    </Button>
                </>
            )}

            <Separator className="my-2" />
            <Button
                variant={currentPath === '/emergency-lookup' ? 'default' : 'ghost'}
                className="justify-start gap-3"
                onClick={() => handleNavigate('/emergency-lookup')}
            >
                <Search className="h-5 w-5" />
                Emergency Lookup
            </Button>
        </nav>
    );
}
