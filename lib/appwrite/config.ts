import {
  Client,
  Account,
  Databases,
  Functions,
  Storage,
  ID,
  Query,
} from "appwrite";

// Appwrite configuration - Replace with your actual Appwrite project details
const APPWRITE_ENDPOINT =
  process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT || "https://cloud.appwrite.io/v1";
const APPWRITE_PROJECT_ID =
  process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID || "YOUR_PROJECT_ID";
const APPWRITE_DATABASE_ID =
  process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID || "resume-builder";

// Optional (but recommended) Appwrite IDs
const APPWRITE_RESUMES_COLLECTION_ID =
  process.env.NEXT_PUBLIC_APPWRITE_RESUMES_COLLECTION_ID || "resumes";
const APPWRITE_USERS_COLLECTION_ID =
  process.env.NEXT_PUBLIC_APPWRITE_USERS_COLLECTION_ID || "users";
const APPWRITE_STORAGE_BUCKET_ID =
  process.env.NEXT_PUBLIC_APPWRITE_STORAGE_BUCKET_ID || "";

// Optional: Appwrite Functions IDs (leave blank if unused)
const APPWRITE_FUNCTION_AI_ID =
  process.env.NEXT_PUBLIC_APPWRITE_FUNCTION_AI_ID || "";
const APPWRITE_FUNCTION_ATS_ID =
  process.env.NEXT_PUBLIC_APPWRITE_FUNCTION_ATS_ID || "";

// Collection IDs
export const COLLECTIONS = {
  RESUMES: APPWRITE_RESUMES_COLLECTION_ID,
  USERS: APPWRITE_USERS_COLLECTION_ID,
} as const;

export const BUCKETS = {
  RESUMES: APPWRITE_STORAGE_BUCKET_ID,
} as const;

export const FUNCTIONS = {
  AI: APPWRITE_FUNCTION_AI_ID,
  ATS: APPWRITE_FUNCTION_ATS_ID,
} as const;

// Initialize Appwrite client
const client = new Client();
client.setEndpoint(APPWRITE_ENDPOINT).setProject(APPWRITE_PROJECT_ID);

// Export services
export const account = new Account(client);
export const databases = new Databases(client);
export const storage = new Storage(client);
export const functions = new Functions(client);
export const appwriteClient = client;

// Export constants
export { ID, Query, APPWRITE_DATABASE_ID };

// Helper types for database documents
export interface ResumeDocument {
  $id?: string;
  $createdAt?: string;
  $updatedAt?: string;
  userId: string;
  title: string;
  data: string; // JSON stringified Resume object
  isDefault: boolean;
}

export interface UserDocument {
  $id?: string;
  $createdAt?: string;
  email: string;
  name: string;
  plan: "free" | "pro";
}
