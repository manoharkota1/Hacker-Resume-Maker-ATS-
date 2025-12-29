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
          className="flex-1 rounded-lg bg-slate-900 px-4 py-2 text-xs font-medium text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:bg-slate-300"
        >
          {isPending ? "Analyzing..." : "⚡ Analyze Resume"}
        </button>
        <button
          onClick={optimize}
          className="rounded-lg bg-slate-100 px-4 py-2 text-xs font-medium text-slate-700 transition hover:bg-slate-200"
        >
          🔧 Optimize
        </button>
        <button
          onClick={() => reset()}
          className="rounded-lg bg-slate-100 px-4 py-2 text-xs font-medium text-slate-700 transition hover:bg-slate-200"
        >
          ↺ Reset
        </button>
      </div>
      {missing.length ? (
        <div className="rounded-lg bg-amber-50 p-3 text-xs text-amber-900">
          <p className="font-medium">Complete required fields:</p>
          <ul className="mt-1 list-disc space-y-0.5 pl-4">
            {missing.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
        </div>
      ) : null}
      {warnings.length ? (
        <div className="rounded-lg bg-slate-50 p-3 text-xs text-slate-600">
          <p className="font-medium text-slate-700">Formatting tips</p>
          <ul className="mt-1 list-disc space-y-0.5 pl-4">
            {warnings.map((w) => (
              <li key={w}>{w}</li>
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
                className="flex items-start justify-between rounded-lg bg-slate-50 px-3 py-2"
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
                    className="rounded-md bg-slate-100 px-2 py-0.5 text-xs text-slate-600"
                  >
                    {kw}
                  </span>
                ))}
              </div>
            </div>
          ) : null}
        </div>
      ) : (
        <div className="rounded-lg bg-slate-50 p-4 text-center text-xs text-slate-500">
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
  return (
    <div className="flex-1 rounded-lg bg-slate-50 p-3 text-center">
      <span className="text-xs text-slate-500">{label}</span>
      <p className={`text-2xl font-bold ${color}`}>{value}</p>
    </div>
  );
}
