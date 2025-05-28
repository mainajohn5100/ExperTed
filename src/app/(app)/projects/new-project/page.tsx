
'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { AppHeader } from '@/components/layout/header';
import { PageTitle } from '@/components/common/page-title';
import { useToast } from "@/hooks/use-toast";
import { createProjectInAppwrite } from '@/lib/data';
import type { Project, ProjectDocumentStatus } from '@/types';
import { ArrowLeft, CalendarIcon, Loader2, PlusCircle } from 'lucide-react';
import Link from 'next/link';
import { format, isValid } from 'date-fns';
import { cn } from '@/lib/utils';

const projectStatuses: ProjectDocumentStatus[] = ["new", "active", "on-hold", "completed"];

export default function NewProjectPage() {
  const router = useRouter();
  const { toast } = useToast();
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [deadline, setDeadline] = useState<Date | undefined>(undefined);
  const [status, setStatus] = useState<ProjectDocumentStatus>('new');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    if (!name.trim() || !description.trim()) {
      toast({ variant: "destructive", title: "Missing Fields", description: "Please fill in project name and description." });
      setIsSubmitting(false);
      return;
    }

    const newProjectData: Omit<Project, '$id' | '$createdAt' | '$updatedAt'> = {
      name,
      description,
      status,
      deadline: deadline ? deadline.toISOString() : null, // Ensure deadline is ISO string or null
      teamMembers: [], // Placeholder for team members
    };
    
    console.log("Attempting to create project with data:", JSON.stringify(newProjectData, null, 2));

    try {
      const createdProject = await createProjectInAppwrite(newProjectData);
      if (createdProject) {
        toast({ title: "Project Created", description: `Project "${createdProject.name}" has been successfully created.` });
        router.refresh(); 
        router.push('/projects/all'); 
      } else {
        toast({ variant: "destructive", title: "Creation Failed", description: "Could not create the project in Appwrite. Function returned undefined." });
      }
    } catch (error) {
      console.error("Failed to create project in Appwrite:", error);
      toast({ variant: "destructive", title: "Creation Failed", description: (error as Error).message || "Could not create the project in Appwrite." });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      <AppHeader title="Create New Project">
        <Button variant="outline" asChild>
          <Link href="/projects/all"><ArrowLeft className="mr-2 h-4 w-4" />Back to Projects</Link>
        </Button>
      </AppHeader>
      <div className="flex flex-col gap-6">
        <PageTitle title="New Project Details" />
        <form onSubmit={handleSubmit}>
          <Card>
            <CardHeader>
              <CardTitle>Project Information</CardTitle>
              <CardDescription>Fill in the details for the new project.</CardDescription>
            </CardHeader>
            <CardContent className="grid gap-6">
              <div className="space-y-2">
                <Label htmlFor="projectName">Project Name</Label>
                <Input id="projectName" value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g., Q4 Marketing Campaign" required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="projectDescription">Description</Label>
                <Textarea id="projectDescription" value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Detailed description of the project goals and scope..." rows={5} required />
              </div>
              <div className="grid md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="projectStatus">Status</Label>
                  <Select value={status} onValueChange={(v) => setStatus(v as ProjectDocumentStatus)}>
                    <SelectTrigger id="projectStatus">
                      <SelectValue placeholder="Select status" />
                    </SelectTrigger>
                    <SelectContent>
                      {projectStatuses.map(s => <SelectItem key={s} value={s}>{s.charAt(0).toUpperCase() + s.slice(1).replace('-', ' ')}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="projectDeadline">Deadline (Optional)</Label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        id="projectDeadline"
                        variant={"outline"}
                        className={cn(
                          "w-full justify-start text-left font-normal",
                          !deadline && "text-muted-foreground"
                        )}
                      >
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {deadline ? format(deadline, "PPP") : <span>Pick a date</span>}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0">
                      <Calendar
                        mode="single"
                        selected={deadline}
                        onSelect={setDeadline}
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>
                </div>
              </div>
              {/* Placeholder for team members selection - to be implemented later */}
              {/* <div className="space-y-2">
                <Label htmlFor="teamMembers">Team Members (Optional)</Label>
                <Input id="teamMembers" placeholder="Search or select team members..." />
              </div> */}
            </CardContent>
            <CardFooter>
              <Button type="submit" className="ml-auto" disabled={isSubmitting}>
                {isSubmitting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <PlusCircle className="mr-2 h-4 w-4" />}
                Create Project
              </Button>
            </CardFooter>
          </Card>
        </form>
      </div>
    </>
  );
}
