"use client";

import { ReactNode } from "react";
import { useResumeStore } from "@/lib/state/useResumeStore";

export function TemplateControls() {
  const template = useResumeStore((s) => s.template);
  const density = useResumeStore((s) => s.density);
  const fontFamily = useResumeStore((s) => s.fontFamily);
  const fontSize = useResumeStore((s) => s.fontSize);
  const lineSpacing = useResumeStore((s) => s.lineSpacing);
  const colorTheme = useResumeStore((s) => s.colorTheme);
  const setTemplate = useResumeStore((s) => s.setTemplate);
  const setDensity = useResumeStore((s) => s.setDensity);
  const setFontFamily = useResumeStore((s) => s.setFontFamily);
  const setFontSize = useResumeStore((s) => s.setFontSize);
  const setLineSpacing = useResumeStore((s) => s.setLineSpacing);
  const setColorTheme = useResumeStore((s) => s.setColorTheme);

  return (
    <div className="flex flex-wrap items-center gap-3 rounded-lg border border-slate-200 bg-white p-3 shadow-sm">
      <ControlGroup label="Template">
        <SelectButton
          active={template === "modern"}
          onClick={() => setTemplate("modern")}
          label="Modern"
        />
        <SelectButton
          active={template === "minimal"}
          onClick={() => setTemplate("minimal")}
          label="Minimal"
        />
      </ControlGroup>
      <ControlGroup label="Density">
        <SelectButton
          active={density === "cozy"}
          onClick={() => setDensity("cozy")}
          label="Cozy"
        />
        <SelectButton
          active={density === "compact"}
          onClick={() => setDensity("compact")}
          label="Compact"
        />
      </ControlGroup>
      <ControlGroup label="Font">
        <SelectButton
          active={fontFamily === "geist"}
          onClick={() => setFontFamily("geist")}
          label="Geist"
        />
        <SelectButton
          active={fontFamily === "inter"}
          onClick={() => setFontFamily("inter")}
          label="Inter"
        />
        <SelectButton
          active={fontFamily === "serif"}
          onClick={() => setFontFamily("serif")}
          label="Serif"
        />
      </ControlGroup>
      <ControlGroup label="Size">
        <SelectButton
          active={fontSize === "sm"}
          onClick={() => setFontSize("sm")}
          label="Small"
        />
        <SelectButton
          active={fontSize === "md"}
          onClick={() => setFontSize("md")}
          label="Medium"
        />
        <SelectButton
          active={fontSize === "lg"}
          onClick={() => setFontSize("lg")}
          label="Large"
        />
      </ControlGroup>
      <ControlGroup label="Spacing">
        <SelectButton
          active={lineSpacing === "normal"}
          onClick={() => setLineSpacing("normal")}
          label="Normal"
        />
        <SelectButton
          active={lineSpacing === "relaxed"}
          onClick={() => setLineSpacing("relaxed")}
          label="Relaxed"
        />
        <SelectButton
          active={lineSpacing === "loose"}
          onClick={() => setLineSpacing("loose")}
          label="Loose"
        />
      </ControlGroup>
      <ControlGroup label="Theme">
        <SelectButton
          active={colorTheme === "slate"}
          onClick={() => setColorTheme("slate")}
          label="Slate"
        />
        <SelectButton
          active={colorTheme === "indigo"}
          onClick={() => setColorTheme("indigo")}
          label="Indigo"
        />
        <SelectButton
          active={colorTheme === "emerald"}
          onClick={() => setColorTheme("emerald")}
          label="Emerald"
        />
      </ControlGroup>
    </div>
  );
}

function ControlGroup({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div className="flex items-center gap-2">
      <span className="text-sm font-semibold text-slate-900">{label}</span>
      {children}
    </div>
  );
}

function SelectButton({
  active,
  onClick,
  label,
}: {
  active: boolean;
  onClick: () => void;
  label: string;
}) {
  return (
    <button
      onClick={onClick}
      className={`rounded-full border px-3 py-1 text-xs font-semibold transition ${
        active
          ? "border-slate-900 bg-slate-900 text-white"
          : "border-slate-200 bg-white text-slate-700 hover:border-slate-300"
      }`}
    >
      {label}
    </button>
  );
}
