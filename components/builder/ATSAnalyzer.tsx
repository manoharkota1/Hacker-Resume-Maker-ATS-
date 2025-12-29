"use client";

import { useState } from "react";
import { useResumeStore } from "@/lib/state/useResumeStore";
import { useAuth } from "@/lib/appwrite/auth";
import { LoginModal } from "@/components/auth/LoginModal";
import clsx from "classnames";

interface ATSResult {
  score: number;
  breakdown: {
    keywordMatch: number;
    formatting: number;
    experience: number;
    skills: number;
    education: number;
  };
  keywords: {
    found: string[];
    missing: string[];
    recommended: string[];
  };
  suggestions: {
    category: string;
    priority: "high" | "medium" | "low";
    suggestion: string;
  }[];
  sectionScores: {
    section: string;
    score: number;
    feedback: string;
  }[];
}

type AnalysisMode = "with-jd" | "without-jd";

export function ATSAnalyzer() {
  const { isAuthenticated } = useAuth();
  const [showLoginModal, setShowLoginModal] = useState(false);

  const resume = useResumeStore((s) => s.resume);
  const jobDescription = useResumeStore((s) => s.jobDescription);
  const setJobDescription = useResumeStore((s) => s.setJobDescription);

  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<ATSResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [analysisMode, setAnalysisMode] = useState<AnalysisMode>("with-jd");

  const analyzeResume = async () => {
    if (analysisMode === "with-jd" && !jobDescription.trim()) {
      setError("Please enter a job description first");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const response = await fetch("/api/ats", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          resume: {
            personal: resume.personal,
            summary: resume.summary,
            skills: resume.skills,
            experience: resume.experience,
          },
          jobDescription: analysisMode === "with-jd" ? jobDescription : "",
          mode: analysisMode,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to analyze resume");
      }

      const data: ATSResult = await response.json();
      setResult(data);
    } catch {
      setError("Failed to analyze resume. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const getScoreColor = (score: number) => {
    if (score >= 80) return "text-emerald-600";
    if (score >= 60) return "text-amber-600";
    return "text-red-600";
  };

  const getScoreBg = (score: number) => {
    if (score >= 80) return "bg-emerald-500";
    if (score >= 60) return "bg-amber-500";
    return "bg-red-500";
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "high":
        return "bg-red-100 text-red-700 border-red-200";
      case "medium":
        return "bg-amber-100 text-amber-700 border-amber-200";
      default:
        return "bg-slate-100 text-slate-700 border-slate-200";
    }
  };

  // Show login prompt if not authenticated
  if (!isAuthenticated) {
    return (
      <>
        <div className="space-y-4">
          <div className="rounded-lg border border-slate-200 bg-white p-6 text-center">
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-slate-900">
              <span className="text-3xl">📊</span>
            </div>
            <h3 className="text-lg font-semibold text-slate-900">
              ATS Score Analyzer
            </h3>
            <p className="mt-2 text-sm text-slate-600">
              Check how well your resume matches job descriptions. Get a
              compatibility score and actionable improvement suggestions.
            </p>
            <div className="mt-4 space-y-2">
              <div className="flex items-center justify-center gap-2 text-xs text-slate-500">
                <span>✓</span> ATS compatibility scoring
              </div>
              <div className="flex items-center justify-center gap-2 text-xs text-slate-500">
                <span>✓</span> Keyword analysis
              </div>
              <div className="flex items-center justify-center gap-2 text-xs text-slate-500">
                <span>✓</span> Improvement suggestions
              </div>
            </div>
            <button
              onClick={() => setShowLoginModal(true)}
              className="mt-6 w-full rounded-lg bg-slate-900 py-3 text-sm font-semibold text-white transition hover:bg-slate-800"
            >
              Login to Analyze Resume
            </button>
          </div>
        </div>
        <LoginModal
          isOpen={showLoginModal}
          onClose={() => setShowLoginModal(false)}
        />
      </>
    );
  }

  return (
    <div className="space-y-4">
      {/* Analysis Mode Selection */}
      <div className="rounded-lg border border-slate-200 bg-white p-4">
        <h3 className="mb-3 flex items-center gap-2 text-sm font-semibold text-slate-900">
          <span className="text-lg">📊</span> ATS Score Analyzer
        </h3>

        {/* Mode Toggle */}
        <div className="mb-4 flex rounded-lg bg-slate-100 p-1">
          <button
            onClick={() => setAnalysisMode("with-jd")}
            className={clsx(
              "flex-1 rounded-md py-2 text-xs font-medium transition",
              analysisMode === "with-jd"
                ? "bg-white text-slate-900 shadow-sm"
                : "text-slate-600 hover:text-slate-900"
            )}
          >
            📋 With Job Description
          </button>
          <button
            onClick={() => setAnalysisMode("without-jd")}
            className={clsx(
              "flex-1 rounded-md py-2 text-xs font-medium transition",
              analysisMode === "without-jd"
                ? "bg-white text-slate-900 shadow-sm"
                : "text-slate-600 hover:text-slate-900"
            )}
          >
            📄 General Analysis
          </button>
        </div>

        <div className="space-y-3">
          {analysisMode === "with-jd" && (
            <div>
              <label className="mb-1 block text-xs font-medium text-slate-700">
                Paste Job Description
              </label>
              <textarea
                value={jobDescription}
                onChange={(e) => setJobDescription(e.target.value)}
                placeholder="Paste the job description here to analyze how well your resume matches..."
                rows={4}
                className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm text-black placeholder:text-slate-400 focus:border-slate-400 focus:outline-none focus:ring-1 focus:ring-slate-400"
              />
            </div>
          )}

          {analysisMode === "without-jd" && (
            <div className="rounded-lg bg-slate-50 p-3">
              <p className="text-xs text-slate-600">
                <strong>General Analysis Mode:</strong> We&apos;ll analyze your
                resume for overall ATS compatibility, formatting, and common
                best practices without comparing to a specific job.
              </p>
            </div>
          )}

          <button
            onClick={analyzeResume}
            disabled={
              loading || (analysisMode === "with-jd" && !jobDescription.trim())
            }
            className="w-full rounded-lg bg-slate-900 px-4 py-2.5 text-sm font-medium text-white transition hover:bg-slate-800 disabled:opacity-50"
          >
            {loading ? (
              <span className="flex items-center justify-center gap-2">
                <svg className="h-4 w-4 animate-spin" viewBox="0 0 24 24">
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                    fill="none"
                  />
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  />
                </svg>
                Analyzing...
              </span>
            ) : analysisMode === "with-jd" ? (
              "Analyze Match"
            ) : (
              "Analyze Resume"
            )}
          </button>
        </div>
      </div>

      {/* Error Display */}
      {error && (
        <div className="rounded-lg border border-red-200 bg-red-50 p-3">
          <p className="text-sm text-red-700">{error}</p>
        </div>
      )}

      {/* Results */}
      {result && (
        <div className="space-y-4">
          {/* Overall Score */}
          <div className="rounded-lg border border-slate-200 bg-white p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-600">
                  ATS Compatibility Score
                </p>
                <p
                  className={clsx(
                    "text-4xl font-bold",
                    getScoreColor(result.score)
                  )}
                >
                  {result.score}%
                </p>
              </div>
              <div className="h-20 w-20">
                <svg viewBox="0 0 36 36" className="h-full w-full">
                  <path
                    d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                    fill="none"
                    stroke="#e2e8f0"
                    strokeWidth="3"
                  />
                  <path
                    d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                    fill="none"
                    stroke={
                      result.score >= 80
                        ? "#10b981"
                        : result.score >= 60
                        ? "#f59e0b"
                        : "#ef4444"
                    }
                    strokeWidth="3"
                    strokeDasharray={`${result.score}, 100`}
                    strokeLinecap="round"
                  />
                </svg>
              </div>
            </div>
          </div>

          {/* Score Breakdown */}
          <div className="rounded-lg border border-slate-200 bg-white p-4">
            <h4 className="mb-3 text-sm font-semibold text-slate-900">
              Score Breakdown
            </h4>
            <div className="space-y-3">
              {Object.entries(result.breakdown).map(([key, value]) => (
                <div key={key}>
                  <div className="mb-1 flex justify-between text-xs">
                    <span className="capitalize text-slate-600">
                      {key.replace(/([A-Z])/g, " $1").trim()}
                    </span>
                    <span className={getScoreColor(value)}>{value}%</span>
                  </div>
                  <div className="h-2 overflow-hidden rounded-full bg-slate-100">
                    <div
                      className={clsx("h-full rounded-full", getScoreBg(value))}
                      style={{ width: `${value}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Keywords */}
          <div className="rounded-lg border border-slate-200 bg-white p-4">
            <h4 className="mb-3 text-sm font-semibold text-slate-900">
              Keyword Analysis
            </h4>

            {result.keywords.found.length > 0 && (
              <div className="mb-3">
                <p className="mb-2 text-xs font-medium text-emerald-600">
                  ✓ Found Keywords ({result.keywords.found.length})
                </p>
                <div className="flex flex-wrap gap-1">
                  {result.keywords.found.map((kw) => (
                    <span
                      key={kw}
                      className="rounded-full bg-emerald-100 px-2 py-0.5 text-xs text-emerald-700"
                    >
                      {kw}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {result.keywords.missing.length > 0 && (
              <div className="mb-3">
                <p className="mb-2 text-xs font-medium text-red-600">
                  ✗ Missing Keywords ({result.keywords.missing.length})
                </p>
                <div className="flex flex-wrap gap-1">
                  {result.keywords.missing.map((kw) => (
                    <span
                      key={kw}
                      className="rounded-full bg-red-100 px-2 py-0.5 text-xs text-red-700"
                    >
                      {kw}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {result.keywords.recommended.length > 0 && (
              <div>
                <p className="mb-2 text-xs font-medium text-amber-600">
                  💡 Recommended to Add
                </p>
                <div className="flex flex-wrap gap-1">
                  {result.keywords.recommended.map((kw) => (
                    <span
                      key={kw}
                      className="rounded-full bg-amber-100 px-2 py-0.5 text-xs text-amber-700"
                    >
                      {kw}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Suggestions */}
          {result.suggestions.length > 0 && (
            <div className="rounded-lg border border-slate-200 bg-white p-4">
              <h4 className="mb-3 text-sm font-semibold text-slate-900">
                Improvement Suggestions
              </h4>
              <div className="space-y-2">
                {result.suggestions.map((suggestion, idx) => (
                  <div
                    key={idx}
                    className={clsx(
                      "rounded-lg border p-3",
                      getPriorityColor(suggestion.priority)
                    )}
                  >
                    <div className="mb-1 flex items-center gap-2">
                      <span className="rounded bg-white/50 px-1.5 py-0.5 text-xs font-medium">
                        {suggestion.category}
                      </span>
                      <span className="text-xs capitalize opacity-75">
                        {suggestion.priority} priority
                      </span>
                    </div>
                    <p className="text-sm">{suggestion.suggestion}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Section Scores */}
          <div className="rounded-lg border border-slate-200 bg-white p-4">
            <h4 className="mb-3 text-sm font-semibold text-slate-900">
              Section Analysis
            </h4>
            <div className="space-y-2">
              {result.sectionScores.map((section) => (
                <div
                  key={section.section}
                  className="flex items-center justify-between rounded-lg bg-slate-50 p-2"
                >
                  <div>
                    <p className="text-sm font-medium text-slate-900">
                      {section.section}
                    </p>
                    <p className="text-xs text-slate-500">{section.feedback}</p>
                  </div>
                  <span
                    className={clsx(
                      "text-sm font-bold",
                      getScoreColor(section.score)
                    )}
                  >
                    {section.score}%
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
