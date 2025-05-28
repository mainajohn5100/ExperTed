
'use client';

import * as React from 'react';
import { Bar, BarChart, CartesianGrid, ResponsiveContainer, XAxis, YAxis, Line, LineChart, Pie, PieChart as RechartsPie, Cell, Legend as RechartsLegend } from 'recharts';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ChartContainer, ChartTooltip, ChartTooltipContent, ChartLegend, ChartLegendContent, type ChartConfig } from '@/components/ui/chart';
import { PrintDownloadActions } from '@/components/common/print-download-actions';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from '@/components/ui/button';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { BarChart3, PieChart as PieChartIcon, MoreVertical, Printer, Download, Loader2 } from 'lucide-react';
import { getTicketsByStatus } from '@/lib/data';
import type { Ticket, TicketDocumentStatus } from '@/types';

const ticketStatusColors: Record<TicketDocumentStatus, string> = {
  new: 'hsl(var(--chart-1))',
  pending: 'hsl(var(--chart-2))',
  'on-hold': 'hsl(var(--chart-3))',
  active: 'hsl(var(--chart-4))',
  closed: 'hsl(var(--chart-5))',
  terminated: 'hsl(var(--destructive))',
};

const initialTicketsByStatusConfig: ChartConfig = {
  count: { label: 'Tickets' },
  new: { label: 'New', color: ticketStatusColors.new },
  pending: { label: 'Pending', color: ticketStatusColors.pending },
  onHold: { label: 'On Hold', color: ticketStatusColors['on-hold'] },
  active: { label: 'Active', color: ticketStatusColors.active },
  closed: { label: 'Closed', color: ticketStatusColors.closed },
  terminated: { label: 'Terminated', color: ticketStatusColors.terminated },
};

const ticketResolutionTimeData = [
  { date: 'Mon', avgTime: 4.5 },
  { date: 'Tue', avgTime: 5.2 },
  { date: 'Wed', avgTime: 3.8 },
  { date: 'Thu', avgTime: 6.1 },
  { date: 'Fri', avgTime: 4.9 },
  { date: 'Sat', avgTime: 2.5 },
  { date: 'Sun', avgTime: 3.0 },
];

const ticketResolutionTimeConfig = {
  avgTime: {
    label: 'Avg. Resolution Time (Hours)',
    color: 'hsl(var(--primary))',
  },
} satisfies ChartConfig;

interface StatusData {
  statusKey: TicketDocumentStatus;
  name: string;
  count: number;
  fill: string;
}

