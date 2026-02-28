import { useEffect, useRef } from 'react';
import { toast } from 'sonner';
import { useInternetIdentity } from '../hooks/useInternetIdentity';
import { useActor } from '../hooks/useActor';
import { usePromoteToAdmin } from '../hooks/useQueries';
import { getAdminToken, clearAdminToken } from '../lib/adminPromotion';

export default function AdminPromotionHandler() {
  const { identity } = useInternetIdentity();
  const { actor, isFetching: actorFetching } = useActor();
  const promoteMutation = usePromoteToAdmin();
  const hasAttempted = useRef(false);
  const identityKey = identity?.getPrincipal().toString() ?? null;

  useEffect(() => {
    // Reset attempt flag when identity changes (new login)
    hasAttempted.current = false;
  }, [identityKey]);

  useEffect(() => {
    // Must have identity, actor must be ready, and we haven't attempted yet
    if (!identity || !actor || actorFetching) return;
    if (hasAttempted.current) return;

    const token = getAdminToken();
    if (!token) return;

    // Mark as attempted to prevent duplicate calls
    hasAttempted.current = true;

    promoteMutation.mutate(token, {
      onSuccess: (result) => {
        // Clear token after successful attempt
        clearAdminToken();
        if (result.__kind__ === 'success') {
          toast.success('Admin access granted! You now have administrator privileges.');
        } else if (result.__kind__ === 'accountAlreadyAdmin') {
          toast.info('Your account already has admin privileges.');
        } else if (result.__kind__ === 'invalidToken') {
          toast.error('Invalid admin token. Please request a new token from an existing administrator.');
        } else if (result.__kind__ === 'tokenExpired') {
          toast.error('Admin token has expired. Please request a new token from an existing administrator.');
        }
      },
      onError: (error) => {
        // Clear token after failed attempt to avoid infinite retry loops
        clearAdminToken();
        toast.error(`Failed to apply admin token: ${error.message}`);
      },
    });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [identity, actor, actorFetching]);

  return null;
}
