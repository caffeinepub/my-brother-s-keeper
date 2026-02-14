import { useState } from 'react';
import { useNavigate } from '@tanstack/react-router';
import { useInternetIdentity } from '../hooks/useInternetIdentity';
import { useGetRoutes } from '../hooks/useQueries';
import { formatDateTime } from '../lib/time';
import AuthenticatedRouteGuard from '../components/auth/AuthenticatedRouteGuard';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Plus, Route as RouteIcon, ArrowRight } from 'lucide-react';
import { toast } from 'sonner';

export default function RoutesListPage() {
    const navigate = useNavigate();
    const { identity } = useInternetIdentity();
    const [lookupPrincipal, setLookupPrincipal] = useState('');
    const [searchPrincipal, setSearchPrincipal] = useState<string | null>(null);

    const myPrincipal = identity?.getPrincipal().toString() || null;
    const { data: myRoutes = [], isLoading: myRoutesLoading } = useGetRoutes(myPrincipal);
    const { data: searchedRoutes = [], isLoading: searchLoading } = useGetRoutes(searchPrincipal);

    const handleSearch = () => {
        if (!lookupPrincipal.trim()) {
            toast.error('Please enter a Principal ID');
            return;
        }
        setSearchPrincipal(lookupPrincipal.trim());
    };

    return (
        <AuthenticatedRouteGuard>
            <div className="space-y-6">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-3xl font-bold">Routes</h1>
                        <p className="text-muted-foreground">Share and view planned routes</p>
                    </div>
                    <Button onClick={() => navigate({ to: '/routes/add' })} className="gap-2">
                        <Plus className="h-4 w-4" />
                        Add Route
                    </Button>
                </div>

                <Tabs defaultValue="my-routes">
                    <TabsList className="grid w-full max-w-md grid-cols-2">
                        <TabsTrigger value="my-routes">My Routes</TabsTrigger>
                        <TabsTrigger value="search">Search Routes</TabsTrigger>
                    </TabsList>

                    <TabsContent value="my-routes" className="space-y-4">
                        {myRoutesLoading ? (
                            <div className="text-center py-12">
                                <div className="mb-4 h-12 w-12 animate-spin rounded-full border-4 border-primary border-t-transparent mx-auto" />
                                <p className="text-muted-foreground">Loading routes...</p>
                            </div>
                        ) : myRoutes.length === 0 ? (
                            <Card>
                                <CardContent className="py-12 text-center">
                                    <RouteIcon className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                                    <p className="text-muted-foreground">No routes yet. Create your first route!</p>
                                </CardContent>
                            </Card>
                        ) : (
                            <div className="grid md:grid-cols-2 gap-4">
                                {myRoutes.map((route, index) => (
                                    <Card key={index} className="cursor-pointer hover:shadow-lg transition-shadow">
                                        <CardHeader>
                                            <CardTitle className="text-lg flex items-center gap-2">
                                                {route.start}
                                                <ArrowRight className="h-4 w-4 text-muted-foreground" />
                                                {route.destination}
                                            </CardTitle>
                                            <CardDescription>{formatDateTime(route.dateTime)}</CardDescription>
                                        </CardHeader>
                                        {route.notes && (
                                            <CardContent>
                                                <p className="text-sm text-muted-foreground line-clamp-2">{route.notes}</p>
                                            </CardContent>
                                        )}
                                    </Card>
                                ))}
                            </div>
                        )}
                    </TabsContent>

                    <TabsContent value="search" className="space-y-4">
                        <Card>
                            <CardHeader>
                                <CardTitle>Search Driver Routes</CardTitle>
                                <CardDescription>
                                    Enter a driver's Principal ID to view their shared routes
                                </CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="flex gap-2">
                                    <div className="flex-1 space-y-2">
                                        <Label htmlFor="principal">Principal ID</Label>
                                        <Input
                                            id="principal"
                                            value={lookupPrincipal}
                                            onChange={(e) => setLookupPrincipal(e.target.value)}
                                            placeholder="Enter Principal ID..."
                                        />
                                    </div>
                                    <Button onClick={handleSearch} className="mt-auto">
                                        Search
                                    </Button>
                                </div>

                                {searchLoading && (
                                    <div className="text-center py-8">
                                        <div className="mb-4 h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent mx-auto" />
                                    </div>
                                )}

                                {searchPrincipal && !searchLoading && (
                                    <div className="space-y-4">
                                        {searchedRoutes.length === 0 ? (
                                            <p className="text-center text-muted-foreground py-8">
                                                No routes found for this driver
                                            </p>
                                        ) : (
                                            <div className="grid gap-4">
                                                {searchedRoutes.map((route, index) => (
                                                    <Card key={index}>
                                                        <CardHeader>
                                                            <CardTitle className="text-lg flex items-center gap-2">
                                                                {route.start}
                                                                <ArrowRight className="h-4 w-4 text-muted-foreground" />
                                                                {route.destination}
                                                            </CardTitle>
                                                            <CardDescription>{formatDateTime(route.dateTime)}</CardDescription>
                                                        </CardHeader>
                                                        {route.notes && (
                                                            <CardContent>
                                                                <p className="text-sm text-muted-foreground">{route.notes}</p>
                                                            </CardContent>
                                                        )}
                                                    </Card>
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                )}
                            </CardContent>
                        </Card>
                    </TabsContent>
                </Tabs>
            </div>
        </AuthenticatedRouteGuard>
    );
}
