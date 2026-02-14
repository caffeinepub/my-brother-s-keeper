import { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Download, Copy, ArrowLeft } from 'lucide-react';
import { toast } from 'sonner';
import { getShareUrl } from '@/lib/shareUrl';
import { generateQRCode } from '@/lib/qr';
import { exportFlyerAsPNG } from '@/lib/flyerExport';
import { useNavigate, useSearch } from '@tanstack/react-router';
import FlyerPreview from '@/components/share/FlyerPreview';
import { clearUrlParam } from '@/lib/urlParams';

export default function FlyerPage() {
  const [shareUrl, setShareUrl] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const qrCanvasRef = useRef<HTMLCanvasElement>(null);
  const flyerRef = useRef<HTMLDivElement>(null);
  const autoExportAttemptedRef = useRef(false);
  const navigate = useNavigate();
  const search = useSearch({ from: '/flyer' });

  useEffect(() => {
    const url = getShareUrl();
    setShareUrl(url);

    // Generate QR code when page loads
    if (qrCanvasRef.current) {
      setIsGenerating(true);
      generateQRCode(url, qrCanvasRef.current, 300)
        .catch((error) => {
          console.error('QR generation error:', error);
          toast.error('Failed to generate QR code');
        })
        .finally(() => {
          setIsGenerating(false);
        });
    }
  }, []);

  // Auto-export effect
  useEffect(() => {
    const shouldAutoExport = search?.autoExportFlyer === '1';
    
    if (shouldAutoExport && !autoExportAttemptedRef.current && !isGenerating) {
      autoExportAttemptedRef.current = true;
      
      // Wait a brief moment to ensure refs are ready
      const timer = setTimeout(async () => {
        if (!flyerRef.current || !qrCanvasRef.current) {
          toast.error('Flyer not ready for download');
          clearUrlParam('autoExportFlyer');
          return;
        }

        setIsExporting(true);
        try {
          await exportFlyerAsPNG(flyerRef.current, qrCanvasRef.current, 'my-brothers-keeper-flyer.png');
          toast.success('Flyer downloaded successfully');
        } catch (error) {
          console.error('Auto-export error:', error);
          toast.error('Failed to download flyer. Please try again.');
        } finally {
          setIsExporting(false);
          clearUrlParam('autoExportFlyer');
        }
      }, 100);

      return () => clearTimeout(timer);
    }
  }, [search, isGenerating]);

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(shareUrl);
      toast.success('Link copied to clipboard');
    } catch (error) {
      console.error('Copy error:', error);
      toast.error('Failed to copy link');
    }
  };

  const handleDownloadFlyer = async () => {
    if (!flyerRef.current || !qrCanvasRef.current) {
      toast.error('Flyer not ready');
      return;
    }

    if (isGenerating) {
      toast.error('Please wait for QR code to finish generating');
      return;
    }

    setIsExporting(true);
    try {
      await exportFlyerAsPNG(flyerRef.current, qrCanvasRef.current, 'my-brothers-keeper-flyer.png');
      toast.success('Flyer downloaded successfully');
    } catch (error) {
      console.error('Export error:', error);
      toast.error('Failed to download flyer. Please try again.');
    } finally {
      setIsExporting(false);
    }
  };

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
          disabled={isGenerating || isExporting}
        >
          <Download className="mr-2 h-4 w-4" />
          {isExporting ? 'Downloading...' : 'Download Flyer as PNG'}
        </Button>

        <p className="text-xs text-muted-foreground text-center">
          Download and share this flyer to help spread awareness about the trucker safety network.
        </p>
      </div>
    </div>
  );
}
