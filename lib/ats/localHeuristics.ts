import { AtsResult } from "@/types/analysis";
import { Resume } from "@/types/resume";

export function scoreResume(
  resume: Resume,
  jobDescription?: string
): AtsResult {
  const sectionScores = [] as AtsResult["sections"];

  const completeness = completenessScore(resume);
  sectionScores.push({
    label: "Completeness",
    score: completeness,
    suggestions: completeness > 80 ? [] : ["Fill missing sections and dates."],
  });

  const readability = readabilityScore(resume);
  sectionScores.push({
    label: "Readability",
    score: readability,
    suggestions:
      readability > 80
        ? []
        : ["Shorten bullets and prefer action-first phrasing."],
  });

  const keywords = keywordScore(resume, jobDescription);
  sectionScores.push({
    label: "Keywords",
    score: keywords,
    suggestions:
      keywords > 70 ? [] : ["Add role-specific skills and verbs from the JD."],
  });

  const baseScore = Math.round(
    (sectionScores.reduce((acc, s) => acc + s.score, 0) /
      sectionScores.length) *
      0.9 +
      10
  );

  const matchScore = jobDescription
    ? Math.min(100, Math.round(keywords * 1.05))
    : undefined;

  const suggestions = sectionScores.flatMap((s) => s.suggestions);

  const missingKeywords = deriveKeywords(jobDescription, resume);

  return {
    baseScore,
    matchScore,
    sections: sectionScores,
    missingKeywords,
    suggestions,
  };
}

export function optimizeForAts(
  resume: Resume,
  jobDescription?: string
): Resume {
  const missingKeywords = deriveKeywords(jobDescription, resume);
  const boostedSummary = missingKeywords.length
    ? `${resume.summary}\nKey strengths: ${missingKeywords
        .slice(0, 5)
        .join(", ")}.`
    : resume.summary;

  const improvedExperience = resume.experience.map((exp) => ({
    ...exp,
    bullets: exp.bullets.map((b) => rewriteBullet(b)),
  }));

  return {
    ...resume,
    summary: boostedSummary,
    experience: improvedExperience,
  };
}

export function missingRequiredFields(resume: Resume): string[] {
  const missing: string[] = [];
  if (!resume.personal.name) missing.push("Full name");
  if (!resume.personal.email) missing.push("Email");
  if (!resume.personal.phone) missing.push("Phone");
  if (!resume.personal.location) missing.push("Location");
  if (!resume.summary || resume.summary.length < 40)
    missing.push("Summary (40+ chars)");
  if (!resume.skills.some((g) => g.items.length))
    missing.push("At least one skill group");
  if (!resume.experience.length) missing.push("At least one experience");
  if (resume.experience.some((e) => !e.title || !e.company))
    missing.push("Experience title/company");
  return missing;
}

export function formattingWarnings(resume: Resume): string[] {
  // Heuristic placeholders; real checks would parse rich content.
  const warnings = [] as string[];
  const text = [
    resume.summary,
    resume.experience
      .flatMap((e) => [e.title, e.company, ...e.bullets])
      .join(" "),
  ]
    .join(" ")
    .toLowerCase();
  if (text.includes("table"))
    warnings.push("Avoid tables; ATS may not parse them.");
  if (text.includes("icon"))
    warnings.push("Avoid icons; text is safer for ATS.");
  return warnings;
}

function completenessScore(resume: Resume) {
  let score = 40;
  if (resume.summary.length > 80) score += 10;
  if (resume.skills.some((g) => g.items.length >= 3)) score += 10;
  if (resume.experience.length >= 2) score += 20;
  if (resume.education.length >= 1) score += 10;
  if (resume.projects.length >= 1) score += 10;
  return Math.min(100, score);
}

function readabilityScore(resume: Resume) {
  const bulletCount = resume.experience.reduce(
    (acc, e) => acc + e.bullets.length,
    0
  );
  const avgBulletLen =
    resume.experience.length === 0
      ? 0
      : resume.experience.reduce(
          (acc, e) => acc + averageLength(e.bullets),
          0
        ) / resume.experience.length;
  let score = 60;
  if (bulletCount >= 6) score += 10;
  if (avgBulletLen < 140) score += 15;
  if (resume.summary.length < 400) score += 5;
  return Math.min(100, score);
}

function keywordScore(resume: Resume, jd?: string) {
  if (!jd) return 60;
  const keywords = extractKeywords(jd);
  const textCorpus = [
    resume.summary,
    resume.skills.flatMap((g) => g.items).join(" "),
    resume.experience
      .flatMap((e) => [e.title, e.company, ...e.bullets])
      .join(" "),
  ].join(" ");
  const hits = keywords.filter((kw) =>
    textCorpus.toLowerCase().includes(kw.toLowerCase())
  ).length;
  return Math.min(100, Math.round((hits / Math.max(keywords.length, 1)) * 100));
}

function extractKeywords(text: string): string[] {
  return text
    .split(/[^a-zA-Z0-9+]+/)
    .filter((t) => t.length > 3)
    .map((t) => t.toLowerCase())
    .slice(0, 30);
}

function deriveKeywords(text: string | undefined, resume: Resume): string[] {
  if (!text) return [];
  const keywords = extractKeywords(text);
  const corpus = [
    resume.summary,
    resume.skills.flatMap((g) => g.items).join(" "),
    resume.experience
      .flatMap((e) => [e.title, e.company, ...e.bullets])
      .join(" "),
  ]
    .join(" ")
    .toLowerCase();

  return keywords.filter((kw) => !corpus.includes(kw)).slice(0, 10);
}

const actionVerbs = [
  "Delivered",
  "Increased",
  "Improved",
  "Built",
  "Led",
  "Optimized",
  "Reduced",
  "Implemented",
  "Automated",
  "Designed",
];

function rewriteBullet(line: string) {
  const trimmed = line.trim();
  if (!trimmed) return "Clarify impact and add numbers.";
  const hasVerb = actionVerbs.some((verb) => trimmed.startsWith(verb));
  if (hasVerb) return trimmed;
  return `${actionVerbs[0]} ${trimmed}`;
}

function averageLength(lines: string[]) {
  if (!lines.length) return 0;
  return lines.reduce((acc, line) => acc + line.length, 0) / lines.length;
}
