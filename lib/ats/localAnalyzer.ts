/**
 * Local ATS Analyzer - Pure JS, no external NLP deps
 * Works in browser and server environments (no DNS/Node built-ins required)
 */

export interface ResumeData {
  personal: {
    name: string;
    email: string;
    phone: string;
    location: string;
    linkedin: string;
    title: string;
  };
  summary: string;
  skills: { label: string; items: string[] }[];
  experience: {
    id: string;
    title: string;
    company: string;
    location?: string;
    startDate?: string;
    endDate?: string;
    bullets: string[];
  }[];
}

export interface ATSResult {
  score: number;
  breakdown: {
    keywordMatch: number;
    formatting: number;
    experience: number;
    skills: number;
    education: number;
    summary: number;
    contact: number;
  };
  keywords: {
    found: string[];
    missing: string[];
    recommended: string[];
  };
  sectionScores: {
    section: string;
    score: number;
    feedback: string;
    maxPotential: number;
  }[];
}

const TECH_SKILLS = [
  "javascript",
  "typescript",
  "python",
  "java",
  "c++",
  "c#",
  "ruby",
  "go",
  "rust",
  "swift",
  "react",
  "angular",
  "vue",
  "next.js",
  "node.js",
  "express",
  "django",
  "flask",
  "spring",
  "aws",
  "azure",
  "gcp",
  "docker",
  "kubernetes",
  "terraform",
  "jenkins",
  "ci/cd",
  "sql",
  "postgresql",
  "mysql",
  "mongodb",
  "redis",
  "elasticsearch",
  "git",
  "github",
  "gitlab",
  "jira",
  "confluence",
  "agile",
  "scrum",
  "html",
  "css",
  "sass",
  "tailwind",
  "bootstrap",
  "figma",
  "graphql",
  "rest",
  "api",
  "microservices",
  "serverless",
  "machine learning",
  "deep learning",
  "tensorflow",
  "pytorch",
  "nlp",
  "data analysis",
  "pandas",
  "numpy",
  "tableau",
  "power bi",
];

const ACTION_VERBS = [
  "achieved",
  "analyzed",
  "architected",
  "built",
  "collaborated",
  "coordinated",
  "created",
  "delivered",
  "designed",
  "developed",
  "directed",
  "drove",
  "enabled",
  "engineered",
  "established",
  "executed",
  "expanded",
  "facilitated",
  "generated",
  "improved",
  "increased",
  "launched",
  "led",
  "managed",
  "mentored",
  "modernized",
  "optimized",
  "orchestrated",
  "oversaw",
  "pioneered",
  "planned",
  "reduced",
  "refactored",
  "resolved",
  "scaled",
  "spearheaded",
  "standardized",
  "streamlined",
  "strengthened",
  "supervised",
  "transformed",
];

export function analyzeResumeLocally(
  resume: ResumeData,
  jobDescription: string
): ATSResult {
  const jdKeywords = extractJobKeywords(jobDescription);
  const resumeText = buildResumeText(resume);

  const found = jdKeywords.filter((kw) => resumeText.includes(kw));
  const missing = jdKeywords
    .filter((kw) => !resumeText.includes(kw))
    .slice(0, 15);

  const breakdown = {
    keywordMatch: jdKeywords.length
      ? Math.round((found.length / jdKeywords.length) * 100)
      : 50,
    formatting: calculateFormattingScore(resume),
    experience: calculateExperienceScore(resume),
    skills: calculateSkillsScore(resume, missing),
    education: 75,
    summary: calculateSummaryScore(resume),
    contact: calculateContactScore(resume),
  };

  const score = Math.round(
    breakdown.keywordMatch * 0.25 +
      breakdown.formatting * 0.15 +
      breakdown.experience * 0.2 +
      breakdown.skills * 0.15 +
      breakdown.education * 0.05 +
      breakdown.summary * 0.1 +
      breakdown.contact * 0.1
  );

  return {
    score,
    breakdown,
    keywords: {
      found: found.slice(0, 30),
      missing,
      recommended: TECH_SKILLS.filter((s) => !resumeText.includes(s)).slice(
        0,
        10
      ),
    },
    sectionScores: Object.entries(breakdown).map(([section, value]) => ({
      section,
      score: value,
      feedback:
        value >= 90 ? "Excellent" : value >= 70 ? "Good" : "Needs improvement",
      maxPotential: 100,
    })),
  };
}

