import type { Metadata } from 'next';
import './globals.css';
import { Noto_Serif_Bengali } from 'next/font/google';

const notoSerifBengali = Noto_Serif_Bengali({
  subsets: ['bengali'],
  weight: ['400', '700'],
  variable: '--font-bengali'
});


export const metadata: Metadata = {
  title: 'Admin Dashboard',
  description: 'Premium Admin Dashboard with Next.js and MongoDB',
};

import { ThemeProvider } from '@/components/providers/ThemeProvider';
import { Toaster } from 'sonner';

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={notoSerifBengali.className} suppressHydrationWarning>
        <ThemeProvider>
          {children}
          <Toaster position="top-right" richColors closeButton />
        </ThemeProvider>
      </body>
    </html>
  );
}
