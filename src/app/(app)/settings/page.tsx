
'use client';

import { PageTitle } from '@/components/common/page-title';
import { AppHeader } from '@/components/layout/header';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { User, Bell, Palette, Shield, Loader2, CheckCircle, ShieldAlert } from 'lucide-react';
import { Separator } from "@/components/ui/separator";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useEffect, useState, FormEvent } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import { ImageDropzone } from '@/components/settings/image-dropzone';
import { storage, avatarsBucketId, ID } from '@/lib/appwrite';
import type { UserPreferences, AppFontSize, AppTheme } from '@/types';

const fontSizes: { value: AppFontSize; label: string }[] = [
  { value: 'sm', label: 'Small' },
  { value: 'default', label: 'Default' },
  { value: 'lg', label: 'Large' },
];

const themes: { value: AppTheme; label: string }[] = [
  { value: 'default', label: 'Default' },
  { value: 'ocean', label: 'Ocean Blue' },
  { value: 'forest', label: 'Forest Green' },
  { value: 'rose', label: 'Rose Pink' },
];

export default function SettingsPage() {
  const [isDark, setIsDark] = useState(false);
  const { user, updateUserName, updateUserAvatarUrl, updateUserPreferences, changePassword, isLoading: authIsLoading, refreshUser } = useAuth();
  const { toast } = useToast();

  // Profile States
  const [nameInput, setNameInput] = useState('');
  const [avatarUrlInput, setAvatarUrlInput] = useState('');
  const [selectedAvatarFile, setSelectedAvatarFile] = useState<File | null>(null);
  const [isUploadingAvatar, setIsUploadingAvatar] = useState(false);
  const [isSavingProfile, setIsSavingProfile] = useState(false);

  // Notification States
  const [emailNotificationsEnabled, setEmailNotificationsEnabled] = useState(false);
  const [isSavingNotificationPrefs, setIsSavingNotificationPrefs] = useState(false);

  // Appearance States
  const [selectedFontSize, setSelectedFontSize] = useState<AppFontSize>('default');
  const [selectedTheme, setSelectedTheme] = useState<AppTheme>('default');
  const [isSavingAppearance, setIsSavingAppearance] = useState(false);

  // Security States
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isChangingPassword, setIsChangingPassword] = useState(false);


  useEffect(() => {
    if (typeof document !== 'undefined') {
      setIsDark(document.documentElement.classList.contains('dark'));
    }
  }, []);

  useEffect(() => {
    if (user) {
      const userPrefs = user.prefs as UserPreferences;
      setNameInput(user.name || '');
      setAvatarUrlInput(userPrefs?.avatarUrl || '');
      setSelectedAvatarFile(null);
      setEmailNotificationsEnabled(userPrefs?.emailNotificationsEnabled || false);
      setSelectedFontSize(userPrefs?.fontSize || 'default');
      setSelectedTheme(userPrefs?.theme || 'default');
      setIsDark(userPrefs?.darkMode === undefined ? document.documentElement.classList.contains('dark') : userPrefs.darkMode);
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

  const handleAvatarFileSelected = (file: File | null) => {
    setSelectedAvatarFile(file);
    if (!file) {
      setAvatarUrlInput((user?.prefs as UserPreferences)?.avatarUrl || '');
    }
  };

  const uploadAvatarAndGetUrl = async (file: File): Promise<string | null> => {
    if (!avatarsBucketId) {
      toast({ variant: "destructive", title: "Upload Error", description: "Avatar bucket ID is not configured." });
      return null;
    }
    setIsUploadingAvatar(true);
    try {
      const uploadedFile = await storage.createFile(avatarsBucketId, ID.unique(), file);
      const fileUrl = storage.getFileView(avatarsBucketId, uploadedFile.$id);
      toast({ title: "Avatar Uploaded", description: "New avatar ready. Click 'Save Changes' to apply." });
      return fileUrl.href;
    } catch (error) {
      console.error("Failed to upload avatar:", error);
      toast({ variant: "destructive", title: "Upload Failed", description: (error as Error).message || "Could not upload new avatar." });
      return null;
    } finally {
      setIsUploadingAvatar(false);
    }
  };

  const handleProfileSaveChanges = async () => {
    if (!user) return;
    setIsSavingProfile(true);
    let finalAvatarUrl = avatarUrlInput;

    try {
      if (selectedAvatarFile) {
        const uploadedUrl = await uploadAvatarAndGetUrl(selectedAvatarFile);
        if (uploadedUrl) {
          finalAvatarUrl = uploadedUrl;
        } else {
          setIsSavingProfile(false);
          return;
        }
      }

      const updatePromises = [];
      let nameChanged = false;
      let avatarChanged = false;

      if (nameInput !== user.name) {
        nameChanged = true;
        updatePromises.push(updateUserName(nameInput));
      }
      const currentAvatarUrl = (user.prefs as UserPreferences)?.avatarUrl || '';
      if (finalAvatarUrl !== currentAvatarUrl) {
        avatarChanged = true;
        updatePromises.push(updateUserAvatarUrl(finalAvatarUrl));
      }

      if (updatePromises.length > 0) {
        await Promise.all(updatePromises);
        let successMessage = "Profile updated successfully!";
        if (nameChanged && avatarChanged) successMessage = "Name and avatar updated!";
        else if (nameChanged) successMessage = "Name updated successfully!";
        else if (avatarChanged) successMessage = "Avatar updated successfully!";
        toast({ title: "Success", description: successMessage });
        setSelectedAvatarFile(null); 
      } else {
        toast({ title: "No Changes", description: "No profile information was changed." });
      }
    } catch (error) {
      console.error("Failed to update profile:", error);
      toast({ variant: "destructive", title: "Update Failed", description: (error as Error).message || "Could not update profile." });
    } finally {
      setIsSavingProfile(false);
    }
  };

  const handleNotificationPreferencesSave = async () => {
    if (!user) return;
    setIsSavingNotificationPrefs(true);
    try {
      const newPrefs: Partial<UserPreferences> = {
        emailNotificationsEnabled: emailNotificationsEnabled,
      };
      await updateUserPreferences(newPrefs);
      toast({ title: "Success", description: "Notification preferences saved." });
    } catch (error) {
      console.error("Failed to save notification preferences:", error);
      toast({ variant: "destructive", title: "Save Failed", description: (error as Error).message || "Could not save notification preferences." });
    } finally {
      setIsSavingNotificationPrefs(false);
    }
  };

  const handleAppearanceSettingsSave = async () => {
    if (!user) return;
    setIsSavingAppearance(true);
    try {
      const newPrefs: Partial<UserPreferences> = {
        fontSize: selectedFontSize,
        theme: selectedTheme,
        darkMode: isDark,
      };
      await updateUserPreferences(newPrefs);
      toast({ title: "Success", description: "Appearance settings saved." });
    } catch (error) {
      console.error("Failed to save appearance settings:", error);
      toast({ variant: "destructive", title: "Save Failed", description: (error as Error).message || "Could not save appearance settings." });
    } finally {
      setIsSavingAppearance(false);
    }
  };

  const handlePasswordChange = async (event: FormEvent) => {
    event.preventDefault();
    if (!user) {
      toast({ variant: "destructive", title: "Not Authenticated", description: "Please log in." });
      return;
    }
    if (!currentPassword || !newPassword || !confirmPassword) {
      toast({ variant: "destructive", title: "Missing Fields", description: "Please fill all password fields." });
      return;
    }
    if (newPassword !== confirmPassword) {
      toast({ variant: "destructive", title: "Password Mismatch", description: "New password and confirm password do not match." });
      return;
    }
    if (newPassword.length < 8) {
        toast({ variant: "destructive", title: "Password Too Short", description: "New password must be at least 8 characters." });
        return;
    }

    setIsChangingPassword(true);
    try {
      await changePassword(currentPassword, newPassword);
      toast({ title: "Password Changed", description: "Your password has been successfully updated." });
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (error: any) {
      toast({ variant: "destructive", title: "Password Change Failed", description: error.message || "Could not change password. Please check your current password." });
    } finally {
      setIsChangingPassword(false);
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
            <CardContent className="space-y-6">
              <div className="grid md:grid-cols-2 gap-6 items-start">
                <div className="space-y-4">
                  <div className="space-y-1">
                    <Label htmlFor="name">Full Name</Label>
                    <Input 
                      id="name" 
                      value={nameInput}
                      onChange={(e) => setNameInput(e.target.value)}
                      placeholder="Your Name" 
                      disabled={isSavingProfile || authIsLoading || isUploadingAvatar}
                    />
                  </div>
                  <div className="space-y-1">
                    <Label htmlFor="email">Email</Label>
                    <Input id="email" type="email" value={user?.email || ''} readOnly disabled />
                  </div>
                  <div className="space-y-1">
                    <Label htmlFor="avatarUrl">Avatar URL (or upload below)</Label>
                    <Input 
                      id="avatarUrl" 
                      value={avatarUrlInput}
                      onChange={(e) => {
                        setAvatarUrlInput(e.target.value);
                        setSelectedAvatarFile(null); 
                      }}
                      placeholder="https://example.com/avatar.png" 
                      disabled={isSavingProfile || authIsLoading || isUploadingAvatar || !!selectedAvatarFile}
                    />
                    {selectedAvatarFile && <p className="text-xs text-muted-foreground">A new avatar file is selected. The URL will be updated upon save.</p>}
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>Avatar Image</Label>
                  <ImageDropzone
                    currentImageUrl={(user?.prefs as UserPreferences)?.avatarUrl}
                    onFileSelected={handleAvatarFileSelected}
                    disabled={isSavingProfile || authIsLoading || isUploadingAvatar}
                  />
                  {isUploadingAvatar && (
                    <div className="flex items-center text-sm text-muted-foreground">
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Uploading new avatar...
                    </div>
                  )}
                </div>
              </div>
              
              <Button onClick={handleProfileSaveChanges} disabled={isSavingProfile || authIsLoading || isUploadingAvatar || (!user)}>
                {(isSavingProfile || isUploadingAvatar) ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <CheckCircle className="mr-2 h-4 w-4" />}
                Save Profile
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
                <Label htmlFor="email-notifications" className="flex flex-col space-y-1 cursor-pointer">
                  <span>Email Notifications</span>
                  <span className="font-normal leading-snug text-muted-foreground">
                    Receive notifications about new tickets and updates via email.
                  </span>
                </Label>
                <Switch 
                  id="email-notifications" 
                  checked={emailNotificationsEnabled}
                  onCheckedChange={setEmailNotificationsEnabled}
                  disabled={isSavingNotificationPrefs || authIsLoading}
                />
              </div>
              <div className="flex items-center justify-between space-x-2 p-4 border rounded-lg opacity-50 cursor-not-allowed">
                <Label htmlFor="app-notifications" className="flex flex-col space-y-1">
                  <span>In-App Notifications</span>
                  <span className="font-normal leading-snug text-muted-foreground">
                    Show notifications directly within the ExperTed application. (Always enabled for demo)
                  </span>
                </Label>
                <Switch 
                  id="app-notifications" 
                  checked={true}
                  disabled 
                />
              </div>
               <Button onClick={handleNotificationPreferencesSave} disabled={isSavingNotificationPrefs || authIsLoading || !user}>
                {isSavingNotificationPrefs ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <CheckCircle className="mr-2 h-4 w-4" />}
                Save Notification Preferences
               </Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="appearance">
          <Card>
            <CardHeader>
              <CardTitle>Appearance Customization</CardTitle>
              <CardDescription>Customize the look and feel of the application.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
               <div className="flex items-center justify-between space-x-2 p-4 border rounded-lg">
                <Label htmlFor="dark-mode" className="flex flex-col space-y-1 cursor-pointer">
                  <span>Dark Mode</span>
                  <span className="font-normal leading-snug text-muted-foreground">
                    Enable dark theme for the application.
                  </span>
                </Label>
                <Switch 
                  id="dark-mode" 
                  checked={isDark}
                  onCheckedChange={toggleDarkMode}
                  disabled={isSavingAppearance || authIsLoading}
                />
              </div>

              <div className="space-y-2 p-4 border rounded-lg">
                <Label htmlFor="font-size">Font Size</Label>
                <Select value={selectedFontSize} onValueChange={(v) => setSelectedFontSize(v as AppFontSize)} disabled={isSavingAppearance || authIsLoading}>
                  <SelectTrigger id="font-size">
                    <SelectValue placeholder="Select font size" />
                  </SelectTrigger>
                  <SelectContent>
                    {fontSizes.map(fs => <SelectItem key={fs.value} value={fs.value}>{fs.label}</SelectItem>)}
                  </SelectContent>
                </Select>
                 <p className="text-xs text-muted-foreground">Changes global font size.</p>
              </div>

              <div className="space-y-2 p-4 border rounded-lg">
                <Label htmlFor="theme">Application Theme</Label>
                <Select value={selectedTheme} onValueChange={(v) => setSelectedTheme(v as AppTheme)} disabled={isSavingAppearance || authIsLoading}>
                  <SelectTrigger id="theme">
                    <SelectValue placeholder="Select theme" />
                  </SelectTrigger>
                  <SelectContent>
                    {themes.map(th => <SelectItem key={th.value} value={th.value}>{th.label}</SelectItem>)}
                  </SelectContent>
                </Select>
                 <p className="text-xs text-muted-foreground">Changes primary and accent colors.</p>
              </div>
              
               <Button onClick={handleAppearanceSettingsSave} disabled={isSavingAppearance || authIsLoading || !user}>
                {isSavingAppearance ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <CheckCircle className="mr-2 h-4 w-4" />}
                Save Appearance Settings
               </Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="security">
          <Card>
            <CardHeader>
              <CardTitle>Security</CardTitle>
              <CardDescription>Manage your account security settings.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <form onSubmit={handlePasswordChange} className="space-y-4">
                <div className="space-y-1">
                  <Label htmlFor="current-password">Current Password</Label>
                  <Input 
                    id="current-password" 
                    type="password" 
                    value={currentPassword}
                    onChange={(e) => setCurrentPassword(e.target.value)}
                    disabled={isChangingPassword || authIsLoading}
                    required
                  />
                </div>
                <div className="space-y-1">
                  <Label htmlFor="new-password">New Password</Label>
                  <Input 
                    id="new-password" 
                    type="password" 
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    disabled={isChangingPassword || authIsLoading}
                    minLength={8}
                    required
                  />
                </div>
                <div className="space-y-1">
                  <Label htmlFor="confirm-password">Confirm New Password</Label>
                  <Input 
                    id="confirm-password" 
                    type="password" 
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    disabled={isChangingPassword || authIsLoading}
                    minLength={8}
                    required
                  />
                </div>
                <Button type="submit" disabled={isChangingPassword || authIsLoading || !user}>
                  {isChangingPassword ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <ShieldAlert className="mr-2 h-4 w-4" />}
                  Change Password
                </Button>
              </form>
              <Separator />
              <div className="flex items-center justify-between space-x-2 p-4 border rounded-lg">
                <Label htmlFor="2fa" className="flex flex-col space-y-1">
                  <span>Two-Factor Authentication (2FA)</span>
                  <span className="font-normal leading-snug text-muted-foreground">
                    Enhance your account security by enabling 2FA.
                  </span>
                </Label>
                <Button variant="outline" disabled>Enable 2FA (Coming Soon)</Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
    </>
  );
}
