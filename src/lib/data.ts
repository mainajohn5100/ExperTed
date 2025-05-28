
import type { Ticket, Project, User, TicketStatusFilter, TicketDocumentStatus, ProjectDocumentStatus, ProjectStatusKey } from '@/types';
import { databases, databaseId, ticketsCollectionId, projectsCollectionId, Query, ID } from './appwrite';
import { formatISO, startOfDay, endOfDay } from 'date-fns';

// Mock data for users will remain for now
export const mockUsers: User[] = [
  { id: 'user-1', name: 'Alice Wonderland', avatar: 'https://placehold.co/100x100.png' },
  { id: 'user-2', name: 'Bob The Builder', avatar: 'https://placehold.co/100x100.png' },
  { id: 'user-3', name: 'Charlie Chaplin', avatar: 'https://placehold.co/100x100.png' },
];


const logAppwriteError = (context: string, error: any) => {
  console.error(`Appwrite error in ${context}:`, error?.message || String(error));
  if (error && error.response) {
    console.error('Appwrite error response details:', JSON.stringify(error.response, null, 2));
  }
  if (error && error.code) {
    console.error('Appwrite error code:', error.code);
  }
  if (error && error.type) {
    console.error('Appwrite error type:', error.type);
  }
  // Log the full error object if it might contain more details
  if (typeof error === 'object' && error !== null) {
    console.error('Full Appwrite error object:', error);
  }
};

// --- Ticket Functions (using Appwrite) ---

export const createTicketInAppwrite = async (ticketData: Omit<Ticket, '$id' | '$createdAt' | '$updatedAt'>): Promise<Ticket | undefined> => {
  if (!databaseId || !ticketsCollectionId) {
    console.error("Appwrite databaseId or ticketsCollectionId is missing. Check .env variables.");
    return undefined;
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
    return undefined;
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
    if ((error as any)?.code === 404) {
        return undefined;
    }
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
    if ((error as any)?.code === 404) {
        return undefined;
    }
    return undefined;
  }
}


// --- Project Functions (using Appwrite) ---

export const createProjectInAppwrite = async (projectData: Omit<Project, '$id' | '$createdAt' | '$updatedAt'>): Promise<Project | undefined> => {
  if (!databaseId || !projectsCollectionId) {
    console.error("Appwrite databaseId or projectsCollectionId is missing. Check .env variables.");
    return undefined;
  }
  try {
    // Ensure deadline is either an ISO string or null for Appwrite
    const dataToSave = {
      ...projectData,
      deadline: projectData.deadline ? formatISO(new Date(projectData.deadline)) : null,
      teamMembers: projectData.teamMembers || [], // Ensure teamMembers is an array
    };

    const document = await databases.createDocument(
      databaseId,
      projectsCollectionId,
      ID.unique(),
      dataToSave
    );
    return document as unknown as Project;
  } catch (error) {
    logAppwriteError("createProjectInAppwrite", error);
    return undefined;
  }
};

export const getProjectsByStatus = async (status: ProjectStatusKey): Promise<Project[]> => {
  if (!databaseId || !projectsCollectionId) {
    console.error("Appwrite databaseId or projectsCollectionId is missing. Check .env variables.");
    return [];
  }
  try {
    const queries = [];
    if (status !== 'all') {
      queries.push(Query.equal('status', status as ProjectDocumentStatus));
    }
    queries.push(Query.orderDesc('$createdAt'));
    
    const response = await databases.listDocuments(databaseId, projectsCollectionId, queries);
    return response.documents as unknown as Project[];
  } catch (error) {
    logAppwriteError(`getProjectsByStatus (status: "${status}")`, error);
    return []; 
  }
};

export const getProjectById = async (id: string): Promise<Project | undefined> => {
  if (!databaseId || !projectsCollectionId) {
    console.error("Appwrite databaseId or projectsCollectionId is missing. Check .env variables.");
    return undefined;
  }
  try {
    const document = await databases.getDocument(databaseId, projectsCollectionId, id);
    return document as unknown as Project;
  } catch (error) {
    logAppwriteError(`getProjectById (id: "${id}")`, error);
    if ((error as any)?.code === 404) {
        return undefined;
    }
    return undefined; 
  }
};

// Example update function, can be expanded later
export const updateProjectInAppwrite = async (projectId: string, updatedFields: Partial<Omit<Project, '$id' | '$createdAt' | '$updatedAt'>>): Promise<Project | undefined> => {
  if (!databaseId || !projectsCollectionId) {
    console.error("Appwrite databaseId or projectsCollectionId is missing. Check .env variables.");
    return undefined;
  }
  try {
    const dataToUpdate = { ...updatedFields };
    if (dataToUpdate.deadline) {
      dataToUpdate.deadline = formatISO(new Date(dataToUpdate.deadline));
    }
    if (dataToUpdate.teamMembers && !Array.isArray(dataToUpdate.teamMembers)) {
        // Assuming teamMembers should always be an array, if not already.
        // Or handle conversion if it's passed differently.
        dataToUpdate.teamMembers = []; 
    }
    
    const document = await databases.updateDocument(
      databaseId,
      projectsCollectionId,
      projectId,
      dataToUpdate
    );
    return document as unknown as Project;
  } catch (error) {
    logAppwriteError(`updateProjectInAppwrite (projectId: ${projectId})`, error);
    return undefined;
  }
};
