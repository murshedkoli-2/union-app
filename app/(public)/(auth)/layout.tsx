import type { Metadata } from 'next';

export const metadata: Metadata = {
    robots: {
        follow: false,
        index: false,
    },
    title: 'Admin Login',
};

export default function PublicAuthLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return <div className="auth-shell min-h-screen bg-muted/20">{children}</div>;
}
