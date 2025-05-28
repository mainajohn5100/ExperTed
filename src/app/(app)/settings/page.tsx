
'use client';

import { PageTitle } from '@/components/common/page-title';
import { AppHeader } from '@/components/layout/header';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { User, Bell, Palette, Shield, Loader2 } from 'lucide-react'; // Added Loader2
import { Separator } from "@/components/ui/separator";
import { useEffect, useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';

export default function SettingsPage() {
  const [isDark, setIsDark] = useState(false);
  const { user, updateUserName, updateUserAvatarUrl, isLoading: authIsLoading } = useAuth();
  const { toast } = useToast();

  const [nameInput, setNameInput] = useState('');
  const [avatarUrlInput, setAvatarUrlInput] = useState('');
  const [isSavingProfile, setIsSavingProfile] = useState(false);

  useEffect(() => {
    if (typeof document !== 'undefined') {
      setIsDark(document.documentElement.classList.contains('dark'));
    }
  }, []);

  useEffect(() => {
    if (user) {
      setNameInput(user.name || '');
      setAvatarUrlInput(user.prefs?.avatarUrl || '');
    }
  }, [user]);

  const toggleDarkMode = (checked: boolean) => {
    setIsDark(checked);
    if (typeof document !== 'undefined') {
      if (checked) {
        document.documentElement.classList.add('dark');
      } else {
        document.documentElement.classList.remove('dark');
      }
    }
  };

  const handleProfileSaveChanges = async () => {
    if (!user) return;
    setIsSavingProfile(true);
    let nameChanged = false;
    let avatarChanged = false;

    try {
      const updatePromises = [];
      if (nameInput !== user.name) {
        nameChanged = true;
        updatePromises.push(updateUserName(nameInput));
      }
      if (avatarUrlInput !== (user.prefs?.avatarUrl || '')) {
        avatarChanged = true;
        updatePromises.push(updateUserAvatarUrl(avatarUrlInput));
      }

      if (updatePromises.length > 0) {
        await Promise.all(updatePromises);
        let successMessage = "Profile updated successfully!";
        if (nameChanged && avatarChanged) successMessage = "Name and avatar updated!";
        else if (nameChanged) successMessage = "Name updated successfully!";
        else if (avatarChanged) successMessage = "Avatar URL updated successfully!";
        toast({ title: "Success", description: successMessage });
      } else {
        toast({ title: "No Changes", description: "No information was changed." });
      }
    } catch (error) {
      console.error("Failed to update profile:", error);
      toast({ variant: "destructive", title: "Update Failed", description: (error as Error).message || "Could not update profile." });
    } finally {
      setIsSavingProfile(false);
    }
  };


  return (
    <>
    <AppHeader title="Settings" />
    <div className="flex flex-col gap-6">
      <PageTitle title="Application Settings" />

      <Tabs defaultValue="profile" className="w-full">
        <TabsList className="grid w-full grid-cols-2 md:grid-cols-4 mb-6">
          <TabsTrigger value="profile"><User className="mr-2 h-4 w-4 inline-block"/>Profile</TabsTrigger>
          <TabsTrigger value="notifications"><Bell className="mr-2 h-4 w-4 inline-block"/>Notifications</TabsTrigger>
          <TabsTrigger value="appearance"><Palette className="mr-2 h-4 w-4 inline-block"/>Appearance</TabsTrigger>
          <TabsTrigger value="security"><Shield className="mr-2 h-4 w-4 inline-block"/>Security</TabsTrigger>
        </TabsList>
        
        <TabsContent value="profile">
          <Card>
            <CardHeader>
              <CardTitle>User Profile</CardTitle>
              <CardDescription>Manage your personal information and account settings.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid md:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <Label htmlFor="name">Full Name</Label>
                  <Input 
                    id="name" 
                    value={nameInput}
                    onChange={(e) => setNameInput(e.target.value)}
                    placeholder="Your Name" 
                    disabled={isSavingProfile || authIsLoading}
                  />
                </div>
                <div className="space-y-1">
                  <Label htmlFor="email">Email</Label>
                  <Input id="email" type="email" defaultValue={user?.email || ''} readOnly disabled />
                </div>
              </div>
              <div className="space-y-1">
                  <Label htmlFor="avatar">Avatar URL</Label>
                  <Input 
                    id="avatar" 
                    value={avatarUrlInput}
                    onChange={(e) => setAvatarUrlInput(e.target.value)}
                    placeholder="https://example.com/avatar.png" 
                    disabled={isSavingProfile || authIsLoading}
                  />
              </div>
              <Button onClick={handleProfileSaveChanges} disabled={isSavingProfile || authIsLoading || (!user)}>
                {isSavingProfile ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                Save Changes
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="notifications">
          <Card>
            <CardHeader>
              <CardTitle>Notification Settings</CardTitle>
              <CardDescription>Configure how you receive notifications.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center justify-between space-x-2 p-4 border rounded-lg">
                <Label htmlFor="email-notifications" className="flex flex-col space-y-1">
                  <span>Email Notifications</span>
                  <span className="font-normal leading-snug text-muted-foreground">
                    Receive notifications about new tickets and updates via email. (Coming Soon)
                  </span>
                </Label>
                <Switch id="email-notifications" defaultChecked disabled />
              </div>
              <div className="flex items-center justify-between space-x-2 p-4 border rounded-lg">
                <Label htmlFor="app-notifications" className="flex flex-col space-y-1">
                  <span>In-App Notifications</span>
                  <span className="font-normal leading-snug text-muted-foreground">
                    Show notifications directly within the ExperTed application.
                  </span>
                </Label>
                <Switch id="app-notifications" defaultChecked />
              </div>
               <Button disabled>Save Preferences (Coming Soon)</Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="appearance">
          <Card>
            <CardHeader>
              <CardTitle>Appearance</CardTitle>
              <CardDescription>Customize the look and feel of the application.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
               <div className="flex items-center justify-between space-x-2 p-4 border rounded-lg">
                <Label htmlFor="dark-mode" className="flex flex-col space-y-1">
                  <span>Dark Mode</span>
                  <span className="font-normal leading-snug text-muted-foreground">
                    Enable dark theme for the application.
                  </span>
                </Label>
                <Switch 
                  id="dark-mode" 
                  checked={isDark}
                  onCheckedChange={toggleDarkMode}
                />
              </div>
              <p className="text-muted-foreground text-sm">More appearance settings (e.g., font size, theme accents) will be available here.</p>
               <Button disabled>Save Settings (Coming Soon)</Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="security">
          <Card>
            <CardHeader>
              <CardTitle>Security</CardTitle>
              <CardDescription>Manage your account security settings.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-1">
                <Label htmlFor="current-password">Current Password</Label>
                <Input id="current-password" type="password" disabled />
              </div>
              <div className="space-y-1">
                <Label htmlFor="new-password">New Password</Label>
                <Input id="new-password" type="password" disabled />
              </div>
              <div className="space-y-1">
                <Label htmlFor="confirm-password">Confirm New Password</Label>
                <Input id="confirm-password" type="password" disabled />
              </div>
              <Button disabled>Change Password (Coming Soon)</Button>
              <Separator />
              <div className="flex items-center justify-between space-x-2 p-4 border rounded-lg">
                <Label htmlFor="2fa" className="flex flex-col space-y-1">
                  <span>Two-Factor Authentication (2FA)</span>
                  <span className="font-normal leading-snug text-muted-foreground">
                    Enhance your account security by enabling 2FA. (Coming Soon)
                  </span>
                </Label>
                <Button variant="outline" disabled>Enable 2FA</Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
    </>
  );
}
