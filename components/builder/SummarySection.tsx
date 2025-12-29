"use client";

import { Field, TextArea } from "./Field";
import { useResumeStore } from "@/lib/state/useResumeStore";

export function SummarySection() {
  const summary = useResumeStore((s) => s.resume.summary);
  const updateSummary = useResumeStore((s) => s.updateSummary);

  return (
    <Field label="Professional summary" hint="2-4 lines; outcome-focused.">
      <TextArea
        rows={4}
        value={summary}
        placeholder="Full-stack engineer with 5+ years experience building scalable web applications..."
        onChange={(e) => updateSummary(e.target.value)}
      />
    </Field>
  );
}
