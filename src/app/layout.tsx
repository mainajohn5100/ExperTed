
'use client'; // Make root layout client to use ThemeApplicator which uses useAuth hook

import { Inter } from 'next/font/google';
import './globals.css';
import { Toaster } from "@/components/ui/toaster";
import { AuthProvider } from '@/contexts/AuthContext';
import ThemeApplicator from '@/components/common/theme-applicator'; // Import ThemeApplicator

const fontSans = Inter({ 
  variable: '--font-sans',
  subsets: ['latin'],
});

// Removed: export const metadata: Metadata = { ... };

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <title>ExperTed</title>
        <meta name="description" content="ExperTed - Smart Helpdesk Solution" />
      </head>
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
