"use client";

import { Field, TextInput } from "./Field";
import { useResumeStore } from "@/lib/state/useResumeStore";

export function PublicationsSection() {
  const publications = useResumeStore((s) => s.resume.publications);
  const add = useResumeStore((s) => s.addPublication);
  const update = useResumeStore((s) => s.updatePublication);
  const remove = useResumeStore((s) => s.removePublication);

  return (
    <div className="space-y-3">
      {publications.map((item) => (
        <div key={item.id} className="rounded-lg bg-slate-50 p-3">
          <div className="mb-3 flex items-center justify-between">
            <p className="text-sm font-medium text-slate-800">
              {item.title || "New Publication"}
            </p>
            <button
              onClick={() => remove(item.id)}
              className="text-xs text-slate-400 hover:text-red-500"
            >
              ✕
            </button>
          </div>
          <div className="grid grid-cols-2 gap-2">
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
        className="w-full rounded-lg bg-slate-100 py-2 text-xs font-medium text-slate-600 transition hover:bg-slate-200"
      >
        + Add publication
      </button>
    </div>
  );
}
