
import { PageTitle } from '@/components/common/page-title';
import { DashboardCharts } from '@/components/dashboard/dashboard-charts';
import { RecentTicketsTable } from '@/components/dashboard/recent-tickets-table';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { getTicketsByStatus, getNewTicketsTodayCount } from '@/lib/data'; // Updated imports
import { Ticket, FileText, Users, Activity } from 'lucide-react';
import Link from 'next/link';
import { AppHeader } from '@/components/layout/header';

export default async function DashboardPage() {
  // Fetch data from Appwrite (or your data source)
  const allTickets = await getTicketsByStatus('all');
  const totalTickets = allTickets.length;
  
  const openTickets = allTickets.filter(t => t.status !== 'closed' && t.status !== 'terminated').length;
  
  const newTicketsToday = await getNewTicketsTodayCount();

  return (
    <>
    <AppHeader title="Dashboard">
        <Button asChild>
          <Link href="/tickets/new-ticket">Create New Ticket</Link>
        </Button>
      </AppHeader>
    <div className="flex flex-col gap-6">
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Tickets</CardTitle>
            <Ticket className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalTickets}</div>
            <p className="text-xs text-muted-foreground">All time</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Open Tickets</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{openTickets}</div>
            <p className="text-xs text-muted-foreground">Currently active or pending</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">New Today</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">+{newTicketsToday}</div>
            <p className="text-xs text-muted-foreground">New tickets created today</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Agent Activity</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">N/A</div>
            <p className="text-xs text-muted-foreground">Live agent status (placeholder)</p>
          </CardContent>
        </Card>
      </div>

      <DashboardCharts />
      <RecentTicketsTable />
    </div>
    </>
  );
}
