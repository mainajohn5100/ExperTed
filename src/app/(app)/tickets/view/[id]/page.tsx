import { getTicketById } from '@/lib/data';
import { TicketViewClient } from '@/components/tickets/ticket-view-client';
import { PageTitle } from '@/components/common/page-title';
import { AppHeader } from '@/components/layout/header';

export const dynamic = 'force-dynamic';

export default async function ViewTicketPage({ params }: { params: { id: string } }) {
  const ticket = await getTicketById(params.id);

  if (!ticket) {
    return (
    <>
    <AppHeader title="Ticket Not Found" />
      <div className="p-6">
        <PageTitle title="Ticket Not Found" />
        <p>The ticket with ID "{params.id}" could not be found.</p>
      </div>
    </>
    );
  }

  return (
    <>
    <AppHeader title={`Ticket ${ticket.id}`} />
    <div className="flex flex-col gap-6">
      <TicketViewClient ticket={ticket} />
    </div>
    </>
  );
}

export async function generateStaticParams() {
  // In a real app, fetch all ticket IDs to pre-render
  // For mock data, this is not strictly necessary but good practice
  // const tickets = await getAllTicketIds(); // This function would fetch IDs
  // return tickets.map((ticketId) => ({ id: ticketId }));
  return []; // For now, rely on dynamic rendering
}
