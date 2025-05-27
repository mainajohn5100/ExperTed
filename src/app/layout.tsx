import type { Metadata } from 'next';
import { Geist_Sans } from 'next/font/google'; // Corrected import
import './globals.css';
import { Toaster } from "@/components/ui/toaster";
import { SidebarProvider } from '@/components/ui/sidebar';

const geistSans = Geist_Sans({ // Corrected usage
  variable: '--font-geist-sans',
  subsets: ['latin'],
});

// Removed Geist_Mono as it's not explicitly used or requested over a single sans-serif.
// If needed, it can be added back.

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
      <body className={`${geistSans.variable} font-sans antialiased`}>
        <SidebarProvider defaultOpen>
          {children}
        </SidebarProvider>
        <Toaster />
      </body>
    </html>
  );
}
