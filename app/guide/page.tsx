"use client";

import Link from "next/link";
import { HackoraLogo } from "@/components/HackoraLogo";

const noteCards = [
  {
    id: "structure",
    title: "Structure first",
    accent: "border-amber-500",
    badge: "Layout",
    icon: (
      <svg
        className="h-5 w-5 text-amber-600"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth={1.6}
      >
        <path
          d="M4 6h16M4 12h10M4 18h6"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    ),
    points: [
      "Header with name, role, city, email, phone, LinkedIn",
      "Work experience with reverse chronology and 3-5 bullets",
      "Skills grouped by category; keep the list honest and short",
      "Education and certifications go last unless you are junior",
    ],
  },
  {
    id: "impact",
    title: "Write impact bullets",
    accent: "border-emerald-600",
    badge: "Impact",
    icon: (
      <svg
        className="h-5 w-5 text-emerald-600"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth={1.6}
      >
        <path
          d="M5 12l4 4 10-10"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    ),
    points: [
      "Action + metric + result (XYZ formula)",
      "Lead with strong verbs: built, shipped, optimized, reduced",
      "Quantify: %, time saved, revenue, users, reliability",
      "Cut filler words; keep one clear idea per line",
    ],
  },
  {
    id: "ats",
    title: "ATS friendly",
    accent: "border-slate-500",
    badge: "ATS",
    icon: (
      <svg
        className="h-5 w-5 text-slate-600"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth={1.6}
      >
        <path d="M6 5h12v14H6z" />
        <path d="M9 9h6M9 12h4" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    ),
    points: [
      "Plain text layout; avoid tables, columns, images",
      "Section headers: Summary, Experience, Skills, Education",
      "Mirror keywords from the job description naturally",
      "Save to PDF and check that text is selectable",
    ],
  },
  {
    id: "format",
    title: "Keep it readable",
    accent: "border-indigo-500",
    badge: "Style",
    icon: (
      <svg
        className="h-5 w-5 text-indigo-600"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth={1.6}
      >
        <path
          d="M7 6h10M7 10h6M7 14h10M7 18h6"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    ),
    points: [
      "One page for <6 years experience; two max for senior",
      "11-12pt clean fonts; consistent spacing and margins",
      "Bold company and title; keep dates aligned to the right",
      "Leave white space; dense text looks like AI output",
    ],
  },
  {
    id: "proof",
    title: "Proof & tailor",
    accent: "border-rose-500",
    badge: "Review",
    icon: (
      <svg
        className="h-5 w-5 text-rose-600"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth={1.6}
      >
        <path
          d="M4 12h16M12 4v16"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    ),
    points: [
      "Read aloud to catch awkward phrasing",
      "Check dates, links, and contact info",
      "Remove confidential details and filler buzzwords",
      "Tailor top bullets to the role before sending",
    ],
  },
];

