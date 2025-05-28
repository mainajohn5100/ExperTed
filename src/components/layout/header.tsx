
'use client';

import { SidebarTrigger } from '@/components/ui/sidebar';
import { Button } from '@/components/ui/button';
import { Bell, UserCircle, Settings, LogOut, Maximize, Minimize } from 'lucide-react';
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

interface AppHeaderProps {
  title?: string;
  children?: React.ReactNode;
}

const mockNotifications = [
  { id: '1', text: 'New ticket #TICK-007 assigned to you.', time: '2m ago', href: '/tickets/view/TICK-007' },
  { id: '2', text: 'Ticket #TICK-004 status changed to Active.', time: '1h ago', href: '/tickets/view/TICK-004' },
  { id: '3', text: 'Project "Website Redesign Q3" deadline approaching.', time: '1d ago', href: '/projects/all' },
];


export function AppHeader({ title, children }: AppHeaderProps) {
  const { toast } = useToast();
  const [isFullScreen, setIsFullScreen] = useState(false);

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

  const handleLogout = () => {
    // In a real app, this would call an authentication service to log out.
    toast({
      title: "Logout",
      description: "Logout functionality to be implemented. You are not actually logged out.",
    });
  };

  return (
    <header className="sticky top-0 z-10 flex h-16 items-center gap-4 border-b bg-background/80 px-4 backdrop-blur md:px-6">
      <div className="md:hidden">
        <SidebarTrigger />
      </div>
      {title && <PageTitle title={title} className="text-xl md:text-2xl hidden md:block mb-0" />} {/* mb-0 to override default */}
      <div className="ml-auto flex items-center gap-1 md:gap-2"> {/* Reduced gap for more space */}
        {children}

        <Button variant="ghost" size="icon" className="rounded-full h-8 w-8 md:h-9 md:w-9" onClick={toggleFullScreen} title={isFullScreen ? "Exit Fullscreen" : "Enter Fullscreen"}>
          {isFullScreen ? <Minimize className="h-4 w-4 md:h-5 md:w-5" /> : <Maximize className="h-4 w-4 md:h-5 md:w-5" />}
          <span className="sr-only">{isFullScreen ? "Exit Fullscreen" : "Enter Fullscreen"}</span>
        </Button>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="rounded-full h-8 w-8 md:h-9 md:w-9">
              <Bell className="h-4 w-4 md:h-5 md:w-5" />
              <span className="sr-only">Notifications</span>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-80">
            <DropdownMenuLabel>Notifications</DropdownMenuLabel>
            <DropdownMenuSeparator />
            {mockNotifications.length > 0 ? (
              mockNotifications.map(notification => (
                <DropdownMenuItem key={notification.id} asChild className="cursor-pointer">
                  <Link href={notification.href || '#'}>
                    <div className="flex flex-col">
                      <span className="text-sm">{notification.text}</span>
                      <span className="text-xs text-muted-foreground">{notification.time}</span>
                    </div>
                  </Link>
                </DropdownMenuItem>
              ))
            ) : (
              <DropdownMenuItem disabled>No new notifications</DropdownMenuItem>
            )}
             <DropdownMenuSeparator />
            <DropdownMenuItem className="justify-center text-sm text-primary hover:underline cursor-pointer" asChild>
                <Link href="#">View all notifications</Link>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="rounded-full h-8 w-8 md:h-9 md:w-9">
              <UserCircle className="h-5 w-5 md:h-6 md:w-6" />
              <span className="sr-only">User Profile</span>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuLabel>My Account</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem asChild className="cursor-pointer">
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
      </div>
    </header>
  );
}
