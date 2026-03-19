import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { useNavigate } from "@tanstack/react-router";
import { Copy, ShieldX } from "lucide-react";
import { useState } from "react";
import { useInternetIdentity } from "../../hooks/useInternetIdentity";

export default function AccessDeniedScreen() {
  const navigate = useNavigate();
  const { identity } = useInternetIdentity();
  const [copied, setCopied] = useState(false);

  const principalText = identity?.getPrincipal().toString() ?? null;
  const isLoggedIn = principalText && principalText !== "2vxsx-fae";

  const handleCopy = () => {
    if (principalText) {
      navigator.clipboard.writeText(principalText);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-[60vh] px-4">
      <div className="w-full max-w-md">
        <Card className="text-center">
          <CardHeader>
            <div className="flex justify-center mb-2">
              <ShieldX className="h-12 w-12 text-destructive" />
            </div>
            <CardTitle>Access Denied</CardTitle>
            <CardDescription>
              Your account does not have administrator privileges.
            </CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col gap-3">
            {isLoggedIn && (
              <div className="rounded-md border border-border bg-muted p-3 text-left">
                <p className="text-xs font-semibold text-muted-foreground mb-1">
                  Your current Principal ID:
                </p>
                <p className="text-xs font-mono break-all text-foreground">
                  {principalText}
                </p>
                <Button
                  variant="outline"
                  size="sm"
                  className="mt-2 w-full text-xs"
                  onClick={handleCopy}
                >
                  <Copy className="h-3 w-3 mr-1" />
                  {copied ? "Copied!" : "Copy Principal ID"}
                </Button>
              </div>
            )}
            <Button
              onClick={() => navigate({ to: "/" })}
              variant="default"
              className="w-full"
            >
              Return Home
            </Button>
            <Button
              onClick={() => navigate({ to: "/places" })}
              variant="outline"
              className="w-full"
            >
              Browse Safe Places
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
