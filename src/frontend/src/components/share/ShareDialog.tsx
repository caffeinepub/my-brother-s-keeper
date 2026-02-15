import { useState, useEffect, useCallback } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Copy, Download, Share2, FileText, AlertCircle } from 'lucide-react';
import { toast } from 'sonner';
import { getShareUrl } from '@/lib/shareUrl';
import { downloadCanvasAsPNG } from '@/lib/qrDownload';
import { quickShare } from '@/lib/quickShare';
import { useNavigate } from '@tanstack/react-router';
import { useQrCodeCanvas } from '@/hooks/useQrCodeCanvas';
import { copyToClipboard } from '@/lib/clipboard';

interface ShareDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export default function ShareDialog({ open, onOpenChange }: ShareDialogProps) {
  const [shareUrl, setShareUrl] = useState('');
  const [isSharing, setIsSharing] = useState(false);
  const [canvasElement, setCanvasElement] = useState<HTMLCanvasElement | null>(null);
  const navigate = useNavigate();

  // Callback ref to capture canvas element when it mounts
  const canvasRef = useCallback((node: HTMLCanvasElement | null) => {
    setCanvasElement(node);
  }, []);

  // Set share URL when dialog opens
  useEffect(() => {
    if (open) {
      const url = getShareUrl();
      setShareUrl(url);
    } else {
      // Reset canvas when dialog closes
      setCanvasElement(null);
    }
  }, [open]);

  // Generate QR code using the hook with mount-aware canvas
  const { qrReady, qrError, status } = useQrCodeCanvas({
    canvas: open ? canvasElement : null,
    text: shareUrl,
    size: 256,
    margin: 4,
  });

  // Show error toast if QR generation fails
  useEffect(() => {
    if (qrError) {
      toast.error('Failed to generate QR code. You can still copy the link below.');
    }
  }, [qrError]);

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

  const handleDownloadQR = async () => {
    if (!canvasElement) {
      toast.error('QR code not ready. Please wait a moment and try again.');
      return;
    }

    if (!qrReady) {
      toast.error('QR code is still generating. Please wait a moment and try again.');
      return;
    }

    try {
      await downloadCanvasAsPNG(canvasElement, 'my-brothers-keeper-qr.png');
      toast.success('QR code downloaded');
    } catch (error) {
      console.error('Download error:', error);
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      toast.error(`Failed to download QR code: ${errorMessage}`);
    }
  };

  const handleViewFlyer = () => {
    onOpenChange(false);
    navigate({ to: '/flyer' });
  };

  const handleDownloadFlyer = () => {
    if (!qrReady) {
      toast.error('Please wait for QR code to finish generating, then try again.');
      return;
    }
    
    onOpenChange(false);
    navigate({ to: '/flyer', search: { autoExportFlyer: '1' } });
  };

  const isGenerating = status === 'generating';

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Share2 className="h-5 w-5" />
            Share App
          </DialogTitle>
          <DialogDescription>
            Share this app with drivers and subscribers. Scan the QR code or copy the link below.
          </DialogDescription>
        </DialogHeader>

        <div className="flex flex-col items-center gap-6 py-4">
          {/* QR Code */}
          <div className="relative flex items-center justify-center rounded-lg border-2 border-border bg-white p-4">
            {isGenerating && (
              <div className="absolute inset-0 flex items-center justify-center bg-background/80 rounded-lg">
                <div className="text-sm text-muted-foreground">Generating QR code...</div>
              </div>
            )}
            {qrError && (
              <div className="absolute inset-0 flex flex-col items-center justify-center bg-background/80 rounded-lg p-4 text-center">
                <AlertCircle className="h-6 w-6 text-destructive mb-2" />
                <div className="text-sm text-destructive">
                  QR code unavailable
                </div>
                <div className="text-xs text-muted-foreground mt-1">
                  Use "Copy Link" below
                </div>
              </div>
            )}
            <canvas
              ref={canvasRef}
              className="max-w-full"
              style={{ imageRendering: 'pixelated' }}
            />
          </div>

          {/* Scanning tip */}
          {qrReady && (
            <div className="w-full bg-muted/50 rounded-lg p-3 text-xs text-muted-foreground text-center">
              <strong>Tip:</strong> If your camera doesn't recognize the QR code, try adjusting the distance or lighting. You can also use the "Copy Link" button below to share manually.
            </div>
          )}

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
          <div className="w-full grid grid-cols-2 gap-2">
            <Button
              variant="outline"
              onClick={handleQuickShare}
              disabled={isSharing || !shareUrl}
              className="gap-2"
            >
              <Share2 className="h-4 w-4" />
              {isSharing ? 'Sharing...' : 'Quick Share'}
            </Button>
            <Button
              variant="outline"
              onClick={handleDownloadQR}
              disabled={!qrReady}
              className="gap-2"
            >
              <Download className="h-4 w-4" />
              Download QR
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
                disabled={!qrReady}
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
