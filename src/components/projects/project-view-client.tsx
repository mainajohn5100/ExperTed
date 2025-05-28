
'use client';

import type { Project } from '@/types';
import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { cn } from '@/lib/utils';

interface ProjectViewClientProps {
  project: Project;
}

export function ProjectViewClient({ project: initialProject }: ProjectViewClientProps) {
  const [project, setProject] = useState<Project>(initialProject);
  const [formattedCreatedAt, setFormattedCreatedAt] = useState<string | null>(null);
  const [formattedUpdatedAt, setFormattedUpdatedAt] = useState<string | null>(null);
  const [formattedDeadline, setFormattedDeadline] = useState<string | null>(null);

  useEffect(() => {
    setProject(initialProject);
    if (initialProject?.$createdAt) {
      setFormattedCreatedAt(new Date(initialProject.$createdAt).toLocaleString());
    }
    if (initialProject?.$updatedAt) {
      setFormattedUpdatedAt(new Date(initialProject.$updatedAt).toLocaleString());
    }
    if (initialProject?.deadline) {
      setFormattedDeadline(new Date(initialProject.deadline).toLocaleDateString());
    } else {
      setFormattedDeadline('N/A');
    }
  }, [initialProject]);

  if (!project) {
    return <div className="p-6 text-center">Project data is not available.</div>;
  }

  return (
    <div className="grid md:grid-cols-3 gap-6">
      <div className="md:col-span-2 space-y-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-2xl">{project.name}</CardTitle>
            <CardDescription>
              Project ID: {project.$id}
            </CardDescription>
            <div className="text-sm text-muted-foreground mt-2">
              Created: {formattedCreatedAt || 'Loading...'} | Last Updated: {formattedUpdatedAt || 'Loading...'}
            </div>
          </CardHeader>
          <CardContent>
            <h3 className="font-semibold mb-2 text-lg">Description</h3>
            <p className="whitespace-pre-wrap">{project.description}</p>
          </CardContent>
        </Card>
      </div>

      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Project Details</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-sm">
            <div className="flex justify-between">
              <span>Status:</span>
              <Badge
                variant={project.status === 'completed' ? 'outline' : 'default'}
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
            <Separator />
            <div className="flex justify-between">
              <span>Deadline:</span>
              <span>{formattedDeadline || 'Loading...'}</span>
            </div>
            <Separator />
             <div className="space-y-1">
              <span>Team Members:</span>
              {project.teamMembers && project.teamMembers.length > 0 ? (
                <div className="flex flex-wrap gap-1 mt-1">
                  {project.teamMembers.map(member => (
                    <Badge key={member} variant="secondary">{member}</Badge>
                  ))}
                </div>
              ) : (
                <span className="text-muted-foreground"> N/A</span>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
