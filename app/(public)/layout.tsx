import type { Metadata } from 'next';

import { PublicProviders } from '@/components/providers/PublicProviders';
import { getCachedSettings } from '@/lib/server/settings';

export async function generateMetadata(): Promise<Metadata> {
    const settings = await getCachedSettings();

    return {
        title: {
            default: settings.siteName || 'Union Portal',
            template: `%s | ${settings.siteName || 'Union Portal'}`,
        },
        description: 'Public services, certificate applications, and the admin dashboard for the union portal.',
        icons: settings.unionLogo
            ? {
                  apple: settings.unionLogo,
                  icon: settings.unionLogo,
              }
            : undefined,
    };
}

export default async function PublicLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const settings = await getCachedSettings();

    return (
        <PublicProviders initialSettings={settings}>{children}</PublicProviders>
    );
}
