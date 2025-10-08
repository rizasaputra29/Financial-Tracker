// rizasaputra29/financial-tracker/Financial-Tracker-15996308ee6cfd5d3abc50bd8eb71447eefc8019/app/layout.tsx
import './globals.css';
import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import { AuthProvider } from '@/contexts/AuthContext';
import { FinanceProvider } from '@/contexts/FinanceContext';
import { Toaster } from '@/components/ui/toaster';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'Financial Tracker',
  description: 'Track your income, expenses, and savings goals',
  // Menggunakan site.webmanifest yang lebih lengkap
  manifest: '/site.webmanifest', 
  themeColor: '#000000',
  icons: {
    // Favicon desktop menggunakan ikon resolusi tertinggi
    icon: '/android-chrome-512x512.png', 
    // Ikon Home Screen iOS
    apple: '/apple-touch-icon.png', 
    // Menyertakan ikon ukuran lain (jika diperlukan oleh browser/OS spesifik)
    other: [
      {
        rel: 'icon',
        type: 'image/png',
        sizes: '32x32',
        url: '/favicon-32x32.png',
      },
      {
        rel: 'icon',
        type: 'image/png',
        sizes: '16x16',
        url: '/favicon-16x16.png',
      },
    ],
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <AuthProvider>
          <FinanceProvider>
            {children}
            <Toaster />
          </FinanceProvider>
        </AuthProvider>
      </body>
    </html>
  );
}