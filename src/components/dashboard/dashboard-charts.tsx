
'use client';

import * as React from 'react';
import { Bar, BarChart, CartesianGrid, ResponsiveContainer, XAxis, YAxis, Line, LineChart, Pie, PieChart, Cell, Legend as RechartsLegend } from 'recharts';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ChartContainer, ChartTooltip, ChartTooltipContent, ChartLegend, ChartLegendContent, type ChartConfig } from '@/components/ui/chart';
import { PrintDownloadActions } from '@/components/common/print-download-actions';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { BarChart3, PieChart as PieChartIcon } from 'lucide-react';


const ticketsByStatusDataRaw = [
  { statusKey: 'new', name: 'New', count: 5, fill: 'var(--color-new)' },
  { statusKey: 'pending', name: 'Pending', count: 12, fill: 'var(--color-pending)' },
  { statusKey: 'onHold', name: 'On Hold', count: 3, fill: 'var(--color-onHold)' },
  { statusKey: 'active', name: 'Active', count: 8, fill: 'var(--color-active)' },
  { statusKey: 'closed', name: 'Closed', count: 25, fill: 'var(--color-closed)' },
];

const ticketsByStatusConfig = {
  count: { label: 'Tickets' },
  new: { label: 'New', color: 'hsl(var(--chart-1))' },
  pending: { label: 'Pending', color: 'hsl(var(--chart-2))' },
  onHold: { label: 'On Hold', color: 'hsl(var(--chart-3))' },
  active: { label: 'Active', color: 'hsl(var(--chart-4))' },
  closed: { label: 'Closed', color: 'hsl(var(--chart-5))' },
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
  const [ticketStatusChartType, setTicketStatusChartType] = React.useState<'bar' | 'pie'>('bar');

  const pieDataForTicketsByStatus = ticketsByStatusDataRaw.map(item => ({
    name: item.name,
    value: item.count,
    fill: item.fill, // Make sure 'fill' is directly on the item for PieChart Cells
  }));


  return (
    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-2">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-lg font-medium">Tickets by Status</CardTitle>
          <div className="flex items-center gap-2">
            <Select value={ticketStatusChartType} onValueChange={(value) => setTicketStatusChartType(value as 'bar' | 'pie')}>
              <SelectTrigger className="w-[160px] h-8 text-xs">
                <SelectValue placeholder="Chart Type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="bar"><BarChart3 className="mr-2 h-3 w-3 inline-block" />Bar Chart</SelectItem>
                <SelectItem value="pie"><PieChartIcon className="mr-2 h-3 w-3 inline-block" />Pie Chart</SelectItem>
              </SelectContent>
            </Select>
            <PrintDownloadActions />
          </div>
        </CardHeader>
        <CardContent>
          <ChartContainer config={ticketsByStatusConfig} className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              {ticketStatusChartType === 'bar' ? (
                <BarChart data={ticketsByStatusDataRaw} margin={{ top: 5, right: 20, left: -20, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false}/>
                  <XAxis dataKey="name" tickLine={false} axisLine={false} tickMargin={8} />
                  <YAxis tickLine={false} axisLine={false} tickMargin={8} />
                  <ChartTooltip content={<ChartTooltipContent />} />
                  <ChartLegend content={<ChartLegendContent />} />
                  <Bar dataKey="count" radius={4}>
                     {ticketsByStatusDataRaw.map((entry) => (
                        <Cell key={`cell-${entry.statusKey}`} fill={entry.fill} />
                      ))}
                  </Bar>
                </BarChart>
              ) : (
                <PieChart>
                  <ChartTooltip content={<ChartTooltipContent nameKey="name" />} />
                  <Pie data={pieDataForTicketsByStatus} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={100} label>
                    {pieDataForTicketsByStatus.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.fill} />
                    ))}
                  </Pie>
                  <RechartsLegend content={<ChartLegendContent />} />
                </PieChart>
              )}
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

