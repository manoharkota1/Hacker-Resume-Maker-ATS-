"use client";

import { Field, TextInput } from "./Field";
import { useResumeStore } from "@/lib/state/useResumeStore";

export function PersonalSection() {
  const personal = useResumeStore((s) => s.resume.personal);
  const update = useResumeStore((s) => s.updatePersonal);

  const entries: Array<{
    key: keyof typeof personal;
    label: string;
    placeholder: string;
  }> = [
    { key: "name", label: "Full name", placeholder: "Alex Candidate" },
    {
      key: "title",
      label: "Headline",
      placeholder: "Product-Focused Full-Stack Engineer",
    },
    { key: "email", label: "Email", placeholder: "alex@example.com" },
    { key: "phone", label: "Phone", placeholder: "(555) 123-4567" },
    { key: "location", label: "Location", placeholder: "Remote / SF Bay Area" },
    {
      key: "linkedin",
      label: "LinkedIn",
      placeholder: "linkedin.com/in/example",
    },
    { key: "github", label: "GitHub", placeholder: "github.com/example" },
    { key: "portfolio", label: "Portfolio", placeholder: "example.dev" },
  ];

  return (
    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
      {entries.map((entry) => (
        <Field key={entry.key} label={entry.label}>
          <TextInput
            value={personal[entry.key]}
            placeholder={entry.placeholder}
            onChange={(e) => update(entry.key, e.target.value)}
          />
        </Field>
      ))}
    </div>
  );
}
