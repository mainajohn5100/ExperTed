
// Top-level log to confirm file is reached by Next.js
console.log('[TicketsByStatusPage] File /src/app/(app)/tickets/[ticketStateParam]/page.tsx reached by Next.js routing.');

import { getTicketsByStatus } from '@/lib/data';
import type { TicketStatusFilter, TicketDocumentStatus } from '@/types';
import { TicketListClient } from '@/components/tickets/ticket-list-client';
import { PageTitle } from '@/components/common/page-title';
import { AppHeader } from '@/components/layout/header';
import { Button } from '@/components/ui/button';
import Link from 'next/link';

export const dynamic = 'force-dynamic'; // Ensure fresh data on each request

interface TicketsByStatusPageProps {
  params: { ticketStateParam: string }; // Ensure this matches the directory name [ticketStateParam]
  searchParams?: { [key: string]: string | string[] | undefined };
}

export default async function TicketsByStatusPage({ params, searchParams }: TicketsByStatusPageProps) {
  console.log('[TicketsByStatusPage] Component loaded. Received full props:', JSON.stringify({ params, searchParams }, null, 2));
  console.log('[TicketsByStatusPage] Received params object:', JSON.stringify(params, null, 2));

  try {
    const statusFromParams = params?.ticketStateParam; // Use the correct param name
    console.log('[TicketsByStatusPage] Extracted statusFromParams:', statusFromParams);

    const validStatuses: TicketStatusFilter[] = ["all", "new", "pending", "on-hold", "closed", "active", "terminated"];

    if (typeof statusFromParams !== 'string' || !validStatuses.includes(statusFromParams as TicketStatusFilter)) {
      const displayStatus = statusFromParams === undefined ? 'undefined (not provided)' : `"${statusFromParams}" (unrecognized)`;
      const receivedParamsString = JSON.stringify(params);
      console.error(`SERVER_ERROR_PATH: [TicketsByStatusPage] Invalid or missing status parameter. Displayed as: ${displayStatus}. statusFromParams: ${statusFromParams}. Received full params object: ${receivedParamsString}. Is params.ticketStateParam available? ${String(params?.ticketStateParam !== undefined)}`);
      return (
          <>
          <AppHeader title="Invalid Ticket Status" />
          <div className="p-6">
              <PageTitle title={`Invalid Ticket Status: ${displayStatus}`} />
              <p>Please select a valid ticket status from the navigation. The status parameter ('{statusFromParams}') in the URL was not recognized or was missing. Params received: {receivedParamsString}</p>
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
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    console.error(`[TicketsByStatusPage] UNHANDLED EXCEPTION for params "${params?.ticketStateParam}":`, errorMessage, error);
    return (
      <>
        <AppHeader title="Internal Server Error" />
        <div className="p-6">
          <PageTitle title="Internal Server Error" />
          <p>An unexpected error occurred while trying to load tickets for status: "{params?.ticketStateParam}". Error: {errorMessage}. Please check the server logs for more details.</p>
           <Button asChild className="mt-4">
            <Link href="/dashboard">Go to Dashboard</Link>
          </Button>
        </div>
      </>
    );
  }
}
