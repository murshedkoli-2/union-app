import type { Metadata } from 'next';
import './globals.css';
import { Noto_Serif_Bengali } from 'next/font/google';

const notoSerifBengali = Noto_Serif_Bengali({
  subsets: ['bengali'],
  weight: ['400', '700'],
  variable: '--font-bengali'
});


import { getSettings } from '@/lib/settings';

export async function generateMetadata() {
  const settings = await getSettings();

  return {
    title: {
      default: settings.siteName || 'Admin Dashboard',
      template: `%s | ${settings.siteName || 'Admin Dashboard'}`
    },
    description: 'Premium Admin Dashboard with Next.js and MongoDB',
  };
}

import { ThemeProvider } from '@/components/providers/ThemeProvider';
import { LanguageProvider } from '@/components/providers/LanguageContext';
import { SettingsProvider } from '@/components/providers/SettingsContext';
import { Toaster } from 'sonner';

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const settings = await getSettings();

  return (
    <html lang="en" suppressHydrationWarning>
      <body className={notoSerifBengali.className} suppressHydrationWarning>
        <ThemeProvider>
          <SettingsProvider initialSettings={settings}>
            <LanguageProvider>
              {children}
              <Toaster position="top-right" richColors closeButton />
            </LanguageProvider>
          </SettingsProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
