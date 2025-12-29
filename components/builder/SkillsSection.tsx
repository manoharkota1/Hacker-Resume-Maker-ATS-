"use client";

import { Field, TextInput } from "./Field";
import { useResumeStore } from "@/lib/state/useResumeStore";
import { useState, useEffect } from "react";

export function SkillsSection() {
  const skills = useResumeStore((s) => s.resume.skills);
  const updateGroup = useResumeStore((s) => s.updateSkillGroup);
  const addGroup = useResumeStore((s) => s.addSkillGroup);
  const removeGroup = useResumeStore((s) => s.removeSkillGroup);

  return (
    <div className="space-y-4">
      {skills.map((group, idx) => (
        <SkillGroupInput
          key={idx}
          group={group}
          index={idx}
          updateGroup={updateGroup}
          removeGroup={removeGroup}
        />
      ))}
      <button
        onClick={() => addGroup("New Category")}
        className="flex w-full items-center justify-center gap-2 border-2 border-dashed border-slate-300 bg-slate-50 py-3 text-xs font-medium text-slate-500 transition-all duration-200 hover:border-slate-400 hover:bg-slate-100 hover:text-slate-700"
      >
        <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
          <line x1="12" y1="5" x2="12" y2="19" />
          <line x1="5" y1="12" x2="19" y2="12" />
        </svg>
        Add skill group
      </button>
    </div>
  );
}

// Separate component to manage local state for smooth typing
function SkillGroupInput({
  group,
  index,
  updateGroup,
  removeGroup,
}: {
  group: { label: string; items: string[] };
  index: number;
  updateGroup: (index: number, updater: (g: { label: string; items: string[] }) => { label: string; items: string[] }) => void;
  removeGroup: (index: number) => void;
}) {
  // Local state to allow typing commas without immediate splitting
  const [inputValue, setInputValue] = useState(group.items.join(", "));

  // Sync with store when group changes externally
  useEffect(() => {
    setInputValue(group.items.join(", "));
  }, [group.items]);

  const handleBlur = () => {
    // Only split and update on blur
    updateGroup(index, (g) => ({
      ...g,
      items: inputValue
        .split(",")
        .map((t) => t.trim())
        .filter(Boolean),
    }));
  };

  return (
    <div className="border border-slate-200 bg-slate-50 p-4 transition-all duration-200 hover:bg-slate-100">
      <div className="flex items-center gap-2">
        <TextInput
          value={group.label}
          placeholder="Skill category"
          onChange={(e) =>
            updateGroup(index, (g) => ({ ...g, label: e.target.value }))
          }
          className="font-semibold"
        />
        <button
          onClick={() => removeGroup(index)}
          className="shrink-0 p-1.5 text-slate-400 transition-colors hover:bg-red-50 hover:text-red-500"
          title="Remove skill group"
        >
          <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
            <line x1="18" y1="6" x2="6" y2="18" />
            <line x1="6" y1="6" x2="18" y2="18" />
          </svg>
        </button>
      </div>
      <Field label="Skills" hint="Comma separated" className="mt-3">
        <TextInput
          value={inputValue}
          placeholder="React, TypeScript, Node.js"
          onChange={(e) => setInputValue(e.target.value)}
          onBlur={handleBlur}
        />
      </Field>
    </div>
  );
}
