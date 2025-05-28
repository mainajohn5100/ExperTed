
import { PageTitle } from '@/components/common/page-title';
import { PrintDownloadActions } from '@/components/common/print-download-actions';
import { AppHeader } from '@/components/layout/header';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ProjectStatusReportChart } from '@/components/charts/project-status-report-chart';
import { MonthlyTicketVolumeReportChart } from '@/components/charts/monthly-ticket-volume-report-chart';
import { CsatReportChart } from '@/components/charts/csat-report-chart';

export default function ReportsPage() {
  return (
    <>
    <AppHeader title="Reports" />
    <div className="flex flex-col gap-6">
      <PageTitle title="Reporting Overview" actions={<PrintDownloadActions />} />
      
      <div className="grid gap-6 md:grid-cols-1 lg:grid-cols-2">
        <MonthlyTicketVolumeReportChart />
        <ProjectStatusReportChart />
        <div className="lg:col-span-2">
            <CsatReportChart />
        </div>
      </div>
      <Card>
        <CardHeader>
          <CardTitle>Custom Report Generator</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">
            This section will allow users to generate custom reports based on various metrics and filters.
            (Functionality to be implemented)
          </p>
        </CardContent>
      </Card>
    </div>
    </>
  );
}
