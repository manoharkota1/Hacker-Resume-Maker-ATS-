// Client-side Appwrite setup (JS wrapper)
// Use this when you want a simple JS import instead of TypeScript.

import {
  Client,
  Account,
  Databases,
  Storage,
  Functions,
  ID,
  Query,
} from "appwrite";

export const APPWRITE_ENDPOINT =
  process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT || "https://cloud.appwrite.io/v1";
export const APPWRITE_PROJECT_ID =
  process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID || "YOUR_PROJECT_ID";
export const APPWRITE_DATABASE_ID =
  process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID || "resume-builder";

// Recommended: set these to the actual *IDs* from Appwrite Console
export const APPWRITE_RESUMES_COLLECTION_ID =
  process.env.NEXT_PUBLIC_APPWRITE_RESUMES_COLLECTION_ID || "resumes";
export const APPWRITE_USERS_COLLECTION_ID =
  process.env.NEXT_PUBLIC_APPWRITE_USERS_COLLECTION_ID || "users";

// Optional: Storage bucket ID
export const APPWRITE_STORAGE_BUCKET_ID =
  process.env.NEXT_PUBLIC_APPWRITE_STORAGE_BUCKET_ID || "";

// Optional: Appwrite Function IDs
export const APPWRITE_FUNCTION_AI_ID =
  process.env.NEXT_PUBLIC_APPWRITE_FUNCTION_AI_ID || "";
export const APPWRITE_FUNCTION_ATS_ID =
  process.env.NEXT_PUBLIC_APPWRITE_FUNCTION_ATS_ID || "";

export const COLLECTIONS = {
  RESUMES: APPWRITE_RESUMES_COLLECTION_ID,
  USERS: APPWRITE_USERS_COLLECTION_ID,
};

export const BUCKETS = {
  RESUMES: APPWRITE_STORAGE_BUCKET_ID,
};

export const FUNCTIONS = {
  AI: APPWRITE_FUNCTION_AI_ID,
  ATS: APPWRITE_FUNCTION_ATS_ID,
};

export const appwriteClient = new Client()
  .setEndpoint(APPWRITE_ENDPOINT)
  .setProject(APPWRITE_PROJECT_ID);

export const account = new Account(appwriteClient);
export const databases = new Databases(appwriteClient);
export const storage = new Storage(appwriteClient);
export const functions = new Functions(appwriteClient);

export { ID, Query };
