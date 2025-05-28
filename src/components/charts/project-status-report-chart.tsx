
'use client';

import * as React from 'react';
import { Bar, BarChart, CartesianGrid, Pie, PieChart, ResponsiveContainer, XAxis, YAxis, Tooltip as RechartsTooltip, Legend as RechartsLegend, Cell } from 'recharts';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ChartContainer, ChartTooltip, ChartTooltipContent, ChartLegend, ChartLegendContent, type ChartConfig } from '@/components/ui/chart';
import { mockProjects } from '@/lib/data'; // Using mockProjects for now
import type { Project, ProjectStatusKey } from '@/types';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { BarChart3, PieChart as PieChartIcon } from 'lucide-react';

const projectStatusColors: Record<ProjectStatusKey, string> = {
  all: 'hsl(var(--chart-1))', // Should not be used for individual status
  new: 'hsl(var(--chart-1))', // Blue
  active: 'hsl(var(--chart-2))', // Green
  'on-hold': 'hsl(var(--chart-3))', // Orange
  completed: 'hsl(var(--chart-4))', // Gray/muted
};

const chartConfigBase = {
  count: { label: 'Projects' },
  new: { label: 'New', color: projectStatusColors.new },
  active: { label: 'Active', color: projectStatusColors.active },
  'on-hold': { label: 'On Hold', color: projectStatusColors['on-hold'] },
  completed: { label: 'Completed', color: projectStatusColors.completed },
} satisfies ChartConfig;


export function ProjectStatusReportChart() {
  const [chartType, setChartType] = React.useState<'bar' | 'pie'>('bar');
  const [isLoading, setIsLoading] = React.useState(true);
  const [processedData, setProcessedData] = React.useState<any[]>([]);
  const [chartConfig, setChartConfig] = React.useState<ChartConfig>(chartConfigBase);


  React.useEffect(() => {
    setIsLoading(true);
    // Simulate fetching or processing data
    const projects: Project[] = mockProjects;
    const statusCounts = projects.reduce((acc, project) => {
      acc[project.status] = (acc[project.status] || 0) + 1;
      return acc;
    }, {} as Record<ProjectStatusKey, number>);

    const dataForChart = Object.entries(statusCounts)
      .map(([status, count]) => ({
        name: status.charAt(0).toUpperCase() + status.slice(1).replace('-', ' '),
        value: count,
        status: status as ProjectStatusKey,
        fill: projectStatusColors[status as ProjectStatusKey] || 'hsl(var(--muted))', // Fallback color
      }))
      .filter(item => item.status !== 'all'); // Exclude 'all' if it accidentally gets counted

    setProcessedData(dataForChart);
    
    // Dynamically build chartConfig based on actual statuses present
    const dynamicConfig: ChartConfig = { count: { label: "Projects"} };
    dataForChart.forEach(item => {
        dynamicConfig[item.status] = {
            label: item.name,
            color: item.fill
        };
    });
    setChartConfig(dynamicConfig);
    setIsLoading(false);
  }, []);

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Projects by Status</CardTitle>
        </CardHeader>
        <CardContent className="h-[350px] flex items-center justify-center">
          <p>Loading chart data...</p>
        </CardContent>
      </Card>
    );
  }
  
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle>Projects by Status</CardTitle>
        <Select value={chartType} onValueChange={(value) => setChartType(value as 'bar' | 'pie')}>
          <SelectTrigger className="w-[160px]">
            <SelectValue placeholder="Select chart type" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="bar"><BarChart3 className="mr-2 h-4 w-4 inline-block" />Bar Chart</SelectItem>
            <SelectItem value="pie"><PieChartIcon className="mr-2 h-4 w-4 inline-block" />Pie Chart</SelectItem>
          </SelectContent>
        </Select>
      </CardHeader>
      <CardContent>
        <ChartContainer config={chartConfig} className="h-[300px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            {chartType === 'bar' ? (
              <BarChart data={processedData} layout="vertical" margin={{ right: 20, left: 20 }}>
                <CartesianGrid horizontal={false} />
                <XAxis type="number" dataKey="value" />
                <YAxis type="category" dataKey="name" tickLine={false} axisLine={false} width={80} />
                <ChartTooltip content={<ChartTooltipContent />} />
                <Bar dataKey="value" radius={4}>
                  {processedData.map((entry) => (
                    <Cell key={`cell-${entry.status}`} fill={entry.fill} />
                  ))}
                </Bar>
              </BarChart>
            ) : (
              <PieChart>
                <ChartTooltip content={<ChartTooltipContent nameKey="name" />} />
                <Pie data={processedData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={100} label>
                  {processedData.map((entry) => (
                    <Cell key={`cell-${entry.status}`} fill={entry.fill} />
                  ))}
                </Pie>
                <RechartsLegend content={<ChartLegendContent />} />
              </PieChart>
            )}
          </ResponsiveContainer>
        </ChartContainer>
      </CardContent>
    </Card>
  );
}
