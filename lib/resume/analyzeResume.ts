import type { Resume } from "@/types/resume";

export type ResumeInsights = {
  suggestions: string[];
};

function safeTrim(value: unknown): string {
  return typeof value === "string" ? value.trim() : "";
}

function countBullets(resume: Resume): string[] {
  const expBullets = resume.experience.flatMap((x) => x.bullets || []);
  const internshipBullets = resume.internships.flatMap((x) => x.bullets || []);
  const volunteeringBullets = resume.volunteering.flatMap(
    (x) => x.bullets || []
  );
  const customBullets = resume.customSections.flatMap((s) =>
    s.items.map((i) => i.content || "")
  );

  return [
    ...expBullets,
    ...internshipBullets,
    ...volunteeringBullets,
    ...customBullets,
  ]
    .map((b) => safeTrim(b))
    .filter(Boolean);
}

function bulletHasMetric(text: string): boolean {
  return (
    /\d/.test(text) ||
    /\b(\$|%|ms|sec|s|hrs|hours|days|weeks|months|yrs|years|k|m|b)\b/i.test(
      text
    )
  );
}

function bulletStartsStrong(text: string): boolean {
  const t = text.trim();
  if (!t) return false;
  if (/^(responsible for|worked on|helped|assisted|involved in)\b/i.test(t))
    return false;
  return /^[A-Z][a-zA-Z]+\b/.test(t);
}

export function analyzeResumeBasics(resume: Resume): ResumeInsights {
  const suggestions: string[] = [];

  // Contact completeness
  const email = safeTrim(resume.personal?.email);
  const phone = safeTrim(resume.personal?.phone);
  const linkedin = safeTrim(resume.personal?.linkedin);
  const portfolio = safeTrim(resume.personal?.portfolio);
  if (!email || !phone) {
    suggestions.push(
      "Add a complete header (email + phone) so recruiters can contact you fast."
    );
  }
  if (!linkedin && !portfolio) {
    suggestions.push(
      "Add a LinkedIn or portfolio link to increase credibility."
    );
  }

  // Summary quality
  const summary = safeTrim(resume.summary);
  if (!summary) {
    suggestions.push(
      "Add a 2–3 line summary with role, strengths, and 1–2 quantified wins."
    );
  } else if (summary.length < 60) {
    suggestions.push(
      "Expand your summary: include specialization + tech/domain + measurable impact."
    );
  }

  // Skills coverage
  const skillItems = resume.skills
    .flatMap((g) => (g.items || []).map((x) => safeTrim(x)))
    .filter(Boolean);
  if (resume.skills.length < 2) {
    suggestions.push(
      "Split skills into clear groups (e.g., Languages, Frameworks, Tools) for ATS scanning."
    );
  }
  if (skillItems.length < 8) {
    suggestions.push(
      "Add 8–15 relevant skills (match the job keywords; keep them truthful)."
    );
  }

  // Experience + bullets
  const bullets = countBullets(resume);
  if (!resume.experience.length && !resume.internships.length) {
    suggestions.push(
      "Add at least one Experience/Internship entry with impact-focused bullets."
    );
  }
  if (bullets.length > 0) {
    const withMetrics = bullets.filter(bulletHasMetric).length;
    const metricRatio = withMetrics / bullets.length;
    if (metricRatio < 0.4) {
      suggestions.push(
        "Quantify more bullets (%, $, time, scale, users). Numbers drive ATS + recruiter decisions."
      );
    }

    const weakStarts = bullets.filter((b) => !bulletStartsStrong(b)).length;
    if (weakStarts / bullets.length > 0.35) {
      suggestions.push(
        "Start bullets with strong action verbs (Built, Led, Shipped, Improved) and avoid 'Responsible for'."
      );
    }

    const tooLong = bullets.filter((b) => b.length > 180).length;
    if (tooLong / bullets.length > 0.25) {
      suggestions.push(
        "Shorten long bullets to 1–2 lines; keep them punchy and scannable."
      );
    }
  } else {
    suggestions.push(
      "Add 2–4 bullets per role: action + method + measurable result."
    );
  }

  // Projects / Education (common gaps)
  if (!resume.projects.length) {
    suggestions.push(
      "Add 1–2 projects that demonstrate skills + impact (with link if possible)."
    );
  }
  if (!resume.education.length) {
    suggestions.push(
      "Add Education (degree/school/year). Even a short entry helps ATS completeness."
    );
  }

  return { suggestions: suggestions.slice(0, 4) };
}
