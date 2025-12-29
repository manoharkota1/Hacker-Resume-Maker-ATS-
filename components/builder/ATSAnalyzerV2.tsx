"use client";

import { useState, useCallback, ReactNode } from "react";
import { useResumeStore } from "@/lib/state/useResumeStore";
import { useAuth } from "@/lib/appwrite/auth";
import { LoginModal } from "@/components/auth/LoginModal";
import { analyzeResumeLocally } from "@/lib/ats/localAnalyzer";
import clsx from "classnames";

interface ATSImprovement {
  id: string;
  category:
    | "summary"
    | "skills"
    | "experience"
    | "keywords"
    | "formatting"
    | "contact"
    | "bullet";
  priority: "critical" | "high" | "medium" | "low";
  title: string;
  description: string;
  currentValue?: string;
  suggestedValue?: string;
  action: "add" | "replace" | "enhance" | "remove";
  applied: boolean;
  impact: number;
  experienceId?: string;
  bulletIndex?: number;
}

interface ATSResult {
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
  improvements: ATSImprovement[];
  sectionScores: {
    section: string;
    score: number;
    feedback: string;
    maxPotential: number;
  }[];
}

type AnalysisMode = "with-jd" | "without-jd";

// Action verbs for bullet improvements
const STRONG_ACTION_VERBS = [
  "Spearheaded",
  "Orchestrated",
  "Pioneered",
  "Revolutionized",
  "Transformed",
  "Architected",
  "Engineered",
  "Optimized",
  "Accelerated",
  "Delivered",
  "Achieved",
  "Increased",
  "Reduced",
  "Generated",
  "Streamlined",
];

// Bullet point templates for different scenarios
const BULLET_TEMPLATES = {
  technical: [
    "Designed and implemented scalable {technology} solutions serving {number}+ users with 99.9% uptime",
    "Reduced system latency by {percentage}% through optimization of {component} architecture",
    "Built automated {tool} pipeline reducing deployment time from {old_time} to {new_time}",
    "Developed RESTful APIs processing {number}+ requests daily with {percentage}% error reduction",
  ],
  leadership: [
    "Led cross-functional team of {number} engineers delivering ${amount} revenue-generating features",
    "Mentored {number} junior developers, improving team velocity by {percentage}%",
    "Coordinated with {number}+ stakeholders to define technical roadmap and project milestones",
    "Established engineering best practices adopted by {number}+ team members organization-wide",
  ],
  impact: [
    "Drove {percentage}% increase in user engagement through data-driven feature improvements",
    "Generated ${amount} in cost savings by automating manual processes",
    "Improved customer satisfaction scores by {percentage}% through UX enhancements",
    "Reduced bug escape rate by {percentage}% through implementation of comprehensive testing",
  ],
  general: [
    "Collaborated with product and design teams to launch {number}+ features ahead of schedule",
    "Analyzed user data to identify opportunities resulting in {percentage}% conversion improvement",
    "Documented technical specifications and maintained {number}+ pages of system documentation",
    "Participated in on-call rotation, resolving {number}+ production incidents with {percentage}% SLA adherence",
  ],
};

// Common ATS-friendly skills by category
const RECOMMENDED_SKILLS: Record<string, string[]> = {
  technical: [
    "Python",
    "JavaScript",
    "TypeScript",
    "SQL",
    "AWS",
    "Docker",
    "Git",
    "REST APIs",
    "Agile",
    "CI/CD",
  ],
  soft: [
    "Leadership",
    "Communication",
    "Problem-solving",
    "Teamwork",
    "Project Management",
    "Critical Thinking",
  ],
  tools: [
    "Jira",
    "Confluence",
    "Slack",
    "VS Code",
    "Figma",
    "Microsoft Office",
    "GitHub",
  ],
};

