
'use client';

import type { Project } from '@/types';
import Link from 'next/link';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ArrowUpRight, Briefcase, ListOrdered, PlusCircle } from 'lucide-react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { cn } from '@/lib/utils';
import React from 'react';

interface ProjectListClientProps {
  projects: Project[];
  statusTitle: string;
}

function ProjectCard({ project }: { project: Project }) {
  return (
    <Card>
      <CardHeader>
        <div className="flex justify-between items-start">
          <CardTitle className="hover:underline">
            <Link href={`/projects/view/${project.$id}`}>{project.name}</Link>
          </CardTitle>
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
          <Link href={`/projects/view/${project.$id}`}>View Project <ArrowUpRight className="ml-1 h-4 w-4" /></Link>
        </Button>
      </CardFooter>
    </Card>
  );
}


export function ProjectListClient({ projects, statusTitle }: ProjectListClientProps) {
  const [searchTerm, setSearchTerm] = React.useState('');
  const [sortBy, setSortBy] = React.useState('$createdAt_desc');

  const filteredAndSortedProjects = React.useMemo(() => {
    let filtered = projects.filter(project =>
      project.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      project.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      project.$id.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const [key, order] = sortBy.split('_');

    filtered.sort((a, b) => {
      let valA = a[key as keyof Project];
      let valB = b[key as keyof Project];

      if (key === '$createdAt' || key === '$updatedAt' || key === 'deadline') {
        // For deadline, null values should be sorted consistently (e.g., at the end for asc, beginning for desc)
        if (valA === null && valB === null) return 0;
        if (valA === null) return order === 'asc' ? 1 : -1; // nulls last for asc
        if (valB === null) return order === 'asc' ? -1 : 1; // nulls first for desc
        valA = new Date(valA as string).getTime();
        valB = new Date(valB as string).getTime();
      } else if (typeof valA === 'string' && typeof valB === 'string') {
        valA = valA.toLowerCase();
        valB = valB.toLowerCase();
      }

      if (valA < valB) return order === 'asc' ? -1 : 1;
      if (valA > valB) return order === 'asc' ? 1 : -1;
      return 0;
    });

    return filtered;
  }, [projects, searchTerm, sortBy]);

  return (
    <Card>
      <CardHeader>
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <CardTitle>{statusTitle} Projects</CardTitle>
            <CardDescription>
              Browse and manage projects with the status: {statusTitle.toLowerCase()}.
            </CardDescription>
          </div>
          <div className="flex flex-col sm:flex-row gap-2 w-full md:w-auto">
            <Input
              placeholder="Search projects..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="max-w-xs"
            />
            <Select value={sortBy} onValueChange={setSortBy}>
              <SelectTrigger className="w-full sm:w-[180px]">
                <ListOrdered className="h-4 w-4 mr-2" />
                <SelectValue placeholder="Sort by" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="$createdAt_desc">Newest First</SelectItem>
                <SelectItem value="$createdAt_asc">Oldest First</SelectItem>
                <SelectItem value="name_asc">Name (A-Z)</SelectItem>
                <SelectItem value="name_desc">Name (Z-A)</SelectItem>
                <SelectItem value="deadline_asc">Deadline (Soonest)</SelectItem>
                <SelectItem value="deadline_desc">Deadline (Latest)</SelectItem>
                <SelectItem value="$updatedAt_desc">Last Updated</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {filteredAndSortedProjects.length === 0 ? (
          <div className="text-center py-10 text-muted-foreground">
            <Briefcase className="mx-auto h-12 w-12 mb-4" />
            <p>No projects found for "{statusTitle}" with current filters.</p>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredAndSortedProjects.map((project) => (
              <ProjectCard key={project.$id} project={project} />
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
