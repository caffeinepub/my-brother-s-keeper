import { useState, useEffect, useRef } from 'react';
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
import { generateQRCode } from '@/lib/qr';
import { downloadCanvasAsPNG } from '@/lib/qrDownload';
import { quickShare } from '@/lib/quickShare';
import { useNavigate } from '@tanstack/react-router';

interface ShareDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export default function ShareDialog({ open, onOpenChange }: ShareDialogProps) {
  const [shareUrl, setShareUrl] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [isSharing, setIsSharing] = useState(false);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const navigate = useNavigate();

  useEffect(() => {
    if (open) {
      const url = getShareUrl();
      setShareUrl(url);

      // Generate QR code when dialog opens
      if (canvasRef.current) {
        setIsGenerating(true);
        generateQRCode(url, canvasRef.current, 256)
          .catch((error) => {
            console.error('QR generation error:', error);
            toast.error('Failed to generate QR code');
          })
          .finally(() => {
            setIsGenerating(false);
          });
      }
    }
  }, [open]);

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(shareUrl);
      toast.success('Link copied to clipboard');
    } catch (error) {
      console.error('Copy error:', error);
      toast.error('Failed to copy link');
    }
  };

  const handleQuickShare = async () => {
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
        case 'error':
          toast.error(result.message);
          break;
      }
    } catch (error) {
      console.error('Quick share error:', error);
      toast.error('Failed to share');
    } finally {
      setIsSharing(false);
    }
  };

  const handleDownloadQR = async () => {
    if (!canvasRef.current) {
      toast.error('QR code not ready');
      return;
    }

    try {
      await downloadCanvasAsPNG(canvasRef.current, 'my-brothers-keeper-qr.png');
      toast.success('QR code downloaded');
    } catch (error) {
      console.error('Download error:', error);
      toast.error('Failed to download QR code');
    }
  };

  const handleViewFlyer = () => {
    onOpenChange(false);
    navigate({ to: '/flyer' });
  };

  const handleDownloadFlyer = () => {
    if (isGenerating) {
      toast.error('Please wait for QR code to finish generating');
      return;
    }
    
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
            Share this app with drivers and subscribers. Scan the QR code or copy the link below.
          </DialogDescription>
        </DialogHeader>

        <div className="flex flex-col items-center gap-6 py-4">
          {/* QR Code */}
          <div className="relative flex items-center justify-center rounded-lg border-2 border-border bg-white p-4">
            {isGenerating && (
              <div className="absolute inset-0 flex items-center justify-center bg-background/80 rounded-lg">
                <div className="text-sm text-muted-foreground">Generating...</div>
              </div>
            )}
            <canvas
              ref={canvasRef}
              className="max-w-full"
              style={{ imageRendering: 'pixelated' }}
            />
          </div>

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

          {/* Actions */}
          <div className="flex w-full flex-col gap-2">
            <Button
              variant="default"
              className="w-full"
              onClick={handleQuickShare}
              disabled={isSharing}
            >
              <Share2 className="mr-2 h-4 w-4" />
              {isSharing ? 'Sharing...' : 'Quick Share'}
            </Button>

            <Button
              variant="secondary"
              className="w-full"
              onClick={handleDownloadFlyer}
              disabled={isGenerating}
            >
              <Download className="mr-2 h-4 w-4" />
              Download Flyer
            </Button>
            
            <div className="flex gap-2">
              <Button
                variant="outline"
                className="flex-1"
                onClick={handleDownloadQR}
                disabled={isGenerating}
              >
                <Download className="mr-2 h-4 w-4" />
                Download QR
              </Button>
              <Button
                variant="outline"
                className="flex-1"
                onClick={handleCopyLink}
              >
                <Copy className="mr-2 h-4 w-4" />
                Copy Link
              </Button>
            </div>
            
            <Button
              variant="outline"
              className="w-full"
              onClick={handleViewFlyer}
            >
              <FileText className="mr-2 h-4 w-4" />
              View Flyer
            </Button>
          </div>

          <p className="text-xs text-muted-foreground text-center">
            Share responsibly. This link provides access to the trucker safety network.
          </p>
        </div>
      </DialogContent>
    </Dialog>
  );
}
