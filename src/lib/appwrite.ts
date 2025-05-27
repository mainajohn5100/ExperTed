
import { Client, Databases, Account, ID, Query } from 'appwrite';

const client = new Client();

const endpoint = process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT!;
const projectId = process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID!;
const apiKey = process.env.APPWRITE_API_KEY!; // Used for server-side operations
export const databaseId = process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID!;
export const ticketsCollectionId = process.env.NEXT_PUBLIC_APPWRITE_TICKETS_COLLECTION_ID!;
// Add other collection IDs here as needed, e.g.:
// export const projectsCollectionId = process.env.NEXT_PUBLIC_APPWRITE_PROJECTS_COLLECTION_ID!;


if (!endpoint || !projectId || !databaseId || !ticketsCollectionId) {
  throw new Error(
    'Missing Appwrite environment variables. Please check your .env file.'
  );
}

client.setEndpoint(endpoint).setProject(projectId);

// For server-side operations that require an API key
if (apiKey && typeof window === 'undefined') {
  client.setKey(apiKey);
}

const account = new Account(client);
const databases = new Databases(client);

export { client, account, databases, ID, Query };
