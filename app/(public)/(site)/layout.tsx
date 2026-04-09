import PublicFooter from '@/components/public/layout/PublicFooter';
import PublicHeader from '@/components/public/layout/PublicHeader';

export default function PublicSiteLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <div className="public-shell flex min-h-screen flex-col bg-background">
            <a href="#main-content" className="skip-link">
                Skip to main content
            </a>
            <PublicHeader />
            <main id="main-content" className="flex-1" tabIndex={-1}>
                {children}
            </main>
            <PublicFooter />
        </div>
    );
}
