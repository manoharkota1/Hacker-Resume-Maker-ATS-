"use client";

import { useTransition } from "react";
import { useResumeStore } from "@/lib/state/useResumeStore";
import {
  scoreResume,
  missingRequiredFields,
  formattingWarnings,
  optimizeForAts,
} from "@/lib/ats/localHeuristics";

export function AnalysisPanel() {
  const resume = useResumeStore((s) => s.resume);
  const jd = useResumeStore((s) => s.jobDescription);
  const analysis = useResumeStore((s) => s.analysis);
  const setAnalysis = useResumeStore((s) => s.setAnalysis);
  const setAnalyzing = useResumeStore((s) => s.setAnalyzing);
  const setResume = useResumeStore((s) => s.setResume);
  const reset = useResumeStore((s) => s.reset);
  const [isPending, startTransition] = useTransition();

  const missing = missingRequiredFields(resume);
  const warnings = formattingWarnings(resume);

  const runAnalysis = () => {
    startTransition(() => {
      setAnalyzing(true);
      const result = scoreResume(resume, jd);
      setAnalysis(result);
      setAnalyzing(false);
    });
  };

  const optimize = () => {
    const optimized = optimizeForAts(resume, jd);
    setResume(optimized);
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-2">
        <button
          onClick={runAnalysis}
          disabled={missing.length > 0}
          className="flex-1 bg-slate-900 px-4 py-2.5 text-xs font-medium text-white transition-all duration-200 hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {isPending ? (
            <span className="flex items-center justify-center gap-2">
              <span className="h-3 w-3 animate-spin rounded-full border-2 border-white/30 border-t-white" />
              Analyzing...
            </span>
          ) : (
            <span className="flex items-center justify-center gap-1.5">
              <svg className="h-3.5 w-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5}>
                <path d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
              Analyze Resume
            </span>
          )}
        </button>
        <button
          onClick={optimize}
          className="bg-slate-100 px-4 py-2.5 text-xs font-medium text-slate-700 transition-all duration-200 hover:bg-slate-200"
        >
          <span className="flex items-center gap-1.5">
            <svg className="h-3.5 w-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
              <path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z" />
            </svg>
            Optimize
          </span>
        </button>
        <button
          onClick={() => reset()}
          className="bg-slate-100 px-4 py-2.5 text-xs font-medium text-slate-700 transition-all duration-200 hover:bg-slate-200"
        >
          <span className="flex items-center gap-1.5">
            <svg className="h-3.5 w-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
              <path d="M3 12a9 9 0 0 1 9-9 9.75 9.75 0 0 1 6.74 2.74L21 8" />
              <path d="M21 3v5h-5" />
              <path d="M21 12a9 9 0 0 1-9 9 9.75 9.75 0 0 1-6.74-2.74L3 16" />
              <path d="M3 21v-5h5" />
            </svg>
            Reset
          </span>
        </button>
      </div>
      {missing.length ? (
        <div className="border border-amber-200 bg-amber-50 p-3.5 text-xs text-amber-900">
          <div className="flex items-center gap-2 font-medium">
            <svg className="h-4 w-4 text-amber-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
              <path d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
            Complete required fields:
          </div>
          <ul className="mt-2 space-y-1 pl-6">
            {missing.map((item) => (
              <li key={item} className="flex items-center gap-1.5">
                <span className="h-1 w-1 rounded-full bg-amber-400" />
                {item}
              </li>
            ))}
          </ul>
        </div>
      ) : null}
      {warnings.length ? (
        <div className="border border-slate-200 bg-slate-50 p-3.5 text-xs text-slate-600">
          <div className="flex items-center gap-2 font-medium text-slate-700">
            <svg className="h-4 w-4 text-slate-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
              <circle cx="12" cy="12" r="10" />
              <path d="M12 16v-4" />
              <path d="M12 8h.01" />
            </svg>
            Formatting tips
          </div>
          <ul className="mt-2 space-y-1 pl-6">
            {warnings.map((w) => (
              <li key={w} className="flex items-center gap-1.5">
                <span className="h-1 w-1 rounded-full bg-slate-300" />
                {w}
              </li>
            ))}
          </ul>
        </div>
      ) : null}
      {analysis ? (
        <div className="space-y-3">
          <div className="flex gap-3">
            <Score label="Base" value={analysis.baseScore} />
            {analysis.matchScore !== undefined && (
              <Score label="Match" value={analysis.matchScore} />
            )}
          </div>
          <div className="space-y-2">
            {analysis.sections.map((section) => (
              <div
                key={section.label}
                className="flex items-start justify-between bg-slate-50 px-3 py-2"
              >
                <div>
                  <p className="text-xs font-medium text-slate-800">
                    {section.label}
                  </p>
                  {section.suggestions.map((s, idx) => (
                    <p key={idx} className="text-xs text-slate-500">
                      • {s}
                    </p>
                  ))}
                </div>
                <span className="text-xs font-semibold text-slate-800">
                  {section.score}
                </span>
              </div>
            ))}
          </div>
          {analysis.missingKeywords && analysis.missingKeywords.length ? (
            <div>
              <p className="mb-2 text-xs font-medium text-slate-600">
                Missing keywords
              </p>
              <div className="flex flex-wrap gap-1.5">
                {analysis.missingKeywords.map((kw) => (
                  <span
                    key={kw}
                    className="bg-slate-100 px-2 py-0.5 text-xs text-slate-600"
                  >
                    {kw}
                  </span>
                ))}
              </div>
            </div>
          ) : null}
        </div>
      ) : (
        <div className="bg-slate-50 p-4 text-center text-xs text-slate-500">
          Click &ldquo;Analyze Resume&rdquo; to see scores and suggestions
        </div>
      )}
    </div>
  );
}

function Score({ label, value }: { label: string; value: number }) {
  const color =
    value >= 80
      ? "text-emerald-600"
      : value >= 60
      ? "text-amber-600"
      : "text-red-500";
  const bgColor =
    value >= 80
      ? "bg-emerald-50 border-emerald-100"
      : value >= 60
      ? "bg-amber-50 border-amber-100"
      : "bg-red-50 border-red-100";
  return (
    <div className={`flex-1 border p-4 text-center ${bgColor}`}>
      <span className="text-xs font-medium uppercase tracking-wide text-slate-500">{label}</span>
      <p className={`mt-1 text-3xl font-bold ${color}`}>{value}</p>
      <span className={`text-[10px] ${color}`}>{value >= 80 ? 'Excellent' : value >= 60 ? 'Good' : 'Needs Work'}</span>
    </div>
  );
}
