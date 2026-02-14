import { useState } from 'react';
import { useInternetIdentity } from '../../hooks/useInternetIdentity';
import { useNavigate } from '@tanstack/react-router';
import { Button } from '@/components/ui/button';
import { Shield, Share2 } from 'lucide-react';
import LoginButton from '../auth/LoginButton';
import ShareDialog from '../share/ShareDialog';

export default function BrandHeader() {
    const { identity } = useInternetIdentity();
    const navigate = useNavigate();
    const [shareDialogOpen, setShareDialogOpen] = useState(false);

    return (
        <>
            <header className="sticky top-0 z-40 w-full border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
                <div className="container mx-auto flex h-16 items-center justify-between px-4">
                    <button
                        onClick={() => navigate({ to: '/' })}
                        className="flex items-center gap-3 hover:opacity-80 transition-opacity"
                    >
                        <div className="flex items-center justify-center h-10 w-10 rounded-lg bg-primary text-primary-foreground">
                            <Shield className="h-6 w-6" />
                        </div>
                        <div className="flex flex-col items-start">
                            <span className="text-lg font-bold leading-none">My Brother's Keeper</span>
                            <span className="text-xs text-muted-foreground">Trucker Safety Network</span>
                        </div>
                    </button>

                    <div className="flex items-center gap-2 sm:gap-4">
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setShareDialogOpen(true)}
                            className="gap-2"
                        >
                            <Share2 className="h-4 w-4" />
                            <span className="hidden sm:inline">Share</span>
                        </Button>
                        {!identity && (
                            <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => navigate({ to: '/emergency-lookup' })}
                            >
                                <span className="hidden sm:inline">Emergency Lookup</span>
                                <span className="sm:hidden">Emergency</span>
                            </Button>
                        )}
                        <LoginButton />
                    </div>
                </div>
            </header>

            <ShareDialog open={shareDialogOpen} onOpenChange={setShareDialogOpen} />
        </>
    );
}
