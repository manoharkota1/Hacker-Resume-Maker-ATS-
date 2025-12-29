"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faAmazon } from "@fortawesome/free-brands-svg-icons";
import { HackoraLogo } from "@/components/HackoraLogo";
import { useAuth } from "@/lib/appwrite/auth";
import { useResumeStorage } from "@/lib/appwrite/hooks";
import { ResumeDocument } from "@/lib/appwrite/config";
import { useResumeStore } from "@/lib/state/useResumeStore";
import type { TemplateId } from "@/lib/state/useResumeStore";
import { analyzeResumeBasics } from "@/lib/resume/analyzeResume";
import type { Resume } from "@/types/resume";

// MAANG Templates - Authentic company design styles
const maangTemplates = [
  {
    id: "google",
    name: "Google Material",
    company: "Google",
    description:
      "Clean, accessible design inspired by Google's Material Design system. Simple sans-serif typography, clear hierarchy, and generous whitespace. Focus on readability and structured content.",
    bgColor: "bg-white",
    borderColor: "border-[#4285F4]",
    accentColor: "#4285F4",
    textColor: "text-slate-900",
    icon: (
      <svg className="h-6 w-6" viewBox="0 0 24 24">
        <path
          fill="#4285F4"
          d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
        />
        <path
          fill="#34A853"
          d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
        />
        <path
          fill="#FBBC05"
          d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
        />
        <path
          fill="#EA4335"
          d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
        />
      </svg>
    ),
    features: [
      "Material Design System",
      "Roboto Typography",
      "Clean Hierarchy",
      "Card-Based Layout",
      "Accessible Colors",
    ],
    hrTip:
      "Google loves quantified impact. Use XYZ formula: Accomplished [X] as measured by [Y], by doing [Z]. Keep formatting simple - ATS parses clean text best.",
    style: "border-l-4 border-[#4285F4]",
  },
  {
    id: "amazon",
    name: "Amazon Leadership",
    company: "Amazon",
    description:
      "Direct, no-frills format reflecting Amazon's Day 1 culture. Emphasis on data and metrics. Bold section headers, tight spacing, and action-oriented bullet points aligned with Leadership Principles.",
    bgColor: "bg-[#232F3E]",
    borderColor: "border-[#FF9900]",
    accentColor: "#FF9900",
    textColor: "text-white",
    icon: (
      <FontAwesomeIcon icon={faAmazon} className="h-6 w-6 text-[#FF9900]" />
    ),
    features: [
      "STAR Method Format",
      "Leadership Principles",
      "Data-Driven Bullets",
      "Bold Headers",
      "Metric-Heavy Content",
    ],
    hrTip:
      "Each bullet should map to a Leadership Principle. Use STAR format: Situation, Task, Action, Result. Always include numbers - 'Saved $2M annually' not 'Saved money'.",
    style: "border-l-4 border-[#FF9900]",
  },
  {
    id: "apple",
    name: "Apple Precision",
    company: "Apple",
    description:
      "Minimal, elegant design reflecting Apple's premium aesthetic. San Francisco font family, balanced negative space, and refined details. Every element serves a purpose - no decorative clutter.",
    bgColor: "bg-white",
    borderColor: "border-slate-200",
    accentColor: "#000000",
    textColor: "text-slate-900",
    icon: (
      <svg className="h-6 w-6" viewBox="0 0 24 24" fill="currentColor">
        <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.81-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M13 3.5c.73-.83 1.94-1.46 2.94-1.5.13 1.17-.34 2.35-1.04 3.19-.69.85-1.83 1.51-2.95 1.42-.15-1.15.41-2.35 1.05-3.11z" />
      </svg>
    ),
    features: [
      "SF Pro Typography",
      "Generous Whitespace",
      "Refined Minimalism",
      "Perfect Alignment",
      "Curated Content",
    ],
    hrTip:
      "Apple cares about craft. Every word should be intentional. Quality over quantity - 3 polished bullets beat 6 mediocre ones. Show obsession with detail.",
    style: "border-l-4 border-slate-900",
  },
  {
    id: "meta",
    name: "Meta Blueprint",
    company: "Meta",
    description:
      "Modern, bold design with Meta's signature blue palette. Focus on scale and impact metrics. Clean sections with emphasis on collaboration and building products that connect billions.",
    bgColor: "bg-[#0668E1]",
    borderColor: "border-[#0668E1]",
    accentColor: "#0668E1",
    textColor: "text-white",
    icon: (
      <svg className="h-6 w-6" viewBox="0 0 24 24" fill="white">
        <path d="M12 2.04c-5.5 0-10 4.49-10 10.02 0 5 3.66 9.15 8.44 9.9v-7H7.9v-2.9h2.54V9.85c0-2.51 1.49-3.89 3.78-3.89 1.09 0 2.23.19 2.23.19v2.47h-1.26c-1.24 0-1.63.77-1.63 1.56v1.88h2.78l-.45 2.9h-2.33v7a10 10 0 0 0 8.44-9.9c0-5.53-4.5-10.02-10-10.02z" />
      </svg>
    ),
    features: [
      "Scale Metrics",
      "Impact-First Layout",
      "Collaboration Focus",
      "Bold Typography",
      "Global Reach Stats",
    ],
    hrTip:
      "Meta wants to see scale. 'Built feature used by 500M users' trumps generic bullets. Show you can move fast, break things, and iterate based on data.",
    style: "border-l-4 border-[#0668E1]",
  },
  {
    id: "netflix",
    name: "Netflix Culture",
    company: "Netflix",
    description:
      "Sophisticated, cinematic design with Netflix's signature dark theme. Red accents, premium feel. Content focuses on judgment, ownership, and high-impact decisions at senior level.",
    bgColor: "bg-[#141414]",
    borderColor: "border-[#E50914]",
    accentColor: "#E50914",
    textColor: "text-white",
    icon: (
      <svg className="h-6 w-6" viewBox="0 0 24 24" fill="#E50914">
        <path d="M5.398 0v.006c3.028 8.556 5.37 15.175 8.348 23.596 2.344.058 4.85.398 4.854.398-2.8-7.924-5.923-16.747-8.487-24zm8.489 0v9.63L18.6 22.951c-.043-7.86-.004-15.913.002-22.95zM5.398 1.05V24c1.873-.225 2.81-.312 4.715-.398v-9.22z" />
      </svg>
    ),
    features: [
      "Cinematic Design",
      "Strategic Focus",
      "Ownership Stories",
      "Decision Examples",
      "Senior-Level Tone",
    ],
    hrTip:
      "Netflix hires fully-formed adults. Skip the junior tasks. Show strategic decisions you made autonomously, and times you took calculated risks that paid off.",
    style: "border-l-4 border-[#E50914]",
  },
];

