'use client';

import { Toaster } from 'sonner';

import { AuthProvider } from '@/components/providers/AuthProvider';
import { LanguageProvider } from '@/components/providers/LanguageContext';
import { SettingsProvider } from '@/components/providers/SettingsContext';
import { SidebarProvider } from '@/components/providers/SidebarContext';
import { ThemeProvider } from '@/components/providers/ThemeProvider';
import type { AuthSession, AuthUser, SettingsData } from '@/types';

export function AdminProviders({
    children,
    initialSession,
    initialSettings,
    initialUser,
}: {
    children: React.ReactNode;
    initialSession: AuthSession;
    initialSettings: SettingsData;
    initialUser: AuthUser;
}) {
    return (
        <ThemeProvider mode="manual">
            <SettingsProvider initialSettings={initialSettings}>
                <LanguageProvider>
                    <AuthProvider initialSession={initialSession} initialUser={initialUser}>
                        <SidebarProvider>
                            {children}
                            <Toaster position="top-right" richColors closeButton />
                        </SidebarProvider>
                    </AuthProvider>
                </LanguageProvider>
            </SettingsProvider>
        </ThemeProvider>
    );
}
