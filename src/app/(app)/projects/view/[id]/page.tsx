
import { getProjectById } from '@/lib/data';
import { ProjectViewClient } from '@/components/projects/project-view-client';
import { PageTitle } from '@/components/common/page-title';
import { AppHeader } from '@/components/layout/header';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';

export const dynamic = 'force-dynamic';

export default async function ViewProjectPage({ params }: { params: { id: string } }) {
  const project = await getProjectById(params.id);

  if (!project) {
    return (
      <>
        <AppHeader title="Project Not Found">
          <Button variant="outline" asChild>
            <Link href="/projects/all"><ArrowLeft className="mr-2 h-4 w-4" />Back to Projects</Link>
          </Button>
        </AppHeader>
        <div className="p-6">
          <PageTitle title="Project Not Found" />
          <p>The project with ID "{params.id}" could not be found.</p>
        </div>
      </>
    );
  }

  return (
    <>
      <AppHeader title={`Project: ${project.name}`}>
        <Button variant="outline" asChild>
            <Link href="/projects/all"><ArrowLeft className="mr-2 h-4 w-4" />Back to Projects</Link>
        </Button>
      </AppHeader>
      <div className="flex flex-col gap-6">
        <ProjectViewClient project={project} />
      </div>
    </>
  );
}
