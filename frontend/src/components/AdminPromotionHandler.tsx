import { useEffect, useRef } from 'react';
import { toast } from 'sonner';
import { useNavigate } from '@tanstack/react-router';
import { useInternetIdentity } from '../hooks/useInternetIdentity';
import { useActor } from '../hooks/useActor';
import { useIsCallerAdmin, usePromoteToAdmin } from '../hooks/useQueries';
import { getAdminToken, clearAdminToken } from '../lib/adminPromotion';
import { useQueryClient } from '@tanstack/react-query';

/**
 * AdminPromotionHandler
 *
 * Handles ONE flow only: stored-token promotion.
 * When a user has a token saved in localStorage (from AdminAccessDialog before login),
 * this component calls promoteToAdmin(token) once after the actor is ready.
 *
 * Bootstrap admin detection is handled entirely by the backend's isCallerAdmin()
 * which returns true for the hardcoded bootstrap principal — no auto-promotion call needed.
 */
export default function AdminPromotionHandler() {
  const { identity, isInitializing } = useInternetIdentity();
  const { actor, isFetching: actorFetching } = useActor();
  const promoteMutation = usePromoteToAdmin();
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  const hasAttempted = useRef(false);
  const identityKey = identity?.getPrincipal().toString() ?? null;

  // Check if already admin so we don't re-trigger promotion
  const { data: isAdmin } = useIsCallerAdmin();

  useEffect(() => {
    // Reset attempt flag when identity changes (new login)
    hasAttempted.current = false;
  }, [identityKey]);

  // Handle stored token promotion (explicit token flow only)
  useEffect(() => {
    if (!identity || !actor || actorFetching || isInitializing) return;
    if (hasAttempted.current) return;

    const token = getAdminToken();
    if (!token) return;

    // If already admin, just clear the token and navigate to dashboard
    if (isAdmin === true) {
      clearAdminToken();
      toast.info('You already have admin privileges.');
      navigate({ to: '/admin/dashboard' });
      hasAttempted.current = true;
      return;
    }

    // Wait until isAdmin has been determined (not undefined) before proceeding
    if (isAdmin === undefined) return;

    hasAttempted.current = true;

    promoteMutation.mutate(token, {
      onSuccess: (result) => {
        clearAdminToken();

        if (result.__kind__ === 'success') {
          toast.success('Admin access granted! You now have administrator privileges.');
          queryClient.invalidateQueries({ queryKey: ['isCallerAdmin'] });
          navigate({ to: '/admin/dashboard' });
        } else if (result.__kind__ === 'accountAlreadyAdmin') {
          toast.info('Your account already has admin privileges.');
          queryClient.invalidateQueries({ queryKey: ['isCallerAdmin'] });
          navigate({ to: '/admin/dashboard' });
        } else if (result.__kind__ === 'invalidToken') {
          toast.error(
            'Invalid admin token. Please enter a new token from an existing administrator.',
            { duration: 6000 }
          );
          navigate({ to: '/places' });
        } else if (result.__kind__ === 'tokenExpired') {
          toast.error(
            'Admin token has expired. Please request a new token from an existing administrator.',
            { duration: 6000 }
          );
          navigate({ to: '/places' });
        }
      },
      onError: (error) => {
        clearAdminToken();
        toast.error(`Failed to apply admin token: ${error.message}`, { duration: 6000 });
        navigate({ to: '/places' });
      },
    });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [identity, actor, actorFetching, isInitializing, isAdmin]);

  return null;
}
