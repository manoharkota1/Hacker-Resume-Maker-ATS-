"use client";

import { Field, TextInput, TextArea } from "./Field";
import { useResumeStore } from "@/lib/state/useResumeStore";

export function ExperienceSection() {
  const experience = useResumeStore((s) => s.resume.experience);
  const addExperience = useResumeStore((s) => s.addExperience);
  const updateExperience = useResumeStore((s) => s.updateExperience);
  const removeExperience = useResumeStore((s) => s.removeExperience);

  return (
    <div className="space-y-3">
      {experience.map((exp) => (
        <div key={exp.id} className="rounded-lg bg-slate-50 p-3">
          <div className="mb-3 flex items-center justify-between">
            <p className="text-sm font-medium text-slate-800">
              {exp.title || "New Role"}
            </p>
            <button
              onClick={() => removeExperience(exp.id)}
              className="text-xs text-slate-400 hover:text-red-500"
            >
              ✕
            </button>
          </div>
          <div className="grid grid-cols-2 gap-2">
            <Field label="Title">
              <TextInput
                value={exp.title}
                placeholder="Software Engineer"
                onChange={(e) =>
                  updateExperience(exp.id, (prev) => ({
                    ...prev,
                    title: e.target.value,
                  }))
                }
              />
            </Field>
            <Field label="Company">
              <TextInput
                value={exp.company}
                placeholder="Company Name"
                onChange={(e) =>
                  updateExperience(exp.id, (prev) => ({
                    ...prev,
                    company: e.target.value,
                  }))
                }
              />
            </Field>
            <Field label="Start">
              <TextInput
                value={exp.startDate}
                placeholder="Jan 2022"
                onChange={(e) =>
                  updateExperience(exp.id, (prev) => ({
                    ...prev,
                    startDate: e.target.value,
                  }))
                }
              />
            </Field>
            <Field label="End">
              <TextInput
                value={exp.endDate}
                placeholder="Present"
                onChange={(e) =>
                  updateExperience(exp.id, (prev) => ({
                    ...prev,
                    endDate: e.target.value,
                  }))
                }
              />
            </Field>
          </div>
          <div className="mt-3 space-y-2">
            <span className="text-xs font-medium text-slate-500">
              Achievements
            </span>
            {exp.bullets.map((bullet, idx) => (
              <TextArea
                key={idx}
                rows={2}
                value={bullet}
                onChange={(e) =>
                  updateExperience(exp.id, (prev) => {
                    const next = [...prev.bullets];
                    next[idx] = e.target.value;
                    return { ...prev, bullets: next };
                  })
                }
                placeholder="Delivered X by doing Y, resulting in Z"
              />
            ))}
            <div className="flex gap-3">
              <button
                onClick={() =>
                  updateExperience(exp.id, (prev) => ({
                    ...prev,
                    bullets: [...prev.bullets, ""],
                  }))
                }
                className="text-xs font-medium text-slate-600 hover:text-slate-900"
              >
                + Add bullet
              </button>
              {exp.bullets.length > 1 && (
                <button
                  onClick={() =>
                    updateExperience(exp.id, (prev) => ({
                      ...prev,
                      bullets: prev.bullets.slice(0, -1),
                    }))
                  }
                  className="text-xs text-slate-400 hover:text-red-500"
                >
                  Remove last
                </button>
              )}
            </div>
          </div>
        </div>
      ))}
      <button
        onClick={addExperience}
        className="w-full rounded-lg bg-slate-100 py-2 text-xs font-medium text-slate-600 transition hover:bg-slate-200"
      >
        + Add experience
      </button>
    </div>
  );
}
