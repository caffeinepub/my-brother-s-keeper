import { useInternetIdentity } from '../../hooks/useInternetIdentity';
import BrandHeader from './BrandHeader';
import AppNav from './AppNav';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { Menu } from 'lucide-react';
import { useState } from 'react';

export default function AppLayout({ children }: { children: React.ReactNode }) {
    const { identity } = useInternetIdentity();
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

    return (
        <div className="min-h-screen flex flex-col bg-background">
            <BrandHeader />
            
            <div className="flex flex-1">
                {/* Desktop Sidebar */}
                {identity && (
                    <aside className="hidden lg:block w-64 border-r border-border bg-card">
                        <div className="sticky top-0 p-4">
                            <AppNav />
                        </div>
                    </aside>
                )}

                {/* Mobile Menu */}
                {identity && (
                    <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
                        <SheetTrigger asChild>
                            <Button
                                variant="ghost"
                                size="icon"
                                className="lg:hidden fixed bottom-4 right-4 z-50 h-14 w-14 rounded-full shadow-lg bg-primary text-primary-foreground"
                            >
                                <Menu className="h-6 w-6" />
                            </Button>
                        </SheetTrigger>
                        <SheetContent side="left" className="w-64 p-4">
                            <div onClick={() => setMobileMenuOpen(false)}>
                                <AppNav />
                            </div>
                        </SheetContent>
                    </Sheet>
                )}

                {/* Main Content */}
                <main className="flex-1 overflow-auto">
                    <div className="container mx-auto p-4 lg:p-8 max-w-7xl">
                        {children}
                    </div>
                </main>
            </div>

            {/* Footer */}
            <footer className="border-t border-border bg-card mt-auto">
                <div className="container mx-auto px-4 py-6 text-center text-sm text-muted-foreground">
                    <p>
                        © {new Date().getFullYear()} My Brother's Keeper • Built with ❤️ using{' '}
                        <a
                            href={`https://caffeine.ai/?utm_source=Caffeine-footer&utm_medium=referral&utm_content=${encodeURIComponent(window.location.hostname)}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="underline hover:text-foreground transition-colors"
                        >
                            caffeine.ai
                        </a>
                    </p>
                </div>
            </footer>
        </div>
    );
}
