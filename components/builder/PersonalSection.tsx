"use client";

import { Field, TextInput } from "./Field";
import { ClearButton } from "./ClearButton";
import { useResumeStore } from "@/lib/state/useResumeStore";

export function PersonalSection() {
  const personal = useResumeStore((s) => s.resume.personal);
  const update = useResumeStore((s) => s.updatePersonal);
  const clearPersonal = useResumeStore((s) => s.clearPersonal);

  const entries: Array<{
    key: keyof typeof personal;
    label: string;
    placeholder: string;
    icon?: string;
  }> = [
    { key: "name", label: "Full name", placeholder: "Alex Candidate", icon: "user" },
    {
      key: "title",
      label: "Headline",
      placeholder: "Product-Focused Full-Stack Engineer",
      icon: "briefcase"
    },
    { key: "email", label: "Email", placeholder: "alex@example.com", icon: "mail" },
    { key: "phone", label: "Phone", placeholder: "(555) 123-4567", icon: "phone" },
    { key: "location", label: "Location", placeholder: "Remote / SF Bay Area", icon: "location" },
    {
      key: "linkedin",
      label: "LinkedIn",
      placeholder: "linkedin.com/in/example",
      icon: "linkedin"
    },
    { key: "github", label: "GitHub", placeholder: "github.com/example", icon: "github" },
    { key: "portfolio", label: "Portfolio", placeholder: "example.dev", icon: "globe" },
  ];

  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        <ClearButton onClear={clearPersonal} sectionName="personal info" />
      </div>
      <div className="grid grid-cols-1 gap-3 sm:gap-4">
        {/* Name and Title - Full Width */}
        <div className="grid grid-cols-1 gap-3">
          {entries.slice(0, 2).map((entry) => (
            <Field key={entry.key} label={entry.label}>
              <TextInput
                value={personal[entry.key]}
                placeholder={entry.placeholder}
                onChange={(e) => update(entry.key, e.target.value)}
              />
            </Field>
          ))}
        </div>
        {/* Contact Info - 2 Columns on Larger Screens */}
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          {entries.slice(2).map((entry) => (
            <Field key={entry.key} label={entry.label}>
              <TextInput
                value={personal[entry.key]}
                placeholder={entry.placeholder}
                onChange={(e) => update(entry.key, e.target.value)}
              />
            </Field>
          ))}
        </div>
      </div>
    </div>
  );
}
