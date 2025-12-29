"use client";

import { useState, useEffect } from "react";
import { useResumeStorage } from "@/lib/appwrite/hooks";
import { ResumeDocument } from "@/lib/appwrite/config";
import { useResumeStore } from "@/lib/state/useResumeStore";
import clsx from "classnames";

export function CloudSave() {
  const {
    resumes,
    loading,
    error,
    saveResume,
    updateResume,
    deleteResume,
    loadResume,
    user,
  } = useResumeStorage();
  const resume = useResumeStore((s) => s.resume);
  const setResume = useResumeStore((s) => s.setResume);

  const [activeResumeId, setActiveResumeId] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [resumeTitle, setResumeTitle] = useState("My Resume");
  const [showSaveDialog, setShowSaveDialog] = useState(false);
  const [localError, setLocalError] = useState<string | null>(null);

  // Check if Appwrite is configured
  const isConfigured =
    process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID &&
    process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID !== "YOUR_PROJECT_ID";

  useEffect(() => {
    // Set active resume from the most recent one
    if (resumes.length > 0 && !activeResumeId) {
      const defaultResume = resumes.find((r) => r.isDefault) || resumes[0];
      setActiveResumeId(defaultResume.$id || null);
    }
  }, [resumes, activeResumeId]);

  const handleSave = async () => {
    setSaving(true);
    setLocalError(null);

    try {
      if (activeResumeId) {
        // Update existing resume
        const success = await updateResume(activeResumeId, resume, resumeTitle);
        if (!success) {
          setLocalError("Failed to save resume");
        }
      } else {
        // Create new resume
        const newId = await saveResume(resume, resumeTitle);
        if (newId) {
          setActiveResumeId(newId);
          setShowSaveDialog(false);
        } else {
          setLocalError("Failed to save resume");
        }
      }
    } catch {
      setLocalError("Failed to save resume");
    } finally {
      setSaving(false);
    }
  };

  const handleLoad = async (doc: ResumeDocument) => {
    if (!doc.$id) return;

    const loadedResume = await loadResume(doc.$id);
    if (loadedResume) {
      setResume(loadedResume);
      setActiveResumeId(doc.$id);
      setResumeTitle(doc.title);
    }
  };

  const handleDelete = async (docId: string) => {
    if (!confirm("Are you sure you want to delete this resume?")) return;

    const success = await deleteResume(docId);
    if (success && activeResumeId === docId) {
      setActiveResumeId(null);
    }
  };

  const handleNewResume = () => {
    setActiveResumeId(null);
    setResumeTitle("Untitled Resume");
    setShowSaveDialog(true);
  };

  if (!isConfigured) {
    return (
      <div className="rounded-lg border border-amber-200 bg-amber-50 p-4">
        <h3 className="mb-2 flex items-center gap-2 text-sm font-semibold text-amber-800">
          <span>☁️</span> Cloud Storage Setup Required
        </h3>
        <p className="mb-3 text-xs text-amber-700">
          To enable cloud storage, configure Appwrite:
        </p>
        <ol className="list-inside list-decimal space-y-1 text-xs text-amber-700">
          <li>Create a free account at cloud.appwrite.io</li>
          <li>Create a new project</li>
          <li>Create a database named &quot;resume-builder&quot;</li>
          <li>Create a collection named &quot;resumes&quot;</li>
          <li>
            Add these attributes: userId (string), title (string), data
            (string), isDefault (boolean)
          </li>
          <li>Add your project ID to .env.local</li>
        </ol>
        <div className="mt-3 rounded bg-amber-100 p-2">
          <code className="text-xs text-amber-900">
            NEXT_PUBLIC_APPWRITE_PROJECT_ID=your_project_id
          </code>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="rounded-lg border border-slate-200 bg-white p-4">
        <div className="mb-3 flex items-center justify-between">
          <h3 className="flex items-center gap-2 text-sm font-semibold text-slate-900">
            <span className="text-lg">☁️</span> Cloud Storage
          </h3>
          {user && (
            <span className="rounded-full bg-emerald-100 px-2 py-0.5 text-xs text-emerald-700">
              Connected
            </span>
          )}
        </div>

        {/* Current Resume */}
        <div className="mb-4 rounded-lg bg-slate-50 p-3">
          <div className="mb-2 flex items-center justify-between">
            <input
              type="text"
              value={resumeTitle}
              onChange={(e) => setResumeTitle(e.target.value)}
              className="bg-transparent text-sm font-medium text-slate-900 focus:outline-none"
              placeholder="Resume title..."
            />
            {activeResumeId && (
              <span className="text-xs text-slate-500">Auto-saved</span>
            )}
          </div>
          <div className="flex gap-2">
            <button
              onClick={handleSave}
              disabled={saving || loading}
              className="flex-1 rounded-lg bg-slate-900 px-3 py-2 text-xs font-medium text-white transition hover:bg-slate-800 disabled:opacity-50"
            >
              {saving
                ? "Saving..."
                : activeResumeId
                ? "Save Changes"
                : "Save to Cloud"}
            </button>
            <button
              onClick={handleNewResume}
              disabled={loading}
              className="rounded-lg bg-slate-100 px-3 py-2 text-xs font-medium text-slate-700 transition hover:bg-slate-200 disabled:opacity-50"
            >
              + New
            </button>
          </div>
        </div>

        {/* Error Display */}
        {(error || localError) && (
          <div className="mb-3 rounded-lg border border-red-200 bg-red-50 p-2">
            <p className="text-xs text-red-700">{error || localError}</p>
          </div>
        )}

        {/* Saved Resumes List */}
        {loading ? (
          <div className="flex items-center justify-center py-4">
            <div className="h-5 w-5 animate-spin rounded-full border-2 border-slate-300 border-t-slate-900"></div>
          </div>
        ) : resumes.length > 0 ? (
          <div className="space-y-2">
            <p className="text-xs font-medium text-slate-600">Saved Resumes</p>
            {resumes.map((doc) => (
              <div
                key={doc.$id}
                className={clsx(
                  "flex items-center justify-between rounded-lg border p-2 transition",
                  activeResumeId === doc.$id
                    ? "border-violet-300 bg-violet-50"
                    : "border-slate-200 hover:bg-slate-50"
                )}
              >
                <button
                  onClick={() => handleLoad(doc)}
                  className="flex-1 text-left"
                >
                  <p className="text-sm font-medium text-slate-900">
                    {doc.title}
                  </p>
                  <p className="text-xs text-slate-500">
                    {doc.$updatedAt
                      ? new Date(doc.$updatedAt).toLocaleDateString()
                      : ""}
                  </p>
                </button>
                <button
                  onClick={() => doc.$id && handleDelete(doc.$id)}
                  className="ml-2 rounded p-1 text-slate-400 transition hover:bg-red-100 hover:text-red-600"
                  title="Delete"
                >
                  🗑️
                </button>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-center text-xs text-slate-500">
            No saved resumes yet
          </p>
        )}
      </div>

      {/* Save Dialog */}
      {showSaveDialog && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="w-80 rounded-lg bg-white p-4 shadow-xl">
            <h4 className="mb-3 text-sm font-semibold text-slate-900">
              Save Resume
            </h4>
            <input
              type="text"
              value={resumeTitle}
              onChange={(e) => setResumeTitle(e.target.value)}
              placeholder="Enter resume title..."
              className="mb-3 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:border-violet-500 focus:outline-none"
              autoFocus
            />
            <div className="flex gap-2">
              <button
                onClick={() => setShowSaveDialog(false)}
                className="flex-1 rounded-lg bg-slate-100 px-3 py-2 text-xs font-medium text-slate-700 hover:bg-slate-200"
              >
                Cancel
              </button>
              <button
                onClick={handleSave}
                disabled={saving || !resumeTitle.trim()}
                className="flex-1 rounded-lg bg-slate-900 px-3 py-2 text-xs font-medium text-white hover:bg-slate-800 disabled:opacity-50"
              >
                {saving ? "Saving..." : "Save"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
