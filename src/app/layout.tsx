
import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { Toaster } from "@/components/ui/toaster";
// Removed SidebarProvider import
import { AuthProvider } from '@/contexts/AuthContext';

const fontSans = Inter({ 
  variable: '--font-sans',
  subsets: ['latin'],
});

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
          {/* SidebarProvider removed from here */}
          {children}
          <Toaster />
        </AuthProvider>
      </body>
    </html>
  );
}
