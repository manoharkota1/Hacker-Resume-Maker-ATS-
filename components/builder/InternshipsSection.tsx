"use client";

import { Field, TextInput, TextArea } from "./Field";
import { useResumeStore } from "@/lib/state/useResumeStore";

export function InternshipsSection() {
  const internships = useResumeStore((s) => s.resume.internships);
  const add = useResumeStore((s) => s.addInternship);
  const update = useResumeStore((s) => s.updateInternship);
  const remove = useResumeStore((s) => s.removeInternship);

  return (
    <div className="space-y-3">
      {internships.map((item) => (
        <div key={item.id} className="rounded-lg bg-slate-50 p-3">
          <div className="mb-3 flex items-center justify-between">
            <p className="text-sm font-medium text-slate-800">
              {item.title || "New Internship"}
            </p>
            <button
              onClick={() => remove(item.id)}
              className="text-xs text-slate-400 hover:text-red-500"
            >
              ✕
            </button>
          </div>
          <div className="grid grid-cols-2 gap-2">
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
          <div className="mt-3 space-y-2">
            <span className="text-xs font-medium text-slate-500">
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
            <div className="flex gap-3">
              <button
                onClick={() =>
                  update(item.id, (prev) => ({
                    ...prev,
                    bullets: [...prev.bullets, ""],
                  }))
                }
                className="text-xs font-medium text-slate-600 hover:text-slate-900"
              >
                + Add bullet
              </button>
              {item.bullets.length > 1 && (
                <button
                  onClick={() =>
                    update(item.id, (prev) => ({
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
        onClick={add}
        className="w-full rounded-lg bg-slate-100 py-2 text-xs font-medium text-slate-600 transition hover:bg-slate-200"
      >
        + Add internship
      </button>
    </div>
  );
}
