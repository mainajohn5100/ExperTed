
'use client';

import * as React from 'react';
import { Bar, BarChart, CartesianGrid, Pie, PieChart as RechartsPie, ResponsiveContainer, XAxis, YAxis, Cell, Legend as RechartsLegend } from 'recharts';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ChartContainer, ChartTooltip, ChartTooltipContent, ChartLegend, ChartLegendContent, type ChartConfig } from '@/components/ui/chart';
import type { Project, ProjectDocumentStatus } from '@/types';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Button } from '@/components/ui/button';
import { MoreVertical, Printer, Download, BarChart3, PieChart as PieChartIcon } from 'lucide-react';

const projectStatusColors: Record<ProjectDocumentStatus, string> = {
  new: 'hsl(var(--chart-1))',
  active: 'hsl(var(--chart-2))',
  'on-hold': 'hsl(var(--chart-3))',
  completed: 'hsl(var(--chart-4))',
};

const chartConfigBase = {
  count: { label: 'Projects' },
  new: { label: 'New', color: projectStatusColors.new },
  active: { label: 'Active', color: projectStatusColors.active },
  'on-hold': { label: 'On Hold', color: projectStatusColors['on-hold'] },
  completed: { label: 'Completed', color: projectStatusColors.completed },
} satisfies ChartConfig;

interface ProjectStatusReportChartProps {
  projects: Project[];
}

export function ProjectStatusReportChart({ projects }: ProjectStatusReportChartProps) {
  console.log('[ProjectStatusReportChart] Received projects:', projects.length);
  const [chartType, setChartType] = React.useState<'bar' | 'pie'>('bar');
  const [isLoading, setIsLoading] = React.useState(true);
  const [processedData, setProcessedData] = React.useState<any[]>([]);
  const [chartConfig, setChartConfig] = React.useState<ChartConfig>(chartConfigBase);

  React.useEffect(() => {
    setIsLoading(true);
    try {
      const statusCounts = projects.reduce((acc, project) => {
        acc[project.status] = (acc[project.status] || 0) + 1;
        return acc;
      }, {} as Record<ProjectDocumentStatus, number>);

      const dataForChart = (Object.keys(projectStatusColors) as ProjectDocumentStatus[])
        .map((status) => ({
          name: status.charAt(0).toUpperCase() + status.slice(1).replace('-', ' '),
          value: statusCounts[status] || 0,
          status: status,
          fill: projectStatusColors[status] || 'hsl(var(--muted))',
        }));

      setProcessedData(dataForChart);
      
      const dynamicConfig: ChartConfig = { count: { label: "Projects"} };
      dataForChart.forEach(item => {
          dynamicConfig[item.status] = { label: item.name, color: item.fill };
      });
      setChartConfig(dynamicConfig);
      console.log('[ProjectStatusReportChart] Processed project data:', dataForChart);

    } catch (error) {
      console.error("[ProjectStatusReportChart] Failed to process project data:", error);
    }
    setIsLoading(false);
  }, [projects]);

  const handlePrint = () => window.print();
  const handleDownload = () => alert('Download functionality to be implemented.');

  if (isLoading) {
    return (
      <Card>
        <CardHeader><CardTitle>Projects by Status</CardTitle></CardHeader>
        <CardContent className="h-[350px] flex items-center justify-center"><p>Loading chart data...</p></CardContent>
      </Card>
    );
  }

  if (!isLoading && processedData.every(d => d.value === 0)) {
    return (
     <Card>
       <CardHeader><CardTitle>Projects by Status</CardTitle></CardHeader>
       <CardContent className="h-[350px] flex items-center justify-center"><p>No project data available to display.</p></CardContent>
     </Card>
   );
 }
  
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle>Projects by Status</CardTitle>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="h-8 w-8">
              <MoreVertical className="h-4 w-4" /> <span className="sr-only">More options</span>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onSelect={() => setChartType('bar')}><BarChart3 className="mr-2 h-4 w-4" />Bar Chart</DropdownMenuItem>
            <DropdownMenuItem onSelect={() => setChartType('pie')}><PieChartIcon className="mr-2 h-4 w-4" />Pie Chart</DropdownMenuItem>
            <DropdownMenuItem onSelect={handlePrint}><Printer className="mr-2 h-4 w-4" />Print</DropdownMenuItem>
            <DropdownMenuItem onSelect={handleDownload}><Download className="mr-2 h-4 w-4" />Download</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </CardHeader>
      <CardContent>
        <ChartContainer config={chartConfig} className="h-[300px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            {chartType === 'bar' ? (
              <BarChart data={processedData} layout="vertical" margin={{ right: 20, left: 20 }}>
                <CartesianGrid horizontal={false} />
                <XAxis type="number" dataKey="value" allowDecimals={false} />
                <YAxis type="category" dataKey="name" tickLine={false} axisLine={false} width={80} />
                <ChartTooltip content={<ChartTooltipContent />} />
                <Bar dataKey="value" radius={4}>
                  {processedData.map((entry) => (
                    <Cell key={`cell-${entry.status}`} fill={entry.fill} />
                  ))}
                </Bar>
              </BarChart>
            ) : (
              <RechartsPie data={processedData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={100} label>
                <ChartTooltip content={<ChartTooltipContent nameKey="name" />} />
                {processedData.map((entry) => (
                  <Cell key={`cell-${entry.status}`} fill={entry.fill} />
                ))}
              </RechartsPie>
            )}
          </ResponsiveContainer>
        </ChartContainer>
      </CardContent>
    </Card>
  );
}
