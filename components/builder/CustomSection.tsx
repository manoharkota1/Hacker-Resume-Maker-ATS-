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
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <TextInput
          value={section.title}
          placeholder="Section Title"
          onChange={(e) => updateCustomSection(section.id, e.target.value)}
          className="font-semibold"
        />
        <button
          onClick={() => removeCustomSection(section.id)}
          className="shrink-0 bg-red-50 px-3 py-2 text-xs font-medium text-red-600 transition-colors hover:bg-red-100"
        >
          <span className="flex items-center gap-1.5">
            <svg className="h-3.5 w-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
              <polyline points="3 6 5 6 21 6" />
              <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
            </svg>
            Delete Section
          </span>
        </button>
      </div>
      {section.items.map((item, idx) => (
        <div
          key={item.id}
          className="border border-slate-200 bg-slate-50 p-4 transition-all duration-200 hover:bg-slate-100"
        >
          <div className="mb-3 flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wide text-slate-500">
              Item {idx + 1}
            </span>
            {section.items.length > 1 && (
              <button
                onClick={() => removeCustomSectionItem(section.id, item.id)}
                className="p-1.5 text-slate-400 transition-colors hover:bg-red-50 hover:text-red-500"
              >
                <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
                  <line x1="18" y1="6" x2="6" y2="18" />
                  <line x1="6" y1="6" x2="18" y2="18" />
                </svg>
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
        className="flex w-full items-center justify-center gap-2 border-2 border-dashed border-slate-300 bg-slate-50 py-3 text-xs font-medium text-slate-500 transition-all duration-200 hover:border-slate-400 hover:bg-slate-100 hover:text-slate-700"
      >
        <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
          <line x1="12" y1="5" x2="12" y2="19" />
          <line x1="5" y1="12" x2="19" y2="12" />
        </svg>
        Add Item
      </button>
    </div>
  );
}
