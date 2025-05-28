
'use client';

import type { Ticket, Project } from '@/types';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Loader2, Brain, Download as DownloadIcon } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { summarizeAllReports, SummarizeAllReportsInput } from '@/ai/flows/summarize-all-reports-flow';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { MonthlyTicketVolumeReportChart } from '@/components/charts/monthly-ticket-volume-report-chart';
import { ProjectStatusReportChart } from '@/components/charts/project-status-report-chart';
import { CsatReportChart } from '@/components/charts/csat-report-chart';
import { MonthlyStatusBreakdownChart } from '@/components/charts/monthly-status-breakdown-chart';
import { PageTitle } from '@/components/common/page-title';

interface ReportsClientPageProps {
  allTickets: Ticket[];
  allProjects: Project[];
}

export function ReportsClientPage({ allTickets, allProjects }: ReportsClientPageProps) {
  console.log('[ReportsClientPage] Client Component: Rendering with tickets:', allTickets.length, 'and projects:', allProjects.length);

  const [isSummaryLoading, setIsSummaryLoading] = useState(false);
  const [reportSummary, setReportSummary] = useState<string | null>(null);
  const { toast } = useToast();

  const handleGenerateSummary = async () => {
    setIsSummaryLoading(true);
    setReportSummary(null);
    try {
      const input: SummarizeAllReportsInput = {
        tickets: allTickets.map(t => ({
          id: t.$id,
          title: t.title,
          status: t.status,
          priority: t.priority,
          createdAt: t.$createdAt,
          channel: t.channel,
        })),
        projects: allProjects.map(p => ({
          id: p.$id,
          name: p.name,
          status: p.status,
          createdAt: p.$createdAt,
          deadline: p.deadline,
        })),
      };
      const result = await summarizeAllReports(input);
      setReportSummary(result.summary);
      toast({ title: 'AI Summary Generated', description: 'The report summary has been created.' });
    } catch (error) {
      console.error('Error generating AI summary:', error);
      toast({ variant: 'destructive', title: 'AI Summary Error', description: 'Could not generate report summary.' });
    } finally {
      setIsSummaryLoading(false);
    }
  };

  const downloadSummary = () => {
    if (!reportSummary) return;
    const blob = new Blob([reportSummary], { type: 'text/plain;charset=utf-8' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = 'report_summary.txt';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(link.href);
  };

  return (
    <div className="flex flex-col gap-6 p-4 md:p-6">
      <PageTitle title="Reporting Overview">
        <Button onClick={handleGenerateSummary} disabled={isSummaryLoading}>
          {isSummaryLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Brain className="mr-2 h-4 w-4" />}
          Generate AI Summary of All Reports
        </Button>
      </PageTitle>

      {reportSummary && (
        <Alert>
          <Brain className="h-4 w-4" />
          <AlertTitle>AI Generated Report Summary</AlertTitle>
          <AlertDescription className="whitespace-pre-wrap mt-2">
            {reportSummary}
            <Button onClick={downloadSummary} variant="outline" size="sm" className="mt-4 ml-auto flex items-center gap-2">
              <DownloadIcon className="h-4 w-4" /> Download Summary
            </Button>
          </AlertDescription>
        </Alert>
      )}

      <div className="grid gap-6 md:grid-cols-1 lg:grid-cols-2">
        <MonthlyTicketVolumeReportChart tickets={allTickets} />
        <ProjectStatusReportChart projects={allProjects} />
        <div className="lg:col-span-2">
          <CsatReportChart /> {/* Mock data for now */}
        </div>
        <div className="lg:col-span-2">
          <MonthlyStatusBreakdownChart tickets={allTickets} />
        </div>
      </div>
      
      {/* Placeholder for Custom Report Generator */}
      {/* <Card>
        <CardHeader><CardTitle>Custom Report Generator</CardTitle></CardHeader>
        <CardContent><p className="text-muted-foreground">Functionality to be implemented.</p></CardContent>
      </Card> */}
    </div>
  );
}
