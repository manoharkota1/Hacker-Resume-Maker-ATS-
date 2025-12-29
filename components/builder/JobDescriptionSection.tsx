"use client";

import { Field, TextArea } from "./Field";
import { useResumeStore } from "@/lib/state/useResumeStore";

export function JobDescriptionSection() {
  const jd = useResumeStore((s) => s.jobDescription);
  const setJD = useResumeStore((s) => s.setJobDescription);

  return (
    <Field
      label="Job description text"
      hint="Paste the job posting to get personalized match scoring"
    >
      <TextArea
        rows={8}
        value={jd}
        placeholder="Paste the job description here to see how well your resume matches..."
        onChange={(e) => setJD(e.target.value)}
      />
    </Field>
  );
}
