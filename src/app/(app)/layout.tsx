import { SidebarNav } from '@/components/layout/sidebar-nav';
import { AppHeader } from '@/components/layout/header';
import { SidebarInset } from '@/components/ui/sidebar';

export default function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen w-full">
      <SidebarNav />
      <SidebarInset className="flex flex-col">
        {/* AppHeader can be part of SidebarInset or manage its own sticky behavior */}
        {/* <AppHeader /> */}
        <main className="flex-1 overflow-y-auto p-4 pt-6 md:p-6">
          {children}
        </main>
      </SidebarInset>
    </div>
  );
}
