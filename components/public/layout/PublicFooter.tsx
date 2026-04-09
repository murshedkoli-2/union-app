'use client';

import { useLanguage } from '@/components/providers/LanguageContext';

export default function PublicFooter() {
    const { t } = useLanguage();

    return (
        <footer className="border-t border-border bg-muted/30">
            <div className="container mx-auto px-4 py-8 text-center text-sm text-muted-foreground">
                <p>
                    &copy; {new Date().getFullYear()} {t.home.unionName} {t.home.unionSuffix}. {t.home.footerRights}
                </p>
            </div>
        </footer>
    );
}
