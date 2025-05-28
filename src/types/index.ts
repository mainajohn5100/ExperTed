
export type TicketDocumentStatus = "new" | "pending" | "on-hold" | "closed" | "active" | "terminated";
export type TicketStatusFilter = "all" | TicketDocumentStatus;

export type ProjectDocumentStatus = "new" | "active" | "on-hold" | "completed";
export type ProjectStatusKey = "all" | ProjectDocumentStatus;


export interface TicketReply {
  id: string;
  userId: string;
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
  assignedTo?: string;
  priority: "low" | "medium" | "high" | "urgent";
  channel: "email" | "sms" | "social-media" | "web-form" | "manual";
  replies?: string; // JSON string of TicketReply[]
  userId: string;
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
}

export interface User {
  id: string;
  name: string;
  avatar?: string; // URL to avatar image
}

export type TicketPriority = Ticket['priority'];
export type TicketChannel = Ticket['channel'];

