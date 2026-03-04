import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { AlertTriangle, Copy, Eye, EyeOff, Key, RefreshCw } from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { useInternetIdentity } from "../../hooks/useInternetIdentity";
import {
  clearAccessCode,
  generateAccessCode,
  getStoredAccessCode,
  storeAccessCode,
} from "../../lib/accessCode";

export default function EmergencyAccessCodeCard() {
  const { identity } = useInternetIdentity();
  const [accessCode, setAccessCode] = useState<string | null>(null);
  const [showCode, setShowCode] = useState(false);

  useEffect(() => {
    const stored = getStoredAccessCode();
    setAccessCode(stored);
  }, []);

  const handleGenerate = () => {
    const newCode = generateAccessCode();
    storeAccessCode(newCode);
    setAccessCode(newCode);
    setShowCode(true);
    toast.success("Emergency Access Code generated");
  };

  const handleCopy = () => {
    if (accessCode) {
      navigator.clipboard.writeText(accessCode);
      toast.success("Access code copied to clipboard");
    }
  };

  const handleRotate = () => {
    if (
      confirm(
        "Rotating your access code will invalidate the previous code. Continue?",
      )
    ) {
      clearAccessCode();
      handleGenerate();
      toast.info(
        "Access code rotated. Update your emergency contacts with the new code.",
      );
    }
  };

  const userPrincipal = identity?.getPrincipal().toString();

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-2">
          <Key className="h-5 w-5" />
          <div>
            <CardTitle>Emergency Access Code</CardTitle>
            <CardDescription>
              Share this code with trusted contacts for emergency access
            </CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <Alert>
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>
            Share only with trusted members. This code + your Principal ID
            enables access to your emergency profile and last SOS location
            (one-time snapshot, not real-time tracking) via Emergency Lookup.
          </AlertDescription>
        </Alert>

        {userPrincipal && (
          <div className="space-y-2">
            <label htmlFor="principal-id-input" className="text-sm font-medium">
              Your Principal ID
            </label>
            <div className="flex gap-2">
              <Input
                id="principal-id-input"
                value={userPrincipal}
                readOnly
                className="font-mono text-xs"
              />
              <Button
                variant="outline"
                size="icon"
                onClick={() => {
                  navigator.clipboard.writeText(userPrincipal);
                  toast.success("Principal ID copied");
                }}
              >
                <Copy className="h-4 w-4" />
              </Button>
            </div>
          </div>
        )}

        {accessCode ? (
          <div className="space-y-2">
            <label htmlFor="access-code-input" className="text-sm font-medium">
              Access Code
            </label>
            <div className="flex gap-2">
              <Input
                id="access-code-input"
                value={showCode ? accessCode : "••••-••••-••••"}
                readOnly
                className="font-mono text-lg tracking-wider"
              />
              <Button
                variant="outline"
                size="icon"
                onClick={() => setShowCode(!showCode)}
              >
                {showCode ? (
                  <EyeOff className="h-4 w-4" />
                ) : (
                  <Eye className="h-4 w-4" />
                )}
              </Button>
              <Button variant="outline" size="icon" onClick={handleCopy}>
                <Copy className="h-4 w-4" />
              </Button>
            </div>
            <Button
              variant="outline"
              onClick={handleRotate}
              className="w-full gap-2"
            >
              <RefreshCw className="h-4 w-4" />
              Rotate Code
            </Button>
          </div>
        ) : (
          <Button onClick={handleGenerate} className="w-full gap-2">
            <Key className="h-4 w-4" />
            Generate Access Code
          </Button>
        )}
      </CardContent>
    </Card>
  );
}
