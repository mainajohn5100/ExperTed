
'use client';

import { SidebarTrigger } from '@/components/ui/sidebar';
import { Button } from '@/components/ui/button';
import { Bell, UserCircle, Settings, LogOut, Maximize, Minimize, LogInIcon } from 'lucide-react';
import { PageTitle } from '@/components/common/page-title';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import Link from 'next/link';
import { useToast } from '@/hooks/use-toast';
import { useState, useEffect, useCallback } from 'react';
import { getNotifications, getUnreadNotificationCount, markNotificationAsRead, markAllNotificationsAsRead } from '@/lib/data';
import type { AppNotification } from '@/types';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { useAuth } from '@/hooks/useAuth'; // Import useAuth

interface AppHeaderProps {
  title?: string;
  children?: React.ReactNode;
}

const ADMIN_USER_ID = "admin_user"; // Placeholder - Notifications are still targeted to admin

export function AppHeader({ title, children }: AppHeaderProps) {
  const { toast } = useToast();
  const [isFullScreen, setIsFullScreen] = useState(false);
  const [notifications, setNotifications] = useState<AppNotification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isNotificationDropdownOpen, setIsNotificationDropdownOpen] = useState(false);
  // Updated useAuth destructuring for NextAuth.js
  const { session, status, logout: nextAuthLogout } = useAuth();
  const user = session?.user; // Extract user from session
  const authIsLoading = status === 'loading'; // Equivalent of isLoading

  const fetchUserNotifications = useCallback(async () => {
    // Notifications are still for ADMIN_USER_ID for now
    try {
      const fetchedNotifications = await getNotifications(ADMIN_USER_ID, 7);
      const fetchedUnreadCount = await getUnreadNotificationCount(ADMIN_USER_ID);
      setNotifications(fetchedNotifications);
      setUnreadCount(fetchedUnreadCount);
    } catch (error) {
      console.error("Failed to fetch notifications:", error);
      setNotifications([]); 
      setUnreadCount(0);
    }
  }, []);

  useEffect(() => {
    if (user) { // Only fetch notifications if a user (even if not used for filtering yet) is determined
        fetchUserNotifications();
        const handleFocus = () => fetchUserNotifications();
        window.addEventListener('focus', handleFocus);
        return () => window.removeEventListener('focus', handleFocus);
    }
  }, [fetchUserNotifications, user]); // user here is now session.user, so this should still work if user is defined

  const handleNotificationClick = async (notification: AppNotification) => {
    if (!notification.isRead) {
      try {
        // This uses Appwrite specific ID: notification.$id
        // This will need to be refactored when notifications are moved away from Appwrite
        await markNotificationAsRead(notification.$id);
        fetchUserNotifications();
      } catch (error) {
        console.error("Failed to mark notification as read:", error);
      }
    }
  };

  const handleMarkAllAsRead = async () => {
    try {
      // This uses Appwrite specific logic
      // This will need to be refactored
      const success = await markAllNotificationsAsRead(ADMIN_USER_ID);
      if (success) {
        toast({ title: "Notifications marked as read." });
        fetchUserNotifications();
      } else {
        toast({ variant: "destructive", title: "Error", description: "Could not mark all notifications as read." });
      }
    } catch (error) {
      toast({ variant: "destructive", title: "Error", description: "Could not mark all notifications as read." });
      console.error("Failed to mark all notifications as read:", error);
    }
  };

  const handleFullScreenChange = useCallback(() => {
    if (typeof document !== 'undefined') {
      setIsFullScreen(!!document.fullscreenElement);
    }
  }, []);

  useEffect(() => {
    if (typeof document !== 'undefined') {
      document.addEventListener('fullscreenchange', handleFullScreenChange);
      return () => {
        document.removeEventListener('fullscreenchange', handleFullScreenChange);
      };
    }
  }, [handleFullScreenChange]);

  const toggleFullScreen = async () => {
    if (typeof document === 'undefined') return;

    if (!document.fullscreenElement) {
      try {
        await document.documentElement.requestFullscreen();
        setIsFullScreen(true);
      } catch (err) {
        toast({
          variant: "destructive",
          title: "Fullscreen Error",
          description: `Could not enter fullscreen mode: ${(err as Error).message}`,
        });
      }
    } else {
      if (document.exitFullscreen) {
        try {
          await document.exitFullscreen();
          setIsFullScreen(false);
        } catch (err) {
           toast({
            variant: "destructive",
            title: "Fullscreen Error",
            description: `Could not exit fullscreen mode: ${(err as Error).message}`,
          });
        }
      }
    }
  };

  const handleLogout = async () => {
    // Use the logout function from NextAuth via the refactored useAuth hook
    await nextAuthLogout();
    toast({ title: "Logged Out", description: "You have been successfully logged out." });
    // NextAuth's signOut will handle redirection (default or as configured)
  };

  return (
    <header className="sticky top-0 z-10 flex h-16 items-center gap-4 border-b bg-background/80 px-4 backdrop-blur md:px-6">
      <div className="md:hidden">
        <SidebarTrigger />
      </div>
      {title && <PageTitle title={title} className="text-xl md:text-2xl hidden md:block mb-0" />}
      <div className="ml-auto flex items-center gap-1 md:gap-2">
        {children}

        <Button variant="ghost" size="icon" className="rounded-full h-8 w-8 md:h-9 md:w-9" onClick={toggleFullScreen} title={isFullScreen ? "Exit Fullscreen" : "Enter Fullscreen"}>
          {isFullScreen ? <Minimize className="h-4 w-4 md:h-5 md:w-5" /> : <Maximize className="h-4 w-4 md:h-5 md:w-5" />}
          <span className="sr-only">{isFullScreen ? "Exit Fullscreen" : "Enter Fullscreen"}</span>
        </Button>

        {/* Display Notifications only if authenticated */}
        {status === 'authenticated' && user && (
          <DropdownMenu open={isNotificationDropdownOpen} onOpenChange={(open) => {
              setIsNotificationDropdownOpen(open);
              if (open) fetchUserNotifications();
          }}>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="rounded-full h-8 w-8 md:h-9 md:w-9 relative">
                <Bell className="h-4 w-4 md:h-5 md:w-5" />
                {unreadCount > 0 && (
                  <Badge 
                    variant="destructive" 
                    className="absolute -top-1 -right-1 h-4 w-4 min-w-[1rem] p-0 flex items-center justify-center rounded-full text-xs"
                  >
                    {unreadCount > 9 ? '9+' : unreadCount}
                  </Badge>
                )}
                <span className="sr-only">Notifications</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-80 md:w-96">
              <DropdownMenuLabel className="flex justify-between items-center">
                <span>Notifications</span>
                {notifications.length > 0 && unreadCount > 0 && (
                  <Button variant="ghost" size="sm" onClick={handleMarkAllAsRead} className="text-xs h-auto p-1">
                    Mark all as read
                  </Button>
                )}
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              {notifications.length > 0 ? (
                notifications.map(notification => (
                  <DropdownMenuItem key={notification.$id} asChild className={cn("cursor-pointer", !notification.isRead && "font-semibold")}>
                    <Link href={notification.href || '#'} onClick={() => handleNotificationClick(notification)}>
                      <div className="flex flex-col w-full">
                        <span className="text-sm whitespace-normal">{notification.message}</span>
                        <span className="text-xs text-muted-foreground mt-0.5">{new Date(notification.$createdAt).toLocaleDateString()}</span>
                      </div>
                    </Link>
                  </DropdownMenuItem>
                ))
              ) : (
                <DropdownMenuItem disabled>No new notifications</DropdownMenuItem>
              )}
            </DropdownMenuContent>
          </DropdownMenu>
        )}

        {/* User Dropdown or Login Button */}
        {authIsLoading ? (
          <div className="h-8 w-8 animate-pulse rounded-full bg-muted md:h-9 md:w-9" /> // Skeleton loader for user icon area
        ) : status === 'authenticated' && user ? (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="rounded-full h-8 w-8 md:h-9 md:w-9">
                {/* TODO: Replace with user.image if available from NextAuth session later */}
                <UserCircle className="h-5 w-5 md:h-6 md:w-6" />
                <span className="sr-only">User Profile</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel>
                {/* Display user's name or email. Ensure user object is checked. */}
                {user.name ? user.name : (user.email ? user.email : 'My Account')}
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem asChild className="cursor-pointer">
                {/* Settings link might need to be conditional if user has no name/email yet */}
                <Link href="/settings">
                  <Settings className="mr-2 h-4 w-4" />
                  <span>Settings</span>
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem onClick={handleLogout} className="cursor-pointer text-destructive focus:bg-destructive/10 focus:text-destructive">
                <LogOut className="mr-2 h-4 w-4" />
                <span>Logout</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        ) : (
          // Show login button if not loading and not authenticated (status === 'unauthenticated')
          <Button variant="outline" asChild>
            <Link href="/auth/signin"><LogInIcon className="mr-2 h-4 w-4" />Login</Link>
          </Button>
        )}
      </div>
    </header>
  );
}
