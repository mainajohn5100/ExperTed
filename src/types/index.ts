
export type TicketStatus = "all" | "new" | "pending" | "on-hold" | "closed" | "active" | "terminated";
export type ProjectStatusKey = "all" | "new" | "active" | "on-hold" | "completed";

export interface TicketReply {
  id: string; // Can be a simple timestamp or a generated ID for the reply
  userId: string; 
  userName: string;
  content: string;
  createdAt: string; // ISO date string
}
export interface Ticket {
  $id: string; // Appwrite document ID
  title: string;
  description: string;
  customerName: string;
  customerEmail: string;
  $createdAt: string; // Appwrite creation timestamp (ISO date string)
  $updatedAt: string; // Appwrite update timestamp (ISO date string)
  status: TicketStatus;
  tags: string[];
  assignedTo?: string; // User ID / Name
  priority: "low" | "medium" | "high" | "urgent";
  channel: "email" | "sms" | "social-media" | "web-form" | "manual";
  replies?: string; // JSON string of TicketReply[]
  userId: string; // ID of the user who created the ticket or customer ID
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
