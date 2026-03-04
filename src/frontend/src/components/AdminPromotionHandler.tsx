import { useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "@tanstack/react-router";
import { useEffect, useRef } from "react";
import { toast } from "sonner";
import { useActor } from "../hooks/useActor";
import { useInternetIdentity } from "../hooks/useInternetIdentity";
import { usePromoteToAdmin } from "../hooks/useQueries";
import { clearAdminToken, getAdminToken } from "../lib/adminPromotion";

/**
 * AdminPromotionHandler
 *
 * Handles ONE flow only: stored-token promotion.
 * When a user has a token saved in localStorage (from AdminAccessDialog before login),
 * this component calls promoteToAdmin(token) once after the actor is ready.
 *
 * Bootstrap admin detection is handled entirely by the backend's isCallerAdmin()
 * which returns true for the hardcoded bootstrap principal — no auto-promotion call needed.
 *
 * The promotion attempt fires exactly once per identity session (tracked via hasAttempted ref).
 * It does NOT depend on isAdmin query state to avoid re-triggering on query invalidations.
 */
export default function AdminPromotionHandler() {
  const { identity, isInitializing } = useInternetIdentity();
  const { actor, isFetching: actorFetching } = useActor();
  const promoteMutation = usePromoteToAdmin();
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  const hasAttempted = useRef(false);
  const _identityKey = identity?.getPrincipal().toString() ?? null;

  useEffect(() => {
    // Reset attempt flag when identity changes (new login)
    hasAttempted.current = false;
  }, []);

  // Handle stored token promotion (explicit token flow only)
  useEffect(() => {
    if (!identity || !actor || actorFetching || isInitializing) return;
    if (hasAttempted.current) return;

    const token = getAdminToken();
    if (!token) return;

    // Mark as attempted immediately to prevent any re-runs
    hasAttempted.current = true;

    // Clear the token from localStorage right away before the async call
    // so it won't be re-used even if the component re-renders during the call
    clearAdminToken();

    promoteMutation.mutate(token, {
      onSuccess: (result) => {
        if (result.__kind__ === "success") {
          toast.success(
            "Admin access granted! You now have administrator privileges.",
          );
          queryClient.invalidateQueries({ queryKey: ["isCallerAdmin"] });
          navigate({ to: "/admin/dashboard" });
        } else if (result.__kind__ === "accountAlreadyAdmin") {
          toast.info("Your account already has admin privileges.");
          queryClient.invalidateQueries({ queryKey: ["isCallerAdmin"] });
          navigate({ to: "/admin/dashboard" });
        } else if (result.__kind__ === "invalidToken") {
          toast.error(
            "Invalid admin token. Please enter a new token from an existing administrator.",
            { duration: 6000 },
          );
          navigate({ to: "/places" });
        } else if (result.__kind__ === "tokenExpired") {
          toast.error(
            "Admin token has expired. Please request a new token from an existing administrator.",
            { duration: 6000 },
          );
          navigate({ to: "/places" });
        }
      },
      onError: (error) => {
        toast.error(`Failed to apply admin token: ${error.message}`, {
          duration: 6000,
        });
        navigate({ to: "/places" });
      },
    });
    // Intentionally omit isAdmin from deps — we do NOT want to re-run when
    // admin status changes, only when the actor/identity becomes ready.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    identity,
    actor,
    actorFetching,
    isInitializing,
    navigate,
    promoteMutation.mutate,
    queryClient.invalidateQueries,
  ]);

  return null;
}
