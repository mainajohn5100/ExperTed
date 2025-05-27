
import { Client, Databases, Account, ID, Query } from 'appwrite';

const client = new Client();

const endpoint = process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT;
const projectId = process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID;
const apiKey = process.env.APPWRITE_API_KEY; // Used for server-side operations
export const databaseId = process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID;
export const ticketsCollectionId = process.env.NEXT_PUBLIC_APPWRITE_TICKETS_COLLECTION_ID;
// Add other collection IDs here as needed, e.g.:
// export const projectsCollectionId = process.env.NEXT_PUBLIC_APPWRITE_PROJECTS_COLLECTION_ID!;


if (!endpoint || !projectId || !databaseId || !ticketsCollectionId) {
  console.warn(
    'Appwrite environment variables might be missing. Please check your .env file if Appwrite functionality is not working.'
  );
}

// For server-side operations that require an API key, attempt to set it early.
if (apiKey && typeof window === 'undefined') {
  if (typeof client.setKey === 'function') {
    client.setKey(apiKey);
  } else {
    // This case should ideally not be reached if the SDK is correct.
    console.error("CRITICAL: Appwrite client.setKey is not a function. SDK might be corrupted or an incompatible version.");
  }
}

if (endpoint) {
  client.setEndpoint(endpoint);
}
if (projectId) {
  client.setProject(projectId);
}

const account = new Account(client);
const databases = new Databases(client);

export { client, account, databases, ID, Query };