export function ATSAnalyzerV2() {
  const { isAuthenticated } = useAuth();
  const [showLoginModal, setShowLoginModal] = useState(false);

  const resume = useResumeStore((s) => s.resume);
  const jobDescription = useResumeStore((s) => s.jobDescription);
  const setJobDescription = useResumeStore((s) => s.setJobDescription);
  const updateSummary = useResumeStore((s) => s.updateSummary);
  const updatePersonal = useResumeStore((s) => s.updatePersonal);
  const updateExperience = useResumeStore((s) => s.updateExperience);
  const addSkillGroup = useResumeStore((s) => s.addSkillGroup);
  const updateSkillGroup = useResumeStore((s) => s.updateSkillGroup);

  const [loading, setLoading] = useState(false);
  const [applying, setApplying] = useState(false);
  const [result, setResult] = useState<ATSResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [analysisMode, setAnalysisMode] = useState<AnalysisMode>("with-jd");
  const [appliedImprovements, setAppliedImprovements] = useState<Set<string>>(
    new Set()
  );
  const [expandedSection, setExpandedSection] = useState<string | null>(null);

  // Section-specific tips for reaching 100%
  const getSectionTips = (section: string, score: number): string[] => {
    const tips: Record<string, string[]> = {
      keywordMatch: [
        "Add more keywords from the job description to your summary",
        "Include exact phrases from job requirements in experience bullets",
        "Add missing technical skills that appear in the job posting",
        "Use industry-standard terminology that ATS systems recognize",
        "Mirror the job title if your experience matches",
      ],
      formatting: [
        "Use 3-5 bullet points per work experience",
        "Keep bullet points concise (1-2 lines each)",
        "Use consistent date formats throughout",
        "Ensure all sections have content",
        "Avoid tables, graphics, or unusual formatting",
      ],
      experience: [
        "Start every bullet with a strong action verb",
        "Add quantifiable metrics (%, $, numbers) to achievements",
        "Include specific technologies and tools used",
        "Show progression and increasing responsibility",
        "Focus on impact and results, not just duties",
      ],
      skills: [
        "List all relevant technical skills from job description",
        "Group skills by category (Technical, Tools, Soft Skills)",
        "Include programming languages, frameworks, and tools",
        "Add certifications and proficiency levels",
        "Match skill keywords exactly as written in job posting",
      ],
      education: [
        "Include graduation date and GPA if above 3.5",
        "Add relevant coursework aligned with job",
        "List academic achievements and honors",
        "Include relevant certifications",
        "Add bootcamps or online courses completed",
      ],
      summary: [
        "Write a 2-3 sentence professional summary",
        "Include your years of experience and specialty",
        "Mention 2-3 key skills from the job description",
        "Highlight your most impressive achievement",
        "State your career objective clearly",
      ],
      contact: [
        "Include professional email address",
        "Add phone number with area code",
        "Include LinkedIn profile URL",
        "Add city and state/country",
        "Include portfolio or GitHub if relevant",
      ],
    };

    // Filter tips based on current score - show more tips for lower scores
    const sectionTips = tips[section] || [];
    if (score >= 90) return sectionTips.slice(0, 1);
    if (score >= 70) return sectionTips.slice(0, 3);
    return sectionTips;
  };

  // Generate improvements based on analysis
  const generateImprovements = useCallback(
    (
      resumeData: typeof resume,
      jd: string,
      keywordAnalysis: { found: string[]; missing: string[] }
    ): ATSImprovement[] => {
      const improvements: ATSImprovement[] = [];
      let idCounter = 0;

      // Contact improvements
      if (!resumeData.personal.linkedin) {
        improvements.push({
          id: `imp-${idCounter++}`,
          category: "contact",
          priority: "high",
          title: "Add LinkedIn Profile",
          description: "LinkedIn profiles are expected by 87% of recruiters",
          suggestedValue: "linkedin.com/in/yourprofile",
          action: "add",
          applied: false,
          impact: 5,
        });
      }

      // Summary improvements
      if (!resumeData.summary || resumeData.summary.length < 100) {
        const suggestedSummary = generateSuggestedSummary(
          resumeData,
          keywordAnalysis.missing
        );
        improvements.push({
          id: `imp-${idCounter++}`,
          category: "summary",
          priority: "critical",
          title: "Enhance Professional Summary",
          description:
            "A strong summary with keywords increases ATS match by 40%",
          currentValue: resumeData.summary || "No summary",
          suggestedValue: suggestedSummary,
          action: "replace",
          applied: false,
          impact: 15,
        });
      } else if (keywordAnalysis.missing.length > 3) {
        const enhancedSummary = enhanceSummaryWithKeywords(
          resumeData.summary,
          keywordAnalysis.missing.slice(0, 3)
        );
        improvements.push({
          id: `imp-${idCounter++}`,
          category: "summary",
          priority: "high",
          title: "Add Missing Keywords to Summary",
          description: `Include: ${keywordAnalysis.missing
            .slice(0, 3)
            .join(", ")}`,
          currentValue: resumeData.summary,
          suggestedValue: enhancedSummary,
          action: "enhance",
          applied: false,
          impact: 10,
        });
      }

      // Skills improvements
      const allSkills = resumeData.skills
        .flatMap((g) => g.items)
        .map((s) => s.toLowerCase());
      const missingSkillKeywords = keywordAnalysis.missing
        .filter((kw) => !allSkills.some((s) => s.includes(kw.toLowerCase())))
        .slice(0, 5);

      if (missingSkillKeywords.length > 0) {
        improvements.push({
          id: `imp-${idCounter++}`,
          category: "skills",
          priority: "critical",
          title: "Add Missing Skill Keywords",
          description: "These skills from the job description are missing",
          suggestedValue: missingSkillKeywords.join(", "),
          action: "add",
          applied: false,
          impact: 12,
        });
      }

      if (resumeData.skills.length < 3) {
        improvements.push({
          id: `imp-${idCounter++}`,
          category: "skills",
          priority: "medium",
          title: "Organize Skills into Categories",
          description: "Categorized skills are easier for ATS to parse",
          suggestedValue: "Technical Skills, Soft Skills, Tools & Technologies",
          action: "add",
          applied: false,
          impact: 8,
        });
      }

      // Experience improvements
      resumeData.experience.forEach((exp) => {
        // Check for weak bullets
        exp.bullets.forEach((bullet, bulletIndex) => {
          if (!hasActionVerb(bullet)) {
            improvements.push({
              id: `imp-${idCounter++}`,
              category: "experience",
              priority: "high",
              title: `Strengthen Bullet ${bulletIndex + 1} in "${exp.title}"`,
              description:
                "Start with a strong action verb for better ATS parsing",
              currentValue: bullet,
              suggestedValue: addActionVerb(bullet),
              action: "replace",
              applied: false,
              impact: 3,
            });
          }

          if (!hasMetrics(bullet)) {
            improvements.push({
              id: `imp-${idCounter++}`,
              category: "experience",
              priority: "high",
              title: `Add Metrics to Bullet in "${exp.title}"`,
              description: "Quantified achievements rank 2x higher in ATS",
              currentValue: bullet,
              suggestedValue: suggestMetrics(bullet),
              action: "enhance",
              applied: false,
              impact: 4,
            });
          }
        });

        // Check for missing keywords in experience
        const expText = [exp.title, exp.company, ...exp.bullets]
          .join(" ")
          .toLowerCase();
        const missingInExp = keywordAnalysis.missing
          .filter((kw) => !expText.includes(kw.toLowerCase()))
          .slice(0, 2);

        if (missingInExp.length > 0 && exp.bullets.length > 0) {
          const enhancedBullet = enhanceBulletWithKeyword(
            exp.bullets[0],
            missingInExp[0]
          );
          improvements.push({
            id: `imp-${idCounter++}`,
            category: "keywords",
            priority: "high",
            title: `Add Keywords to "${exp.title}" Experience`,
            description: `Incorporate: ${missingInExp.join(", ")}`,
            currentValue: exp.bullets[0],
            suggestedValue: enhancedBullet,
            action: "enhance",
            applied: false,
            impact: 6,
          });
        }
      });

      // Formatting improvements - Add more bullet points with specific suggestions
      resumeData.experience.forEach((exp) => {
        if (exp.bullets.length < 3) {
          const bulletsNeeded = 3 - exp.bullets.length;
          const suggestedBullets = generateSuggestedBullets(
            exp,
            bulletsNeeded,
            keywordAnalysis.missing
          );

          improvements.push({
            id: `imp-${idCounter++}`,
            category: "bullet",
            priority: "high",
            title: `Add ${bulletsNeeded} More Bullet${
              bulletsNeeded > 1 ? "s" : ""
            } to "${exp.title}"`,
            description:
              "3-5 bullets per role is optimal. Here are suggested bullets based on your role:",
            suggestedValue: suggestedBullets.join("\n"),
            action: "add",
            applied: false,
            impact: 5 * bulletsNeeded,
            experienceId: exp.id,
          });
        }
      });

      // Add section completeness improvements
      if (!resumeData.personal.title || resumeData.personal.title.length < 5) {
        improvements.push({
          id: `imp-${idCounter++}`,
          category: "contact",
          priority: "high",
          title: "Add Professional Title",
          description:
            "A clear job title helps ATS categorize your resume correctly",
          suggestedValue: suggestJobTitle(resumeData),
          action: "add",
          applied: false,
          impact: 8,
        });
      }

      // Add skills category improvements
      const skillCategories = resumeData.skills.map((s) =>
        s.label.toLowerCase()
      );
      if (
        !skillCategories.some(
          (c) => c.includes("technical") || c.includes("programming")
        )
      ) {
        const techSkills = keywordAnalysis.missing.filter((kw) =>
          RECOMMENDED_SKILLS.technical.some(
            (s) => s.toLowerCase() === kw.toLowerCase()
          )
        );
        if (techSkills.length > 0 || keywordAnalysis.missing.length > 0) {
          improvements.push({
            id: `imp-${idCounter++}`,
            category: "skills",
            priority: "medium",
            title: "Add Technical Skills Section",
            description:
              "Dedicated technical skills section improves ATS parsing",
            suggestedValue:
              techSkills.length > 0
                ? techSkills.join(", ")
                : "Add relevant technical skills",
            action: "add",
            applied: false,
            impact: 6,
          });
        }
      }

      // Add quantification improvements for all bullets
      let unquantifiedCount = 0;
      resumeData.experience.forEach((exp) => {
        exp.bullets.forEach((bullet) => {
          if (!hasMetrics(bullet)) unquantifiedCount++;
        });
      });

      if (unquantifiedCount > 3) {
        improvements.push({
          id: `imp-${idCounter++}`,
          category: "formatting",
          priority: "high",
          title: "Quantify More Achievements",
          description: `${unquantifiedCount} bullets lack metrics. Numbers increase ATS score by 15-20%`,
          suggestedValue:
            "Add specific numbers: percentages, dollar amounts, team sizes, timeframes",
          action: "enhance",
          applied: false,
          impact: 10,
        });
      }

      // Sort by impact and priority
      const priorityOrder = { critical: 0, high: 1, medium: 2, low: 3 };
      improvements.sort((a, b) => {
        if (priorityOrder[a.priority] !== priorityOrder[b.priority]) {
          return priorityOrder[a.priority] - priorityOrder[b.priority];
        }
        return b.impact - a.impact;
      });

      return improvements;
    },
    []
  );

  const analyzeResume = async () => {
    if (analysisMode === "with-jd" && !jobDescription.trim()) {
      setError("Please enter a job description first");
      return;
    }

    setLoading(true);
    setError(null);
    setAppliedImprovements(new Set());

    try {
      const resumeData = {
        personal: resume.personal,
        summary: resume.summary,
        skills: resume.skills,
        experience: resume.experience,
      };
      const jd = analysisMode === "with-jd" ? jobDescription : "";

      // Use NLP-based local analysis (no API required)
      const data = analyzeResumeLocally(resumeData, jd) as ATSResult;

      // Generate actionable improvements
      const improvements = generateImprovements(resume, jobDescription, {
        found: data.keywords.found,
        missing: data.keywords.missing,
      });

      // Enhance result with improvements
      const enhancedResult: ATSResult = {
        ...data,
        breakdown: {
          ...data.breakdown,
          education: data.breakdown.education || 75,
        },
        improvements,
        sectionScores:
          data.sectionScores?.map(
            (s: { section: string; score: number; feedback: string }) => ({
              ...s,
              maxPotential: 100,
            })
          ) || [],
      };

      setResult(enhancedResult);
    } catch {
      setError("Failed to analyze resume. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  // Apply a single improvement
  const applyImprovement = async (improvement: ATSImprovement) => {
    setApplying(true);

    try {
      switch (improvement.category) {
        case "summary":
          if (improvement.suggestedValue) {
            updateSummary(improvement.suggestedValue);
          }
          break;

        case "contact":
          if (
            improvement.title.includes("LinkedIn") &&
            improvement.suggestedValue
          ) {
            updatePersonal("linkedin", improvement.suggestedValue);
          }
          if (
            improvement.title.includes("Title") &&
            improvement.suggestedValue
          ) {
            updatePersonal("title", improvement.suggestedValue);
          }
          break;

        case "skills":
          if (improvement.action === "add" && improvement.suggestedValue) {
            const newSkills = improvement.suggestedValue.split(", ");
            // Add to first skill group or create new one
            if (resume.skills.length > 0) {
              updateSkillGroup(0, (group) => ({
                ...group,
                items: [...new Set([...group.items, ...newSkills])],
              }));
            } else {
              addSkillGroup("Key Skills");
              // Small delay to ensure group is created
              setTimeout(() => {
                updateSkillGroup(0, (group) => ({
                  ...group,
                  items: newSkills,
                }));
              }, 100);
            }
          }
          break;

        case "bullet":
          // Add new bullets to an experience
          if (improvement.experienceId && improvement.suggestedValue) {
            const newBullets = improvement.suggestedValue
              .split("\n")
              .filter((b) => b.trim());
            updateExperience(improvement.experienceId, (e) => ({
              ...e,
              bullets: [...e.bullets, ...newBullets],
            }));
          }
          break;

        case "experience":
        case "keywords":
          // Find and update the specific experience bullet
          if (improvement.currentValue && improvement.suggestedValue) {
            resume.experience.forEach((exp) => {
              const bulletIndex = exp.bullets.findIndex(
                (b) => b === improvement.currentValue
              );
              if (bulletIndex !== -1) {
                updateExperience(exp.id, (e) => ({
                  ...e,
                  bullets: e.bullets.map((b, i) =>
                    i === bulletIndex ? improvement.suggestedValue! : b
                  ),
                }));
              }
            });
          }
          break;
      }

      // Mark as applied
      setAppliedImprovements((prev) => new Set([...prev, improvement.id]));

      // Update the result to reflect applied status and recalculate score
      if (result) {
        const newScore = Math.min(100, result.score + improvement.impact);
        const updatedImprovements = result.improvements.map((imp) =>
          imp.id === improvement.id ? { ...imp, applied: true } : imp
        );

        // Update breakdown scores based on category
        const updatedBreakdown = { ...result.breakdown };
        const impactBoost = Math.min(15, improvement.impact * 2);

        switch (improvement.category) {
          case "summary":
            updatedBreakdown.summary = Math.min(
              100,
              updatedBreakdown.summary + impactBoost
            );
            break;
          case "skills":
            updatedBreakdown.skills = Math.min(
              100,
              updatedBreakdown.skills + impactBoost
            );
            break;
          case "experience":
          case "bullet":
            updatedBreakdown.experience = Math.min(
              100,
              updatedBreakdown.experience + impactBoost
            );
            break;
          case "keywords":
            updatedBreakdown.keywordMatch = Math.min(
              100,
              updatedBreakdown.keywordMatch + impactBoost
            );
            break;
          case "contact":
            updatedBreakdown.contact = Math.min(
              100,
              updatedBreakdown.contact + impactBoost
            );
            break;
          case "formatting":
            updatedBreakdown.formatting = Math.min(
              100,
              updatedBreakdown.formatting + impactBoost
            );
            break;
        }

        setResult({
          ...result,
          score: newScore,
          breakdown: updatedBreakdown,
          improvements: updatedImprovements,
        });
      }
    } catch (err) {
      console.error("Failed to apply improvement:", err);
    } finally {
      setApplying(false);
    }
  };

  // Apply all improvements
  const applyAllImprovements = async () => {
    if (!result) return;

    setApplying(true);

    for (const improvement of result.improvements) {
      if (
        !appliedImprovements.has(improvement.id) &&
        improvement.suggestedValue
      ) {
        await applyImprovement(improvement);
        // Small delay between applications
        await new Promise((resolve) => setTimeout(resolve, 200));
      }
    }

    setApplying(false);
  };

  const getScoreColor = (score: number) => {
    if (score >= 90) return "text-emerald-600";
    if (score >= 70) return "text-amber-600";
    return "text-red-600";
  };

  const getScoreBg = (score: number) => {
    if (score >= 90) return "bg-emerald-500";
    if (score >= 70) return "bg-amber-500";
    return "bg-red-500";
  };

  const getPriorityStyles = (priority: string) => {
    switch (priority) {
      case "critical":
        return "border-red-300 bg-red-50";
      case "high":
        return "border-amber-300 bg-amber-50";
      case "medium":
        return "border-blue-200 bg-blue-50";
      default:
        return "border-slate-200 bg-slate-50";
    }
  };

  const getPriorityBadge = (priority: string) => {
    switch (priority) {
      case "critical":
        return "bg-red-600 text-white";
      case "high":
        return "bg-amber-500 text-white";
      case "medium":
        return "bg-blue-500 text-white";
      default:
        return "bg-slate-400 text-white";
    }
  };

  // Calculate potential score after all improvements
  const calculatePotentialScore = () => {
    if (!result) return 0;
    const unappliedImpact = result.improvements
      .filter((imp) => !appliedImprovements.has(imp.id))
      .reduce((acc, imp) => acc + imp.impact, 0);
    return Math.min(100, result.score + unappliedImpact);
  };

  // Login prompt for unauthenticated users
  if (!isAuthenticated) {
    return (
      <>
        <div className="space-y-4">
          <div className="rounded-lg border border-slate-200 bg-white p-6 text-center">
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-linear-to-br from-emerald-500 to-teal-600">
              <svg
                className="h-8 w-8 text-white"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth={2}
              >
                <path d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
            </div>
            <h3 className="text-lg font-semibold text-slate-900">
              Smart ATS Optimizer
            </h3>
            <p className="mt-2 text-sm text-slate-600">
              Get detailed analysis with one-click fixes to boost your resume
              score to 90-100%.
            </p>
            <div className="mt-4 space-y-2">
              <div className="flex items-center justify-center gap-2 text-xs text-slate-500">
                <svg
                  className="h-4 w-4 text-emerald-500"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth={2}
                >
                  <path d="M5 13l4 4L19 7" />
                </svg>
                Auto-apply improvements
              </div>
              <div className="flex items-center justify-center gap-2 text-xs text-slate-500">
                <svg
                  className="h-4 w-4 text-emerald-500"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth={2}
                >
                  <path d="M5 13l4 4L19 7" />
                </svg>
                Keyword optimization
              </div>
              <div className="flex items-center justify-center gap-2 text-xs text-slate-500">
                <svg
                  className="h-4 w-4 text-emerald-500"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth={2}
                >
                  <path d="M5 13l4 4L19 7" />
                </svg>
                Score boost predictor
              </div>
            </div>
            <button
              onClick={() => setShowLoginModal(true)}
              className="mt-6 w-full rounded-lg bg-slate-900 py-3 text-sm font-semibold text-white transition hover:bg-slate-800"
            >
              Login to Optimize Resume
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
      {/* Analysis Controls */}
      <div className="rounded-lg border border-slate-200 bg-white p-4">
        <h3 className="mb-3 flex items-center gap-2 text-sm font-semibold text-slate-900">
          <svg
            className="h-5 w-5 text-emerald-600"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth={2}
          >
            <path d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
          </svg>
          Smart ATS Optimizer
        </h3>

        {/* Mode Toggle */}
        <div className="mb-4 flex rounded-lg bg-slate-100 p-1">
          <button
            onClick={() => setAnalysisMode("with-jd")}
            className={clsx(
              "flex-1 flex items-center justify-center gap-1.5 rounded-md py-2 text-xs font-medium transition",
              analysisMode === "with-jd"
                ? "bg-white text-slate-900 shadow-sm"
                : "text-slate-600 hover:text-slate-900"
            )}
          >
            <svg
              className="h-3.5 w-3.5"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth={2}
            >
              <path d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2" />
              <rect x="9" y="3" width="6" height="4" rx="1" />
            </svg>
            With Job Description
          </button>
          <button
            onClick={() => setAnalysisMode("without-jd")}
            className={clsx(
              "flex-1 flex items-center justify-center gap-1.5 rounded-md py-2 text-xs font-medium transition",
              analysisMode === "without-jd"
                ? "bg-white text-slate-900 shadow-sm"
                : "text-slate-600 hover:text-slate-900"
            )}
          >
            <svg
              className="h-3.5 w-3.5"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth={2}
            >
              <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z" />
              <path d="M14 2v6h6" />
              <path d="M16 13H8" />
              <path d="M16 17H8" />
            </svg>
            General Analysis
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
                placeholder="Paste the job description to get personalized optimization suggestions..."
                rows={4}
                className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm text-black placeholder:text-slate-400 focus:border-emerald-400 focus:outline-none focus:ring-1 focus:ring-emerald-400"
              />
            </div>
          )}

          {analysisMode === "without-jd" && (
            <div className="rounded-lg bg-slate-50 p-3">
              <p className="text-xs text-slate-600">
                <strong>General Mode:</strong> Analyze for common ATS patterns
                and best practices without a specific job.
              </p>
            </div>
          )}

          <button
            onClick={analyzeResume}
            disabled={
              loading || (analysisMode === "with-jd" && !jobDescription.trim())
            }
            className="w-full rounded-lg bg-linear-to-r from-emerald-600 to-teal-600 px-4 py-2.5 text-sm font-medium text-white transition hover:from-emerald-700 hover:to-teal-700 disabled:opacity-50"
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
            ) : (
              <span className="flex items-center justify-center gap-2">
                <svg
                  className="h-4 w-4"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth={2}
                >
                  <path d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
                Analyze &amp; Get Improvements
              </span>
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
          {/* Score Overview with Potential */}
          <div className="rounded-lg border border-slate-200 bg-white p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-medium text-slate-500 uppercase tracking-wide">
                  Current Score
                </p>
                <p
                  className={clsx(
                    "text-4xl font-bold",
                    getScoreColor(result.score)
                  )}
                >
                  {result.score}%
                </p>
                {calculatePotentialScore() > result.score && (
                  <p className="mt-1 text-xs text-emerald-600 font-medium">
                    → Potential: {calculatePotentialScore()}% after fixes
                  </p>
                )}
              </div>
              <div className="relative h-24 w-24">
                <svg viewBox="0 0 36 36" className="h-full w-full -rotate-90">
                  <circle
                    cx="18"
                    cy="18"
                    r="15.9"
                    fill="none"
                    stroke="#e2e8f0"
                    strokeWidth="2.5"
                  />
                  <circle
                    cx="18"
                    cy="18"
                    r="15.9"
                    fill="none"
                    stroke={
                      result.score >= 90
                        ? "#10b981"
                        : result.score >= 70
                        ? "#f59e0b"
                        : "#ef4444"
                    }
                    strokeWidth="2.5"
                    strokeDasharray={`${result.score} 100`}
                    strokeLinecap="round"
                  />
                  {/* Potential score arc */}
                  {calculatePotentialScore() > result.score && (
                    <circle
                      cx="18"
                      cy="18"
                      r="15.9"
                      fill="none"
                      stroke="#10b981"
                      strokeWidth="2.5"
                      strokeDasharray={`${
                        calculatePotentialScore() - result.score
                      } 100`}
                      strokeDashoffset={`-${result.score}`}
                      strokeLinecap="round"
                      opacity="0.3"
                    />
                  )}
                </svg>
                <div className="absolute inset-0 flex items-center justify-center">
                  <span className="text-xs font-medium text-slate-400">
                    of 100
                  </span>
                </div>
              </div>
            </div>

            {/* Quick Stats */}
            <div className="mt-4 grid grid-cols-3 gap-2 border-t border-slate-100 pt-4">
              <div className="text-center">
                <p className="text-lg font-bold text-slate-900">
                  {
                    result.improvements.filter(
                      (i) => !appliedImprovements.has(i.id)
                    ).length
                  }
                </p>
                <p className="text-xs text-slate-500">Fixes Available</p>
              </div>
              <div className="text-center">
                <p className="text-lg font-bold text-emerald-600">
                  {result.keywords.found.length}
                </p>
                <p className="text-xs text-slate-500">Keywords Found</p>
              </div>
              <div className="text-center">
                <p className="text-lg font-bold text-red-600">
                  {result.keywords.missing.length}
                </p>
                <p className="text-xs text-slate-500">Keywords Missing</p>
              </div>
            </div>
          </div>

          {/* Apply All Button */}
          {result.improvements.filter(
            (i) => !appliedImprovements.has(i.id) && i.suggestedValue
          ).length > 0 && (
            <button
              onClick={applyAllImprovements}
              disabled={applying}
              className="w-full rounded-lg bg-emerald-600 px-4 py-3 text-sm font-semibold text-white transition hover:bg-emerald-700 disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {applying ? (
                <>
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
                  Applying...
                </>
              ) : (
                <>
                  <svg
                    className="h-4 w-4"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth={2}
                  >
                    <path d="M5 13l4 4L19 7" />
                  </svg>
                  Apply All Improvements (+
                  {result.improvements
                    .filter((i) => !appliedImprovements.has(i.id))
                    .reduce((a, i) => a + i.impact, 0)}{" "}
                  pts)
                </>
              )}
            </button>
          )}

          {/* Improvements List */}
          <div className="rounded-lg border border-slate-200 bg-white p-4">
            <h4 className="mb-3 flex items-center justify-between text-sm font-semibold text-slate-900">
              <span className="flex items-center gap-2">
                <svg
                  className="h-4 w-4 text-emerald-600"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth={2}
                >
                  <circle cx="12" cy="12" r="10" />
                  <path d="M12 8v4l2 2" />
                </svg>
                Improvements to Reach 90%+
              </span>
              <span className="text-xs font-normal text-slate-500">
                {appliedImprovements.size}/{result.improvements.length} applied
              </span>
            </h4>

            <div className="space-y-3 max-h-100 overflow-y-auto pr-1">
              {result.improvements.map((imp) => (
                <div
                  key={imp.id}
                  className={clsx(
                    "rounded-lg border p-3 transition",
                    appliedImprovements.has(imp.id)
                      ? "border-emerald-200 bg-emerald-50 opacity-60"
                      : getPriorityStyles(imp.priority)
                  )}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <span
                          className={clsx(
                            "px-1.5 py-0.5 text-[10px] font-bold uppercase rounded",
                            getPriorityBadge(imp.priority)
                          )}
                        >
                          {imp.priority}
                        </span>
                        <span className="text-[10px] text-slate-500 bg-slate-200 px-1.5 py-0.5 rounded">
                          +{imp.impact} pts
                        </span>
                        {appliedImprovements.has(imp.id) && (
                          <span className="text-[10px] text-emerald-600 font-medium">
                            ✓ Applied
                          </span>
                        )}
                      </div>
                      <p className="text-sm font-medium text-slate-800">
                        {imp.title}
                      </p>
                      <p className="text-xs text-slate-600 mt-0.5">
                        {imp.description}
                      </p>

                      {imp.currentValue && imp.suggestedValue && (
                        <div className="mt-2 space-y-1">
                          <div className="rounded bg-red-100/50 p-2">
                            <p className="text-[10px] font-medium text-red-700 uppercase">
                              Current
                            </p>
                            <p className="text-xs text-red-800 line-clamp-2">
                              {imp.currentValue}
                            </p>
                          </div>
                          <div className="rounded bg-emerald-100/50 p-2">
                            <p className="text-[10px] font-medium text-emerald-700 uppercase">
                              Suggested
                            </p>
                            <p className="text-xs text-emerald-800 line-clamp-2">
                              {imp.suggestedValue}
                            </p>
                          </div>
                        </div>
                      )}

                      {!imp.currentValue && imp.suggestedValue && (
                        <div className="mt-2 rounded bg-emerald-100/50 p-2">
                          <p className="text-[10px] font-medium text-emerald-700 uppercase">
                            Suggested
                          </p>
                          <p className="text-xs text-emerald-800">
                            {imp.suggestedValue}
                          </p>
                        </div>
                      )}
                    </div>

                    {imp.suggestedValue && !appliedImprovements.has(imp.id) && (
                      <button
                        onClick={() => applyImprovement(imp)}
                        disabled={applying}
                        className="shrink-0 rounded-lg bg-slate-900 px-3 py-1.5 text-xs font-medium text-white transition hover:bg-slate-800 disabled:opacity-50"
                      >
                        Apply
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Keywords Section */}
          <div className="rounded-lg border border-slate-200 bg-white p-4">
            <h4 className="mb-3 flex items-center gap-2 text-sm font-semibold text-slate-900">
              <svg
                className="h-4 w-4 text-slate-600"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth={2}
              >
                <path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z" />
              </svg>
              Keyword Analysis
            </h4>

            {result.keywords.found.length > 0 && (
              <div className="mb-3">
                <p className="mb-2 flex items-center gap-1 text-xs font-medium text-emerald-600">
                  <svg
                    className="h-3 w-3"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path
                      fillRule="evenodd"
                      d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                      clipRule="evenodd"
                    />
                  </svg>
                  Found ({result.keywords.found.length})
                </p>
                <div className="flex flex-wrap gap-1">
                  {result.keywords.found.slice(0, 12).map((kw) => (
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
                <p className="mb-2 flex items-center gap-1 text-xs font-medium text-red-600">
                  <svg
                    className="h-3 w-3"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path
                      fillRule="evenodd"
                      d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                      clipRule="evenodd"
                    />
                  </svg>
                  Missing ({result.keywords.missing.length})
                </p>
                <div className="flex flex-wrap gap-1">
                  {result.keywords.missing.slice(0, 10).map((kw) => (
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
                <p className="mb-2 flex items-center gap-1 text-xs font-medium text-amber-600">
                  <svg
                    className="h-3 w-3"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path
                      fillRule="evenodd"
                      d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
                      clipRule="evenodd"
                    />
                  </svg>
                  Recommended
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

          {/* Score Breakdown with Tips */}
          <div className="rounded-lg border border-slate-200 bg-white p-4">
            <h4 className="mb-3 flex items-center gap-2 text-sm font-semibold text-slate-900">
              <svg
                className="h-4 w-4 text-slate-600"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth={2}
              >
                <path d="M18 20V10" />
                <path d="M12 20V4" />
                <path d="M6 20v-6" />
              </svg>
              Score Breakdown
              <span className="ml-auto text-[10px] font-normal text-slate-400">
                Click for tips
              </span>
            </h4>
            <div className="space-y-2">
              {Object.entries(result.breakdown).map(([key, value]) => {
                const isExpanded = expandedSection === key;
                const tips = getSectionTips(key, value);
                const sectionIcon = getSectionIcon(key);

                return (
                  <div
                    key={key}
                    className="rounded-lg border border-slate-100 overflow-hidden"
                  >
                    <button
                      onClick={() =>
                        setExpandedSection(isExpanded ? null : key)
                      }
                      className="w-full p-2 hover:bg-slate-50 transition"
                    >
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-slate-500">{sectionIcon}</span>
                        <span className="capitalize text-xs font-medium text-slate-700 flex-1 text-left">
                          {key.replace(/([A-Z])/g, " $1").trim()}
                        </span>
                        <span
                          className={clsx(
                            "text-xs font-bold",
                            getScoreColor(value)
                          )}
                        >
                          {value}%
                        </span>
                        <svg
                          className={clsx(
                            "h-3 w-3 text-slate-400 transition-transform",
                            isExpanded && "rotate-180"
                          )}
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth={2}
                        >
                          <path d="M19 9l-7 7-7-7" />
                        </svg>
                      </div>
                      <div className="h-1.5 overflow-hidden rounded-full bg-slate-100">
                        <div
                          className={clsx(
                            "h-full rounded-full transition-all duration-500",
                            getScoreBg(value)
                          )}
                          style={{ width: `${value}%` }}
                        />
                      </div>
                    </button>

                    {isExpanded && tips.length > 0 && (
                      <div className="px-3 pb-3 pt-1 bg-slate-50 border-t border-slate-100">
                        <p className="text-[10px] font-semibold text-slate-500 uppercase mb-2">
                          How to reach 100%
                        </p>
                        <ul className="space-y-1.5">
                          {tips.map((tip, i) => (
                            <li
                              key={i}
                              className="flex items-start gap-2 text-xs text-slate-600"
                            >
                              <svg
                                className="h-3 w-3 mt-0.5 text-emerald-500 shrink-0"
                                viewBox="0 0 24 24"
                                fill="none"
                                stroke="currentColor"
                                strokeWidth={2}
                              >
                                <path d="M9 12l2 2 4-4" />
                                <circle cx="12" cy="12" r="10" />
                              </svg>
                              {tip}
                            </li>
                          ))}
                        </ul>
                        {value < 100 && (
                          <div className="mt-2 pt-2 border-t border-slate-200">
                            <p className="text-[10px] text-emerald-600 font-medium">
                              +{100 - value} points available in this section
                            </p>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// Section icon helper
function getSectionIcon(section: string): ReactNode {
  const icons: Record<string, ReactNode> = {
    keywordMatch: (
      <svg
        className="h-3.5 w-3.5"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth={2}
      >
        <circle cx="11" cy="11" r="8" />
        <path d="M21 21l-4.35-4.35" />
      </svg>
    ),
    formatting: (
      <svg
        className="h-3.5 w-3.5"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth={2}
      >
        <path d="M4 7h16M4 12h16M4 17h10" />
      </svg>
    ),
    experience: (
      <svg
        className="h-3.5 w-3.5"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth={2}
      >
        <rect x="2" y="7" width="20" height="14" rx="2" />
        <path d="M16 7V5a2 2 0 00-2-2h-4a2 2 0 00-2 2v2" />
      </svg>
    ),
    skills: (
      <svg
        className="h-3.5 w-3.5"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth={2}
      >
        <path d="M12 2l9 5v10l-9 5-9-5V7l9-5z" />
      </svg>
    ),
    education: (
      <svg
        className="h-3.5 w-3.5"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth={2}
      >
        <path d="M12 3L2 9l10 6 10-6-10-6z" />
        <path d="M2 9v8" />
        <path d="M6 11.5v5c0 1.5 2.5 3 6 3s6-1.5 6-3v-5" />
      </svg>
    ),
    summary: (
      <svg
        className="h-3.5 w-3.5"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth={2}
      >
        <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z" />
        <path d="M14 2v6h6" />
        <path d="M16 13H8M16 17H8M10 9H8" />
      </svg>
    ),
    contact: (
      <svg
        className="h-3.5 w-3.5"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth={2}
      >
        <path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2" />
        <circle cx="12" cy="7" r="4" />
      </svg>
    ),
  };
  return icons[section] || icons.skills;
}

// Helper type for resume data
interface ResumeData {
  personal: {
    title: string;
    name: string;
    email: string;
    phone: string;
    location: string;
    linkedin: string;
  };
  summary: string;
  skills: { label: string; items: string[] }[];
  experience: {
    id: string;
    title: string;
    company: string;
    bullets: string[];
  }[];
}

// Helper functions
function generateSuggestedSummary(
  resume: ResumeData,
  missingKeywords: string[]
): string {
  const title = resume.personal.title || "Professional";
  const yearsExp =
    resume.experience.length > 0 ? `${resume.experience.length}+` : "multiple";
  const topKeywords =
    missingKeywords.slice(0, 3).join(", ") || "relevant technologies";

  return `Results-driven ${title} with ${yearsExp} years of experience delivering high-impact solutions. Expertise in ${topKeywords}, with proven ability to drive efficiency, reduce costs, and exceed targets. Passionate about leveraging technology to solve complex business challenges.`;
}

function enhanceSummaryWithKeywords(
  summary: string,
  keywords: string[]
): string {
  const keywordPhrase = keywords.join(", ");
  if (summary.endsWith(".")) {
    return `${summary} Skilled in ${keywordPhrase} with a track record of delivering results.`;
  }
  return `${summary}. Skilled in ${keywordPhrase} with a track record of delivering results.`;
}

function hasActionVerb(bullet: string): boolean {
  const verbs = [
    "led",
    "managed",
    "developed",
    "created",
    "implemented",
    "designed",
    "achieved",
    "improved",
    "increased",
    "reduced",
    "built",
    "launched",
    "executed",
    "delivered",
    "coordinated",
    "spearheaded",
    "orchestrated",
    "pioneered",
    "optimized",
    "accelerated",
    "transformed",
    "established",
    "analyzed",
    "streamlined",
    "engineered",
  ];
  const firstWord = bullet.trim().split(" ")[0].toLowerCase();
  return verbs.some((v) => firstWord.includes(v));
}

function hasMetrics(bullet: string): boolean {
  return /\d+%|\$[\d,]+|\d+\+|\d+x|\d+ (users|customers|clients|team|projects|features|products)/.test(
    bullet
  );
}

function addActionVerb(bullet: string): string {
  const verb =
    STRONG_ACTION_VERBS[Math.floor(Math.random() * STRONG_ACTION_VERBS.length)];
  const trimmed = bullet.trim();
  // Remove common weak starts
  const cleaned = trimmed.replace(
    /^(responsible for|worked on|helped with|assisted in|involved in)\s*/i,
    ""
  );
  return `${verb} ${cleaned.charAt(0).toLowerCase()}${cleaned.slice(1)}`;
}

function suggestMetrics(bullet: string): string {
  const trimmed = bullet.trim();
  if (trimmed.includes("team")) {
    return trimmed.replace(/team/i, "cross-functional team of 8+");
  }
  if (trimmed.includes("project")) {
    return trimmed.replace(/project/i, "$2M+ project");
  }
  if (
    trimmed.includes("improv") ||
    trimmed.includes("increas") ||
    trimmed.includes("reduc")
  ) {
    return `${trimmed} by 35%`;
  }
  return `${trimmed}, resulting in 25% improvement in efficiency`;
}

function enhanceBulletWithKeyword(bullet: string, keyword: string): string {
  return `${bullet.trim().replace(/\.?$/, "")} using ${keyword} methodologies.`;
}

function generateSuggestedBullets(
  exp: { title: string; company: string; bullets: string[] },
  count: number,
  missingKeywords: string[]
): string[] {
  const bullets: string[] = [];
  const title = exp.title.toLowerCase();

  // Determine category based on title
  let category: keyof typeof BULLET_TEMPLATES = "general";
  if (
    title.includes("engineer") ||
    title.includes("developer") ||
    title.includes("architect")
  ) {
    category = "technical";
  } else if (
    title.includes("lead") ||
    title.includes("manager") ||
    title.includes("director")
  ) {
    category = "leadership";
  } else if (
    title.includes("analyst") ||
    title.includes("product") ||
    title.includes("marketing")
  ) {
    category = "impact";
  }

  const templates = BULLET_TEMPLATES[category];
  const usedIndices = new Set<number>();

  for (let i = 0; i < count; i++) {
    let idx = Math.floor(Math.random() * templates.length);
    while (usedIndices.has(idx) && usedIndices.size < templates.length) {
      idx = (idx + 1) % templates.length;
    }
    usedIndices.add(idx);

    let bullet = templates[idx];
    // Replace placeholders with realistic values
    bullet = bullet.replace("{technology}", missingKeywords[0] || "cloud");
    bullet = bullet.replace(
      "{number}",
      String(Math.floor(Math.random() * 10 + 5))
    );
    bullet = bullet.replace(
      "{percentage}",
      String(Math.floor(Math.random() * 30 + 20))
    );
    bullet = bullet.replace(
      "{amount}",
      `${Math.floor(Math.random() * 500 + 100)}K`
    );
    bullet = bullet.replace("{component}", "backend");
    bullet = bullet.replace("{tool}", "CI/CD");
    bullet = bullet.replace("{old_time}", "2 hours");
    bullet = bullet.replace("{new_time}", "15 minutes");

    bullets.push(bullet);
  }

  return bullets;
}

function suggestJobTitle(resume: ResumeData): string {
  // Try to infer from experience
  if (resume.experience.length > 0) {
    const latestTitle = resume.experience[0].title;
    if (latestTitle && latestTitle.length > 3) {
      return latestTitle;
    }
  }

  // Try to infer from skills
  const allSkills = resume.skills
    .flatMap((s) => s.items)
    .join(" ")
    .toLowerCase();
  if (
    allSkills.includes("python") ||
    allSkills.includes("java") ||
    allSkills.includes("javascript")
  ) {
    return "Software Engineer";
  }
  if (
    allSkills.includes("react") ||
    allSkills.includes("figma") ||
    allSkills.includes("ui")
  ) {
    return "Frontend Developer";
  }
  if (
    allSkills.includes("aws") ||
    allSkills.includes("docker") ||
    allSkills.includes("kubernetes")
  ) {
    return "DevOps Engineer";
  }
  if (
    allSkills.includes("sql") ||
    allSkills.includes("analytics") ||
    allSkills.includes("data")
  ) {
    return "Data Analyst";
  }

  return "Professional";
}
