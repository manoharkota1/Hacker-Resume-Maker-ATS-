"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { HackoraLogo } from "@/components/HackoraLogo";
import { ResumePreview } from "@/components/builder/ResumePreview";
import { getSharedResume, ShareSettings } from "@/lib/appwrite/share";
import { Resume } from "@/types/resume";
import { useResumeStore } from "@/lib/state/useResumeStore";

export default function SharedResumePage() {
  const params = useParams();
  const shareId = params.id as string;

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [resumeData, setResumeData] = useState<{
    resume: Resume;
    settings: ShareSettings;
  } | null>(null);

  // Store setters
  const setResume = useResumeStore((s) => s.setResume);
  const setTemplate = useResumeStore((s) => s.setTemplate);
  const setFontFamily = useResumeStore((s) => s.setFontFamily);
  const setDensity = useResumeStore((s) => s.setDensity);
  const setHeaderLayout = useResumeStore((s) => s.setHeaderLayout);
  const setShowDividers = useResumeStore((s) => s.setShowDividers);
  const setColorTheme = useResumeStore((s) => s.setColorTheme);

  useEffect(() => {
    const loadSharedResume = async () => {
      if (!shareId) {
        setError("Invalid share link");
        setLoading(false);
        return;
      }

      try {
        const data = await getSharedResume(shareId);

        if (!data) {
          setError("Resume not found or link has expired");
          setLoading(false);
          return;
        }

        setResumeData(data);

        // Apply resume and settings to the store for preview
        setResume(data.resume);
        setTemplate(
          data.settings.template as
            | "modern"
            | "classic"
            | "executive"
            | "creative"
            | "tech"
        );
        setFontFamily(data.settings.fontFamily as "geist" | "inter" | "serif");
        setDensity(data.settings.density as "cozy" | "compact");
        setHeaderLayout(
          data.settings.headerLayout as "left" | "center" | "split"
        );
        setShowDividers(data.settings.showDividers);
        setColorTheme(
          data.settings.colorTheme as "slate" | "indigo" | "emerald"
        );

        setLoading(false);
      } catch (err) {
        console.error("Failed to load shared resume:", err);
        setError("Failed to load resume");
        setLoading(false);
      }
    };

    loadSharedResume();
  }, [
    shareId,
    setResume,
    setTemplate,
    setFontFamily,
    setDensity,
    setHeaderLayout,
    setShowDividers,
    setColorTheme,
  ]);

  if (loading) {
    return (
      <div className="flex h-dvh flex-col bg-slate-50">
        <header className="z-40 flex h-14 shrink-0 items-center justify-between bg-white px-4 md:px-6 shadow-sm border-b border-slate-200">
          <Link href="/" className="flex items-center">
            <HackoraLogo size="sm" />
          </Link>
        </header>
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-emerald-500 border-r-transparent mb-4"></div>
            <p className="text-slate-600">Loading shared resume...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex h-dvh flex-col bg-slate-50">
        <header className="z-40 flex h-14 shrink-0 items-center justify-between bg-white px-4 md:px-6 shadow-sm border-b border-slate-200">
          <Link href="/" className="flex items-center">
            <HackoraLogo size="sm" />
          </Link>
        </header>
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center max-w-md mx-auto px-4">
            <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-red-100 flex items-center justify-center">
              <svg
                className="w-8 h-8 text-red-500"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth={2}
              >
                <circle cx="12" cy="12" r="10" />
                <path d="M15 9l-6 6M9 9l6 6" />
              </svg>
            </div>
            <h1 className="text-xl font-bold text-slate-800 mb-2">
              Resume Not Found
            </h1>
            <p className="text-slate-600 mb-6">{error}</p>
            <Link
              href="/"
              className="inline-flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white px-6 py-3 font-semibold transition-all"
            >
              <svg
                className="w-4 h-4"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth={2}
              >
                <path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z" />
                <path d="M9 22V12h6v10" />
              </svg>
              Create Your Own Resume
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-dvh flex-col bg-slate-50">
      {/* Header */}
      <header className="z-40 flex h-14 shrink-0 items-center justify-between bg-white px-3 sm:px-4 md:px-6 shadow-sm border-b border-slate-200">
        <Link href="/" className="flex items-center">
          <HackoraLogo size="sm" />
        </Link>

        <div className="flex items-center gap-2 sm:gap-3">
          <span className="hidden sm:flex items-center gap-1.5 text-xs text-slate-500 bg-slate-100 px-3 py-1.5 rounded-full">
            <svg
              className="w-3.5 h-3.5"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth={2}
            >
              <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
              <circle cx="12" cy="12" r="3" />
            </svg>
            Preview Only
          </span>
          <Link
            href="/"
            className="flex items-center gap-1.5 bg-emerald-600 hover:bg-emerald-700 text-white px-3 sm:px-4 py-2 text-xs font-semibold transition-all"
          >
            <svg
              className="w-3.5 h-3.5"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth={2}
            >
              <path d="M12 5v14M5 12h14" />
            </svg>
            <span className="hidden sm:inline">Create Your Resume</span>
            <span className="sm:hidden">Create</span>
          </Link>
        </div>
      </header>

      {/* Shared by info bar */}
      <div className="bg-linear-to-r from-emerald-50 to-teal-50 border-b border-emerald-100 px-4 py-2.5 flex items-center justify-center gap-2">
        <svg
          className="w-4 h-4 text-emerald-600"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth={2}
        >
          <path d="M4 12v8a2 2 0 002 2h12a2 2 0 002-2v-8" />
          <polyline points="16,6 12,2 8,6" />
          <line x1="12" y1="2" x2="12" y2="15" />
        </svg>
        <span className="text-sm text-emerald-700 font-medium">
          {resumeData?.resume.personal.name
            ? `${resumeData.resume.personal.name}'s Resume`
            : "Shared Resume"}
        </span>
      </div>

      {/* Resume Preview */}
      <main className="flex-1 overflow-auto bg-slate-200/50">
        <div className="flex justify-center min-h-full py-4 sm:py-6 px-2 sm:px-4">
          <div className="w-full max-w-full lg:w-auto lg:max-w-none overflow-x-auto">
            <div className="min-w-0 flex justify-center">
              <div className="transform origin-top scale-[0.4] sm:scale-[0.55] md:scale-[0.7] lg:scale-100 transition-transform duration-200">
                <ResumePreview />
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
