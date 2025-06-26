
import { Client as AppwriteClient, Databases, Account, ID, Query, Models, Storage } from 'appwrite';

const client = new AppwriteClient();

const endpoint = process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT;
const projectId = process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID;
const apiKey = process.env.APPWRITE_API_KEY;
export const databaseId = process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID;
export const ticketsCollectionId = process.env.NEXT_PUBLIC_APPWRITE_TICKETS_COLLECTION_ID;
export const projectsCollectionId = process.env.NEXT_PUBLIC_APPWRITE_PROJECTS_COLLECTION_ID;
export const notificationsCollectionId = process.env.NEXT_PUBLIC_APPWRITE_NOTIFICATIONS_COLLECTION_ID;
export const avatarsBucketId = process.env.NEXT_PUBLIC_APPWRITE_AVATARS_BUCKET_ID;


if (!endpoint || !projectId || !databaseId || !ticketsCollectionId || !projectsCollectionId || !notificationsCollectionId || !avatarsBucketId) {
  console.warn(
    'Appwrite environment variables might be missing. Please check your .env file if Appwrite functionality is not working. Ensure all NEXT_PUBLIC_ and APPWRITE_API_KEY variables are set.'
  );
}

if (apiKey && typeof window === 'undefined') {
  if (typeof client.setKey === 'function') {
    client.setKey(apiKey);
  } else {
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
const storage = new Storage(client); // Export storage instance

export const updateUserNameInAppwrite = async (name: string): Promise<Models.User<Models.Preferences>> => {
  return account.updateName(name);
};

export const updateUserPrefsInAppwrite = async (prefs: Partial<Models.Preferences>): Promise<Models.User<Models.Preferences>> => {
  return account.updatePrefs(prefs);
};


// Models is a namespace, not a direct export from the 'appwrite' package in newer versions.
// The types like Models.User are available through the SDK's own typings.
// Removing Models from re-export should resolve the warning.
export { client, account, databases, storage, ID, Query };
