'use client';

import { Toaster } from 'sonner';

import { LanguageProvider } from '@/components/providers/LanguageContext';
import { SettingsProvider } from '@/components/providers/SettingsContext';
import { ThemeProvider } from '@/components/providers/ThemeProvider';
import type { SettingsData } from '@/types';

export function PublicProviders({
    children,
    initialSettings,
}: {
    children: React.ReactNode;
    initialSettings: SettingsData;
}) {
    return (
        <ThemeProvider mode="system-only">
            <SettingsProvider initialSettings={initialSettings}>
                <LanguageProvider>
                    {children}
                    <Toaster position="top-right" richColors closeButton />
                </LanguageProvider>
            </SettingsProvider>
        </ThemeProvider>
    );
}
