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
  manifest: '/manifest.json',
  themeColor: '#000000',
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
