import { useEffect, useState } from 'react';
import { useNavigate } from '@tanstack/react-router';
import { MapPin, Shield, Users, AlertTriangle, Route, ShieldCheck, KeyRound } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useInternetIdentity } from '../hooks/useInternetIdentity';
import AdminAccessDialog from '../components/auth/AdminAccessDialog';

export default function LandingPage() {
  const navigate = useNavigate();
  const { identity } = useInternetIdentity();
  const [adminAccessOpen, setAdminAccessOpen] = useState(false);

  useEffect(() => {
    if (identity) {
      navigate({ to: '/places' });
    }
  }, [identity, navigate]);

  const features = [
    {
      icon: MapPin,
      title: 'Safe Places Directory',
      description: 'Discover and share trusted stops — hotels, restaurants, mechanics, and more vetted by the community.',
    },
    {
      icon: Route,
      title: 'Route Sharing',
      description: 'Share your planned routes with fellow riders so others know your path and can coordinate meetups.',
    },
    {
      icon: Users,
      title: 'Meetup Coordination',
      description: 'Share your real-time location with trusted riders for easy meetup coordination on the road.',
    },
    {
      icon: AlertTriangle,
      title: 'Emergency SOS',
      description: 'One-tap emergency snapshot shares your location. Trusted contacts can look you up anytime.',
    },
    {
      icon: Shield,
      title: 'Verified Members',
      description: 'Upload your trucking license and ID for community verification and trusted status.',
    },
    {
      icon: ShieldCheck,
      title: 'Community Safety',
      description: 'Built on the Internet Computer for decentralized, censorship-resistant safety infrastructure.',
    },
  ];

  return (
    <div className="flex flex-col min-h-screen">
      {/* Hero Section */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 z-0">
          <img
            src="/assets/generated/mbk-hero.dim_1600x600.png"
            alt="MBK Riders Hero"
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-background/75" />
        </div>

        <div className="relative z-10 container mx-auto px-4 py-20 md:py-32 text-center">
          <div className="flex justify-center mb-6">
            <img
              src="/assets/generated/mbk-logo.dim_512x512.png"
              alt="MBK Logo"
              className="h-20 w-20 rounded-2xl shadow-lg"
            />
          </div>

          <h1 className="text-4xl md:text-6xl font-extrabold tracking-tight text-foreground mb-4">
            MBK Riders
          </h1>
          <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto mb-8">
            The community safety network for long-haul truckers and riders. Stay connected, stay safe, and help each other on the road.
          </p>

          <div className="flex flex-col sm:flex-row gap-3 justify-center items-center">
            <Button
              size="lg"
              onClick={() => navigate({ to: '/places' })}
              className="w-full sm:w-auto px-8"
            >
              Explore Safe Places
            </Button>
            <Button
              size="lg"
              variant="outline"
              onClick={() => navigate({ to: '/emergency-lookup' })}
              className="w-full sm:w-auto px-8 border-destructive text-destructive hover:bg-destructive/10"
            >
              <AlertTriangle className="mr-2 h-4 w-4" />
              Emergency Lookup
            </Button>
          </div>

          {/* Admin Access Entry Point */}
          <div className="mt-6">
            <button
              onClick={() => setAdminAccessOpen(true)}
              className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors underline-offset-4 hover:underline"
            >
              <KeyRound className="h-3.5 w-3.5" />
              Have an admin token? Click here
            </button>
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section className="container mx-auto px-4 py-16">
        <h2 className="text-2xl md:text-3xl font-bold text-center text-foreground mb-10">
          Everything you need on the road
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((feature) => (
            <div
              key={feature.title}
              className="rounded-xl border border-border bg-card p-6 hover:shadow-md transition-shadow"
            >
              <div className="flex items-center gap-3 mb-3">
                <div className="rounded-lg bg-primary/10 p-2">
                  <feature.icon className="h-5 w-5 text-primary" />
                </div>
                <h3 className="font-semibold text-foreground">{feature.title}</h3>
              </div>
              <p className="text-sm text-muted-foreground leading-relaxed">{feature.description}</p>
            </div>
          ))}
        </div>
      </section>

      {/* CTA Section */}
      <section className="bg-primary/5 border-t border-border">
        <div className="container mx-auto px-4 py-16 text-center">
          <h2 className="text-2xl md:text-3xl font-bold text-foreground mb-4">
            Join the MBK Community
          </h2>
          <p className="text-muted-foreground max-w-xl mx-auto mb-8">
            Sign in to access all features — share routes, coordinate meetups, and keep your emergency profile up to date.
          </p>
          <Button size="lg" onClick={() => navigate({ to: '/places' })} className="px-10">
            Get Started
          </Button>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border bg-background">
        <div className="container mx-auto px-4 py-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-sm text-muted-foreground">
          <div className="flex items-center gap-2">
            <img
              src="/assets/generated/mbk-logo.dim_512x512.png"
              alt="MBK"
              className="h-5 w-5 rounded"
            />
            <span>© {new Date().getFullYear()} MBK Riders. All rights reserved.</span>
          </div>
          <a
            href={`https://caffeine.ai/?utm_source=Caffeine-footer&utm_medium=referral&utm_content=${encodeURIComponent(window.location.hostname)}`}
            target="_blank"
            rel="noopener noreferrer"
            className="hover:text-foreground transition-colors"
          >
            Built with ❤️ using caffeine.ai
          </a>
        </div>
      </footer>

      <AdminAccessDialog open={adminAccessOpen} onOpenChange={setAdminAccessOpen} />
    </div>
  );
}
