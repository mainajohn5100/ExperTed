
import type { Models } from 'appwrite';

export type TicketDocumentStatus = "new" | "pending" | "on-hold" | "closed" | "active" | "terminated";
export type TicketStatusFilter = "all" | TicketDocumentStatus;

export type ProjectDocumentStatus = "new" | "active" | "on-hold" | "completed";
export const projectDocumentStatuses: ProjectDocumentStatus[] = ["new", "active", "on-hold", "completed"];
export type ProjectStatusKey = "all" | ProjectDocumentStatus;


export interface TicketReply {
  id: string;
  userId: string; // User who wrote the reply
  userName: string;
  content: string;
  createdAt: string; // ISO date string
}
export interface Ticket {
  $id: string;
  title: string;
  description: string;
  customerName: string;
  customerEmail: string;
  $createdAt: string; // ISO date string
  $updatedAt: string; // ISO date string
  status: TicketDocumentStatus;
  tags: string[];
  assignedTo?: string; // ID of an agent/user
  priority: "low" | "medium" | "high" | "urgent";
  channel: "email" | "sms" | "social-media" | "web-form" | "manual";
  replies?: string; // JSON string of TicketReply[]
  userId: string; // User who created/owns the ticket
}

export interface Project {
  $id: string;
  name: string;
  description: string;
  status: ProjectDocumentStatus;
  $createdAt: string; // ISO date string
  $updatedAt: string; // ISO date string
  deadline?: string | null; // ISO date string or null
  teamMembers?: string[]; // Array of user IDs/names
  userId?: string; // User who created/owns the project
}

export interface User {
  id: string; // Generic user ID
  name: string;
  email?: string;
  avatar?: string; // URL to avatar image
}

// Appwrite specific user model with augmented preferences
export type AppFontSize = 'sm' | 'default' | 'lg';
export type AppTheme = 'default' | 'ocean' | 'forest' | 'rose';

export interface UserPreferences extends Models.Preferences {
  avatarUrl?: string;
  emailNotificationsEnabled?: boolean;
  // inAppNotificationsEnabled?: boolean; // Example for future
  fontSize?: AppFontSize;
  theme?: AppTheme;
}

export type AppwriteUser = Models.User<UserPreferences>;


export type TicketPriority = Ticket['priority'];
export type TicketChannel = Ticket['channel'];

export interface AppNotification {
  $id: string;
  userId: string; // To whom the notification belongs
  message: string;
  href?: string; // Optional link for navigation
  isRead: boolean;
  $createdAt: string; // ISO date string
  $updatedAt: string; // ISO date string
}

