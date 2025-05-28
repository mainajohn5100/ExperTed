
'use client';

import * as React from 'react';
import { Bar, BarChart, CartesianGrid, ResponsiveContainer, XAxis, YAxis } from 'recharts';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ChartContainer, ChartTooltip, ChartTooltipContent, type ChartConfig } from '@/components/ui/chart';
import { getTicketsByStatus } from '@/lib/data';
import type { Ticket } from '@/types';
import { format, parseISO, getMonth, getYear } from 'date-fns';

const chartConfig = {
  tickets: {
    label: 'Tickets',
    color: 'hsl(var(--chart-1))',
  },
} satisfies ChartConfig;

interface MonthlyData {
  monthYear: string; // "Jan 2024"
  tickets: number;
}

export function MonthlyTicketVolumeReportChart() {
  const [monthlyData, setMonthlyData] = React.useState<MonthlyData[]>([]);
  const [isLoading, setIsLoading] = React.useState(true);

  React.useEffect(() => {
    async function fetchData() {
      setIsLoading(true);
      try {
        const allTickets = await getTicketsByStatus('all');
        
        const ticketsByMonth = allTickets.reduce((acc, ticket) => {
          const date = parseISO(ticket.$createdAt);
          const monthYearKey = format(date, 'MMM yyyy'); // e.g., "Jul 2024"
          
          if (!acc[monthYearKey]) {
            acc[monthYearKey] = {
              monthYear: monthYearKey,
              tickets: 0,
              // Store year and month for sorting
              year: getYear(date),
              month: getMonth(date) 
            };
          }
          acc[monthYearKey].tickets += 1;
          return acc;
        }, {} as Record<string, MonthlyData & { year: number; month: number }>);

        const sortedData = Object.values(ticketsByMonth).sort((a, b) => {
          if (a.year !== b.year) {
            return a.year - b.year;
          }
          return a.month - b.month;
        });
        
        setMonthlyData(sortedData);
      } catch (error) {
        console.error("Failed to fetch or process ticket data:", error);
        // Handle error state if needed
      }
      setIsLoading(false);
    }
    fetchData();
  }, []);

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

  if (monthlyData.length === 0) {
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
      <CardHeader>
        <CardTitle>Monthly Ticket Volume</CardTitle>
      </CardHeader>
      <CardContent>
        <ChartContainer config={chartConfig} className="h-[300px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={monthlyData} margin={{ top: 5, right: 20, left: -20, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} />
              <XAxis dataKey="monthYear" tickLine={false} axisLine={false} tickMargin={8} />
              <YAxis tickLine={false} axisLine={false} tickMargin={8} allowDecimals={false} />
              <ChartTooltip content={<ChartTooltipContent />} />
              <Bar dataKey="tickets" fill="var(--color-tickets)" radius={4} />
            </BarChart>
          </ResponsiveContainer>
        </ChartContainer>
      </CardContent>
    </Card>
  );
}
