"use client";

import { Field, TextInput } from "./Field";
import { useResumeStore } from "@/lib/state/useResumeStore";

export function PublicationsSection() {
  const publications = useResumeStore((s) => s.resume.publications);
  const add = useResumeStore((s) => s.addPublication);
  const update = useResumeStore((s) => s.updatePublication);
  const remove = useResumeStore((s) => s.removePublication);

  return (
    <div className="space-y-4">
      {publications.map((item) => (
        <div key={item.id} className="border border-slate-200 bg-slate-50 p-4 transition-all duration-200 hover:bg-slate-100">
          <div className="mb-4 flex items-center justify-between">
            <p className="text-sm font-semibold text-slate-800">
              {item.title || "New Publication"}
            </p>
            <button
              onClick={() => remove(item.id)}
              className="p-1.5 text-slate-400 transition-colors hover:bg-red-50 hover:text-red-500"
              title="Remove publication"
            >
              <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
                <line x1="18" y1="6" x2="6" y2="18" />
                <line x1="6" y1="6" x2="18" y2="18" />
              </svg>
            </button>
          </div>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <Field label="Title" className="col-span-2">
              <TextInput
                value={item.title}
                placeholder="Publication title"
                onChange={(e) =>
                  update(item.id, (prev) => ({
                    ...prev,
                    title: e.target.value,
                  }))
                }
              />
            </Field>
            <Field label="Outlet">
              <TextInput
                value={item.outlet}
                placeholder="Journal/Conference"
                onChange={(e) =>
                  update(item.id, (prev) => ({
                    ...prev,
                    outlet: e.target.value,
                  }))
                }
              />
            </Field>
            <Field label="Year">
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
            <Field label="Link" className="col-span-2">
              <TextInput
                value={item.link || ""}
                placeholder="https://..."
                onChange={(e) =>
                  update(item.id, (prev) => ({
                    ...prev,
                    link: e.target.value,
                  }))
                }
              />
            </Field>
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
        Add publication
      </button>
    </div>
  );
}
