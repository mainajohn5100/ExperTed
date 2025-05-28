
'use client';

import { SidebarNav } from '@/components/layout/sidebar-nav';
import { SidebarInset } from '@/components/ui/sidebar';
import { useAuth } from '@/hooks/useAuth';
import { useRouter } from 'next/navigation';
import { useEffect, type ReactNode } from 'react';
import { LoadingSpinner } from '@/components/common/loading-spinner';

export default function AppLayout({
  children,
}: {
  children: ReactNode;
}) {
  const { user, isLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading && !user) {
      router.push('/login');
    }
  }, [user, isLoading, router]);

  if (isLoading || (!isLoading && !user && typeof window !== 'undefined' && window.location.pathname !== '/login')) {
    // Show loading spinner while checking auth or if user is null and not already on login page (to prevent flash)
    return (
      <div className="flex h-screen w-full items-center justify-center bg-background">
        <LoadingSpinner size={12} />
      </div>
    );
  }
  
  // If user is null but we are already on login (or signup), allow child (login/signup page) to render
  // This might not be strictly necessary if login/signup are outside (app) group, but good for robustness
  if (!user && (typeof window !== 'undefined' && (window.location.pathname === '/login' || window.location.pathname === '/signup'))) {
     return <>{children}</>; // This case should ideally not be hit if login/signup are outside this layout
  }


  return (
    <div className="flex min-h-screen w-full">
      <SidebarNav />
      <SidebarInset className="flex flex-col">
        <main className="flex-1 overflow-y-auto p-4 pt-6 md:p-6">
          {children}
        </main>
      </SidebarInset>
    </div>
  );
}
