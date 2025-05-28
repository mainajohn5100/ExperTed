
'use client';

import * as React from 'react';
import { Bar, BarChart, CartesianGrid, XAxis, YAxis, Pie, PieChart as RechartsPieChart, Cell, Line, LineChart as RechartsLineChart, Legend as RechartsLegend } from 'recharts';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ChartContainer, ChartTooltip, ChartTooltipContent, ChartLegend, ChartLegendContent, type ChartConfig } from '@/components/ui/chart';
import { Button } from '@/components/ui/button';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { BarChart3, PieChart as PieChartIcon, LineChart as LineChartIconCSS, MoreVertical, Printer, Download, Loader2 } from 'lucide-react'; // Renamed LineChartIcon
import type { Ticket, TicketDocumentStatus } from '@/types';

const ticketStatusColors: Record<TicketDocumentStatus, string> = {
  new: 'hsl(var(--chart-1))',
  pending: 'hsl(var(--chart-2))',
  'on-hold': 'hsl(var(--chart-3))',
  active: 'hsl(var(--chart-4))',
  closed: 'hsl(var(--chart-5))',
  terminated: 'hsl(var(--destructive))',
};

interface StatusData {
  statusKey: TicketDocumentStatus;
  name: string;
  count: number;
  fill: string;
}

interface OverallTicketsByStatusChartProps {
  tickets: Ticket[];
}

export function OverallTicketsByStatusChart({ tickets }: OverallTicketsByStatusChartProps) {
  console.log('[OverallTicketsByStatusChart] Received tickets:', tickets.length);
  const [chartType, setChartType] = React.useState<'bar' | 'pie' | 'line'>('bar');
  const [isLoading, setIsLoading] = React.useState(true);
  const [processedData, setProcessedData] = React.useState<StatusData[]>([]);
  const [chartConfig, setChartConfig] = React.useState<ChartConfig>({});

  React.useEffect(() => {
    setIsLoading(true);
    try {
      const statusCounts = tickets.reduce((acc, ticket) => {
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
      
      setProcessedData(dataForChart);

      const dynamicConfig: ChartConfig = { 
        count: { label: "Tickets"},
        line: { label: 'Tickets', color: "hsl(var(--primary))" }, 
      };
      dataForChart.forEach(item => {
          dynamicConfig[item.statusKey] = { label: item.name, color: item.fill };
      });
      setChartConfig(dynamicConfig);
      console.log('[OverallTicketsByStatusChart] Processed ticket status data:', dataForChart);

    } catch (error) {
      console.error("[OverallTicketsByStatusChart] Failed to process ticket data:", error);
    }
    setIsLoading(false);
  }, [tickets]);

  const handlePrint = () => {
    if (typeof window !== 'undefined') window.print();
  };
  const handleDownload = () => alert('Download functionality to be implemented.');

  if (isLoading) {
    return (
      <Card>
        <CardHeader><CardTitle>Overall Tickets by Status</CardTitle></CardHeader>
        <CardContent className="h-[350px] flex items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </CardContent>
      </Card>
    );
  }

  if (!isLoading && processedData.every(d => d.count === 0)) {
     return (
      <Card>
        <CardHeader><CardTitle>Overall Tickets by Status</CardTitle></CardHeader>
        <CardContent className="h-[350px] flex items-center justify-center"><p>No ticket data available to display.</p></CardContent>
     </Card>
   );
 }
  
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle>Overall Tickets by Status</CardTitle>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="h-8 w-8">
              <MoreVertical className="h-4 w-4" /> <span className="sr-only">More options</span>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onSelect={() => setChartType('bar')}><BarChart3 className="mr-2 h-4 w-4" />Bar Chart</DropdownMenuItem>
            <DropdownMenuItem onSelect={() => setChartType('pie')}><PieChartIcon className="mr-2 h-4 w-4" />Pie Chart</DropdownMenuItem>
            <DropdownMenuItem onSelect={() => setChartType('line')}><LineChartIconCSS className="mr-2 h-4 w-4" />Line Chart</DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem onSelect={handlePrint}><Printer className="mr-2 h-4 w-4" />Print</DropdownMenuItem>
            <DropdownMenuItem onSelect={handleDownload}><Download className="mr-2 h-4 w-4" />Download</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </CardHeader>
      <CardContent>
        <ChartContainer config={chartConfig} className="h-[300px] w-full">
          {chartType === 'bar' ? (
            <BarChart data={processedData} margin={{ top: 5, right: 20, left: -20, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false}/>
              <XAxis dataKey="name" tickLine={false} axisLine={false} tickMargin={8} />
              <YAxis tickLine={false} axisLine={false} tickMargin={8} allowDecimals={false} />
              <ChartTooltip content={<ChartTooltipContent />} />
              <ChartLegend content={<ChartLegendContent />} />
              <Bar dataKey="count" radius={4}>
                 {processedData.map((entry) => (
                    <Cell key={`cell-${entry.statusKey}`} fill={`var(--color-${entry.statusKey})`} />
                  ))}
              </Bar>
            </BarChart>
          ) : chartType === 'pie' ? (
            <RechartsPieChart>
              <ChartTooltip content={<ChartTooltipContent nameKey="name" />} />
              <Pie data={processedData} dataKey="count" nameKey="name" cx="50%" cy="50%" outerRadius={100} label>
                {processedData.map((entry) => (
                  <Cell key={`cell-${entry.statusKey}`} fill={`var(--color-${entry.statusKey})`} />
                ))}
              </Pie>
              <ChartLegend content={<ChartLegendContent nameKey="name" />} />
            </RechartsPieChart>
          ) : ( 
              <RechartsLineChart data={processedData} margin={{ top: 5, right: 20, left: -20, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false}/>
                  <XAxis dataKey="name" tickLine={false} axisLine={false} tickMargin={8} />
                  <YAxis tickLine={false} axisLine={false} tickMargin={8} allowDecimals={false}/>
                  <ChartTooltip content={<ChartTooltipContent indicator="line" />} />
                  <Line type="monotone" dataKey="count" stroke="var(--color-line)" strokeWidth={2} dot={{ r: 4 }} />
              </RechartsLineChart>
          )}
        </ChartContainer>
      </CardContent>
    </Card>
  );
}
