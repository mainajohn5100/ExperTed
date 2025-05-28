
// Top-level log to confirm file is reached by Next.js
console.log('[ProjectsByStatusPage] File /src/app/(app)/projects/[projectStatusParam]/page.tsx reached by Next.js routing.');

import { getProjectsByStatus } from '@/lib/data';
import type { Project, ProjectStatusKey, ProjectDocumentStatus } from '@/types';
import { PageTitle } from '@/components/common/page-title';
import { AppHeader } from '@/components/layout/header';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { PlusCircle } from 'lucide-react';
import { ProjectListClient } from '@/components/projects/project-list-client';


export const dynamic = 'force-dynamic';

interface ProjectsByStatusPageProps {
  params: { projectStatusParam: string };
  searchParams?: { [key: string]: string | string[] | undefined };
}

export default async function ProjectsByStatusPage({ params, searchParams }: ProjectsByStatusPageProps) {
  console.log('[ProjectsByStatusPage] Component loaded. Received full props:', JSON.stringify({ params, searchParams }, null, 2));
  console.log('[ProjectsByStatusPage] Received params object:', JSON.stringify(params, null, 2));
  
  try {
    const statusFromParams = params?.projectStatusParam;
    console.log('[ProjectsByStatusPage] Extracted statusFromParams:', statusFromParams);
    
    const validStatuses: ProjectStatusKey[] = ["all", "new", "active", "on-hold", "completed"];

    if (typeof statusFromParams !== 'string' || !validStatuses.includes(statusFromParams as ProjectStatusKey)) {
       const displayStatus = statusFromParams === undefined ? 'undefined (not provided)' : `"${statusFromParams}" (unrecognized)`;
       const receivedParamsString = JSON.stringify(params); 
       const errorMessage = `[ProjectsByStatusPage] Invalid or missing project status parameter. Displayed as: ${displayStatus}. statusFromParams: ${statusFromParams}. Received full params object: ${receivedParamsString}. Is params.projectStatusParam available? ${String(params?.projectStatusParam !== undefined)}`;
       console.error(`SERVER_ERROR_PATH: ${errorMessage}`);
       return (
          <>
          <AppHeader title="Invalid Project Status" />
          <div className="p-6">
              <PageTitle title={`Invalid Project Status: ${displayStatus}`} />
              <p>Please select a valid project status from the navigation. Params received: {receivedParamsString}</p>
              <Button asChild className="mt-4">
              <Link href="/projects/all">View All Projects</Link>
              </Button>
          </div>
        </>
      );
    }

    const projects = await getProjectsByStatus(statusFromParams as ProjectStatusKey);
    const statusTitle = statusFromParams.charAt(0).toUpperCase() + statusFromParams.slice(1).replace('-', ' ');

    return (
      <>
      <AppHeader title={`${statusTitle} Projects`}>
          <Button asChild>
            <Link href="/projects/new-project"><PlusCircle className="mr-2 h-4 w-4" />Create New Project</Link>
          </Button>
      </AppHeader>
      <div className="flex flex-col gap-6">
        <ProjectListClient projects={projects} statusTitle={statusTitle} />
      </div>
      </>
    );
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    console.error(`[ProjectsByStatusPage] UNHANDLED EXCEPTION for params "${params?.projectStatusParam}":`, errorMessage, error);
    return (
      <>
        <AppHeader title="Internal Server Error" />
        <div className="p-6">
          <PageTitle title="Internal Server Error" />
          <p>An unexpected error occurred while trying to load projects for status: "{params?.projectStatusParam}". Error: {errorMessage}. Please check the server logs for more details.</p>
           <Button asChild className="mt-4">
            <Link href="/dashboard">Go to Dashboard</Link>
          </Button>
        </div>
      </>
    );
  }
}
