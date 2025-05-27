import type { Metadata } from 'next';
import { Inter } from 'next/font/google'; // Changed from Geist_Sans
import './globals.css';
import { Toaster } from "@/components/ui/toaster";
import { SidebarProvider } from '@/components/ui/sidebar';

const fontSans = Inter({ // Changed from Geist_Sans to Inter
  variable: '--font-sans', // Using a more generic variable name
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
      <body className={`${fontSans.variable} font-sans antialiased`}> {/* Using the new variable */}
        <SidebarProvider defaultOpen>
          {children}
        </SidebarProvider>
        <Toaster />
      </body>
    </html>
  );
}
