
'use client';

import * as React from 'react';
import { Line, LineChart, CartesianGrid, ResponsiveContainer, XAxis, YAxis } from 'recharts';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ChartContainer, ChartTooltip, ChartTooltipContent, type ChartConfig } from '@/components/ui/chart';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';
import { MoreVertical, Printer, Download } from 'lucide-react';

const mockCsatData = [
  { month: 'Jan', score: 4.2, responses: 50 },
  { month: 'Feb', score: 4.5, responses: 65 },
  { month: 'Mar', score: 4.1, responses: 58 },
  { month: 'Apr', score: 4.6, responses: 72 },
  { month: 'May', score: 4.4, responses: 60 },
  { month: 'Jun', score: 4.7, responses: 75 },
];

const chartConfig = {
  score: {
    label: 'CSAT Score',
    color: 'hsl(var(--chart-2))',
  },
} satisfies ChartConfig;

export function CsatReportChart() {
  console.log('[CsatReportChart] Rendering...');
  const [csatData] = React.useState(mockCsatData); // Still using mock data

  const handlePrint = () => {
    if (typeof window !== 'undefined') window.print();
  };
  const handleDownload = () => alert('Download functionality to be implemented.');

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle>Customer Satisfaction (CSAT)</CardTitle>
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
            <LineChart data={csatData} margin={{ top: 5, right: 20, left: -20, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} />
              <XAxis dataKey="month" tickLine={false} axisLine={false} tickMargin={8} />
              <YAxis 
                tickLine={false} 
                axisLine={false} 
                tickMargin={8} 
                domain={[0, 5]} 
                allowDecimals={true} 
              />
              <ChartTooltip content={<ChartTooltipContent indicator="line" />} />
              <Line type="monotone" dataKey="score" stroke="var(--color-score)" strokeWidth={2} dot={{ r: 4 }} />
            </LineChart>
          </ResponsiveContainer>
        </ChartContainer>
      </CardContent>
    </Card>
  );
}