export default function DashboardPage() {
  const router = useRouter();
  const { user, loading: authLoading, logout, isAuthenticated } = useAuth();
  const { resumes, loading: resumesLoading, deleteResume } = useResumeStorage();
  const [activeTab, setActiveTab] = useState<"resumes" | "templates">(
    "resumes"
  );
  const setResume = useResumeStore((s) => s.setResume);
  const setTemplate = useResumeStore((s) => s.setTemplate);

  const resumeInsightsById = useMemo(() => {
    const out: Record<string, { suggestions: string[] } | undefined> = {};
    for (const doc of resumes) {
      if (!doc.$id) continue;
      try {
        const parsed = JSON.parse(doc.data) as Resume;
        out[doc.$id] = analyzeResumeBasics(parsed);
      } catch {
        out[doc.$id] = undefined;
      }
    }
    return out;
  }, [resumes]);

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.push("/");
    }
  }, [authLoading, isAuthenticated, router]);

  const handleLoadResume = (resume: ResumeDocument) => {
    try {
      const data = JSON.parse(resume.data);
      setResume(data);
      router.push("/");
    } catch (err) {
      console.error("Failed to load resume:", err);
    }
  };

  const handleDeleteResume = async (id: string) => {
    if (confirm("Are you sure you want to delete this resume?")) {
      await deleteResume(id);
    }
  };

  const handleUseTemplate = (templateId: string) => {
    // Map MAANG templates to existing template types
    const templateMap: Record<string, TemplateId> = {
      google: "minimal",
      amazon: "executive",
      apple: "modern",
      meta: "creative",
      netflix: "tech",
    };
    setTemplate(templateMap[templateId] || "modern");
    router.push("/");
  };

  const handleLogout = async () => {
    await logout();
    router.push("/");
  };

  if (authLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50">
        <div className="flex items-center gap-3">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-violet-200 border-t-violet-600" />
          <span className="text-slate-600">Loading...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <header className="sticky top-0 z-40 bg-white shadow-sm">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
          <Link href="/">
            <HackoraLogo size="md" />
          </Link>

          <div className="flex items-center gap-4">
            <Link
              href="/"
              className="rounded-lg bg-slate-900 px-4 py-2 text-sm font-medium text-white transition hover:bg-slate-800"
            >
              + New Resume
            </Link>
            <div className="flex items-center gap-3">
              <div className="hidden sm:block">
                <p className="text-sm font-medium text-slate-900">
                  {user?.name || "User"}
                </p>
                <p className="text-xs text-slate-500">{user?.email}</p>
              </div>
              <button
                onClick={handleLogout}
                className="rounded-lg bg-slate-100 px-3 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-200"
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        {/* Welcome + Snack Tabs */}
        <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <h1 className="text-3xl font-bold text-slate-900">
            Welcome back, {user?.name?.split(" ")[0] || "there"}! 👋
          </h1>

          <div className="inline-flex w-fit rounded-full bg-slate-100 p-1">
            <button
              onClick={() => setActiveTab("resumes")}
              className={`rounded-full px-4 py-2 text-sm font-medium transition ${
                activeTab === "resumes"
                  ? "bg-white text-slate-900 shadow-sm"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              My Resumes
            </button>
            <button
              onClick={() => setActiveTab("templates")}
              className={`rounded-full px-4 py-2 text-sm font-medium transition ${
                activeTab === "templates"
                  ? "bg-white text-slate-900 shadow-sm"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              MAANG Templates
            </button>
          </div>
        </div>

        {/* My Resumes Tab */}
        {activeTab === "resumes" && (
          <div className="grid gap-6 lg:grid-cols-12">
            <div className="lg:col-span-8">
              {resumesLoading ? (
                <div className="flex items-center justify-center py-12">
                  <div className="h-8 w-8 animate-spin rounded-full border-4 border-violet-200 border-t-violet-600" />
                </div>
              ) : resumes.length === 0 ? (
                <div className="rounded-xl bg-white p-12 text-center shadow-sm border border-slate-100">
                  <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-slate-100">
                    <svg
                      className="h-8 w-8 text-slate-400"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                      strokeWidth={1.5}
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                      />
                    </svg>
                  </div>
                  <h3 className="text-lg font-semibold text-slate-900">
                    No resumes yet
                  </h3>
                  <p className="mt-2 text-sm text-slate-500">
                    Create your first ATS-optimized resume
                  </p>
                  <Link
                    href="/"
                    className="mt-6 inline-block rounded-lg bg-slate-900 px-6 py-3 text-sm font-medium text-white transition hover:bg-slate-800"
                  >
                    Create Resume
                  </Link>
                </div>
              ) : (
                <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
                  {resumes.map((resume) => (
                    <div
                      key={resume.$id}
                      className="group rounded-xl bg-white p-5 shadow-sm border border-slate-100 transition hover:shadow-md hover:border-slate-200"
                    >
                      <div className="mb-4 flex items-start justify-between">
                        <div className="flex h-11 w-11 items-center justify-center rounded-lg bg-slate-100">
                          <svg
                            className="h-6 w-6 text-slate-600"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                            strokeWidth={1.5}
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                            />
                          </svg>
                        </div>
                        {resume.$id && (
                          <button
                            onClick={() => handleDeleteResume(resume.$id!)}
                            className="rounded-lg p-2 text-slate-400 opacity-0 transition hover:bg-red-50 hover:text-red-500 group-hover:opacity-100"
                          >
                            <svg
                              className="h-4 w-4"
                              fill="none"
                              viewBox="0 0 24 24"
                              stroke="currentColor"
                              strokeWidth={2}
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                              />
                            </svg>
                          </button>
                        )}
                      </div>
                      <h3 className="font-semibold text-slate-900">
                        {resume.title}
                      </h3>
                      <p className="mt-1 text-xs text-slate-500">
                        Updated{" "}
                        {resume.$updatedAt
                          ? new Date(resume.$updatedAt).toLocaleDateString()
                          : "Recently"}
                      </p>

                      {resume.$id &&
                      resumeInsightsById[resume.$id]?.suggestions?.length ? (
                        <div className="mt-3 rounded-lg bg-slate-50 p-3 border border-slate-100">
                          <p className="text-xs font-semibold text-slate-700">
                            Suggestions
                          </p>
                          <ul className="mt-2 space-y-1">
                            {resumeInsightsById[resume.$id]!.suggestions.slice(
                              0,
                              3
                            ).map((s, idx) => (
                              <li
                                key={idx}
                                className="text-xs text-slate-600 leading-relaxed"
                              >
                                • {s}
                              </li>
                            ))}
                          </ul>
                        </div>
                      ) : null}
                      <button
                        onClick={() => handleLoadResume(resume)}
                        className="mt-4 w-full rounded-lg bg-slate-100 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-200"
                      >
                        Open
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Resume Tips Sidebar */}
            <aside className="lg:col-span-4 lg:justify-self-end">
              <div className="rounded-xl bg-gradient-to-br from-emerald-600 to-teal-600 p-5 text-white lg:max-w-sm lg:sticky lg:top-24">
                <div className="flex items-center gap-2.5 mb-3">
                  <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-white/20">
                    <svg
                      className="h-5 w-5"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                      strokeWidth={2}
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                      />
                    </svg>
                  </div>
                  <h2 className="text-lg font-bold">Resume Guide</h2>
                </div>
                <p className="text-xs text-white/90 leading-relaxed mb-4">
                  Learn what to include, how to structure, and tips to get past
                  ATS systems and impress recruiters.
                </p>

                <div className="space-y-2.5 mb-4">
                  <div className="flex items-start gap-2">
                    <svg
                      className="h-4 w-4 mt-0.5 shrink-0"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path
                        fillRule="evenodd"
                        d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                        clipRule="evenodd"
                      />
                    </svg>
                    <span className="text-xs text-white/90">
                      What sections to include
                    </span>
                  </div>
                  <div className="flex items-start gap-2">
                    <svg
                      className="h-4 w-4 mt-0.5 shrink-0"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path
                        fillRule="evenodd"
                        d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                        clipRule="evenodd"
                      />
                    </svg>
                    <span className="text-xs text-white/90">
                      How to write impact bullets
                    </span>
                  </div>
                  <div className="flex items-start gap-2">
                    <svg
                      className="h-4 w-4 mt-0.5 shrink-0"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path
                        fillRule="evenodd"
                        d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                        clipRule="evenodd"
                      />
                    </svg>
                    <span className="text-xs text-white/90">
                      ATS optimization strategies
                    </span>
                  </div>
                  <div className="flex items-start gap-2">
                    <svg
                      className="h-4 w-4 mt-0.5 shrink-0"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path
                        fillRule="evenodd"
                        d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                        clipRule="evenodd"
                      />
                    </svg>
                    <span className="text-xs text-white/90">
                      Formatting best practices
                    </span>
                  </div>
                  <div className="flex items-start gap-2">
                    <svg
                      className="h-4 w-4 mt-0.5 shrink-0"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path
                        fillRule="evenodd"
                        d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                        clipRule="evenodd"
                      />
                    </svg>
                    <span className="text-xs text-white/90">
                      Keywords recruiters look for
                    </span>
                  </div>
                </div>

                <Link
                  href="/guide"
                  className="block w-full rounded-lg bg-white px-4 py-2.5 text-center text-sm font-semibold text-emerald-600 transition hover:bg-white/90"
                >
                  View Complete Guide
                </Link>

                <div className="mt-4 rounded-lg bg-white/10 p-3">
                  <p className="text-xs text-white/80 leading-relaxed">
                    <strong className="text-white">Pro Tip:</strong> Use action
                    verbs, quantify achievements, and tailor your resume for
                    each job application.
                  </p>
                </div>
              </div>
            </aside>
          </div>
        )}

        {/* MAANG Templates Tab */}
        {activeTab === "templates" && (
          <div className="grid gap-6 lg:grid-cols-12">
            <div className="lg:col-span-8">
              <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
                {maangTemplates.map((template) => (
                  <div
                    key={template.id}
                    className={`group overflow-hidden rounded-lg border-2 bg-white transition hover:border-slate-300 ${template.style}`}
                  >
                    {/* Company Header */}
                    <div
                      className={`${template.bgColor} ${template.textColor} p-3`}
                    >
                      <div className="flex items-center gap-2">
                        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-white/20">
                          {template.icon}
                        </div>
                        <div>
                          <p
                            className={`text-xs ${
                              template.textColor === "text-white"
                                ? "text-white/60"
                                : "text-slate-500"
                            }`}
                          >
                            {template.company}
                          </p>
                          <h3 className="text-sm font-bold">{template.name}</h3>
                        </div>
                      </div>
                    </div>
                    {/* Content */}
                    <div className="p-3">
                      <button
                        onClick={() => handleUseTemplate(template.id)}
                        className="w-full rounded-lg border border-slate-900 bg-slate-900 py-1.5 text-sm font-medium text-white transition hover:bg-slate-800"
                      >
                        Use Template
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <aside className="lg:col-span-4 lg:justify-self-end">
              <div className="rounded-xl bg-slate-900 p-5 text-white lg:max-w-sm lg:sticky lg:top-24">
                <div className="flex items-center gap-2.5 mb-3">
                  <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-white/10">
                    <svg
                      className="h-5 w-5"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                      strokeWidth={2}
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z"
                      />
                    </svg>
                  </div>
                  <h2 className="text-lg font-bold">MAANG Templates</h2>
                </div>
                <p className="text-xs text-slate-300 leading-relaxed">
                  Authentic design styles inspired by each company&apos;s brand
                  and hiring culture. These templates reflect real recruiter
                  preferences and ATS optimization strategies.
                </p>
                <div className="mt-4 space-y-2">
                  <div className="flex items-center gap-2 text-xs text-slate-400">
                    <span className="h-1.5 w-1.5 rounded-full bg-emerald-400"></span>
                    95%+ ATS Parse Rate
                  </div>
                  <div className="flex items-center gap-2 text-xs text-slate-400">
                    <span className="h-1.5 w-1.5 rounded-full bg-blue-400"></span>
                    HR-Verified Formats
                  </div>
                  <div className="flex items-center gap-2 text-xs text-slate-400">
                    <span className="h-1.5 w-1.5 rounded-full bg-amber-400"></span>
                    Company Culture Aligned
                  </div>
                </div>
              </div>
            </aside>
          </div>
        )}
      </main>
    </div>
  );
}