export default function GuidePage() {
  return (
    <div className="min-h-screen min-h-[100dvh] bg-slate-50 text-slate-900">
      <header className="sticky top-0 z-40 border-b border-slate-200 bg-white">
        <div className="mx-auto flex h-14 sm:h-16 max-w-6xl items-center justify-between px-4 sm:px-6 lg:px-8">
          <Link
            href="/dashboard"
            className="flex items-center gap-2 text-sm font-semibold text-slate-700 hover:text-slate-900 transition-colors"
          >
            <span className="flex h-9 w-9 items-center justify-center border border-slate-200 bg-white shadow-sm hover:bg-slate-50 transition-colors">
              <svg
                className="h-4 w-4"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth={2}
              >
                <path
                  d="M15 18l-6-6 6-6"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </span>
            <span className="hidden sm:inline">Back</span>
          </Link>
          <HackoraLogo size="sm" />
          <Link
            href="/"
            className="border border-slate-300 bg-white px-4 py-2.5 text-sm font-semibold text-slate-900 hover:border-slate-400 hover:bg-slate-50 transition-all duration-200 flex items-center gap-2 shadow-sm"
          >
            <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}><path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7" /><path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z" /></svg>
            <span className="hidden sm:inline">Open Builder</span>
            <span className="sm:hidden">Build</span>
          </Link>
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-4 py-8 sm:py-14 sm:px-6 lg:px-8">
        <section className="grid gap-6 lg:gap-8 lg:grid-cols-[1.2fr_1fr] items-start">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.2em] text-emerald-600">
              Resume notebook
            </p>
            <h1 className="mt-3 text-3xl sm:text-4xl lg:text-5xl font-bold leading-tight text-slate-900">
              Minimal guide to a human resume
            </h1>
            <p className="mt-4 max-w-2xl text-base sm:text-lg text-slate-600 leading-relaxed">
              Skip the AI fluff. Use this as a checklist to write a clean,
              believable resume that recruiters can scan in under 10 seconds.
            </p>
            <div className="mt-6 flex flex-wrap gap-2 sm:gap-3 text-sm text-slate-600">
              <span className="inline-flex items-center gap-2 border border-slate-200 bg-white px-3 sm:px-4 py-2 shadow-sm">
                <span className="h-2 w-2 bg-emerald-500" /> ATS
                safe
              </span>
              <span className="inline-flex items-center gap-2 border border-slate-200 bg-white px-3 sm:px-4 py-2 shadow-sm">
                <span className="h-2 w-2 bg-amber-500" /> Human
                readable
              </span>
              <span className="inline-flex items-center gap-2 border border-slate-200 bg-white px-3 sm:px-4 py-2 shadow-sm">
                <span className="h-2 w-2 bg-slate-500" /> 1 page
                first
              </span>
            </div>
          </div>

          <div className="relative overflow-hidden border border-slate-200 bg-white shadow-lg">
            <div
              className="absolute -left-10 top-10 h-32 w-32 rounded-full bg-emerald-100 blur-3xl"
              aria-hidden
            />
            <div
              className="absolute -right-8 bottom-6 h-24 w-24 rounded-full bg-amber-100 blur-2xl"
              aria-hidden
            />
            <div className="relative p-5 sm:p-6">
              <div className="flex items-center justify-between text-sm font-bold text-slate-600">
                <span>Today&apos;s notes</span>
                <span className="bg-slate-100 px-2.5 py-1 text-xs">
                  Concise
                </span>
              </div>
              <div className="mt-4 space-y-3 text-sm text-slate-700">
                <div className="flex items-start gap-3 border border-slate-200 bg-slate-50 px-4 py-3">
                  <span className="mt-1 h-2.5 w-2.5 bg-emerald-500 flex-shrink-0" />
                  <p className="leading-relaxed">
                    Lead each bullet with action + metric. If no number, add
                    speed, quality, or adoption.
                  </p>
                </div>
                <div className="flex items-start gap-3 border border-slate-200 bg-slate-50 px-4 py-3">
                  <span className="mt-1 h-2.5 w-2.5 bg-amber-500 flex-shrink-0" />
                  <p className="leading-relaxed">
                    Pin 5-7 strongest achievements; trim the rest. Recruiters
                    skim, not study.
                  </p>
                </div>
                <div className="flex items-start gap-3 border border-slate-200 bg-slate-50 px-4 py-3">
                  <span className="mt-1 h-2.5 w-2.5 bg-slate-500 flex-shrink-0" />
                  <p className="leading-relaxed">
                    Check links, dates, and city. Save as PDF and open it to
                    spot spacing issues.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="mt-10 sm:mt-14 grid gap-4 sm:gap-6 md:grid-cols-2">
          {noteCards.map((card) => (
            <article
              key={card.id}
              className={`group relative overflow-hidden border-l-4 ${card.accent} bg-white shadow-sm transition-all duration-200 hover:-translate-y-1 hover:shadow-lg`}
            >
              <div className="absolute right-4 top-4 text-xs font-bold text-slate-400">
                {card.badge}
              </div>
              <div className="flex items-center gap-3 border-b border-slate-100 px-5 py-4">
                <div className="flex h-10 w-10 items-center justify-center bg-slate-50">
                  {card.icon}
                </div>
                <h2 className="text-lg font-bold text-slate-900">
                  {card.title}
                </h2>
              </div>
              <div className="space-y-2.5 px-5 py-4 text-sm text-slate-700">
                {card.points.map((point, idx) => (
                  <div
                    key={idx}
                    className="flex items-start gap-3 bg-slate-50 px-4 py-2.5"
                  >
                    <span className="mt-1.5 inline-flex h-2 w-2 shrink-0 bg-slate-400" />
                    <p className="leading-relaxed">{point}</p>
                  </div>
                ))}
              </div>
            </article>
          ))}
        </section>

        <section className="mt-10 sm:mt-14 border border-slate-200 bg-white p-5 sm:p-8 shadow-lg">
          <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.2em] text-emerald-600">
                Before sending
              </p>
              <h3 className="mt-2 text-xl sm:text-2xl font-bold text-slate-900">
                One last 90-second sweep
              </h3>
              <p className="mt-2 text-sm text-slate-600 max-w-lg">
                Read out loud, verify contacts, and trim anything that sounds
                like a template.
              </p>
            </div>
            <Link
              href="/"
              className="inline-flex items-center gap-2 bg-slate-900 px-6 py-3 text-sm font-semibold text-white transition-all duration-200 hover:bg-slate-800 shadow-md hover:shadow-lg whitespace-nowrap"
            >
              Go to Builder
              <svg
                className="h-4 w-4"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth={2}
              >
                <path
                  d="M9 5l7 7-7 7"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </Link>
          </div>
        </section>
      </main>
    </div>
  );
}
