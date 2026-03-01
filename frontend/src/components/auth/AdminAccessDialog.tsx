import { useState } from 'react';
import { KeyRound, Loader2, ShieldCheck } from 'lucide-react';
import { toast } from 'sonner';
import { useNavigate } from '@tanstack/react-router';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useInternetIdentity } from '../../hooks/useInternetIdentity';
import { useIsCallerAdmin, usePromoteToAdmin } from '../../hooks/useQueries';
import { saveAdminTokenBeforeLogin } from '../../lib/adminPromotion';
import { useQueryClient } from '@tanstack/react-query';

interface AdminAccessDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export default function AdminAccessDialog({ open, onOpenChange }: AdminAccessDialogProps) {
  const { identity, login, loginStatus } = useInternetIdentity();
  const [token, setToken] = useState('');
  const promoteMutation = usePromoteToAdmin();
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  const isAuthenticated = !!identity;
  const isLoggingIn = loginStatus === 'logging-in';

  // Check if the user is already an admin
  const { data: isAdmin } = useIsCallerAdmin();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const trimmedToken = token.trim();
    if (!trimmedToken) return;

    if (!isAuthenticated) {
      // Save token to localStorage before II redirect
      saveAdminTokenBeforeLogin(trimmedToken);
      setToken('');
      toast.info('Redirecting to login. Your admin token will be applied after authentication.');
      await login();
      return;
    }

    // User is already authenticated — call promoteToAdmin directly
    promoteMutation.mutate(trimmedToken, {
      onSuccess: (result) => {
        if (result.__kind__ === 'success') {
          setToken('');
          toast.success('Admin access granted! You now have administrator privileges.');
          // Invalidate admin status so guards update immediately
          queryClient.invalidateQueries({ queryKey: ['isCallerAdmin'] });
          queryClient.refetchQueries({ queryKey: ['isCallerAdmin'] });
          onOpenChange(false);
          navigate({ to: '/admin/dashboard' });
        } else if (result.__kind__ === 'accountAlreadyAdmin') {
          setToken('');
          toast.info('Your account already has admin privileges.');
          queryClient.invalidateQueries({ queryKey: ['isCallerAdmin'] });
          onOpenChange(false);
          navigate({ to: '/admin/dashboard' });
        } else if (result.__kind__ === 'invalidToken') {
          // Keep dialog open for re-entry
          toast.error('Invalid admin token. Please check the token and try again.');
        } else if (result.__kind__ === 'tokenExpired') {
          // Keep dialog open for re-entry
          toast.error('This admin token has expired. Please request a new one from an administrator.');
        }
      },
      onError: (error) => {
        // Keep dialog open for re-entry
        toast.error(`Failed to apply admin token: ${error.message}`);
      },
    });
  };

  // If the user is already an admin, show a confirmation instead of the token form
  if (isAuthenticated && isAdmin === true) {
    return (
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <div className="flex items-center gap-2">
              <ShieldCheck className="h-5 w-5 text-primary" />
              <DialogTitle>Admin Access</DialogTitle>
            </div>
            <DialogDescription>
              You already have administrator privileges.
            </DialogDescription>
          </DialogHeader>
          <div className="flex flex-col gap-3 pt-2">
            <Button
              onClick={() => {
                onOpenChange(false);
                navigate({ to: '/admin/dashboard' });
              }}
              className="w-full"
            >
              Go to Admin Dashboard
            </Button>
            <Button
              variant="outline"
              onClick={() => onOpenChange(false)}
              className="w-full"
            >
              Close
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <div className="flex items-center gap-2">
            <ShieldCheck className="h-5 w-5 text-primary" />
            <DialogTitle>Admin Access</DialogTitle>
          </div>
          <DialogDescription asChild>
            <div className="space-y-2 text-sm text-muted-foreground">
              <p>
                <strong className="text-foreground">Bootstrap admin:</strong> If you are the designated first administrator, simply log in with your registered principal — admin access is granted automatically, no token required.
              </p>
              <p>
                <strong className="text-foreground">Other users:</strong> Enter an admin token generated by an existing administrator to receive admin privileges.
              </p>
            </div>
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="admin-token">Admin Token</Label>
            <Input
              id="admin-token"
              type="text"
              placeholder="ROUTECOIN_ADMIN_..."
              value={token}
              onChange={(e) => setToken(e.target.value)}
              disabled={promoteMutation.isPending || isLoggingIn}
              className="font-mono text-sm"
            />
          </div>

          {!isAuthenticated && (
            <p className="text-sm text-muted-foreground bg-muted rounded-md p-3">
              <strong>Note:</strong> You are not logged in. Submitting will save your token and redirect you to login. Your admin privileges will be applied automatically after authentication.
            </p>
          )}

          {isAuthenticated && (
            <p className="text-sm text-muted-foreground bg-muted rounded-md p-3">
              You are logged in. Submitting will apply the token immediately to your account.
            </p>
          )}

          <DialogFooter className="gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                setToken('');
                onOpenChange(false);
              }}
              disabled={promoteMutation.isPending || isLoggingIn}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={!token.trim() || promoteMutation.isPending || isLoggingIn}
            >
              {promoteMutation.isPending || isLoggingIn ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  {isLoggingIn ? 'Redirecting...' : 'Applying...'}
                </>
              ) : (
                <>
                  <KeyRound className="mr-2 h-4 w-4" />
                  {isAuthenticated ? 'Apply Token' : 'Login & Apply'}
                </>
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
