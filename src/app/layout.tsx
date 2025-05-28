
'use client'; // Make root layout client to use ThemeApplicator which uses useAuth hook

import type { Metadata } from 'next'; // Metadata can still be defined
import { Inter } from 'next/font/google';
import './globals.css';
import { Toaster } from "@/components/ui/toaster";
import { AuthProvider } from '@/contexts/AuthContext';
import ThemeApplicator from '@/components/common/theme-applicator'; // Import ThemeApplicator

const fontSans = Inter({ 
  variable: '--font-sans',
  subsets: ['latin'],
});

// Static metadata - this is fine even in a client component root layout
export const metadata: Metadata = {
  title: 'ExperTed',
  description: 'ExperTed - Smart Helpdesk Solution',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${fontSans.variable} font-sans antialiased`}>
        <AuthProvider>
          <ThemeApplicator /> {/* Apply theme and font size based on user prefs */}
          {children}
          <Toaster />
        </AuthProvider>
      </body>
    </html>
  );
}
