"use client";

import { useState, useEffect, useCallback } from "react";
import {
  account,
  databases,
  ID,
  Query,
  APPWRITE_DATABASE_ID,
  COLLECTIONS,
  ResumeDocument,
} from "./config";
import { Resume } from "@/types/resume";
import { Models } from "appwrite";
import { useAuth } from "@/lib/appwrite/auth";

// Anonymous session management
export function useAppwriteAuth() {
  const [user, setUser] = useState<Models.User<Models.Preferences> | null>(
    null
  );
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const initSession = async () => {
      try {
        // Check for existing session
        const currentUser = await account.get();
        setUser(currentUser);
      } catch {
        // No session exists, create anonymous session
        try {
          await account.createAnonymousSession();
          const newUser = await account.get();
          setUser(newUser);
        } catch (err) {
          console.error("Failed to create anonymous session:", err);
        }
      } finally {
        setLoading(false);
      }
    };

    initSession();
  }, []);

  return { user, loading };
}

// Resume CRUD operations
export function useResumeStorage() {
  const { user, loading: authLoading } = useAuth();
  const [resumes, setResumes] = useState<ResumeDocument[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [hasFetched, setHasFetched] = useState(false);

  // Fetch all resumes for current user
  const fetchResumes = useCallback(async () => {
    if (!user) {
      setResumes([]);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const response = await databases.listDocuments(
        APPWRITE_DATABASE_ID,
        COLLECTIONS.RESUMES,
        [Query.equal("userId", user.$id), Query.orderDesc("$updatedAt")]
      );

      setResumes(response.documents as unknown as ResumeDocument[]);
    } catch (err) {
      console.error("Failed to fetch resumes:", err);
      setError("Failed to load resumes");
    } finally {
      setLoading(false);
      setHasFetched(true);
    }
  }, [user]);

  // Fetch resumes when user changes (only once per user)
  useEffect(() => {
    // Skip if auth is still loading
    if (authLoading) return;

    // If we have a user and haven't fetched yet
    if (user && !hasFetched) {
      fetchResumes();
    }

    // If no user, reset state
    if (!user) {
      setResumes([]);
      setHasFetched(false);
    }
  }, [user, authLoading, hasFetched, fetchResumes]);

  // Reset hasFetched when user changes
  useEffect(() => {
    setHasFetched(false);
  }, [user?.$id]);

  // Save a new resume
  const saveResume = async (
    resume: Resume,
    title: string = "Untitled Resume"
  ): Promise<string | null> => {
    if (!user) {
      setError("Please login to save resumes");
      return null;
    }

    try {
      const doc = await databases.createDocument(
        APPWRITE_DATABASE_ID,
        COLLECTIONS.RESUMES,
        ID.unique(),
        {
          userId: user.$id,
          title,
          data: JSON.stringify(resume),
          isDefault: resumes.length === 0,
        }
      );

      await fetchResumes();
      return doc.$id;
    } catch (err) {
      console.error("Failed to save resume:", err);
      setError("Failed to save resume");
      return null;
    }
  };

  // Update an existing resume
  const updateResume = async (
    documentId: string,
    resume: Resume,
    title?: string
  ): Promise<boolean> => {
    if (!user) {
      setError("Please login to update resumes");
      return false;
    }

    try {
      const updateData: Record<string, unknown> = {
        data: JSON.stringify(resume),
      };

      if (title) {
        updateData.title = title;
      }

      await databases.updateDocument(
        APPWRITE_DATABASE_ID,
        COLLECTIONS.RESUMES,
        documentId,
        updateData
      );

      await fetchResumes();
      return true;
    } catch (err) {
      console.error("Failed to update resume:", err);
      setError("Failed to update resume");
      return false;
    }
  };

  // Delete a resume
  const deleteResume = async (documentId: string): Promise<boolean> => {
    if (!user) {
      setError("Please login to delete resumes");
      return false;
    }

    try {
      await databases.deleteDocument(
        APPWRITE_DATABASE_ID,
        COLLECTIONS.RESUMES,
        documentId
      );

      await fetchResumes();
      return true;
    } catch (err) {
      console.error("Failed to delete resume:", err);
      setError("Failed to delete resume");
      return false;
    }
  };

  // Load a resume by ID
  const loadResume = async (documentId: string): Promise<Resume | null> => {
    try {
      const doc = await databases.getDocument(
        APPWRITE_DATABASE_ID,
        COLLECTIONS.RESUMES,
        documentId
      );

      return JSON.parse((doc as unknown as ResumeDocument).data);
    } catch (err) {
      console.error("Failed to load resume:", err);
      setError("Failed to load resume");
      return null;
    }
  };

  return {
    user,
    resumes,
    loading: loading || authLoading,
    error,
    saveResume,
    updateResume,
    deleteResume,
    loadResume,
    refreshResumes: fetchResumes,
  };
}
