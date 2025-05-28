
import { PageTitle } from '@/components/common/page-title';
import { AppHeader } from '@/components/layout/header';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';

export default function NewProjectPage() {
  return (
    <>
      <AppHeader title="Create New Project">
        <Button variant="outline" asChild>
          <Link href="/projects/all"><ArrowLeft className="mr-2 h-4 w-4" />Back to Projects</Link>
        </Button>
      </AppHeader>
      <div className="flex flex-col gap-6">
        <PageTitle title="New Project Details" />
        <Card>
          <CardHeader>
            <CardTitle>Project Information</CardTitle>
            <CardDescription>Fill in the details for the new project.</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">
              Project creation form will be implemented here. For now, this is a placeholder.
            </p>
            {/* Future form elements will go here */}
          </CardContent>
        </Card>
      </div>
    </>
  );
}
