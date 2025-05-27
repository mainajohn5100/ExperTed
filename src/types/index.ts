export type TicketStatus = "all" | "new" | "pending" | "on-hold" | "closed" | "active" | "terminated";
export type ProjectStatusKey = "all" | "new" | "active" | "on-hold" | "completed";

export interface Ticket {
  id: string;
  title: string;
  description: string;
  customerName: string;
  customerEmail: string;
  createdAt: string; // ISO date string
  updatedAt: string; // ISO date string
  status: TicketStatus;
  tags: string[];
  assignedTo?: string; // User ID / Name
  priority: "low" | "medium" | "high" | "urgent";
  channel: "email" | "sms" | "social-media" | "web-form" | "manual";
  replies?: Array<{
    id: string;
    userId: string; // User ID / Name
    userName: string;
    content: string;
    createdAt: string; // ISO date string
  }>;
  userId: string; // ID of the user who created the ticket, for smart replies context
}

export interface Project {
  id: string;
  name: string;
  description: string;
  status: ProjectStatusKey;
  createdAt: string; // ISO date string
  updatedAt: string; // ISO date string
  deadline?: string; // ISO date string
  teamMembers?: string[]; // Array of user IDs/names
}

export interface User {
  id: string;
  name: string;
  avatar?: string; // URL to avatar image
}
