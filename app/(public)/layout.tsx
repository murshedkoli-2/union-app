import Link from 'next/link';
import { ShieldCheck } from 'lucide-react';

export default function PublicLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <div className="flex flex-col min-h-screen bg-background">
            {/* Public Header */}
            <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
                <div className="container mx-auto flex h-16 items-center justify-between px-4">
                    <Link href="/" className="flex items-center gap-2 font-bold text-xl">
                        <div className="h-8 w-8 bg-primary rounded-lg flex items-center justify-center text-white">
                            <ShieldCheck size={20} />
                        </div>
                        <span className="font-display">UnionPortal</span>
                    </Link>
                    <nav className="flex items-center gap-6 text-sm font-medium">
                        <Link href="/" className="hover:text-primary transition-colors">Home</Link>
                        <Link href="/apply/citizen" className="hover:text-primary transition-colors">Citizen Registration</Link>
                        <Link href="/apply/certificate" className="hover:text-primary transition-colors">Certificates</Link>
                        <Link href="/verify" className="hover:text-primary transition-colors">Verify</Link>
                        <Link href="/login" className="px-4 py-2 rounded-lg bg-primary/10 text-primary hover:bg-primary/20 transition-colors">
                            Admin Login
                        </Link>
                    </nav>
                </div>
            </header>

            <main className="flex-1">
                {children}
            </main>

            {/* Public Footer */}
            <footer className="border-t border-border bg-muted/30">
                <div className="container mx-auto px-4 py-8 text-center text-sm text-muted-foreground">
                    <p>&copy; {new Date().getFullYear()} Kalikaccha Union Parishad. All rights reserved.</p>
                </div>
            </footer>
        </div>
    );
}
