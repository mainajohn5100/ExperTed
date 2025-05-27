
// This file is DEPRECATED due to a naming conflict with a built-in 'status' property.
// The active route for ticket statuses is now /src/app/(app)/tickets/[ticketStateParam]/page.tsx
// This file should be manually deleted from your project.
import { AppHeader } from '@/components/layout/header';
import { PageTitle } from '@/components/common/page-title';
import { Button } from '@/components/ui/button';
import Link from 'next/link';

export default function DeprecatedTicketStatusPage({ params }: { params: { status: string }}) {
  console.warn(`[DEPRECATED /tickets/[status]/page.tsx] This page was hit with params: ${JSON.stringify(params)}. This file should be deleted. The correct route is /tickets/[ticketStateParam].`);
  return (
    <>
      <AppHeader title="Deprecated Page" />
      <div className="p-6">
        <PageTitle title="Deprecated Ticket Status Page" />
        <p>This page ({`/tickets/${params?.status}`}) is deprecated and should not be used. Please ensure this file is deleted and links point to the correct ticket status routes using '[ticketStateParam]'.</p>
        <Button asChild className="mt-4">
          <Link href="/tickets/all">Go to All Tickets</Link>
        </Button>
      </div>
    </>
  );
}
