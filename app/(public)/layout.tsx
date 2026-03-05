"use client";

import PublicHeader from '@/components/layout/PublicHeader';
import { useLanguage } from '@/components/providers/LanguageContext';

export default function PublicLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const { language, t } = useLanguage();

    return (
        <div className="flex flex-col min-h-screen bg-background">
            <a href="#main-content" className="skip-link">
                {language === 'en' ? 'Skip to main content' : 'মূল কনটেন্টে যান'}
            </a>

            {/* Public Header */}
            {/* Public Header */}
            <PublicHeader />

            <main id="main-content" className="flex-1" tabIndex={-1}>
                {children}
            </main>

            {/* Public Footer */}
            <footer className="border-t border-border bg-muted/30">
                <div className="container mx-auto px-4 py-8 text-center text-sm text-muted-foreground">
                    <p>
                        &copy; {new Date().getFullYear()} {t.home.unionName} {t.home.unionSuffix}. {t.home.footerRights}
                    </p>
                </div>
            </footer>
        </div>
    );
}
