import { Link } from '@tanstack/react-router';
import { useIsCallerAdmin } from '../../hooks/useQueries';
import { MapPin, Route, User, Shield, Users } from 'lucide-react';
import { useEffect } from 'react';

export default function AppNav() {
    const { data: isAdmin, isLoading, isFetched } = useIsCallerAdmin();

    useEffect(() => {
        console.log('[AppNav] Admin status:', {
            isAdmin,
            isLoading,
            isFetched
        });
    }, [isAdmin, isLoading, isFetched]);

    return (
        <nav className="flex flex-col gap-1">
            <Link
                to="/places"
                className="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-accent transition-colors [&.active]:bg-accent [&.active]:text-accent-foreground"
            >
                <MapPin className="h-5 w-5" />
                <span>Places</span>
            </Link>
            <Link
                to="/routes"
                className="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-accent transition-colors [&.active]:bg-accent [&.active]:text-accent-foreground"
            >
                <Route className="h-5 w-5" />
                <span>Routes</span>
            </Link>
            <Link
                to="/meetup"
                className="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-accent transition-colors [&.active]:bg-accent [&.active]:text-accent-foreground"
            >
                <Users className="h-5 w-5" />
                <span>Meetup</span>
            </Link>
            <Link
                to="/profile"
                className="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-accent transition-colors [&.active]:bg-accent [&.active]:text-accent-foreground"
            >
                <User className="h-5 w-5" />
                <span>Profile</span>
            </Link>
            {isAdmin && (
                <Link
                    to="/admin"
                    className="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-accent transition-colors [&.active]:bg-accent [&.active]:text-accent-foreground"
                >
                    <Shield className="h-5 w-5" />
                    <span>Admin Dashboard</span>
                </Link>
            )}
        </nav>
    );
}
