// 'use client';
'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  Ticket,
  List,
  PlusCircle,
  Clock,
  PauseCircle,
  Archive,
  PlayCircle,
  Ban,
  BarChart3,
  Briefcase,
  Settings as SettingsIcon, // Renamed to avoid conflict
  ChevronDown,
  ChevronRight,
  LucideIcon,
  Layers,
  CheckCircle2 // Added import for CheckCircle2
} from 'lucide-react';
import {
  Sidebar,
  SidebarHeader,
  SidebarContent,
  SidebarFooter,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarGroup,
  SidebarGroupLabel,
  SidebarMenuBadge,
  useSidebar,
} from '@/components/ui/sidebar';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Separator } from '@/components/ui/separator';
import { cn } from '@/lib/utils';
import React from 'react';

interface NavItem {
  href: string;
  label: string;
  icon: LucideIcon;
  matchExact?: boolean;
  subItems?: NavItem[];
  badge?: string | number;
}

const ticketSubItems: NavItem[] = [
  { href: '/tickets/all', label: 'All Tickets', icon: List, matchExact: true },
  { href: '/tickets/new', label: 'New Tickets', icon: PlusCircle, matchExact: true },
  { href: '/tickets/pending', label: 'Pending Tickets', icon: Clock, matchExact: true },
  { href: '/tickets/on-hold', label: 'On Hold', icon: PauseCircle, matchExact: true },
  { href: '/tickets/closed', label: 'Closed', icon: Archive, matchExact: true },
  { href: '/tickets/active', label: 'Active Tickets', icon: PlayCircle, matchExact: true },
  { href: '/tickets/terminated', label: 'Terminated', icon: Ban, matchExact: true },
]; 

const projectSubItems: NavItem[] = [
  { href: '/projects/all', label: 'All Projects', icon: List, matchExact: true },
  { href: '/projects/new', label: 'New Projects', icon: PlusCircle, matchExact: true },
  { href: '/projects/active', label: 'Active Projects', icon: PlayCircle, matchExact: true },
  { href: '/projects/on-hold', label: 'On Hold', icon: PauseCircle, matchExact: true },
  { href: '/projects/completed', label: 'Completed', icon: CheckCircle2, matchExact: true },
];

const mainNavItems: NavItem[] = [
  { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard, matchExact: true },
  { href: '/tickets', label: 'Tickets', icon: Ticket, subItems: ticketSubItems },
  { href: '/projects', label: 'Projects', icon: Briefcase, subItems: projectSubItems },
  { href: '/reports', label: 'Reports', icon: BarChart3, matchExact: true },
];

const bottomNavItems: NavItem[] = [
  { href: '/settings', label: 'Settings', icon: SettingsIcon, matchExact: true },
];

// Removed local SVG definition for CheckCircle2 as it's now imported from lucide-react

export function SidebarNav() {
  const pathname = usePathname();
  const { state: sidebarState, isMobile, setOpenMobile } = useSidebar();

  const isActive = (href: string, matchExact?: boolean) => {
    if (matchExact) {
      return pathname === href;
    }
    return pathname.startsWith(href);
  };
  
  const [openSubMenus, setOpenSubMenus] = React.useState<Record<string, boolean>>(() => {
    const activeParent = mainNavItems.find(item => item.subItems && item.subItems.some(sub => isActive(sub.href, sub.matchExact)));
    return activeParent ? { [activeParent.label]: true } : {};
  });

  const toggleSubMenu = (label: string) => {
    setOpenSubMenus(prev => ({ ...prev, [label]: !prev[label] }));
  };

  React.useEffect(() => {
    // If a sub-item is active, ensure its parent menu is open
    mainNavItems.forEach(item => {
      if (item.subItems && item.subItems.some(sub => isActive(sub.href, sub.matchExact))) {
        if (!openSubMenus[item.label]) {
          setOpenSubMenus(prev => ({ ...prev, [item.label]: true }));
        }
      }
    });
  }, [pathname, mainNavItems, openSubMenus]);


  const renderNavItems = (items: NavItem[]) => {
    return items.map((item) => (
      <SidebarMenuItem key={item.label}>
        {item.subItems ? (
          <>
            <SidebarMenuButton
              onClick={() => toggleSubMenu(item.label)}
              isActive={isActive(item.href)}
              className="justify-between"
              tooltip={item.label}
            >
              <span className="flex items-center gap-2">
                <item.icon />
                <span>{item.label}</span>
              </span>
              {openSubMenus[item.label] ? <ChevronDown /> : <ChevronRight />}
            </SidebarMenuButton>
            {openSubMenus[item.label] && sidebarState === 'expanded' && (
              <SidebarMenuSub>
                {item.subItems.map((subItem) => (
                  <SidebarMenuItem key={subItem.label}>
                    <Link href={subItem.href} passHref legacyBehavior>
                      <SidebarMenuSubButton
                        isActive={isActive(subItem.href, subItem.matchExact)}
                        onClick={() => isMobile && setOpenMobile(false)}
                      >
                        <subItem.icon />
                        <span>{subItem.label}</span>
                        {subItem.badge && <SidebarMenuBadge>{subItem.badge}</SidebarMenuBadge>}
                      </SidebarMenuSubButton>
                    </Link>
                  </SidebarMenuItem>
                ))}
              </SidebarMenuSub>
            )}
          </>
        ) : (
          <Link href={item.href} passHref legacyBehavior>
            <SidebarMenuButton 
              isActive={isActive(item.href, item.matchExact)}
              tooltip={item.label}
              onClick={() => isMobile && setOpenMobile(false)}
            >
              <item.icon />
              <span>{item.label}</span>
              {item.badge && <SidebarMenuBadge>{item.badge}</SidebarMenuBadge>}
            </SidebarMenuButton>
          </Link>
        )}
      </SidebarMenuItem>
    ));
  };

  return (
    <Sidebar>
      <SidebarHeader>
        <Button variant="ghost" className="w-full justify-start gap-2 px-2 text-lg font-semibold">
          <Layers className="h-6 w-6 text-primary" />
          <span className={cn(sidebarState === 'collapsed' && 'hidden')}>ExperTed</span>
        </Button>
      </SidebarHeader>
      <SidebarContent className="flex-grow">
        <SidebarMenu>{renderNavItems(mainNavItems)}</SidebarMenu>
      </SidebarContent>
      <SidebarFooter>
        <Separator className="my-2" />
        <SidebarMenu>{renderNavItems(bottomNavItems)}</SidebarMenu>
        <Separator className="my-2" />
        <div className={cn("p-2", sidebarState === 'collapsed' && "hidden")}>
          <div className="flex items-center gap-2">
            <Avatar className="h-9 w-9">
              <AvatarImage src="https://placehold.co/100x100.png" alt="User Avatar" data-ai-hint="user avatar" />
              <AvatarFallback>JD</AvatarFallback>
            </Avatar>
            <div>
              <p className="text-sm font-medium">John Doe</p>
              <p className="text-xs text-muted-foreground">john.doe@example.com</p>
            </div>
          </div>
        </div>
      </SidebarFooter>
    </Sidebar>
  );
}
