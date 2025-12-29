"use client";

import { Field, TextInput, TextArea } from "./Field";
import { useResumeStore } from "@/lib/state/useResumeStore";

export function VolunteeringSection() {
  const volunteering = useResumeStore((s) => s.resume.volunteering);
  const add = useResumeStore((s) => s.addVolunteer);
  const update = useResumeStore((s) => s.updateVolunteer);
  const remove = useResumeStore((s) => s.removeVolunteer);

  return (
    <div className="space-y-3">
      {volunteering.map((item) => (
        <div key={item.id} className="rounded-lg bg-slate-50 p-3">
          <div className="mb-3 flex items-center justify-between">
            <p className="text-sm font-medium text-slate-800">
              {item.organization || "New Volunteering"}
            </p>
            <button
              onClick={() => remove(item.id)}
              className="text-xs text-slate-400 hover:text-red-500"
            >
              ✕
            </button>
          </div>
          <div className="grid grid-cols-2 gap-2">
            <Field label="Organization">
              <TextInput
                value={item.organization}
                placeholder="Nonprofit"
                onChange={(e) =>
                  update(item.id, (prev) => ({
                    ...prev,
                    organization: e.target.value,
                  }))
                }
              />
            </Field>
            <Field label="Role">
              <TextInput
                value={item.role}
                placeholder="Volunteer"
                onChange={(e) =>
                  update(item.id, (prev) => ({
                    ...prev,
                    role: e.target.value,
                  }))
                }
              />
            </Field>
            <Field label="Year" className="col-span-2">
              <TextInput
                value={item.year}
                placeholder="2023"
                onChange={(e) =>
                  update(item.id, (prev) => ({
                    ...prev,
                    year: e.target.value,
                  }))
                }
              />
            </Field>
          </div>
          <div className="mt-3 space-y-2">
            <span className="text-xs font-medium text-slate-500">Impact</span>
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
                placeholder="Describe your impact..."
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
        + Add volunteering
      </button>
    </div>
  );
}