function extractJobKeywords(jobDescription: string): string[] {
  if (!jobDescription || !jobDescription.trim()) return [];

  const words = jobDescription
    .toLowerCase()
    .split(/[^a-z0-9+.#/]+/g)
    .filter((w) => w.length > 3);

  const freq: Record<string, number> = {};
  for (const w of words) freq[w] = (freq[w] || 0) + 1;

  const sorted = Object.entries(freq)
    .sort((a, b) => b[1] - a[1])
    .map(([w]) => w);

  const jdLower = jobDescription.toLowerCase();
  const techHits = TECH_SKILLS.filter((s) => jdLower.includes(s));

  return Array.from(new Set([...sorted.slice(0, 40), ...techHits])).slice(
    0,
    50
  );
}

function buildResumeText(resume: ResumeData): string {
  return [
    resume.summary,
    ...resume.skills.flatMap((s) => s.items),
    ...resume.experience.flatMap((e) => [e.title, e.company, ...e.bullets]),
  ]
    .join(" ")
    .toLowerCase();
}

function calculateFormattingScore(resume: ResumeData): number {
  let score = 60;
  const avgBullets =
    resume.experience.length > 0
      ? resume.experience.reduce((acc, exp) => acc + exp.bullets.length, 0) /
        resume.experience.length
      : 0;

  if (avgBullets >= 3 && avgBullets <= 5) score += 20;
  else if (avgBullets >= 2) score += 10;

  if (resume.experience.length > 0) score += 10;
  if (resume.skills.length > 0) score += 10;

  return Math.min(100, score);
}

function calculateExperienceScore(resume: ResumeData): number {
  let score = 30;
  const bullets = resume.experience.flatMap((e) => e.bullets);

  const actionVerbRatio = bullets.length
    ? bullets.filter(hasActionVerb).length / bullets.length
    : 0;
  score += Math.round(actionVerbRatio * 30);

  const metricsRatio = bullets.length
    ? bullets.filter(hasMetrics).length / bullets.length
    : 0;
  score += Math.round(metricsRatio * 30);

  if (resume.experience.length >= 2) score += 10;

  return Math.min(100, score);
}

function calculateSkillsScore(
  resume: ResumeData,
  missingKeywords: string[]
): number {
  let score = 50;

  if (resume.skills.length >= 2) score += 15;
  if (resume.skills.length >= 3) score += 10;

  const allSkills = resume.skills
    .flatMap((g) => g.items)
    .map((s) => s.toLowerCase());
  const foundKeywords = missingKeywords.filter((kw) =>
    allSkills.some((s) => s.includes(kw.toLowerCase()))
  );
  const coverage = missingKeywords.length
    ? foundKeywords.length / missingKeywords.length
    : 1;
  score += Math.round(coverage * 25);

  return Math.min(100, score);
}

function calculateSummaryScore(resume: ResumeData): number {
  const summary = resume.summary || "";
  let score = 0;

  if (summary.length > 0) score += 30;
  if (summary.length >= 50) score += 20;
  if (summary.length >= 100) score += 20;
  if (summary.length >= 150) score += 15;

  if (/\d+/.test(summary)) score += 5;
  if (summary.toLowerCase().includes("year")) score += 5;
  if (summary.split(" ").length >= 20) score += 5;

  return Math.min(100, score);
}

function calculateContactScore(resume: ResumeData): number {
  let score = 0;
  if (resume.personal.email) score += 25;
  if (resume.personal.phone) score += 25;
  if (resume.personal.linkedin) score += 20;
  if (resume.personal.location) score += 15;
  if (resume.personal.title) score += 15;
  return Math.min(100, score);
}

function hasActionVerb(bullet: string): boolean {
  const first = bullet.trim().split(/\s+/)[0]?.toLowerCase();
  return ACTION_VERBS.some((v) => first && first.startsWith(v.slice(0, 5)));
}

function hasMetrics(bullet: string): boolean {
  return /\d+%|\$[\d,]+|\d+\+|\d+x|\d+ (users|customers|clients|team|projects|features|products)/i.test(
    bullet
  );
}
