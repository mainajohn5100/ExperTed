
import type { Ticket, Project, User, TicketStatusFilter, TicketDocumentStatus, ProjectStatusKey } from '@/types';
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

const logAppwriteError = (context: string, error: any) => {
  console.error(`Appwrite error in ${context}:`, error.message || error);
  if (error.response) {
    console.error('Appwrite error response details:', JSON.stringify(error.response, null, 2));
  }
  if (error.code) {
    console.error('Appwrite error code:', error.code);
  }
  if (error.type) {
    console.error('Appwrite error type:', error.type);
  }
  // Log the full error object if it might contain more details
  if (typeof error === 'object' && error !== null) {
    console.error('Full Appwrite error object:', error);
  }
};

// --- Ticket Functions (using Appwrite) ---

export const createTicketInAppwrite = async (ticketData: Omit<Ticket, '$id' | '$createdAt' | '$updatedAt'>): Promise<Ticket> => {
  if (!databaseId || !ticketsCollectionId) {
    console.error("Appwrite databaseId or ticketsCollectionId is missing. Check .env variables.");
    throw new Error("Appwrite configuration is incomplete.");
  }
  try {
    const document = await databases.createDocument(
      databaseId,
      ticketsCollectionId,
      ID.unique(),
      ticketData
    );
    return document as unknown as Ticket;
  } catch (error) {
    logAppwriteError("createTicketInAppwrite", error);
    throw error;
  }
};

export const getTicketsByStatus = async (status: TicketStatusFilter): Promise<Ticket[]> => {
  if (!databaseId || !ticketsCollectionId) {
    console.error("Appwrite databaseId or ticketsCollectionId is missing. Check .env variables.");
    return [];
  }
  try {
    const queries = [];
    if (status !== 'all') {
      queries.push(Query.equal('status', status as TicketDocumentStatus));
    }
    queries.push(Query.orderDesc('$createdAt'));
    
    const response = await databases.listDocuments(databaseId, ticketsCollectionId, queries);
    return response.documents as unknown as Ticket[];
  } catch (error) {
    logAppwriteError(`getTicketsByStatus (status: "${status}")`, error);
    return []; 
  }
};

export const getTicketById = async (id: string): Promise<Ticket | undefined> => {
  if (!databaseId || !ticketsCollectionId) {
    console.error("Appwrite databaseId or ticketsCollectionId is missing. Check .env variables.");
    return undefined;
  }
  try {
    const document = await databases.getDocument(databaseId, ticketsCollectionId, id);
    return document as unknown as Ticket;
  } catch (error) {
    logAppwriteError(`getTicketById (id: "${id}")`, error);
    if ((error as any).code === 404) {
        return undefined;
    }
    // Do not re-throw for other errors here, let the caller handle undefined
    return undefined; 
  }
};

export const getNewTicketsTodayCount = async (): Promise<number> => {
  if (!databaseId || !ticketsCollectionId) {
    console.error("Appwrite databaseId or ticketsCollectionId is missing. Check .env variables.");
    return 0;
  }
  try {
    const todayStart = formatISO(startOfDay(new Date()));
    const todayEnd = formatISO(endOfDay(new Date()));

    const response = await databases.listDocuments(databaseId, ticketsCollectionId, [
      Query.greaterThanEqual('$createdAt', todayStart),
      Query.lessThanEqual('$createdAt', todayEnd),
      Query.limit(1) // We only need the total count
    ]);
    return response.total;
  } catch (error) {
    logAppwriteError("getNewTicketsTodayCount", error);
    return 0;
  }
}

export const updateTicketInAppwrite = async (ticketId: string, updatedFields: Partial<Omit<Ticket, '$id' | '$createdAt' | '$updatedAt'>>): Promise<Ticket | undefined> => {
  if (!databaseId || !ticketsCollectionId) {
    console.error("Appwrite databaseId or ticketsCollectionId is missing. Check .env variables.");
    return undefined;
  }
  try {
    // Ensure replies are stringified if they are objects
    const dataToUpdate = { ...updatedFields };
    if (dataToUpdate.replies && typeof dataToUpdate.replies !== 'string') {
      dataToUpdate.replies = JSON.stringify(dataToUpdate.replies);
    }
    
    const document = await databases.updateDocument(
      databaseId,
      ticketsCollectionId,
      ticketId,
      dataToUpdate
    );
    return document as unknown as Ticket;
  } catch (error) {
    logAppwriteError(`updateTicketInAppwrite (ticketId: ${ticketId})`, error);
    if ((error as any).code === 404) {
        return undefined;
    }
    // Do not re-throw for other errors here, let the caller handle undefined
    return undefined;
  }
}


// --- Project Functions (still using mock data) ---
export const getProjectsByStatus = async (status: ProjectStatusKey): Promise<Project[]> => {
  // Simulate async behavior
  await new Promise(resolve => setTimeout(resolve, 50)); 
  if (status === 'all') return mockProjects;
  return mockProjects.filter(project => project.status === status);
};

export const getProjectById = async (id: string): Promise<Project | undefined> => {
  // Simulate async behavior
  await new Promise(resolve => setTimeout(resolve, 50));
  return mockProjects.find(project => project.id === id);
};

