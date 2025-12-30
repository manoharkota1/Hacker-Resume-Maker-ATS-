"use client";

import { databases, ID, Query, APPWRITE_DATABASE_ID } from "./config";
import { Permission, Role } from "appwrite";
import { Resume } from "@/types/resume";

// Shared resumes collection ID
const SHARED_RESUMES_COLLECTION_ID =
  process.env.NEXT_PUBLIC_APPWRITE_SHARED_RESUMES_COLLECTION_ID ||
  "shared-resumes";

export interface SharedResumeDocument {
  $id: string;
  $createdAt: string;
  $updatedAt: string;
  shareId: string;
  userId: string;
  data: string; // JSON stringified Resume object
  template: string;
  fontFamily: string;
  density: string;
  headerLayout: string;
  showDividers: boolean;
  colorTheme: string;
  expiresAt?: string;
  viewCount: number;
}

export interface ShareSettings {
  template: string;
  fontFamily: string;
  density: string;
  headerLayout: string;
  showDividers: boolean;
  colorTheme: string;
}

// Generate a short unique ID for sharing
function generateShareId(): string {
  const chars =
    "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  let result = "";
  for (let i = 0; i < 8; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}

// Create a shareable link for a resume
export async function createShareLink(
  userId: string,
  resume: Resume,
  settings: ShareSettings
): Promise<string | null> {
  try {
    const shareId = generateShareId();

    await databases.createDocument(
      APPWRITE_DATABASE_ID,
      SHARED_RESUMES_COLLECTION_ID,
      ID.unique(),
      {
        shareId,
        userId,
        data: JSON.stringify(resume),
        template: settings.template,
        fontFamily: settings.fontFamily,
        density: settings.density,
        headerLayout: settings.headerLayout,
        showDividers: settings.showDividers,
        colorTheme: settings.colorTheme,
        viewCount: 0,
      },
      // Document permissions - allow anyone to read, only owner to modify
      [
        Permission.read(Role.any()),
        Permission.update(Role.user(userId)),
        Permission.delete(Role.user(userId)),
      ]
    );

    return shareId;
  } catch (error) {
    console.error("Failed to create share link:", error);
    return null;
  }
}

// Get a shared resume by share ID
export async function getSharedResume(shareId: string): Promise<{
  resume: Resume;
  settings: ShareSettings;
} | null> {
  try {
    const response = await databases.listDocuments(
      APPWRITE_DATABASE_ID,
      SHARED_RESUMES_COLLECTION_ID,
      [Query.equal("shareId", shareId), Query.limit(1)]
    );

    if (response.documents.length === 0) {
      return null;
    }

    const doc = response.documents[0] as unknown as SharedResumeDocument;

    // Increment view count (fire and forget)
    databases
      .updateDocument(
        APPWRITE_DATABASE_ID,
        SHARED_RESUMES_COLLECTION_ID,
        doc.$id,
        { viewCount: (doc.viewCount || 0) + 1 }
      )
      .catch(() => {});

    return {
      resume: JSON.parse(doc.data),
      settings: {
        template: doc.template,
        fontFamily: doc.fontFamily,
        density: doc.density,
        headerLayout: doc.headerLayout,
        showDividers: doc.showDividers,
        colorTheme: doc.colorTheme,
      },
    };
  } catch (error) {
    console.error("Failed to get shared resume:", error);
    return null;
  }
}

// Delete a shared resume
export async function deleteSharedResume(
  shareId: string,
  userId: string
): Promise<boolean> {
  try {
    const response = await databases.listDocuments(
      APPWRITE_DATABASE_ID,
      SHARED_RESUMES_COLLECTION_ID,
      [
        Query.equal("shareId", shareId),
        Query.equal("userId", userId),
        Query.limit(1),
      ]
    );

    if (response.documents.length === 0) {
      return false;
    }

    await databases.deleteDocument(
      APPWRITE_DATABASE_ID,
      SHARED_RESUMES_COLLECTION_ID,
      response.documents[0].$id
    );

    return true;
  } catch (error) {
    console.error("Failed to delete shared resume:", error);
    return false;
  }
}

// Get user's shared resumes
export async function getUserSharedResumes(
  userId: string
): Promise<SharedResumeDocument[]> {
  try {
    const response = await databases.listDocuments(
      APPWRITE_DATABASE_ID,
      SHARED_RESUMES_COLLECTION_ID,
      [Query.equal("userId", userId), Query.orderDesc("$createdAt")]
    );

    return response.documents as unknown as SharedResumeDocument[];
  } catch (error) {
    console.error("Failed to get user shared resumes:", error);
    return [];
  }
}
