import { forwardRef } from 'react';
import { Shield } from 'lucide-react';

interface FlyerPreviewProps {
  shareUrl: string;
}

const FlyerPreview = forwardRef<HTMLDivElement, FlyerPreviewProps>(
  ({ shareUrl }, ref) => {
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
              My Brother's Keeper is a community-driven platform designed to keep truck drivers safe and connected.
            </p>
            <ul className="space-y-2 list-disc list-inside">
              <li>Find trusted safe places recommended by fellow truckers</li>
              <li>Share your routes and stay connected with other drivers</li>
              <li>Store emergency contact information securely</li>
              <li>Access SOS features when you need help</li>
            </ul>
            <p className="font-medium">
              Join a verified community built by truckers, for truckers. Your safety is our priority.
            </p>
          </div>
        </div>

        {/* Visit Section */}
        <div className="text-center space-y-4 max-w-2xl mx-auto">
          <h2 className="text-2xl font-semibold">Visit the Platform</h2>
          <p className="text-muted-foreground">
            Access the platform by visiting the link below:
          </p>
          <div className="bg-card border-2 border-primary/20 rounded-lg p-6">
            <p className="text-sm text-muted-foreground mb-2">APP LINK:</p>
            <p className="text-xl md:text-2xl font-bold text-primary break-all font-mono">
              {shareUrl}
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="text-center text-sm text-muted-foreground pt-4 border-t border-border">
          <p>Built with care for the trucking community</p>
        </div>
      </div>
    );
  }
);

FlyerPreview.displayName = 'FlyerPreview';

export default FlyerPreview;
