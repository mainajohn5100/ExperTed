
import type { Ticket, Project, User, TicketStatusFilter, TicketDocumentStatus } from '@/types';
import { databases, databaseId, ticketsCollectionId, Query, ID } from './appwrite';
import { formatISO, startOfDay, endOfDay } from 'date-fns';

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

// --- Ticket Functions (using Appwrite) ---

export const createTicketInAppwrite = async (ticketData: Omit<Ticket, '$id' | '$createdAt' | '$updatedAt'>): Promise<Ticket> => {
  try {
    const document = await databases.createDocument(
      databaseId,
      ticketsCollectionId,
      ID.unique(),
      ticketData
    );
    return document as unknown as Ticket;
  } catch (error) {
    console.error("Failed to create ticket in Appwrite:", error);
    throw error;
  }
};

export const getTicketsByStatus = async (status: TicketStatusFilter): Promise<Ticket[]> => {
  try {
    const queries = [];
    if (status !== 'all') {
      queries.push(Query.equal('status', status as TicketDocumentStatus));
    }
    // Add a default sort order, e.g., by creation date descending
    queries.push(Query.orderDesc('$createdAt'));
    
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
    // Appwrite throws an error if document not found, so catch and return undefined
    if ((error as any).code === 404) {
        return undefined;
    }
    throw error; // Re-throw other errors
  }
};

export const getNewTicketsTodayCount = async (): Promise<number> => {
  try {
    const todayStart = formatISO(startOfDay(new Date()));
    const todayEnd = formatISO(endOfDay(new Date()));

    const response = await databases.listDocuments(databaseId, ticketsCollectionId, [
      Query.greaterThanEqual('$createdAt', todayStart),
      Query.lessThanEqual('$createdAt', todayEnd),
      // Query.equal('status', 'new'), // Count all tickets created today, regardless of current status for "New Today"
      Query.limit(1) // We only need the total count from response.total
    ]);
    return response.total;
  } catch (error) {
    console.error("Failed to fetch new tickets today count from Appwrite:", error);
    return 0;
  }
}

export const updateTicketInAppwrite = async (ticketId: string, updatedFields: Partial<Omit<Ticket, '$id' | '$createdAt' | '$updatedAt'>>): Promise<Ticket | undefined> => {
  try {
    const document = await databases.updateDocument(
      databaseId,
      ticketsCollectionId,
      ticketId,
      updatedFields
    );
    return document as unknown as Ticket;
  } catch (error) {
    console.error(`Failed to update ticket ${ticketId} in Appwrite:`, error);
    if ((error as any).code === 404) {
        return undefined;
    }
    throw error;
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
