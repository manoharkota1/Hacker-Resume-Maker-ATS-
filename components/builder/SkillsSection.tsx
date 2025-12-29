"use client";

import { Field, TextInput } from "./Field";
import { useResumeStore } from "@/lib/state/useResumeStore";

export function SkillsSection() {
  const skills = useResumeStore((s) => s.resume.skills);
  const updateGroup = useResumeStore((s) => s.updateSkillGroup);
  const addGroup = useResumeStore((s) => s.addSkillGroup);
  const removeGroup = useResumeStore((s) => s.removeSkillGroup);

  return (
    <div className="space-y-3">
      {skills.map((group, idx) => (
        <div key={idx} className="rounded-lg bg-slate-50 p-3">
          <div className="flex items-center gap-2">
            <TextInput
              value={group.label}
              placeholder="Skill category"
              onChange={(e) =>
                updateGroup(idx, (g) => ({ ...g, label: e.target.value }))
              }
              className="font-medium"
            />
            <button
              onClick={() => removeGroup(idx)}
              className="shrink-0 text-xs text-slate-400 hover:text-red-500"
            >
              ✕
            </button>
          </div>
          <Field label="Skills" hint="Comma separated" className="mt-2">
            <TextInput
              value={group.items.join(", ")}
              placeholder="React, TypeScript, Node.js"
              onChange={(e) =>
                updateGroup(idx, (g) => ({
                  ...g,
                  items: e.target.value
                    .split(",")
                    .map((t) => t.trim())
                    .filter(Boolean),
                }))
              }
            />
          </Field>
        </div>
      ))}
      <button
        onClick={() => addGroup("New Category")}
        className="w-full rounded-lg bg-slate-100 py-2 text-xs font-medium text-slate-600 transition hover:bg-slate-200"
      >
        + Add skill group
      </button>
    </div>
  );
}
