import type { Metadata } from 'next';

import { redirect } from 'next/navigation';

import DashboardLayout from '@/components/admin/layout/DashboardLayout';
import { AdminProviders } from '@/components/providers/AdminProviders';
import { getAuthenticatedUser, getAuthSession } from '@/lib/server/auth/session';
import { getCachedSettings } from '@/lib/server/settings';

export const metadata: Metadata = {
    robots: {
        follow: false,
        index: false,
    },
    title: {
        default: 'Admin Dashboard',
        template: '%s | Admin Dashboard',
    },
};

export default async function AdminLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const [session, settings, user] = await Promise.all([
        getAuthSession(),
        getCachedSettings(),
        getAuthenticatedUser(),
    ]);

    if (!session || !user) {
        redirect('/login');
    }

    return (
        <AdminProviders initialSession={session} initialSettings={settings} initialUser={user}>
            <DashboardLayout>{children}</DashboardLayout>
        </AdminProviders>
    );
}
