'use client';

import { Bar, BarChart, CartesianGrid, ResponsiveContainer, XAxis, YAxis, Line, LineChart, Tooltip as RechartsTooltip } from 'recharts';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { ChartContainer, ChartTooltip, ChartTooltipContent, ChartLegend, ChartLegendContent, type ChartConfig } from '@/components/ui/chart';
import { PrintDownloadActions } from '@/components/common/print-download-actions';

const ticketsByStatusData = [
  { status: 'New', count: 5, fill: 'var(--color-new)' },
  { status: 'Pending', count: 12, fill: 'var(--color-pending)' },
  { status: 'On Hold', count: 3, fill: 'var(--color-onHold)' },
  { status: 'Active', count: 8, fill: 'var(--color-active)' },
  { status: 'Closed', count: 25, fill: 'var(--color-closed)' },
];

const ticketsByStatusConfig = {
  count: {
    label: 'Tickets',
  },
  new: {
    label: 'New',
    color: 'hsl(var(--chart-1))',
  },
  pending: {
    label: 'Pending',
    color: 'hsl(var(--chart-2))',
  },
  onHold: {
    label: 'On Hold',
    color: 'hsl(var(--chart-3))',
  },
  active: {
    label: 'Active',
    color: 'hsl(var(--chart-4))',
  },
  closed: {
    label: 'Closed',
    color: 'hsl(var(--chart-5))',
  },
} satisfies ChartConfig;


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


export function DashboardCharts() {
  return (
    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-2">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-lg font-medium">Tickets by Status</CardTitle>
          <PrintDownloadActions />
        </CardHeader>
        <CardContent>
          <ChartContainer config={ticketsByStatusConfig} className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={ticketsByStatusData} margin={{ top: 5, right: 20, left: -20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false}/>
                <XAxis dataKey="status" tickLine={false} axisLine={false} tickMargin={8} />
                <YAxis tickLine={false} axisLine={false} tickMargin={8} />
                <ChartTooltip content={<ChartTooltipContent />} />
                 <ChartLegend content={<ChartLegendContent />} />
                <Bar dataKey="count" radius={4} />
              </BarChart>
            </ResponsiveContainer>
          </ChartContainer>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-lg font-medium">Avg. Ticket Resolution Time</CardTitle>
           <PrintDownloadActions />
        </CardHeader>
        <CardContent>
           <ChartContainer config={ticketResolutionTimeConfig} className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={ticketResolutionTimeData} margin={{ top: 5, right: 20, left: -20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="date" tickLine={false} axisLine={false} tickMargin={8} />
                <YAxis tickLine={false} axisLine={false} tickMargin={8} />
                <ChartTooltip content={<ChartTooltipContent indicator="line" />} />
                <Line type="monotone" dataKey="avgTime" stroke="var(--color-avgTime)" strokeWidth={2} dot={false} />
              </LineChart>
            </ResponsiveContainer>
          </ChartContainer>
        </CardContent>
      </Card>
    </div>
  );
}
