
import { getTicketsByStatus } from '@/lib/data';
import type { TicketStatus } from '@/types';
import { TicketListClient } from '@/components/tickets/ticket-list-client';
import { PageTitle } from '@/components/common/page-title';
import { AppHeader } from '@/components/layout/header';
import { Button } from '@/components/ui/button';
import Link from 'next/link';

export const dynamic = 'force-dynamic'; // Ensure fresh data on each request

export default async function TicketsByStatusPage({ params }: { params: { status: string } }) {
  // Log received params for debugging
  // console.log('TicketsByStatusPage received params:', params);

  const statusFromParams = params?.status;

  // Basic validation for status
  const validStatuses: TicketStatus[] = ["all", "new", "pending", "on-hold", "closed", "active", "terminated"];
  
  if (typeof statusFromParams !== 'string' || !validStatuses.includes(statusFromParams as TicketStatus)) {
    const displayStatus = statusFromParams === undefined ? 'undefined (not provided)' : statusFromParams;
    // console.error(`TicketsByStatusPage: Invalid or missing status parameter. Received: "${statusFromParams}"`);
    return (
        <>
        <AppHeader title="Invalid Ticket Status" />
        <div className="p-6">
            <PageTitle title={`Invalid Ticket Status: ${displayStatus}`} />
            <p>Please select a valid ticket status from the navigation. The status parameter in the URL was not recognized or was missing.</p>
            <Button asChild className="mt-4">
            <Link href="/tickets/all">View All Tickets</Link>
            </Button>
        </div>
      </>
    );
  }
  
  // If we reach here, statusFromParams is a valid TicketStatus string.
  const status = statusFromParams as TicketStatus;
  const tickets = await getTicketsByStatus(status);
  const statusTitle = status.charAt(0).toUpperCase() + status.slice(1).replace('-', ' ');

  return (
    <>
    <AppHeader title={`${statusTitle} Tickets`}>
        <Button asChild>
          <Link href="/tickets/new-ticket">Create New Ticket</Link>
        </Button>
      </AppHeader>
    <div className="flex flex-col gap-6">
      <TicketListClient tickets={tickets} statusTitle={statusTitle} />
    </div>
    </>
  );
}
