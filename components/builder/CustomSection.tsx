"use client";

import { TextInput, TextArea } from "./Field";
import { useResumeStore } from "@/lib/state/useResumeStore";
import { CustomSection } from "@/types/resume";

export function CustomSectionEditor({ section }: { section: CustomSection }) {
  const updateCustomSection = useResumeStore((s) => s.updateCustomSection);
  const removeCustomSection = useResumeStore((s) => s.removeCustomSection);
  const addCustomSectionItem = useResumeStore((s) => s.addCustomSectionItem);
  const updateCustomSectionItem = useResumeStore(
    (s) => s.updateCustomSectionItem
  );
  const removeCustomSectionItem = useResumeStore(
    (s) => s.removeCustomSectionItem
  );

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2">
        <TextInput
          value={section.title}
          placeholder="Section Title"
          onChange={(e) => updateCustomSection(section.id, e.target.value)}
          className="font-medium"
        />
        <button
          onClick={() => removeCustomSection(section.id)}
          className="shrink-0 rounded-md bg-red-50 px-2 py-1 text-xs text-red-600 hover:bg-red-100"
        >
          Delete Section
        </button>
      </div>
      {section.items.map((item, idx) => (
        <div
          key={item.id}
          className="rounded-lg border border-slate-200 bg-white p-3"
        >
          <div className="mb-2 flex items-center justify-between">
            <span className="text-xs font-medium text-slate-500">
              Item {idx + 1}
            </span>
            {section.items.length > 1 && (
              <button
                onClick={() => removeCustomSectionItem(section.id, item.id)}
                className="text-xs text-slate-400 hover:text-red-500"
              >
                ✕
              </button>
            )}
          </div>
          <TextArea
            rows={2}
            value={item.content}
            placeholder="Enter content..."
            onChange={(e) =>
              updateCustomSectionItem(section.id, item.id, e.target.value)
            }
          />
        </div>
      ))}
      <button
        onClick={() => addCustomSectionItem(section.id)}
        className="w-full rounded-lg border border-dashed border-slate-300 py-2 text-xs font-medium text-slate-600 transition hover:border-slate-400 hover:bg-slate-50"
      >
        + Add Item
      </button>
    </div>
  );
}
