
// Top-level log to confirm file is reached by Next.js
console.log('[ProjectsByStatusPage] File /src/app/(app)/projects/[projectStatusParam]/page.tsx reached by Next.js routing.');

import { getProjectsByStatus } from '@/lib/data';
import type { Project, ProjectStatusKey } from '@/types';
import { PageTitle } from '@/components/common/page-title';
import { AppHeader } from '@/components/layout/header';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { Briefcase, ArrowUpRight, PlusCircle } from 'lucide-react';
import { cn } from '@/lib/utils';

export const dynamic = 'force-dynamic';

function ProjectCard({ project }: { project: Project }) {
  return (
    <Card>
      <CardHeader>
        <div className="flex justify-between items-start">
          <CardTitle>{project.name}</CardTitle>
          <Badge variant={project.status === 'completed' ? 'outline' : 'default'}
            className={cn(
                project.status === 'new' && 'bg-blue-500/20 text-blue-700 border-blue-500/30 hover:bg-blue-500/30',
                project.status === 'active' && 'bg-green-500/20 text-green-700 border-green-500/30 hover:bg-green-500/30',
                project.status === 'on-hold' && 'bg-orange-500/20 text-orange-700 border-orange-500/30 hover:bg-orange-500/30',
                project.status === 'completed' && 'bg-gray-500/20 text-gray-700 border-gray-500/30 hover:bg-gray-500/30',
            )}
          >
            {project.status.charAt(0).toUpperCase() + project.status.slice(1).replace('-', ' ')}
          </Badge>
        </div>
        <CardDescription>Created: {new Date(project.$createdAt).toLocaleDateString()}</CardDescription>
      </CardHeader>
      <CardContent>
        <p className="text-sm text-muted-foreground line-clamp-3">{project.description}</p>
        {project.deadline && <p className="text-sm mt-2">Deadline: <span className="font-medium">{new Date(project.deadline).toLocaleDateString()}</span></p>}
      </CardContent>
      <CardFooter>
        <Button variant="outline" size="sm" className="ml-auto" asChild>
          {/* Placeholder link, a real app would have a /projects/view/[id] page */}
          <Link href="#">View Project <ArrowUpRight className="ml-1 h-4 w-4" /></Link>
        </Button>
      </CardFooter>
    </Card>
  );
}

interface ProjectsByStatusPageProps {
  params: { projectStatusParam: ProjectStatusKey }; // Ensure this matches the directory name
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
       console.error(`SERVER_ERROR_PATH: [ProjectsByStatusPage] Invalid or missing project status parameter. Displayed as: ${displayStatus}. statusFromParams: ${statusFromParams}. Received full params object: ${receivedParamsString}. Is params.projectStatusParam available? ${String(params?.projectStatusParam !== undefined)}`);
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
        {projects.length === 0 ? (
          <div className="text-center py-10 text-muted-foreground">
              <Briefcase className="mx-auto h-12 w-12 mb-4" />
              <p>No projects found with status "{statusTitle}".</p>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {projects.map((project) => (
              <ProjectCard key={project.$id} project={project} />
            ))}
          </div>
        )}
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
