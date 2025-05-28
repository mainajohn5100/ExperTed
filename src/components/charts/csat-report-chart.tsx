
'use client';

import * as React from 'react';
import { Line, LineChart, CartesianGrid, ResponsiveContainer, XAxis, YAxis } from 'recharts';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ChartContainer, ChartTooltip, ChartTooltipContent, type ChartConfig } from '@/components/ui/chart';

// Mock CSAT Data
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
    color: 'hsl(var(--chart-2))', // Using chart-2 color
  },
} satisfies ChartConfig;

export function CsatReportChart() {
  // In a real app, this data would be fetched or passed as props
  const [csatData] = React.useState(mockCsatData);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Customer Satisfaction (CSAT)</CardTitle>
      </CardHeader>
      <CardContent>
        <ChartContainer config={chartConfig} className="h-[300px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={csatData} margin={{ top: 5, right: 20, left: -20, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} />
              <XAxis dataKey="month" tickLine={false} axisLine={false} tickMargin={8} />
              <YAxis 
                tickLine={false} 
                axisLine={false} 
                tickMargin={8} 
                domain={[0, 5]} // Assuming CSAT score is out of 5
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
