
'use client';

import * as React from 'react';
import { Bar, BarChart, CartesianGrid, ResponsiveContainer, XAxis, YAxis, Line, LineChart } from 'recharts';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ChartContainer, ChartTooltip, ChartTooltipContent, type ChartConfig } from '@/components/ui/chart';
import type { Ticket } from '@/types';
import { format, parseISO, getMonth, getYear } from 'date-fns';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';
import { MoreVertical, Printer, Download, BarChart3, LineChart as LineChartIcon } from 'lucide-react';

const chartConfigBase = {
  tickets: {
    label: 'Tickets',
    color: 'hsl(var(--chart-1))',
  },
} satisfies ChartConfig;

interface MonthlyData {
  monthYear: string;
  tickets: number;
  year: number;
  month: number;
}

interface MonthlyTicketVolumeReportChartProps {
  tickets: Ticket[];
}

export function MonthlyTicketVolumeReportChart({ tickets }: MonthlyTicketVolumeReportChartProps) {
  const [monthlyData, setMonthlyData] = React.useState<MonthlyData[]>([]);
  const [isLoading, setIsLoading] = React.useState(true);
  const [chartType, setChartType] = React.useState<'bar' | 'line'>('bar');

  React.useEffect(() => {
    console.log('[MonthlyTicketVolumeReportChart] Received tickets:', tickets.length);
    setIsLoading(true);
    try {
      const ticketsByMonth = tickets.reduce((acc, ticket) => {
        const date = parseISO(ticket.$createdAt);
        const monthYearKey = format(date, 'MMM yyyy');
        
        if (!acc[monthYearKey]) {
          acc[monthYearKey] = {
            monthYear: monthYearKey,
            tickets: 0,
            year: getYear(date),
            month: getMonth(date),
          };
        }
        acc[monthYearKey].tickets += 1;
        return acc;
      }, {} as Record<string, MonthlyData>);

      const sortedData = Object.values(ticketsByMonth).sort((a, b) => {
        if (a.year !== b.year) return a.year - b.year;
        return a.month - b.month;
      });
      
      setMonthlyData(sortedData);
      console.log('[MonthlyTicketVolumeReportChart] Processed monthly data:', sortedData);
    } catch (error) {
      console.error("[MonthlyTicketVolumeReportChart] Failed to process ticket data:", error);
    }
    setIsLoading(false);
  }, [tickets]);

  const handlePrint = () => window.print();
  const handleDownload = () => alert('Download functionality to be implemented.');

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Monthly Ticket Volume</CardTitle>
        </CardHeader>
        <CardContent className="h-[350px] flex items-center justify-center">
          <p>Loading chart data...</p>
        </CardContent>
      </Card>
    );
  }

  if (monthlyData.length === 0 && !isLoading) {
     return (
      <Card>
        <CardHeader>
          <CardTitle>Monthly Ticket Volume</CardTitle>
        </CardHeader>
        <CardContent className="h-[350px] flex items-center justify-center">
          <p>No ticket data available to display.</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle>Monthly Ticket Volume</CardTitle>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="h-8 w-8">
              <MoreVertical className="h-4 w-4" /> <span className="sr-only">More options</span>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onSelect={() => setChartType('bar')}><BarChart3 className="mr-2 h-4 w-4" />Bar Chart</DropdownMenuItem>
            <DropdownMenuItem onSelect={() => setChartType('line')}><LineChartIcon className="mr-2 h-4 w-4" />Line Chart</DropdownMenuItem>
            <DropdownMenuItem onSelect={handlePrint}><Printer className="mr-2 h-4 w-4" />Print</DropdownMenuItem>
            <DropdownMenuItem onSelect={handleDownload}><Download className="mr-2 h-4 w-4" />Download</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </CardHeader>
      <CardContent>
        <ChartContainer config={chartConfigBase} className="h-[300px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            {chartType === 'bar' ? (
              <BarChart data={monthlyData} margin={{ top: 5, right: 20, left: -20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="monthYear" tickLine={false} axisLine={false} tickMargin={8} />
                <YAxis tickLine={false} axisLine={false} tickMargin={8} allowDecimals={false} />
                <ChartTooltip content={<ChartTooltipContent />} />
                <Bar dataKey="tickets" fill="var(--color-tickets)" radius={4} />
              </BarChart>
            ) : (
              <LineChart data={monthlyData} margin={{ top: 5, right: 20, left: -20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="monthYear" tickLine={false} axisLine={false} tickMargin={8} />
                <YAxis tickLine={false} axisLine={false} tickMargin={8} allowDecimals={false} />
                <ChartTooltip content={<ChartTooltipContent indicator="line" />} />
                <Line type="monotone" dataKey="tickets" stroke="var(--color-tickets)" strokeWidth={2} dot={{ r: 4 }} />
              </LineChart>
            )}
          </ResponsiveContainer>
        </ChartContainer>
      </CardContent>
    </Card>
  );
}