export function DashboardCharts() {
  const [ticketStatusChartType, setTicketStatusChartType] = React.useState<'bar' | 'pie'>('bar');
  const [ticketsByStatusData, setTicketsByStatusData] = React.useState<StatusData[]>([]);
  const [ticketsByStatusConfig, setTicketsByStatusConfig] = React.useState<ChartConfig>(initialTicketsByStatusConfig);
  const [isLoadingStatusData, setIsLoadingStatusData] = React.useState(true);

  React.useEffect(() => {
    async function fetchStatusData() {
      setIsLoadingStatusData(true);
      try {
        const allTickets = await getTicketsByStatus('all');
        const statusCounts = allTickets.reduce((acc, ticket) => {
          acc[ticket.status] = (acc[ticket.status] || 0) + 1;
          return acc;
        }, {} as Record<TicketDocumentStatus, number>);

        const dataForChart = (Object.keys(ticketStatusColors) as TicketDocumentStatus[])
          .map((status) => ({
            statusKey: status,
            name: status.charAt(0).toUpperCase() + status.slice(1).replace('-', ' '),
            count: statusCounts[status] || 0,
            fill: ticketStatusColors[status] || 'hsl(var(--muted))',
          }));
        
        setTicketsByStatusData(dataForChart);

        const dynamicConfig: ChartConfig = { count: { label: "Tickets"} };
        dataForChart.forEach(item => {
            dynamicConfig[item.statusKey] = { // Use statusKey for consistency in config keys
                label: item.name,
                color: item.fill
            };
        });
        setTicketsByStatusConfig(dynamicConfig);

      } catch (error) {
        console.error("Failed to fetch ticket status data:", error);
      }
      setIsLoadingStatusData(false);
    }
    fetchStatusData();
  }, []);

  const handlePrint = () => window.print();
  const handleDownload = () => alert('Download functionality to be implemented.');

  return (
    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-2">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-lg font-medium">Tickets by Status</CardTitle>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="h-8 w-8">
                <MoreVertical className="h-4 w-4" />
                <span className="sr-only">More options</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onSelect={() => setTicketStatusChartType('bar')}>
                <BarChart3 className="mr-2 h-4 w-4" /> Bar Chart
              </DropdownMenuItem>
              <DropdownMenuItem onSelect={() => setTicketStatusChartType('pie')}>
                <PieChartIcon className="mr-2 h-4 w-4" /> Pie Chart
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onSelect={handlePrint}>
                <Printer className="mr-2 h-4 w-4" /> Print
              </DropdownMenuItem>
              <DropdownMenuItem onSelect={handleDownload}>
                <Download className="mr-2 h-4 w-4" /> Download
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </CardHeader>
        <CardContent>
          {isLoadingStatusData ? (
            <div className="h-[300px] flex items-center justify-center">
              <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
          ) : ticketsByStatusData.every(d => d.count === 0) ? (
            <div className="h-[300px] flex items-center justify-center text-muted-foreground">
              No ticket data available.
            </div>
          ) : (
            <ChartContainer config={ticketsByStatusConfig} className="h-[300px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                {ticketStatusChartType === 'bar' ? (
                  <BarChart data={ticketsByStatusData} margin={{ top: 5, right: 20, left: -20, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false}/>
                    <XAxis dataKey="name" tickLine={false} axisLine={false} tickMargin={8} />
                    <YAxis tickLine={false} axisLine={false} tickMargin={8} allowDecimals={false} />
                    <ChartTooltip content={<ChartTooltipContent />} />
                    <ChartLegend content={<ChartLegendContent />} />
                    <Bar dataKey="count" radius={4}>
                       {ticketsByStatusData.map((entry) => (
                          <Cell key={`cell-${entry.statusKey}`} fill={`var(--color-${entry.statusKey})`} />
                        ))}
                    </Bar>
                  </BarChart>
                ) : (
                  <RechartsPie>
                    <ChartTooltip content={<ChartTooltipContent nameKey="name" />} />
                    <RechartsPie data={ticketsByStatusData} dataKey="count" nameKey="name" cx="50%" cy="50%" outerRadius={100} label>
                      {ticketsByStatusData.map((entry) => (
                        <Cell key={`cell-${entry.statusKey}`} fill={`var(--color-${entry.statusKey})`} />
                      ))}
                    </RechartsPie>
                    <RechartsLegend content={<ChartLegendContent nameKey="name" />} />
                  </RechartsPie>
                )}
              </ResponsiveContainer>
            </ChartContainer>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-lg font-medium">Avg. Ticket Resolution Time</CardTitle>
           <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="h-8 w-8">
                <MoreVertical className="h-4 w-4" />
                <span className="sr-only">More options</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onSelect={handlePrint}>
                <Printer className="mr-2 h-4 w-4" /> Print
              </DropdownMenuItem>
              <DropdownMenuItem onSelect={handleDownload}>
                <Download className="mr-2 h-4 w-4" /> Download
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </CardHeader>
        <CardContent>
          <p className="text-xs text-muted-foreground mb-2">Note: This chart currently uses mock data.</p>
           <ChartContainer config={ticketResolutionTimeConfig} className="h-[276px] w-full"> {/* Adjusted height for note */}
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={ticketResolutionTimeData} margin={{ top: 5, right: 20, left: -20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="date" tickLine={false} axisLine={false} tickMargin={8} />
                <YAxis tickLine={false} axisLine={false} tickMargin={8} />
                <ChartTooltip content={<ChartTooltipContent indicator="line" />} />
                <Line type="monotone" dataKey="avgTime" stroke="var(--color-avgTime)" strokeWidth={2} dot={{r: 4}} />
              </LineChart>
            </ResponsiveContainer>
          </ChartContainer>
        </CardContent>
      </Card>
    </div>
  );
}
