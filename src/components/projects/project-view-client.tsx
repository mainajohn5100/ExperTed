
'use client';

import type { Project, ProjectDocumentStatus } from '@/types';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { updateProjectInAppwrite, createNotification } from '@/lib/data'; // Added createNotification
import { notifyAdmin, AdminNotificationInput } from "@/ai/flows/notify-admin-flow"; // Added notifyAdmin and AdminNotificationInput
import { cn } from '@/lib/utils';
import { projectDocumentStatuses } from '@/types'; // Import available statuses
import { Loader2 } from 'lucide-react';

interface ProjectViewClientProps {
  project: Project;
}

const ADMIN_USER_ID = "admin_user"; // Placeholder

export function ProjectViewClient({ project: initialProject }: ProjectViewClientProps) {
  const [project, setProject] = useState<Project>(initialProject);
  const [formattedCreatedAt, setFormattedCreatedAt] = useState<string | null>(null);
  const [formattedUpdatedAt, setFormattedUpdatedAt] = useState<string | null>(null);
  const [formattedDeadline, setFormattedDeadline] = useState<string | null>(null);
  const [isUpdatingStatus, setIsUpdatingStatus] = useState(false);
  const { toast } = useToast();
  const router = useRouter();

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

  const triggerAdminNotificationForProject = async (projectId: string, projectTitle: string, eventType: AdminNotificationInput['eventType'], eventDetails: string) => {
    try {
      const notificationInput: AdminNotificationInput = {
        ticketId: projectId, // Using ticketId field for project ID as flow expects it
        eventType,
        details: eventDetails,
        ticketTitle: projectTitle, // Using ticketTitle for project title
      };
      const notificationResult = await notifyAdmin(notificationInput);
      if (notificationResult.sent && notificationResult.notificationMessage) {
        await createNotification({
          userId: ADMIN_USER_ID,
          message: notificationResult.notificationMessage,
          href: `/projects/view/${projectId}`,
        });
        console.log(`Admin notification created for ${eventType} on project:`, projectId);
      }
    } catch (error) {
      console.error("Failed to send/store admin notification for project event:", error);
    }
  };

  const handleStatusChange = async (newStatus: ProjectDocumentStatus) => {
    if (newStatus === project.status) return;
    setIsUpdatingStatus(true);
    const oldStatus = project.status;
    try {
      const updatedProject = await updateProjectInAppwrite(project.$id, { status: newStatus });
      if (updatedProject) {
        setProject(updatedProject); // Update local state with the full updated project
        if (updatedProject.$updatedAt) {
          setFormattedUpdatedAt(new Date(updatedProject.$updatedAt).toLocaleString());
        }
        toast({ title: "Project Status Updated", description: `Project status changed from "${oldStatus}" to "${newStatus}".` });
        
        // Trigger admin notification for status change
        triggerAdminNotificationForProject(
          updatedProject.$id,
          updatedProject.name,
          'status_change', // Re-using 'status_change' event type from tickets
          `Project "${updatedProject.name}" status changed from ${oldStatus} to ${newStatus}.`
        );

        router.refresh(); // Refresh server components if needed
      } else {
        toast({ variant: "destructive", title: "Update Failed", description: "Could not update project status." });
      }
    } catch (error) {
      console.error("Error updating project status:", error);
      toast({ variant: "destructive", title: "Update Error", description: (error instanceof Error ? error.message : "An unknown error occurred") });
    } finally {
      setIsUpdatingStatus(false);
    }
  };


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
            <div className="flex justify-between items-center">
              <span>Status:</span>
              {isUpdatingStatus ? (
                <Loader2 className="h-5 w-5 animate-spin" />
              ) : (
                <Select value={project.status} onValueChange={(value) => handleStatusChange(value as ProjectDocumentStatus)} disabled={isUpdatingStatus}>
                  <SelectTrigger className="w-[180px] h-9">
                    <SelectValue placeholder="Set status" />
                  </SelectTrigger>
                  <SelectContent>
                    {projectDocumentStatuses.map(s => (
                      <SelectItem key={s} value={s}>
                        {s.charAt(0).toUpperCase() + s.slice(1).replace('-', ' ')}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
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
