
import { AppHeader } from '@/components/layout/header';
import { ReportsClientPage } from '@/components/reports/reports-client-page';
import { getTicketsByStatus, getProjectsByStatus } from '@/lib/data';
import type { Ticket, Project } from '@/types';

export const dynamic = 'force-dynamic';

export default async function ReportsPage() {
  console.log('[ReportsPage] Server Component: Rendering reports page...');

  let allTickets: Ticket[] = [];
  let allProjects: Project[] = [];
  let errorLoadingData = false;

  try {
    allTickets = await getTicketsByStatus('all');
    allProjects = await getProjectsByStatus('all');
    console.log(`[ReportsPage] Server Component: Fetched ${allTickets.length} tickets and ${allProjects.length} projects.`);
  } catch (error) {
    console.error('[ReportsPage] Server Component: Error fetching data for reports:', error);
    errorLoadingData = true;
  }

  if (errorLoadingData) {
    return (
      <>
        <AppHeader title="Reports" />
        <div className="p-6">
          <h1 className="text-2xl font-semibold mb-4">Reporting Overview</h1>
          <p className="text-red-500">Error loading data for reports. Please check server logs.</p>
        </div>
      </>
    );
  }

  return (
    <>
      <AppHeader title="Reports" />
      <ReportsClientPage allTickets={allTickets} allProjects={allProjects} />
    </>
  );
}
