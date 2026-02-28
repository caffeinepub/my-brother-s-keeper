import { useState } from 'react';
import { Share2, AlertTriangle, ShieldCheck } from 'lucide-react';
import { Button } from '@/components/ui/button';
import LoginButton from '../auth/LoginButton';
import ShareDialog from '../share/ShareDialog';
import AdminAccessDialog from '../auth/AdminAccessDialog';
import { useNavigate } from '@tanstack/react-router';

export default function BrandHeader() {
  const [shareOpen, setShareOpen] = useState(false);
  const [adminAccessOpen, setAdminAccessOpen] = useState(false);
  const navigate = useNavigate();

  return (
    <header className="sticky top-0 z-40 w-full border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto flex h-16 items-center justify-between px-4">
        {/* Logo & Title */}
        <button
          onClick={() => navigate({ to: '/' })}
          className="flex items-center gap-3 hover:opacity-80 transition-opacity"
        >
          <img
            src="/assets/generated/mbk-logo.dim_512x512.png"
            alt="MBK Logo"
            className="h-9 w-9 rounded-lg object-cover"
          />
          <div className="flex flex-col items-start leading-tight">
            <span className="font-bold text-base text-foreground tracking-tight">MBK Riders</span>
            <span className="text-xs text-muted-foreground hidden sm:block">Community Safety Network</span>
          </div>
        </button>

        {/* Actions */}
        <div className="flex items-center gap-2">
          {/* Emergency Lookup */}
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate({ to: '/emergency-lookup' })}
            className="hidden sm:flex items-center gap-1.5 text-destructive hover:text-destructive hover:bg-destructive/10"
          >
            <AlertTriangle className="h-4 w-4" />
            <span className="text-xs font-medium">Emergency</span>
          </Button>

          {/* Admin Access */}
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setAdminAccessOpen(true)}
            className="hidden sm:flex items-center gap-1.5 text-muted-foreground hover:text-foreground"
            title="Enter admin token"
          >
            <ShieldCheck className="h-4 w-4" />
            <span className="text-xs font-medium">Admin Access</span>
          </Button>

          {/* Share */}
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setShareOpen(true)}
            title="Share app"
            className="h-8 w-8"
          >
            <Share2 className="h-4 w-4" />
          </Button>

          <LoginButton />
        </div>
      </div>

      <ShareDialog open={shareOpen} onOpenChange={setShareOpen} />
      <AdminAccessDialog open={adminAccessOpen} onOpenChange={setAdminAccessOpen} />
    </header>
  );
}
