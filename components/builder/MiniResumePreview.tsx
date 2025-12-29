"use client";

import { Resume } from "@/types/resume";

// A4 at 96 DPI
const A4_WIDTH = 794;
const A4_HEIGHT = 1123;
const PAGE_MARGIN = 76; // ~20mm

interface MiniResumePreviewProps {
  resume: Resume;
  scale?: number;
}

export function MiniResumePreview({ resume, scale = 0.18 }: MiniResumePreviewProps) {
  const { personal, summary, skills, experience, education } = resume;
  const hasContent = personal.name || summary || skills.length > 0 || experience.length > 0;

  return (
    <div 
      className="relative overflow-hidden bg-white shadow-sm border border-slate-200"
      style={{
        width: A4_WIDTH * scale,
        height: A4_HEIGHT * scale,
      }}
    >
      <div
        style={{
          width: A4_WIDTH,
          height: A4_HEIGHT,
          transform: `scale(${scale})`,
          transformOrigin: "top left",
          padding: PAGE_MARGIN,
        }}
      >
        {!hasContent ? (
          <div className="flex h-full items-center justify-center">
            <div className="text-center text-slate-400">
              <svg className="mx-auto h-12 w-12 mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              <p className="text-sm">Empty Resume</p>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            {/* Header / Personal */}
            {personal.name && (
              <div className="text-center border-b border-slate-200 pb-3">
                <h1 className="text-lg font-bold text-slate-900">{personal.name}</h1>
                {personal.title && (
                  <p className="text-sm text-slate-600">{personal.title}</p>
                )}
                <div className="mt-1 flex flex-wrap justify-center gap-2 text-xs text-slate-500">
                  {personal.email && <span>{personal.email}</span>}
                  {personal.phone && <span>• {personal.phone}</span>}
                  {personal.location && <span>• {personal.location}</span>}
                </div>
              </div>
            )}

            {/* Summary */}
            {summary && (
              <div>
                <h2 className="text-xs font-bold uppercase tracking-wide text-slate-700 mb-1">Summary</h2>
                <p className="text-xs text-slate-600 leading-relaxed line-clamp-3">{summary}</p>
              </div>
            )}

            {/* Skills */}
            {skills.length > 0 && skills.some(s => s.items.length > 0) && (
              <div>
                <h2 className="text-xs font-bold uppercase tracking-wide text-slate-700 mb-1">Skills</h2>
                <div className="space-y-1">
                  {skills.slice(0, 2).map((group, idx) => (
                    group.items.length > 0 && (
                      <div key={idx} className="text-xs text-slate-600">
                        {group.label && <span className="font-medium">{group.label}: </span>}
                        <span className="line-clamp-1">{group.items.join(", ")}</span>
                      </div>
                    )
                  ))}
                </div>
              </div>
            )}

            {/* Experience */}
            {experience.length > 0 && (
              <div>
                <h2 className="text-xs font-bold uppercase tracking-wide text-slate-700 mb-1">Experience</h2>
                <div className="space-y-2">
                  {experience.slice(0, 2).map((exp) => (
                    <div key={exp.id}>
                      <div className="flex justify-between items-start">
                        <div>
                          <p className="text-xs font-semibold text-slate-800">{exp.title || "Position"}</p>
                          <p className="text-xs text-slate-600">{exp.company}</p>
                        </div>
                        <p className="text-xs text-slate-500 whitespace-nowrap">
                          {exp.startDate}{exp.endDate ? ` - ${exp.endDate}` : ""}
                        </p>
                      </div>
                      {exp.bullets.length > 0 && (
                        <ul className="mt-1 text-xs text-slate-600">
                          <li className="line-clamp-1">• {exp.bullets[0]}</li>
                        </ul>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Education */}
            {education && education.length > 0 && (
              <div>
                <h2 className="text-xs font-bold uppercase tracking-wide text-slate-700 mb-1">Education</h2>
                <div className="space-y-1">
                  {education.slice(0, 1).map((edu) => (
                    <div key={edu.id} className="flex justify-between items-start">
                      <div>
                        <p className="text-xs font-semibold text-slate-800">{edu.degree || "Degree"}</p>
                        <p className="text-xs text-slate-600">{edu.school}</p>
                      </div>
                      <p className="text-xs text-slate-500">
                        {edu.startDate}{edu.endDate ? ` - ${edu.endDate}` : ""}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
