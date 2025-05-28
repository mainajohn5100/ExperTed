
'use client';

import * as React from 'react';
import { Bar, BarChart, Line, LineChart, ComposedChart, CartesianGrid, ResponsiveContainer, XAxis, YAxis, Tooltip, Legend as RechartsLegend } from 'recharts';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ChartConfig, ChartContainer, ChartLegendContent, ChartTooltipContent } from '@/components/ui/chart';
import type { Ticket, TicketDocumentStatus } from '@/types';
import { format, parseISO, getMonth, getYear } from 'date-fns';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';
import { MoreVertical, Printer, Download } from 'lucide-react';

const statusColors: Record<TicketDocumentStatus, string> = {
  new: 'hsl(var(--chart-1))',
  pending: 'hsl(var(--chart-2))',
  active: 'hsl(var(--chart-3))',
  'on-hold': 'hsl(var(--chart-4))',
  closed: 'hsl(var(--chart-5))',
  terminated: 'hsl(var(--destructive))',
};

interface MonthlyStatusData {
  monthYear: string;
  totalTickets: number;
  new?: number;
  pending?: number;
  active?: number;
  'on-hold'?: number;
  closed?: number;
  terminated?: number;
  year: number;
  month: number;
}

interface MonthlyStatusBreakdownChartProps {
  tickets: Ticket[];
}

export function MonthlyStatusBreakdownChart({ tickets }: MonthlyStatusBreakdownChartProps) {
  console.log('[MonthlyStatusBreakdownChart] Received tickets:', tickets.length);
  const [monthlyStatusData, setMonthlyStatusData] = React.useState<MonthlyStatusData[]>([]);
  const [isLoading, setIsLoading] = React.useState(true);
  
  const chartConfig = React.useMemo(() => {
    const config: ChartConfig = {
      totalTickets: { label: 'Total Tickets', color: 'hsl(var(--muted-foreground))' }, // Bar color
    };
    (Object.keys(statusColors) as TicketDocumentStatus[]).forEach(status => {
      config[status] = { label: status.charAt(0).toUpperCase() + status.slice(1).replace('-', ' '), color: statusColors[status] };
    });
    return config;
  }, []);

  React.useEffect(() => {
    setIsLoading(true);
    try {
      const dataByMonth = tickets.reduce((acc, ticket) => {
        const date = parseISO(ticket.$createdAt);
        const monthYearKey = format(date, 'MMM yyyy');

        if (!acc[monthYearKey]) {
          acc[monthYearKey] = {
            monthYear: monthYearKey,
            totalTickets: 0,
            year: getYear(date),
            month: getMonth(date),
            new: 0, pending: 0, active: 0, 'on-hold': 0, closed: 0, terminated: 0,
          };
        }
        acc[monthYearKey].totalTickets += 1;
        acc[monthYearKey][ticket.status] = (acc[monthYearKey][ticket.status] || 0) + 1;
        return acc;
      }, {} as Record<string, MonthlyStatusData>);

      const sortedData = Object.values(dataByMonth).sort((a, b) => {
        if (a.year !== b.year) return a.year - b.year;
        return a.month - b.month;
      });
      setMonthlyStatusData(sortedData);
      console.log('[MonthlyStatusBreakdownChart] Processed monthly status data:', sortedData);
    } catch (error) {
      console.error("[MonthlyStatusBreakdownChart] Failed to process ticket data:", error);
    }
    setIsLoading(false);
  }, [tickets]);

  const handlePrint = () => window.print();
  const handleDownload = () => alert('Download functionality to be implemented.');

  if (isLoading) {
    return (
      <Card>
        <CardHeader><CardTitle>Monthly Tickets & Status Trends</CardTitle></CardHeader>
        <CardContent className="h-[350px] flex items-center justify-center"><p>Loading chart data...</p></CardContent>
      </Card>
    );
  }

  if (monthlyStatusData.length === 0 && !isLoading) {
    return (
      <Card>
        <CardHeader><CardTitle>Monthly Tickets & Status Trends</CardTitle></CardHeader>
        <CardContent className="h-[350px] flex items-center justify-center"><p>No ticket data available for this chart.</p></CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle>Monthly Tickets & Status Trends</CardTitle>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="h-8 w-8">
              <MoreVertical className="h-4 w-4" /> <span className="sr-only">More options</span>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onSelect={handlePrint}><Printer className="mr-2 h-4 w-4" />Print</DropdownMenuItem>
            <DropdownMenuItem onSelect={handleDownload}><Download className="mr-2 h-4 w-4" />Download</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </CardHeader>
      <CardContent>
        <ChartContainer config={chartConfig} className="h-[400px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <ComposedChart data={monthlyStatusData} margin={{ top: 5, right: 20, left: -20, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false}/>
              <XAxis dataKey="monthYear" tickLine={false} axisLine={false} tickMargin={8} />
              <YAxis yAxisId="left" orientation="left" stroke="hsl(var(--foreground))" tickLine={false} axisLine={false} tickMargin={8} allowDecimals={false} />
              <YAxis yAxisId="right" orientation="right" stroke="hsl(var(--foreground))" tickLine={false} axisLine={false} tickMargin={8} allowDecimals={false} />
              <Tooltip content={<ChartTooltipContent />} />
              <RechartsLegend content={<ChartLegendContent />} />
              <Bar yAxisId="left" dataKey="totalTickets" fill="var(--color-totalTickets)" radius={4} barSize={30} />
              {(Object.keys(statusColors) as TicketDocumentStatus[]).map(status => (
                <Line key={status} yAxisId="right" type="monotone" dataKey={status} stroke={`var(--color-${status})`} strokeWidth={2} dot={{ r: 3 }} />
              ))}
            </ComposedChart>
          </ResponsiveContainer>
        </ChartContainer>
      </CardContent>
    </Card>
  );
}
