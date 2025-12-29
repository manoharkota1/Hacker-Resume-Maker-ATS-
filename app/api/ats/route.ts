import { NextRequest, NextResponse } from "next/server";
import { analyzeResumeLocally, ResumeData } from "@/lib/ats/localAnalyzer";

const CORS_ORIGIN = "https://www.hackora.tech";
const CORS_HEADERS = {
  "Access-Control-Allow-Origin": CORS_ORIGIN,
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization",
  "Access-Control-Allow-Credentials": "true",
};

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { resume, jobDescription, mode } = body;

    if (!resume) {
      return NextResponse.json(
        { error: "Resume data is required" },
        { status: 400 }
      );
    }

    // Transform resume data to match ResumeData interface
    const resumeData: ResumeData = {
      personal: {
        name: resume.personal?.name || "",
        email: resume.personal?.email || "",
        phone: resume.personal?.phone || "",
        location: resume.personal?.location || "",
        linkedin: resume.personal?.linkedin || "",
        title: resume.personal?.title || "",
      },
      summary: resume.summary || "",
      skills: resume.skills || [],
      experience: (resume.experience || []).map(
        (exp: {
          id: string;
          title: string;
          company: string;
          location?: string;
          startDate?: string;
          endDate?: string;
          bullets: string[];
        }) => ({
          id: exp.id,
          title: exp.title,
          company: exp.company,
          location: exp.location,
          startDate: exp.startDate,
          endDate: exp.endDate,
          bullets: exp.bullets || [],
        })
      ),
    };

    // Analyze resume
    const result = analyzeResumeLocally(
      resumeData,
      mode === "with-jd" ? jobDescription || "" : ""
    );

    // Transform result to match expected API response format
    const response = {
      score: result.score,
      breakdown: {
        keywordMatch: result.breakdown.keywordMatch,
        formatting: result.breakdown.formatting,
        experience: result.breakdown.experience,
        skills: result.breakdown.skills,
        education: result.breakdown.education,
      },
      keywords: result.keywords,
      suggestions: result.sectionScores
        .filter((s) => s.score < 80)
        .map((s) => ({
          category: s.section,
          priority:
            s.score < 50
              ? "high"
              : s.score < 70
              ? "medium"
              : ("low" as "high" | "medium" | "low"),
          suggestion: s.feedback,
        })),
      sectionScores: result.sectionScores.map((s) => ({
        section: s.section,
        score: s.score,
        feedback: s.feedback,
      })),
    };

    return NextResponse.json(response, { headers: CORS_HEADERS });
  } catch {
    return NextResponse.json(
      { error: "Failed to analyze resume" },
      { status: 500, headers: CORS_HEADERS }
    );
  }
}

export function OPTIONS() {
  return new NextResponse(null, { status: 204, headers: CORS_HEADERS });
}
