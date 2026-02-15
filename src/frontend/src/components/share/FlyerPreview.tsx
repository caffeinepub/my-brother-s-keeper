import { forwardRef } from 'react';
import { Shield } from 'lucide-react';

interface FlyerPreviewProps {
  qrCanvasRef: (node: HTMLCanvasElement | null) => void;
  shareUrl: string;
  isGenerating: boolean;
  qrError?: string | null;
}

const FlyerPreview = forwardRef<HTMLDivElement, FlyerPreviewProps>(
  ({ qrCanvasRef, shareUrl, isGenerating, qrError }, ref) => {
    return (
      <div
        ref={ref}
        className="bg-gradient-to-br from-background via-background to-primary/5 p-8 md:p-12 space-y-8"
      >
        {/* Header */}
        <div className="text-center space-y-4">
          <div className="flex items-center justify-center">
            <div className="flex items-center justify-center h-20 w-20 rounded-2xl bg-primary text-primary-foreground">
              <Shield className="h-12 w-12" />
            </div>
          </div>
          <h1 className="text-4xl md:text-5xl font-bold tracking-tight">
            My Brother's Keeper
          </h1>
          <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto">
            A Safety Network for Truck Drivers
          </p>
        </div>

        {/* Introduction */}
        <div className="bg-card border border-border rounded-lg p-6 space-y-4 max-w-2xl mx-auto">
          <h2 className="text-2xl font-semibold text-center">Stay Safe on the Road</h2>
          <div className="space-y-3 text-muted-foreground">
            <p>
              <strong className="text-foreground">My Brother's Keeper</strong> is a community-driven platform designed to keep truck drivers safe and connected.
            </p>
            <ul className="space-y-2 list-disc list-inside">
              <li>Find trusted safe places recommended by fellow truckers</li>
              <li>Share your routes and stay connected with other drivers</li>
              <li>Store emergency contact information securely</li>
              <li>Access SOS features when you need help</li>
            </ul>
            <p className="text-sm pt-2">
              Join a verified community built by truckers, for truckers. Your safety is our priority.
            </p>
          </div>
        </div>

        {/* QR Code Section */}
        <div className="space-y-4">
          <div className="text-center">
            <h3 className="text-xl font-semibold mb-2">Scan to Join</h3>
            <p className="text-sm text-muted-foreground">
              Scan this QR code with your phone to access the platform
            </p>
          </div>
          
          <div className="flex justify-center">
            <div className="relative inline-block rounded-xl border-4 border-border bg-white p-6 shadow-lg">
              {isGenerating && (
                <div className="absolute inset-0 flex items-center justify-center bg-background/80 rounded-xl">
                  <div className="text-sm text-muted-foreground">Generating QR code...</div>
                </div>
              )}
              {qrError && (
                <div className="absolute inset-0 flex items-center justify-center bg-background/80 rounded-xl">
                  <div className="text-sm text-destructive px-4 text-center">
                    QR code unavailable
                  </div>
                </div>
              )}
              <canvas
                ref={qrCanvasRef}
                className="max-w-full"
                style={{ imageRendering: 'pixelated' }}
              />
            </div>
          </div>

          {/* URL Display */}
          <div className="text-center space-y-2">
            <p className="text-xs text-muted-foreground uppercase tracking-wide">
              Or visit directly:
            </p>
            <p className="font-mono text-sm md:text-base font-semibold text-primary break-all px-4">
              {shareUrl}
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="text-center text-xs text-muted-foreground pt-4 border-t border-border">
          <p>Built with care for the trucking community</p>
        </div>
      </div>
    );
  }
);

FlyerPreview.displayName = 'FlyerPreview';

export default FlyerPreview;
