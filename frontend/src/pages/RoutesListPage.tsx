import { useState } from 'react';
import { useInternetIdentity } from '../hooks/useInternetIdentity';
import { useGetRoutes } from '../hooks/useQueries';
import { parsePrincipal } from '../lib/principal';
import { formatDateTime } from '../lib/time';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Skeleton } from '@/components/ui/skeleton';
import { MapPin, Calendar, Search, Plus, ChevronRight } from 'lucide-react';
import { Route as RouteIcon } from 'lucide-react';
import { useNavigate } from '@tanstack/react-router';
import type { Route as RouteType } from '../backend';
import { Principal } from '@dfinity/principal';

function RouteCard({ route }: { route: RouteType }) {
  return (
    <Card className="transition-shadow hover:shadow-md">
      <CardContent className="p-4">
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2">
              <MapPin className="h-4 w-4 shrink-0 text-primary" />
              <span className="truncate font-medium">{route.start}</span>
              <ChevronRight className="h-4 w-4 shrink-0 text-muted-foreground" />
              <span className="truncate font-medium">{route.destination}</span>
            </div>
            {route.waypoints.length > 0 && (
              <p className="mt-1 text-sm text-muted-foreground">
                Via: {route.waypoints.join(' → ')}
              </p>
            )}
            <div className="mt-2 flex items-center gap-1 text-sm text-muted-foreground">
              <Calendar className="h-3 w-3" />
              <span>{formatDateTime(route.dateTime)}</span>
            </div>
            {route.notes && (
              <p className="mt-2 text-sm text-muted-foreground">{route.notes}</p>
            )}
          </div>
          <Badge variant="outline" className="shrink-0">
            {route.waypoints.length} stops
          </Badge>
        </div>
      </CardContent>
    </Card>
  );
}

function MyRoutes() {
  const { identity } = useInternetIdentity();
  const navigate = useNavigate();

  const myPrincipal = identity ? identity.getPrincipal() : null;
  const { data: routes, isLoading, error } = useGetRoutes(myPrincipal);

  if (!identity) {
    return (
      <Alert>
        <AlertDescription>Please log in to view your routes.</AlertDescription>
      </Alert>
    );
  }

  if (isLoading) {
    return (
      <div className="space-y-3">
        {[1, 2, 3].map((i) => (
          <Skeleton key={i} className="h-24 w-full" />
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <Alert variant="destructive">
        <AlertDescription>Failed to load routes. Please try again.</AlertDescription>
      </Alert>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">
          {routes?.length ?? 0} route{routes?.length !== 1 ? 's' : ''} shared
        </p>
        <Button size="sm" onClick={() => navigate({ to: '/routes/add' })}>
          <Plus className="mr-1 h-4 w-4" />
          Add Route
        </Button>
      </div>

      {!routes || routes.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <RouteIcon className="mx-auto mb-4 h-12 w-12 text-muted-foreground/50" />
            <p className="font-medium text-muted-foreground">No routes shared yet</p>
            <p className="mt-1 text-sm text-muted-foreground">
              Share your planned routes to help other drivers stay safe.
            </p>
            <Button className="mt-4" onClick={() => navigate({ to: '/routes/add' })}>
              Share Your First Route
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {routes.map((route, idx) => (
            <RouteCard key={idx} route={route} />
          ))}
        </div>
      )}
    </div>
  );
}

function SearchRoutes() {
  const [searchPrincipalId, setSearchPrincipalId] = useState('');
  const [submittedPrincipal, setSubmittedPrincipal] = useState<Principal | null>(null);
  const [inputError, setInputError] = useState<string | null>(null);

  const { data: routes, isLoading, error } = useGetRoutes(submittedPrincipal);

  const handleSearch = () => {
    setInputError(null);
    const principal = parsePrincipal(searchPrincipalId.trim());
    if (!principal) {
      setInputError('Invalid Principal ID format. Please check and try again.');
      return;
    }
    setSubmittedPrincipal(principal);
  };

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Search by Principal ID</CardTitle>
          <CardDescription>
            Enter another driver's Principal ID to view their shared routes.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="space-y-2">
            <Label htmlFor="searchPrincipal">Driver's Principal ID</Label>
            <Input
              id="searchPrincipal"
              type="text"
              placeholder="e.g. 2yscf-yuwfq-41ml4-t6ujy-r3ogj-..."
              value={searchPrincipalId}
              onChange={(e) => setSearchPrincipalId(e.target.value)}
              className="font-mono text-sm"
              autoComplete="off"
              autoCorrect="off"
              autoCapitalize="off"
              spellCheck={false}
              onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
            />
          </div>
          {inputError && (
            <Alert variant="destructive">
              <AlertDescription>{inputError}</AlertDescription>
            </Alert>
          )}
          <Button
            onClick={handleSearch}
            disabled={isLoading || !searchPrincipalId.trim()}
            className="w-full"
          >
            {isLoading ? (
              <>
                <Search className="mr-2 h-4 w-4 animate-spin" />
                Searching...
              </>
            ) : (
              <>
                <Search className="mr-2 h-4 w-4" />
                Search Routes
              </>
            )}
          </Button>
        </CardContent>
      </Card>

      {error && submittedPrincipal && (
        <Alert variant="destructive">
          <AlertDescription>Failed to load routes. Please try again.</AlertDescription>
        </Alert>
      )}

      {routes && submittedPrincipal && (
        <div className="space-y-3">
          <p className="text-sm text-muted-foreground">
            {routes.length} route{routes.length !== 1 ? 's' : ''} found
          </p>
          {routes.length === 0 ? (
            <Card>
              <CardContent className="py-8 text-center">
                <p className="text-muted-foreground">No routes found for this driver.</p>
              </CardContent>
            </Card>
          ) : (
            routes.map((route, idx) => <RouteCard key={idx} route={route} />)
          )}
        </div>
      )}
    </div>
  );
}

export default function RoutesListPage() {
  return (
    <div className="container mx-auto max-w-2xl px-4 py-8">
      <div className="mb-6">
        <h1 className="text-3xl font-bold">Routes</h1>
        <p className="mt-1 text-muted-foreground">
          Share your planned routes and discover routes from other drivers.
        </p>
      </div>

      <Tabs defaultValue="my-routes">
        <TabsList className="mb-6 w-full">
          <TabsTrigger value="my-routes" className="flex-1">
            My Routes
          </TabsTrigger>
          <TabsTrigger value="search" className="flex-1">
            Search Routes
          </TabsTrigger>
        </TabsList>
        <TabsContent value="my-routes">
          <MyRoutes />
        </TabsContent>
        <TabsContent value="search">
          <SearchRoutes />
        </TabsContent>
      </Tabs>
    </div>
  );
}
