import Link from 'next/link';
import { ShieldCheck } from 'lucide-react';
import PublicHeader from '@/components/layout/PublicHeader';

export default function PublicLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <div className="flex flex-col min-h-screen bg-background">
            {/* Public Header */}
            {/* Public Header */}
            <PublicHeader />

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
