import { useState, useEffect, useRef, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Download, Copy, ArrowLeft } from 'lucide-react';
import { toast } from 'sonner';
import { getShareUrl } from '@/lib/shareUrl';
import { exportFlyerAsPNG } from '@/lib/flyerExport';
import { useNavigate, useSearch } from '@tanstack/react-router';
import FlyerPreview from '@/components/share/FlyerPreview';
import { clearUrlParam } from '@/lib/urlParams';
import { useQrCodeCanvas } from '@/hooks/useQrCodeCanvas';
import { copyToClipboard } from '@/lib/clipboard';

export default function FlyerPage() {
  const [shareUrl, setShareUrl] = useState('');
  const [isExporting, setIsExporting] = useState(false);
  const [qrCanvasElement, setQrCanvasElement] = useState<HTMLCanvasElement | null>(null);
  const flyerRef = useRef<HTMLDivElement>(null);
  const autoExportAttemptedRef = useRef(false);
  const navigate = useNavigate();
  const search = useSearch({ from: '/flyer' });

  // Callback ref to capture QR canvas element when it mounts
  const qrCanvasRef = useCallback((node: HTMLCanvasElement | null) => {
    setQrCanvasElement(node);
  }, []);

  // Set share URL on mount
  useEffect(() => {
    const url = getShareUrl();
    setShareUrl(url);
  }, []);

  // Generate QR code using the hook with mount-aware canvas
  const { qrReady, qrError, status } = useQrCodeCanvas({
    canvas: qrCanvasElement,
    text: shareUrl,
    size: 300,
    margin: 4,
  });

  // Show error toast if QR generation fails
  useEffect(() => {
    if (qrError) {
      toast.error('Failed to generate QR code. You can still copy the link below.');
    }
  }, [qrError]);

  // Auto-export effect
  useEffect(() => {
    const shouldAutoExport = search?.autoExportFlyer === '1';
    
    if (shouldAutoExport && !autoExportAttemptedRef.current && qrReady) {
      autoExportAttemptedRef.current = true;
      
      console.log('[FlyerPage] Auto-export triggered');
      
      // Wait for layout stability and next frame
      const timer = setTimeout(async () => {
        if (!flyerRef.current || !qrCanvasElement) {
          console.error('[FlyerPage] Auto-export failed: refs not ready');
          toast.error('Flyer not ready for download. Please wait and try again.');
          clearUrlParam('autoExportFlyer');
          return;
        }

        setIsExporting(true);
        try {
          console.log('[FlyerPage] Starting auto-export...');
          await exportFlyerAsPNG(flyerRef.current, qrCanvasElement, 'my-brothers-keeper-flyer.png');
          toast.success('Flyer downloaded successfully');
          console.log('[FlyerPage] Auto-export completed');
        } catch (error) {
          console.error('[FlyerPage] Auto-export error:', error);
          const errorMessage = error instanceof Error ? error.message : 'Unknown error';
          toast.error(`Failed to download flyer: ${errorMessage}`);
        } finally {
          setIsExporting(false);
          clearUrlParam('autoExportFlyer');
        }
      }, 200); // Increased delay for better stability

      return () => clearTimeout(timer);
    }
  }, [search, qrReady, qrCanvasElement]);

  const handleCopyLink = async () => {
    const success = await copyToClipboard(shareUrl);
    if (success) {
      toast.success('Link copied to clipboard');
    } else {
      toast.error('Failed to copy link. Please manually select and copy the link from the App Link field below.');
    }
  };

  const handleDownloadFlyer = async () => {
    if (!flyerRef.current || !qrCanvasElement) {
      toast.error('Flyer not ready. Please wait a moment and try again.');
      return;
    }

    if (!qrReady) {
      toast.error('QR code is still generating. Please wait a moment and try again.');
      return;
    }

    console.log('[FlyerPage] Manual download triggered');
    setIsExporting(true);
    try {
      await exportFlyerAsPNG(flyerRef.current, qrCanvasElement, 'my-brothers-keeper-flyer.png');
      toast.success('Flyer downloaded successfully');
      console.log('[FlyerPage] Manual download completed');
    } catch (error) {
      console.error('[FlyerPage] Manual download error:', error);
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      toast.error(errorMessage);
    } finally {
      setIsExporting(false);
    }
  };

  const isGenerating = status === 'generating';

  return (
    <div className="container max-w-4xl mx-auto py-8 space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <Button
          variant="ghost"
          onClick={() => navigate({ to: '/' })}
          className="gap-2"
        >
          <ArrowLeft className="h-4 w-4" />
          Back
        </Button>
        <h1 className="text-2xl font-bold">Shareable Flyer</h1>
        <div className="w-20" /> {/* Spacer for centering */}
      </div>

      {/* Flyer Preview */}
      <Card className="overflow-hidden">
        <CardContent className="p-0">
          <FlyerPreview
            ref={flyerRef}
            qrCanvasRef={qrCanvasRef}
            shareUrl={shareUrl}
            isGenerating={isGenerating}
            qrError={qrError}
          />
        </CardContent>
      </Card>

      {/* Actions */}
      <div className="space-y-4">
        <div className="space-y-2">
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

        <Button
          className="w-full"
          size="lg"
          onClick={handleDownloadFlyer}
          disabled={isExporting || !qrReady}
        >
          <Download className="mr-2 h-5 w-5" />
          {isExporting ? 'Downloading...' : 'Download Flyer'}
        </Button>

        {isGenerating && (
          <p className="text-sm text-muted-foreground text-center">
            Generating QR code... Please wait.
          </p>
        )}

        {qrError && (
          <p className="text-sm text-destructive text-center">
            QR code generation failed. You can still copy the link above to share.
          </p>
        )}
      </div>
    </div>
  );
}
