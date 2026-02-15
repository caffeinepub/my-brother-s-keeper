import { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Copy, Download, Share2, FileText } from 'lucide-react';
import { toast } from 'sonner';
import { getShareUrl } from '@/lib/shareUrl';
import { quickShare } from '@/lib/quickShare';
import { useNavigate } from '@tanstack/react-router';
import { copyToClipboard } from '@/lib/clipboard';

interface ShareDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export default function ShareDialog({ open, onOpenChange }: ShareDialogProps) {
  const [shareUrl, setShareUrl] = useState('');
  const [isSharing, setIsSharing] = useState(false);
  const navigate = useNavigate();

  // Set share URL when dialog opens
  useEffect(() => {
    if (open) {
      const url = getShareUrl();
      setShareUrl(url);
    }
  }, [open]);

  const handleCopyLink = async () => {
    const success = await copyToClipboard(shareUrl);
    if (success) {
      toast.success('Link copied to clipboard');
    } else {
      toast.error('Failed to copy link. Please manually select and copy the link from the App Link field below.');
    }
  };

  const handleQuickShare = async () => {
    // Guard against missing share URL
    if (!shareUrl || shareUrl.trim().length === 0) {
      toast.error('Share link is not ready yet. Please wait a moment.');
      return;
    }

    setIsSharing(true);
    try {
      const result = await quickShare(shareUrl, "My Brother's Keeper - Trucker Safety Network");
      
      switch (result.status) {
        case 'success':
          toast.success('Shared successfully');
          break;
        case 'copied':
          toast.success('Link copied to clipboard');
          break;
        case 'cancelled':
          // User cancelled - no toast needed
          break;
        case 'not-supported':
          toast.error('Sharing is not available. Please use the "Copy Link" button below to manually copy the app link from the App Link field.');
          break;
        case 'error':
          toast.error(result.message || 'Failed to share. Please use the "Copy Link" button to manually copy the app link from the App Link field.');
          break;
        default:
          // Handle any unexpected result status
          console.error('Unexpected quick share result:', result);
          toast.error('Failed to share. Please use the "Copy Link" button to manually copy the app link from the App Link field.');
      }
    } catch (error) {
      console.error('Quick share error:', error);
      toast.error('Failed to share. Please use the "Copy Link" button to manually copy the app link from the App Link field.');
    } finally {
      setIsSharing(false);
    }
  };

  const handleViewFlyer = () => {
    onOpenChange(false);
    navigate({ to: '/flyer' });
  };

  const handleDownloadFlyer = () => {
    onOpenChange(false);
    navigate({ to: '/flyer', search: { autoExportFlyer: '1' } });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Share2 className="h-5 w-5" />
            Share App
          </DialogTitle>
          <DialogDescription>
            Share this app with drivers and subscribers using the link below.
          </DialogDescription>
        </DialogHeader>

        <div className="flex flex-col gap-6 py-4">
          {/* Share URL */}
          <div className="w-full space-y-2">
            <label className="text-sm font-medium">App Link</label>
            <div className="flex gap-2">
              <Input
                value={shareUrl}
                readOnly
                className="flex-1 font-mono text-sm"
              />
              <Button
                variant="outline"
                size="icon"
                onClick={handleCopyLink}
                title="Copy link"
              >
                <Copy className="h-4 w-4" />
              </Button>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="w-full">
            <Button
              variant="outline"
              onClick={handleQuickShare}
              disabled={isSharing || !shareUrl}
              className="w-full gap-2"
            >
              <Share2 className="h-4 w-4" />
              {isSharing ? 'Sharing...' : 'Quick Share'}
            </Button>
          </div>

          {/* Flyer Actions */}
          <div className="w-full pt-2 border-t border-border space-y-2">
            <p className="text-sm text-muted-foreground text-center">
              Need a printable flyer?
            </p>
            <div className="grid grid-cols-2 gap-2">
              <Button
                variant="secondary"
                onClick={handleViewFlyer}
                className="gap-2"
              >
                <FileText className="h-4 w-4" />
                View Flyer
              </Button>
              <Button
                variant="secondary"
                onClick={handleDownloadFlyer}
                disabled={!shareUrl}
                className="gap-2"
              >
                <Download className="h-4 w-4" />
                Download Flyer
              </Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
