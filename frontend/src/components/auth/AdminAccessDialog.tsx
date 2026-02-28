import { useState } from 'react';
import { KeyRound, Loader2, ShieldCheck } from 'lucide-react';
import { toast } from 'sonner';
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
import { usePromoteToAdmin } from '../../hooks/useQueries';
import { saveAdminTokenBeforeLogin } from '../../lib/adminPromotion';

interface AdminAccessDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export default function AdminAccessDialog({ open, onOpenChange }: AdminAccessDialogProps) {
  const { identity, login, loginStatus } = useInternetIdentity();
  const [token, setToken] = useState('');
  const promoteMutation = usePromoteToAdmin();
  const isAuthenticated = !!identity;
  const isLoggingIn = loginStatus === 'logging-in';

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

    promoteMutation.mutate(trimmedToken, {
      onSuccess: (result) => {
        setToken('');
        if (result.__kind__ === 'success') {
          toast.success('Admin access granted! You now have administrator privileges.');
          onOpenChange(false);
        } else if (result.__kind__ === 'accountAlreadyAdmin') {
          toast.info('Your account already has admin privileges.');
          onOpenChange(false);
        } else if (result.__kind__ === 'invalidToken') {
          toast.error('Invalid admin token. Please check the token and try again.');
        } else if (result.__kind__ === 'tokenExpired') {
          toast.error('This admin token has expired. Please request a new one.');
        }
      },
      onError: (error) => {
        toast.error(`Failed to apply admin token: ${error.message}`);
      },
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <div className="flex items-center gap-2">
            <ShieldCheck className="h-5 w-5 text-primary" />
            <DialogTitle>Admin Access</DialogTitle>
          </div>
          <DialogDescription>
            Enter your admin token to gain administrator privileges. Tokens are provided by existing administrators.
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
