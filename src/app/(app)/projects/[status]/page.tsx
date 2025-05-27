
// This file is DEPRECATED due to a potential naming conflict.
// The active route for project statuses is now /src/app/(app)/projects/[projectStatusParam]/page.tsx
// This file should be manually deleted from your project.
import { AppHeader } from '@/components/layout/header';
import { PageTitle } from '@/components/common/page-title';
import { Button } from '@/components/ui/button';
import Link from 'next/link';

export default function DeprecatedProjectStatusPage({ params }: { params: { status: string }}) {
  console.warn(`[DEPRECATED /projects/[status]/page.tsx] This page was hit with params: ${JSON.stringify(params)}. This file should be deleted. The correct route is /projects/[projectStatusParam].`);
  return (
    <>
      <AppHeader title="Deprecated Page" />
      <div className="p-6">
        <PageTitle title="Deprecated Project Status Page" />
        <p>This page ({`/projects/${params?.status}`}) is deprecated and should not be used. Please ensure this file is deleted and links point to the correct project status routes using '[projectStatusParam]'.</p>
        <Button asChild className="mt-4">
          <Link href="/projects/all">Go to All Projects</Link>
        </Button>
      </div>
    </>
  );
}
