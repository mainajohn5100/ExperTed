
'use client'; // Make root layout client to use ThemeApplicator which uses useAuth hook

import { Inter } from 'next/font/google';
import './globals.css';
import { Toaster } from "@/components/ui/toaster";
// import { AuthProvider } from '@/contexts/AuthContext'; // To be replaced
import { SessionProvider } from "next-auth/react"; // Import NextAuth SessionProvider
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
        <SessionProvider> {/* Wrap with NextAuth SessionProvider */}
          {/* ThemeApplicator might need refactoring to use useSession or a new way to get user prefs */}
          <ThemeApplicator />
          {children}
          <Toaster />
        </SessionProvider>
      </body>
    </html>
  );
}
