import { useState } from 'react';
import { useActor } from '../hooks/useActor';
import { parsePrincipal } from '../lib/principal';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Loader2, ShieldAlert, Search } from 'lucide-react';
import PublicSOSCardView from '../components/sos/PublicSOSCardView';
import LastKnownLocationCard from '../components/sos/LastKnownLocationCard';
import type { EmergencyLookupResult } from '../backend';

export default function EmergencyLookupPage() {
  const { actor } = useActor();
  const [principalId, setPrincipalId] = useState('');
  const [accessCode, setAccessCode] = useState('');
  const [result, setResult] = useState<EmergencyLookupResult | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [searched, setSearched] = useState(false);

  const handleLookup = async () => {
    if (!actor) return;
    setError(null);
    setResult(null);

    const principal = parsePrincipal(principalId.trim());
    if (!principal) {
      setError('Invalid Principal ID format. Please check and try again.');
      return;
    }

    if (!accessCode.trim()) {
      setError('Please enter the Emergency Access Code.');
      return;
    }

    setIsLoading(true);
    setSearched(true);
    try {
      const lookupResult = await actor.emergencyLookup(principal, accessCode.trim());
      setResult(lookupResult);
    } catch (err) {
      setError('An error occurred during lookup. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const hasValidResult =
    result &&
    (result.emergencyProfile !== undefined ||
      result.sosSnapshot !== undefined ||
      result.userName !== undefined);

  const isUnauthorized = searched && result && !hasValidResult && !isLoading;

  return (
    <div className="container mx-auto max-w-2xl px-4 py-8">
      <div className="mb-8 text-center">
        <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-destructive/10">
          <ShieldAlert className="h-8 w-8 text-destructive" />
        </div>
        <h1 className="text-3xl font-bold">Emergency Lookup</h1>
        <p className="mt-2 text-muted-foreground">
          Enter a driver's Principal ID and Emergency Access Code to view their emergency
          information snapshot.
        </p>
      </div>

      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Driver Lookup</CardTitle>
          <CardDescription>
            Both the Principal ID and Emergency Access Code are required. The driver must have
            shared these with you in advance.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="principalId">Principal ID</Label>
            <Input
              id="principalId"
              type="text"
              placeholder="e.g. 2yscf-yuwfq-41ml4-t6ujy-r3ogj-ajbkj-rmiih-uyk25-o34ky-6jpe6-gae"
              value={principalId}
              onChange={(e) => setPrincipalId(e.target.value)}
              className="font-mono text-sm"
              autoComplete="off"
              autoCorrect="off"
              autoCapitalize="off"
              spellCheck={false}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="accessCode">Emergency Access Code</Label>
            <Input
              id="accessCode"
              type="text"
              placeholder="Enter the emergency access code"
              value={accessCode}
              onChange={(e) => setAccessCode(e.target.value)}
              autoComplete="off"
            />
          </div>

          {error && (
            <Alert variant="destructive">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          <Button
            onClick={handleLookup}
            disabled={isLoading || !principalId.trim() || !accessCode.trim()}
            className="w-full"
          >
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Looking up...
              </>
            ) : (
              <>
                <Search className="mr-2 h-4 w-4" />
                Look Up Emergency Info
              </>
            )}
          </Button>
        </CardContent>
      </Card>

      {isUnauthorized && (
        <Alert variant="destructive">
          <ShieldAlert className="h-4 w-4" />
          <AlertDescription>
            Invalid credentials. Please check the Principal ID and Emergency Access Code and try
            again.
          </AlertDescription>
        </Alert>
      )}

      {result && hasValidResult && result.emergencyProfile && (
        <PublicSOSCardView
          emergencyProfile={result.emergencyProfile}
          sosSnapshot={result.sosSnapshot}
          userName={result.userName}
        />
      )}

      {result && hasValidResult && !result.emergencyProfile && result.sosSnapshot && (
        <LastKnownLocationCard sosSnapshot={result.sosSnapshot} />
      )}
    </div>
  );
}
