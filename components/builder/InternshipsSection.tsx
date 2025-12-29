"use client";

import { Field, TextInput, TextArea } from "./Field";
import { useResumeStore } from "@/lib/state/useResumeStore";

export function InternshipsSection() {
  const internships = useResumeStore((s) => s.resume.internships);
  const add = useResumeStore((s) => s.addInternship);
  const update = useResumeStore((s) => s.updateInternship);
  const remove = useResumeStore((s) => s.removeInternship);

  return (
    <div className="space-y-4">
      {internships.map((item) => (
        <div key={item.id} className="border border-slate-200 bg-slate-50 p-4 transition-all duration-200 hover:bg-slate-100">
          <div className="mb-4 flex items-center justify-between">
            <p className="text-sm font-semibold text-slate-800">
              {item.title || "New Internship"}
            </p>
            <button
              onClick={() => remove(item.id)}
              className="p-1.5 text-slate-400 transition-colors hover:bg-red-50 hover:text-red-500"
              title="Remove internship"
            >
              <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
                <line x1="18" y1="6" x2="6" y2="18" />
                <line x1="6" y1="6" x2="18" y2="18" />
              </svg>
            </button>
          </div>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <Field label="Title">
              <TextInput
                value={item.title}
                placeholder="Intern"
                onChange={(e) =>
                  update(item.id, (prev) => ({
                    ...prev,
                    title: e.target.value,
                  }))
                }
              />
            </Field>
            <Field label="Organization">
              <TextInput
                value={item.organization}
                placeholder="Company"
                onChange={(e) =>
                  update(item.id, (prev) => ({
                    ...prev,
                    organization: e.target.value,
                  }))
                }
              />
            </Field>
            <Field label="Start">
              <TextInput
                value={item.startDate}
                placeholder="Jun 2023"
                onChange={(e) =>
                  update(item.id, (prev) => ({
                    ...prev,
                    startDate: e.target.value,
                  }))
                }
              />
            </Field>
            <Field label="End">
              <TextInput
                value={item.endDate}
                placeholder="Aug 2023"
                onChange={(e) =>
                  update(item.id, (prev) => ({
                    ...prev,
                    endDate: e.target.value,
                  }))
                }
              />
            </Field>
          </div>
          <div className="mt-4 space-y-3">
            <span className="text-xs font-semibold uppercase tracking-wide text-slate-500">
              Achievements
            </span>
            {item.bullets.map((bullet, idx) => (
              <TextArea
                key={idx}
                rows={2}
                value={bullet}
                onChange={(e) =>
                  update(item.id, (prev) => {
                    const next = [...prev.bullets];
                    next[idx] = e.target.value;
                    return { ...prev, bullets: next };
                  })
                }
                placeholder="Contributed to..."
              />
            ))}
            <div className="flex gap-4">
              <button
                onClick={() =>
                  update(item.id, (prev) => ({
                    ...prev,
                    bullets: [...prev.bullets, ""],
                  }))
                }
                className="flex items-center gap-1 text-xs font-medium text-emerald-600 transition-colors hover:text-emerald-700"
              >
                <svg className="h-3.5 w-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
                  <line x1="12" y1="5" x2="12" y2="19" />
                  <line x1="5" y1="12" x2="19" y2="12" />
                </svg>
                Add bullet
              </button>
              {item.bullets.length > 1 && (
                <button
                  onClick={() =>
                    update(item.id, (prev) => ({
                      ...prev,
                      bullets: prev.bullets.slice(0, -1),
                    }))
                  }
                  className="flex items-center gap-1 text-xs text-slate-400 transition-colors hover:text-red-500"
                >
                  <svg className="h-3.5 w-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
                    <line x1="5" y1="12" x2="19" y2="12" />
                  </svg>
                  Remove last
                </button>
              )}
            </div>
          </div>
        </div>
      ))}
      <button
        onClick={add}
        className="flex w-full items-center justify-center gap-2 border-2 border-dashed border-slate-300 bg-slate-50 py-3 text-xs font-medium text-slate-500 transition-all duration-200 hover:border-slate-400 hover:bg-slate-100 hover:text-slate-700"
      >
        <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
          <line x1="12" y1="5" x2="12" y2="19" />
          <line x1="5" y1="12" x2="19" y2="12" />
        </svg>
        Add internship
      </button>
    </div>
  );
}
