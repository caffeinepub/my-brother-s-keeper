import { useState } from 'react';
import { toast } from 'sonner';
import { Copy, Key, Loader2, RefreshCw, CheckCircle } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useGenerateAdminToken } from '../../hooks/useQueries';
import { copyToClipboard } from '../../lib/clipboard';

export default function GenerateAdminTokenCard() {
  const [generatedToken, setGeneratedToken] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const generateMutation = useGenerateAdminToken();

  const handleGenerate = async () => {
    try {
      const token = await generateMutation.mutateAsync();
      setGeneratedToken(token);
      setCopied(false);
      toast.success('Admin token generated', {
        description: 'Share this token with the user you want to promote to admin. It expires in 3 days.',
      });
    } catch (err: any) {
      toast.error('Failed to generate token', {
        description: err?.message ?? 'An unexpected error occurred.',
      });
    }
  };

  const handleCopy = async () => {
    if (!generatedToken) return;
    const success = await copyToClipboard(generatedToken);
    if (success) {
      setCopied(true);
      toast.success('Token copied to clipboard');
      setTimeout(() => setCopied(false), 2500);
    } else {
      toast.error('Could not copy to clipboard', {
        description: 'Please copy the token manually.',
      });
    }
  };

  return (
    <Card className="border-primary/20 bg-primary/5">
      <CardHeader className="pb-3">
        <div className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/15">
            <Key className="h-4 w-4 text-primary" />
          </div>
          <div>
            <CardTitle className="text-base">Generate Admin Token</CardTitle>
            <CardDescription className="text-xs">
              Create a one-time token to promote another user to admin. Valid for 3 days.
            </CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        {generatedToken ? (
          <div className="space-y-2">
            <Label htmlFor="admin-token-output" className="text-xs font-medium">
              Generated Token
            </Label>
            <div className="flex gap-2">
              <Input
                id="admin-token-output"
                readOnly
                value={generatedToken}
                className="font-mono text-xs"
                onFocus={(e) => e.target.select()}
              />
              <Button
                size="icon"
                variant="outline"
                onClick={handleCopy}
                title="Copy token"
                className="shrink-0"
              >
                {copied ? (
                  <CheckCircle className="h-4 w-4 text-green-600" />
                ) : (
                  <Copy className="h-4 w-4" />
                )}
              </Button>
            </div>
            <p className="text-xs text-muted-foreground">
              Share this token with the user. It can only be used once and expires in 3 days.
            </p>
            <Button
              size="sm"
              variant="outline"
              onClick={handleGenerate}
              disabled={generateMutation.isPending}
              className="w-full gap-1"
            >
              {generateMutation.isPending ? (
                <Loader2 className="h-3 w-3 animate-spin" />
              ) : (
                <RefreshCw className="h-3 w-3" />
              )}
              Generate New Token
            </Button>
          </div>
        ) : (
          <Button
            onClick={handleGenerate}
            disabled={generateMutation.isPending}
            className="w-full gap-2"
          >
            {generateMutation.isPending ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Generating…
              </>
            ) : (
              <>
                <Key className="h-4 w-4" />
                Generate Admin Token
              </>
            )}
          </Button>
        )}
      </CardContent>
    </Card>
  );
}
