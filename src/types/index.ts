
export type TicketStatus = "all" | "new" | "pending" | "on-hold" | "closed" | "active" | "terminated";
export type ProjectStatusKey = "all" | "new" | "active" | "on-hold" | "completed";

export interface TicketReply {
  id: string; 
  userId: string; 
  userName: string;
  content: string;
  createdAt: string; // ISO date string
}
export interface Ticket {
  id: string; // Changed from $id
  title: string;
  description: string;
  customerName: string;
  customerEmail: string;
  createdAt: string; // Changed from $createdAt (ISO date string)
  updatedAt: string; // Changed from $updatedAt (ISO date string)
  status: TicketStatus;
  tags: string[];
  assignedTo?: string; 
  priority: "low" | "medium" | "high" | "urgent";
  channel: "email" | "sms" | "social-media" | "web-form" | "manual";
  replies?: string; // JSON string of TicketReply[]
  userId: string; 
}

// Project type remains unchanged for now, using mock data
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
