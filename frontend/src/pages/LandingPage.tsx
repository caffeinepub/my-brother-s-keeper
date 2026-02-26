import { useInternetIdentity } from '../hooks/useInternetIdentity';
import { useNavigate } from '@tanstack/react-router';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { MapPin, Route, Heart, AlertTriangle, Shield, Users } from 'lucide-react';
import { useEffect } from 'react';

export default function LandingPage() {
    const { identity } = useInternetIdentity();
    const navigate = useNavigate();

    useEffect(() => {
        if (identity) {
            navigate({ to: '/places' });
        }
    }, [identity, navigate]);

    const features = [
        {
            icon: MapPin,
            title: 'Safe Places Directory',
            description: 'Find trusted hotels, restaurants, mechanics, gas stations, and shops recommended by fellow truckers.'
        },
        {
            icon: Route,
            title: 'Route Sharing',
            description: 'Share your planned routes with other drivers and stay connected on the road.'
        },
        {
            icon: Heart,
            title: 'Emergency Profile',
            description: 'Store next of kin and health information securely for emergency situations.'
        },
        {
            icon: AlertTriangle,
            title: 'SOS Location',
            description: 'Capture and share your location snapshot in case of emergency.'
        },
        {
            icon: Shield,
            title: 'Verified Community',
            description: 'All members verify their identity and trucking license for a trusted network.'
        },
        {
            icon: Users,
            title: 'Built by Truckers, for Truckers',
            description: 'A community-driven platform designed with your safety and needs in mind.'
        }
    ];

    return (
        <div className="space-y-12">
            {/* Hero Section */}
            <section className="text-center space-y-6 py-12">
                <div className="flex items-center justify-center mb-6">
                    <div className="flex items-center justify-center h-20 w-20 rounded-2xl bg-primary text-primary-foreground">
                        <Shield className="h-12 w-12" />
                    </div>
                </div>
                <h1 className="text-4xl md:text-6xl font-bold tracking-tight">
                    My Brother's Keeper
                </h1>
                <p className="text-xl md:text-2xl text-muted-foreground max-w-2xl mx-auto">
                    A safety network for truck drivers. Share routes, find safe places, and stay protected on the road.
                </p>
                <div className="flex gap-4 justify-center pt-4">
                    <Button size="lg" onClick={() => navigate({ to: '/emergency-lookup' })} variant="outline">
                        Emergency Lookup
                    </Button>
                </div>
            </section>

            {/* Features Grid */}
            <section className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {features.map((feature) => {
                    const Icon = feature.icon;
                    return (
                        <Card key={feature.title}>
                            <CardHeader>
                                <div className="flex items-center gap-3">
                                    <div className="flex items-center justify-center h-10 w-10 rounded-lg bg-primary/10 text-primary">
                                        <Icon className="h-5 w-5" />
                                    </div>
                                    <CardTitle className="text-lg">{feature.title}</CardTitle>
                                </div>
                            </CardHeader>
                            <CardContent>
                                <CardDescription>{feature.description}</CardDescription>
                            </CardContent>
                        </Card>
                    );
                })}
            </section>

            {/* CTA Section */}
            <section className="text-center space-y-4 py-12">
                <h2 className="text-3xl font-bold">Ready to join the network?</h2>
                <p className="text-muted-foreground max-w-xl mx-auto">
                    Login with Internet Identity to access the full platform and connect with fellow truckers.
                </p>
            </section>
        </div>
    );
}
