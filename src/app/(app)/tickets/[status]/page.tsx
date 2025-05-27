
import { getTicketsByStatus } from '@/lib/data';
import type { TicketStatusFilter, TicketDocumentStatus } from '@/types';
import { TicketListClient } from '@/components/tickets/ticket-list-client';
import { PageTitle } from '@/components/common/page-title';
import { AppHeader } from '@/components/layout/header';
import { Button } from '@/components/ui/button';
import Link from 'next/link';

export const dynamic = 'force-dynamic'; // Ensure fresh data on each request

// Updated to log the full props and params object
export default async function TicketsByStatusPage(props: { params: { status: string }, searchParams?: any }) {
  const { params } = props;

  // Detailed logging at the beginning of the component
  console.log('[TicketsByStatusPage] Received full props:', JSON.stringify(props, null, 2));
  console.log('[TicketsByStatusPage] Received params object:', JSON.stringify(params, null, 2));

  const statusFromParams = params?.status;
  console.log('[TicketsByStatusPage] Extracted statusFromParams:', statusFromParams);


  // Basic validation for status
  const validStatuses: TicketStatusFilter[] = ["all", "new", "pending", "on-hold", "closed", "active", "terminated"];

  if (typeof statusFromParams !== 'string' || !validStatuses.includes(statusFromParams as TicketStatusFilter)) {
    const displayStatus = statusFromParams === undefined ? 'undefined (not provided)' : `"${statusFromParams}" (unrecognized)`;
    console.error(`[TicketsByStatusPage] Invalid or missing status parameter. Displayed as: ${displayStatus}. Received status: ${statusFromParams}. Full params: ${JSON.stringify(params)}`);
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

  const status = statusFromParams as TicketStatusFilter;
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
