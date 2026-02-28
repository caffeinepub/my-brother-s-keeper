import { useNavigate, useLocation } from '@tanstack/react-router';
import { MapPin, Route, Users, AlertTriangle, User, LayoutDashboard, Navigation } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useIsCallerAdmin } from '../../hooks/useQueries';
import { useInternetIdentity } from '../../hooks/useInternetIdentity';

const navItems = [
  { to: '/places', label: 'Safe Places', icon: MapPin },
  { to: '/routes', label: 'Routes', icon: Route },
  { to: '/meetup', label: 'Meetup', icon: Navigation },
  { to: '/sos', label: 'SOS', icon: AlertTriangle },
  { to: '/profile', label: 'Profile', icon: User },
];

interface AppNavProps {
  onNavigate?: () => void;
}

export default function AppNav({ onNavigate }: AppNavProps) {
  const navigate = useNavigate();
  const location = useLocation();
  const { identity } = useInternetIdentity();
  const { data: isAdmin } = useIsCallerAdmin();

  const handleNav = (to: string) => {
    navigate({ to });
    onNavigate?.();
  };

  return (
    <nav className="flex flex-col gap-1 p-2">
      {navItems.map(({ to, label, icon: Icon }) => {
        const isActive = location.pathname === to || location.pathname.startsWith(to + '/');
        return (
          <button
            key={to}
            onClick={() => handleNav(to)}
            className={cn(
              'flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors w-full text-left',
              isActive
                ? 'bg-primary text-primary-foreground'
                : 'text-muted-foreground hover:bg-accent hover:text-accent-foreground'
            )}
          >
            <Icon className="h-4 w-4 shrink-0" />
            {label}
          </button>
        );
      })}

      {identity && isAdmin && (
        <>
          <div className="my-1 h-px bg-border" />
          <button
            onClick={() => handleNav('/admin/dashboard')}
            className={cn(
              'flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors w-full text-left',
              location.pathname.startsWith('/admin')
                ? 'bg-primary text-primary-foreground'
                : 'text-muted-foreground hover:bg-accent hover:text-accent-foreground'
            )}
          >
            <LayoutDashboard className="h-4 w-4 shrink-0" />
            Admin Dashboard
          </button>
        </>
      )}
    </nav>
  );
}
