
import type { Ticket, Project, User, TicketStatus, ProjectStatusKey, TicketReply } from '@/types';
import { databases, databaseId, ticketsCollectionId, Query, ID } from './appwrite';

// Mock data for users and projects will remain for now
export const mockUsers: User[] = [
  { id: 'user-1', name: 'Alice Wonderland', avatar: 'https://placehold.co/100x100.png' },
  { id: 'user-2', name: 'Bob The Builder', avatar: 'https://placehold.co/100x100.png' },
  { id: 'user-3', name: 'Charlie Chaplin', avatar: 'https://placehold.co/100x100.png' },
];

export const mockProjects: Project[] = [
  {
    id: 'PROJ-001',
    name: 'Website Redesign Q3',
    description: 'Complete redesign of the company website with new branding and improved UX.',
    status: 'active',
    createdAt: '2024-03-01T00:00:00Z',
    updatedAt: '2024-05-01T00:00:00Z',
    deadline: '2024-09-30T00:00:00Z',
    teamMembers: ['Alice Wonderland', 'Bob The Builder'],
  },
  {
    id: 'PROJ-002',
    name: 'Mobile App v2.0 Launch',
    description: 'Develop and launch version 2.0 of the mobile application with new features.',
    status: 'on-hold',
    createdAt: '2024-01-15T00:00:00Z',
    updatedAt: '2024-04-10T00:00:00Z',
    deadline: '2024-07-31T00:00:00Z',
    teamMembers: ['Charlie Chaplin'],
  },
  {
    id: 'PROJ-003',
    name: 'Knowledge Base Setup',
    description: 'Create and populate a new knowledge base for customer self-service.',
    status: 'completed',
    createdAt: '2023-11-01T00:00:00Z',
    updatedAt: '2024-02-28T00:00:00Z',
    teamMembers: ['Alice Wonderland'],
  },
  {
    id: 'PROJ-004',
    name: 'New API Endpoint Development',
    description: 'Develop new API endpoints for partner integrations.',
    status: 'new',
    createdAt: '2024-05-01T00:00:00Z',
    updatedAt: '2024-05-01T00:00:00Z',
    deadline: '2024-06-30T00:00:00Z',
    teamMembers: ['Bob The Builder', 'Charlie Chaplin'],
  }
];


// --- Ticket Functions using Appwrite ---

export const createTicketInAppwrite = async (ticketData: Omit<Ticket, '$id' | '$createdAt' | '$updatedAt'>): Promise<Ticket> => {
  try {
    const document = await databases.createDocument(
      databaseId,
      ticketsCollectionId,
      ID.unique(),
      {
        ...ticketData,
        replies: ticketData.replies || JSON.stringify([]) // Ensure replies is a JSON string
      }
    );
    return document as unknown as Ticket;
  } catch (error) {
    console.error("Failed to create ticket in Appwrite:", error);
    throw error;
  }
};

export const getTicketsByStatus = async (status: TicketStatus): Promise<Ticket[]> => {
  try {
    const queries = [Query.orderDesc('$createdAt')];
    if (status !== 'all') {
      queries.push(Query.equal('status', status));
    }
    const response = await databases.listDocuments(databaseId, ticketsCollectionId, queries);
    return response.documents as unknown as Ticket[];
  } catch (error) {
    console.error(`Failed to fetch tickets with status "${status}" from Appwrite:`, error);
    return []; // Return empty array on error
  }
};

export const getTicketById = async (id: string): Promise<Ticket | undefined> => {
  try {
    const document = await databases.getDocument(databaseId, ticketsCollectionId, id);
    return document as unknown as Ticket;
  } catch (error) {
    console.error(`Failed to fetch ticket with ID "${id}" from Appwrite:`, error);
    return undefined; // Return undefined on error or if not found
  }
};

export const getNewTicketsTodayCount = async (): Promise<number> => {
  try {
    const today = new Date();
    const startOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate()).toISOString();
    // Appwrite query for "created after start of day" and status "new"
    const response = await databases.listDocuments(databaseId, ticketsCollectionId, [
      Query.equal('status', 'new'),
      Query.greaterThanEqual('$createdAt', startOfDay)
    ]);
    return response.total;
  } catch (error) {
    console.error("Failed to fetch new tickets today count from Appwrite:", error);
    return 0;
  }
}


// --- Project Functions (still using mock data) ---
export const getProjectsByStatus = async (status: ProjectStatusKey): Promise<Project[]> => {
  if (status === 'all') return mockProjects;
  return mockProjects.filter(project => project.status === status);
};

export const getProjectById = async (id: string): Promise<Project | undefined> => {
  return mockProjects.find(project => project.id === id);
};
