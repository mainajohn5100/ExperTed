
'use client';

import * as React from 'react';
import { Line, LineChart, CartesianGrid, ResponsiveContainer, XAxis, YAxis } from 'recharts';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ChartContainer, ChartTooltip, ChartTooltipContent, type ChartConfig } from '@/components/ui/chart';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';
import { MoreVertical, Printer, Download } from 'lucide-react';

// Using the same mock data as the dashboard for consistency
const ticketResolutionTimeData = [
  { date: 'Mon', avgTime: 4.5 },
  { date: 'Tue', avgTime: 5.2 },
  { date: 'Wed', avgTime: 3.8 },
  { date: 'Thu', avgTime: 6.1 },
  { date: 'Fri', avgTime: 4.9 },
  { date: 'Sat', avgTime: 2.5 },
  { date: 'Sun', avgTime: 3.0 },
];

const chartConfig = {
  avgTime: {
    label: 'Avg. Resolution Time (Hours)',
    color: 'hsl(var(--chart-1))', // Using chart-1 for reports, was --primary on dashboard
  },
} satisfies ChartConfig;

export function AverageTicketResolutionTimeReportChart() {
  console.log('[AverageTicketResolutionTimeReportChart] Rendering...');

  const handlePrint = () => window.print();
  const handleDownload = () => alert('Download functionality to be implemented.');

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle>Avg. Ticket Resolution Time</CardTitle>
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
        <p className="text-xs text-muted-foreground mb-2">Note: This chart currently uses mock data.</p>
        <ChartContainer config={chartConfig} className="h-[276px] w-full"> {/* Adjusted height for note */}
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
  );
}
