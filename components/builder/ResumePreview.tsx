"use client";

import React, { ReactNode, useMemo } from "react";
import { Resume, SectionOrderItem } from "@/types/resume";
import { useResumeStore } from "@/lib/state/useResumeStore";
import { useAuth } from "@/lib/appwrite/auth";
import clsx from "classnames";

export function ResumePreview() {
  const { isAuthenticated, loading: authLoading } = useAuth();
  const resume = useResumeStore((s) => s.resume);
  const template = useResumeStore((s) => s.template);
  const density = useResumeStore((s) => s.density);
  const fontFamily = useResumeStore((s) => s.fontFamily);
  const fontSize = useResumeStore((s) => s.fontSize);
  const lineSpacing = useResumeStore((s) => s.lineSpacing);
  const colorTheme = useResumeStore((s) => s.colorTheme);
  const sectionOrder = useResumeStore((s) => s.sectionOrder);
  const headerLayout = useResumeStore((s) => s.headerLayout);
  const showDividers = useResumeStore((s) => s.showDividers);

  const stylePreset = useMemo(
    () =>
      getStylePreset({
        fontFamily,
        fontSize,
        lineSpacing,
        colorTheme,
      }),
    [fontFamily, fontSize, lineSpacing, colorTheme]
  );

  // Render template based on selection
  const templateProps: TemplateProps = {
    resume,
    density,
    stylePreset,
    sectionOrder,
    headerLayout,
    showDividers,
  };

  const effectiveTemplate =
    !authLoading && !isAuthenticated ? "modern" : template;

  return (
    <div className="mx-auto max-w-3xl rounded-lg bg-white p-1 shadow-xl ring-1 ring-black/5">
      <div
        className="min-h-[11in] rounded-md bg-white"
        style={{ pageBreakAfter: "auto" }}
      >
        {effectiveTemplate === "modern" && (
          <ModernTemplate {...templateProps} />
        )}
        {effectiveTemplate === "minimal" && (
          <MinimalTemplate {...templateProps} />
        )}
        {effectiveTemplate === "classic" && (
          <ClassicTemplate {...templateProps} />
        )}
        {effectiveTemplate === "executive" && (
          <ExecutiveTemplate {...templateProps} />
        )}
        {effectiveTemplate === "creative" && (
          <CreativeTemplate {...templateProps} />
        )}
        {effectiveTemplate === "tech" && <TechTemplate {...templateProps} />}
      </div>
    </div>
  );
}

type TemplateProps = {
  resume: Resume;
  density: "cozy" | "compact";
  stylePreset: ReturnType<typeof getStylePreset>;
  sectionOrder: SectionOrderItem[];
  headerLayout: "left" | "center" | "split";
  showDividers: boolean;
};

function ModernTemplate({
  resume,
  density,
  stylePreset,
  sectionOrder,
  headerLayout,
  showDividers,
}: TemplateProps) {
  const pad = density === "compact" ? "p-5" : "p-8";
  const gap = density === "compact" ? "gap-2" : "gap-3";
  const contactLinks = buildContactLinks(resume.personal);
  const isCenter = headerLayout === "center";
  const isSplit = headerLayout === "split";

  // Render section content based on key
  const renderSection = (key: string) => {
    switch (key) {
      case "summary":
        if (!resume.summary) return null;
        return (
          <Section
            key={key}
            title="Summary"
            gap={gap}
            showDividers={showDividers}
          >
            <p className={clsx("text-slate-800", stylePreset.bodyLine)}>
              {resume.summary}
            </p>
          </Section>
        );
      case "skills":
        if (!resume.skills.length) return null;
        return (
          <Section
            key={key}
            title="Skills"
            gap={gap}
            showDividers={showDividers}
          >
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              {resume.skills.map((group) => (
                <div key={group.label}>
                  <p className="text-sm font-semibold text-slate-900">
                    {group.label}
                  </p>
                  <p className={clsx("text-slate-700", stylePreset.bodyLine)}>
                    {group.items.join(", ")}
                  </p>
                </div>
              ))}
            </div>
          </Section>
        );
      case "experience":
        if (!resume.experience.length) return null;
        return (
          <Section
            key={key}
            title="Experience"
            gap={gap}
            showDividers={showDividers}
          >
            <div className="space-y-4">
              {resume.experience.map((exp) => (
                <div key={exp.id}>
                  <div className="flex flex-wrap items-baseline justify-between gap-2">
                    <div className="space-y-1">
                      <p className="text-sm font-semibold text-slate-900">
                        {exp.title}
                      </p>
                      <p className="text-sm text-slate-700">{exp.company}</p>
                    </div>
                    <p className="text-xs uppercase tracking-wide text-slate-500">
                      {exp.startDate} – {exp.endDate || "Present"}
                    </p>
                  </div>
                  <ul
                    className={clsx(
                      "mt-2 space-y-2 text-sm text-slate-800",
                      stylePreset.listLine
                    )}
                  >
                    {exp.bullets.map((b, idx) => (
                      <li key={idx} className="flex gap-2">
                        <span className="text-slate-400">•</span>
                        <span>{b}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </Section>
        );
      case "projects":
        if (!resume.projects.length) return null;
        return (
          <Section
            key={key}
            title="Projects"
            gap={gap}
            showDividers={showDividers}
          >
            <div className="space-y-2">
              {resume.projects.map((p) => (
                <div key={p.id}>
                  <p className="text-sm font-semibold text-slate-900">
                    {p.name}
                  </p>
                  <p
                    className={clsx(
                      "text-sm text-slate-700",
                      stylePreset.bodyLine
                    )}
                  >
                    {p.description}
                  </p>
                  {p.link ? (
                    <a
                      href={normalizeUrl(p.link)}
                      target="_blank"
                      rel="noreferrer"
                      className="text-xs text-slate-500 underline-offset-2 hover:text-slate-700 hover:underline"
                    >
                      {p.link}
                    </a>
                  ) : null}
                </div>
              ))}
            </div>
          </Section>
        );
      case "education":
        if (!resume.education.length && !resume.certifications.length)
          return null;
        return (
          <div key={key} className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <Section title="Education" gap={gap} showDividers={showDividers}>
              {resume.education.map((e) => (
                <div key={e.id} className="space-y-1">
                  <p className="text-sm font-semibold text-slate-900">
                    {e.school}
                  </p>
                  <p className="text-sm text-slate-700">{e.degree}</p>
                  <p className="text-xs text-slate-500">
                    {e.startDate} – {e.endDate}
                  </p>
                </div>
              ))}
            </Section>
            <Section
              title="Certifications"
              gap={gap}
              showDividers={showDividers}
            >
              <ul className="space-y-2 text-sm text-slate-800">
                {resume.certifications.map((c) => (
                  <li key={c.id} className="flex justify-between">
                    <span>{c.name}</span>
                    <span className="text-xs text-slate-500">{c.year}</span>
                  </li>
                ))}
              </ul>
            </Section>
          </div>
        );
      case "achievements":
        if (!resume.achievements.length) return null;
        return (
          <Section
            key={key}
            title="Achievements"
            gap={gap}
            showDividers={showDividers}
          >
            <ul
              className={clsx(
                "space-y-2 text-sm text-slate-800",
                stylePreset.listLine
              )}
            >
              {resume.achievements.map((a) => (
                <li key={a.id} className="flex gap-2">
                  <span className="text-slate-400">•</span>
                  <span>{a.description}</span>
                </li>
              ))}
            </ul>
          </Section>
        );
      case "internships":
        if (!resume.internships.length) return null;
        return (
          <Section
            key={key}
            title="Internships"
            gap={gap}
            showDividers={showDividers}
          >
            <div className="space-y-3">
              {resume.internships.map((item) => (
                <div key={item.id} className="space-y-1">
                  <div className="flex items-baseline justify-between">
                    <p className="text-sm font-semibold text-slate-900">
                      {item.title}
                    </p>
                    <p className="text-xs text-slate-500">
                      {item.startDate} – {item.endDate || "Present"}
                    </p>
                  </div>
                  <p className="text-sm text-slate-700">{item.organization}</p>
                  <ul
                    className={clsx(
                      "ml-4 list-disc space-y-1 text-sm text-slate-800",
                      stylePreset.listLine
                    )}
                  >
                    {item.bullets.map((b, idx) => (
                      <li key={idx}>{b}</li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </Section>
        );
      case "volunteering":
        if (!resume.volunteering.length) return null;
        return (
          <Section
            key={key}
            title="Volunteering"
            gap={gap}
            showDividers={showDividers}
          >
            <div className="space-y-3">
              {resume.volunteering.map((item) => (
                <div key={item.id} className="space-y-1">
                  <div className="flex items-baseline justify-between">
                    <p className="text-sm font-semibold text-slate-900">
                      {item.organization}
                    </p>
                    <p className="text-xs text-slate-500">{item.year}</p>
                  </div>
                  <p className="text-sm text-slate-700">{item.role}</p>
                  <ul
                    className={clsx(
                      "ml-4 list-disc space-y-1 text-sm text-slate-800",
                      stylePreset.listLine
                    )}
                  >
                    {item.bullets.map((b, idx) => (
                      <li key={idx}>{b}</li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </Section>
        );
      case "publications":
        if (!resume.publications.length) return null;
        return (
          <Section
            key={key}
            title="Publications"
            gap={gap}
            showDividers={showDividers}
          >
            <div className="space-y-2 text-sm text-slate-800">
              {resume.publications.map((p) => (
                <div key={p.id}>
                  <p className="text-sm font-semibold text-slate-900">
                    {p.title}
                  </p>
                  <p className="text-sm text-slate-700">{p.outlet}</p>
                  <p className="text-xs text-slate-500">{p.year}</p>
                  {p.link ? (
                    <a
                      href={normalizeUrl(p.link)}
                      target="_blank"
                      rel="noreferrer"
                      className="text-xs text-slate-500 underline-offset-2 hover:text-slate-700 hover:underline"
                    >
                      {p.link}
                    </a>
                  ) : null}
                </div>
              ))}
            </div>
          </Section>
        );
      default:
        // Custom sections
        if (key.startsWith("custom-")) {
          const customSection = resume.customSections?.find(
            (s) => s.id === key
          );
          if (!customSection || !customSection.items.length) return null;
          return (
            <Section
              key={key}
              title={customSection.title}
              gap={gap}
              showDividers={showDividers}
            >
              <ul
                className={clsx(
                  "space-y-2 text-sm text-slate-800",
                  stylePreset.listLine
                )}
              >
                {customSection.items.map((item) => (
                  <li key={item.id} className="flex gap-2">
                    <span className="text-slate-400">•</span>
                    <span>{item.content}</span>
                  </li>
                ))}
              </ul>
            </Section>
          );
        }
        return null;
    }
  };

  return (
    <div
      className={clsx(stylePreset.baseText, pad, "max-w-3xl")}
      style={{ fontFamily: stylePreset.fontFamily }}
    >
      {/* Personal Info Header - Always First */}
      <header
        className={clsx(
          stylePreset.border,
          "pb-4",
          gap,
          "flex flex-col",
          isSplit
            ? "sm:flex-row sm:items-start sm:justify-between sm:gap-4"
            : ""
        )}
      >
        <div
          className={clsx(
            "space-y-0",
            isCenter ? "text-center" : "text-left",
            isSplit ? "sm:w-[60%] sm:shrink-0 sm:text-left" : ""
          )}
        >
          <h1 className="text-2xl font-semibold text-slate-900 sm:text-3xl">
            {resume.personal.name}
          </h1>
          <p className="text-base text-slate-700 sm:text-lg">
            {resume.personal.title}
          </p>
        </div>
        {contactLinks.length ? (
          <div
            className={clsx(
              "text-sm text-slate-700",
              isCenter
                ? "flex flex-wrap justify-center gap-2"
                : "flex flex-wrap gap-2",
              isSplit
                ? "sm:w-[40%] sm:flex-col sm:items-end sm:gap-0.5 sm:text-right"
                : ""
            )}
          >
            {contactLinks.map((item) =>
              item.href ? (
                <a
                  key={item.label}
                  href={item.href}
                  className="text-slate-700 underline-offset-2 hover:text-slate-900 hover:underline"
                  rel="noreferrer"
                  target={item.href.startsWith("http") ? "_blank" : undefined}
                >
                  {item.label}
                </a>
              ) : (
                <span key={item.label} className="text-slate-700">
                  {item.label}
                </span>
              )
            )}
          </div>
        ) : null}
      </header>

      {/* Render sections based on sectionOrder */}
      {sectionOrder
        .filter((s) => s.enabled && s.key !== "personal")
        .map((section) => renderSection(section.key))}
    </div>
  );
}

function MinimalTemplate({
  resume,
  density,
  stylePreset,
  sectionOrder,
  headerLayout,
}: Omit<TemplateProps, "showDividers">) {
  const pad = density === "compact" ? "p-5" : "p-8";
  const contactLinks = buildContactLinks(resume.personal);
  const isCenter = headerLayout === "center";
  const isSplit = headerLayout === "split";

  // Render section content based on key
  const renderSection = (key: string) => {
    switch (key) {
      case "summary":
        if (!resume.summary) return null;
        return (
          <p key={key} className={clsx("text-slate-800", stylePreset.bodyLine)}>
            {resume.summary}
          </p>
        );
      case "skills":
        if (!resume.skills.length) return null;
        return (
          <div
            key={key}
            className="grid grid-cols-2 gap-4 text-sm text-slate-800"
          >
            {resume.skills.map((group) => (
              <div key={group.label}>
                <p className="font-semibold text-slate-900">{group.label}</p>
                <p className={stylePreset.bodyLine}>{group.items.join(", ")}</p>
              </div>
            ))}
          </div>
        );
      case "experience":
        if (!resume.experience.length) return null;
        return (
          <div key={key} className="space-y-3">
            <p className="text-sm font-semibold uppercase tracking-wide text-slate-600">
              Experience
            </p>
            {resume.experience.map((exp) => (
              <div key={exp.id} className="space-y-1">
                <div className="flex items-baseline justify-between text-sm">
                  <span className="font-semibold text-slate-900">
                    {exp.title}
                  </span>
                  <span className="text-xs text-slate-500">
                    {exp.startDate} – {exp.endDate || "Present"}
                  </span>
                </div>
                <p className="text-sm text-slate-700">{exp.company}</p>
                <ul
                  className={clsx(
                    "ml-4 list-disc space-y-1 text-sm text-slate-800",
                    stylePreset.listLine
                  )}
                >
                  {exp.bullets.map((b, idx) => (
                    <li key={idx}>{b}</li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        );
      case "projects":
        if (!resume.projects.length) return null;
        return (
          <div key={key}>
            <p className="text-sm font-semibold uppercase tracking-wide text-slate-600">
              Projects
            </p>
            {resume.projects.map((p) => (
              <div key={p.id} className="space-y-0.5">
                <p className="font-semibold text-slate-900">{p.name}</p>
                <p className={stylePreset.bodyLine}>{p.description}</p>
                {p.link ? (
                  <a
                    href={normalizeUrl(p.link)}
                    target="_blank"
                    rel="noreferrer"
                    className="text-xs text-slate-500 underline-offset-2 hover:text-slate-700 hover:underline"
                  >
                    {p.link}
                  </a>
                ) : null}
              </div>
            ))}
          </div>
        );
      case "education":
        if (!resume.education.length) return null;
        return (
          <div
            key={key}
            className="grid grid-cols-2 gap-4 text-sm text-slate-800"
          >
            <div>
              <p className="text-sm font-semibold uppercase tracking-wide text-slate-600">
                Education
              </p>
              {resume.education.map((e) => (
                <div key={e.id} className="space-y-0.5">
                  <p className="font-semibold text-slate-900">{e.school}</p>
                  <p className={stylePreset.bodyLine}>{e.degree}</p>
                  <p className="text-xs text-slate-500">
                    {e.startDate} – {e.endDate}
                  </p>
                </div>
              ))}
            </div>
          </div>
        );
      case "internships":
        if (!resume.internships.length) return null;
        return (
          <div key={key} className="space-y-3 text-sm text-slate-800">
            <p className="text-sm font-semibold uppercase tracking-wide text-slate-600">
              Internships
            </p>
            {resume.internships.map((item) => (
              <div key={item.id} className="space-y-1">
                <div className="flex items-baseline justify-between text-sm">
                  <span className="font-semibold text-slate-900">
                    {item.title}
                  </span>
                  <span className="text-xs text-slate-500">
                    {item.startDate} – {item.endDate || "Present"}
                  </span>
                </div>
                <p className="text-sm text-slate-700">{item.organization}</p>
                <ul
                  className={clsx(
                    "ml-4 list-disc space-y-1 text-sm text-slate-800",
                    stylePreset.listLine
                  )}
                >
                  {item.bullets.map((b, idx) => (
                    <li key={idx}>{b}</li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        );
      case "volunteering":
        if (!resume.volunteering.length) return null;
        return (
          <div key={key} className="space-y-3 text-sm text-slate-800">
            <p className="text-sm font-semibold uppercase tracking-wide text-slate-600">
              Volunteering
            </p>
            {resume.volunteering.map((item) => (
              <div key={item.id} className="space-y-1">
                <div className="flex items-baseline justify-between text-sm">
                  <span className="font-semibold text-slate-900">
                    {item.organization}
                  </span>
                  <span className="text-xs text-slate-500">{item.year}</span>
                </div>
                <p className="text-sm text-slate-700">{item.role}</p>
                <ul
                  className={clsx(
                    "ml-4 list-disc space-y-1 text-sm text-slate-800",
                    stylePreset.listLine
                  )}
                >
                  {item.bullets.map((b, idx) => (
                    <li key={idx}>{b}</li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        );
      case "publications":
        if (!resume.publications.length) return null;
        return (
          <div key={key} className="space-y-3 text-sm text-slate-800">
            <p className="text-sm font-semibold uppercase tracking-wide text-slate-600">
              Publications
            </p>
            {resume.publications.map((p) => (
              <div key={p.id} className="space-y-0.5">
                <p className="font-semibold text-slate-900">{p.title}</p>
                <p className={stylePreset.bodyLine}>{p.outlet}</p>
                <p className="text-xs text-slate-500">{p.year}</p>
                {p.link ? (
                  <a
                    href={normalizeUrl(p.link)}
                    target="_blank"
                    rel="noreferrer"
                    className="text-xs text-slate-500 underline-offset-2 hover:text-slate-700 hover:underline"
                  >
                    {p.link}
                  </a>
                ) : null}
              </div>
            ))}
          </div>
        );
      default:
        // Custom sections
        if (key.startsWith("custom-")) {
          const customSection = resume.customSections?.find(
            (s) => s.id === key
          );
          if (!customSection || !customSection.items.length) return null;
          return (
            <div key={key} className="space-y-3 text-sm text-slate-800">
              <p className="text-sm font-semibold uppercase tracking-wide text-slate-600">
                {customSection.title}
              </p>
              <ul
                className={clsx(
                  "ml-4 list-disc space-y-1 text-sm text-slate-800",
                  stylePreset.listLine
                )}
              >
                {customSection.items.map((item) => (
                  <li key={item.id}>{item.content}</li>
                ))}
              </ul>
            </div>
          );
        }
        return null;
    }
  };

  return (
    <div
      className={clsx(
        "max-w-3xl space-y-5 border-l-4 bg-white",
        stylePreset.borderLeft,
        stylePreset.baseText,
        pad
      )}
      style={{ fontFamily: stylePreset.fontFamily }}
    >
      {/* Personal Info Header - Always First */}
      <div
        className={clsx(
          "space-y-1",
          isSplit
            ? "sm:flex sm:items-start sm:justify-between sm:space-y-0"
            : ""
        )}
      >
        <div
          className={clsx(
            "space-y-0",
            isCenter ? "text-center" : "text-left",
            isSplit ? "sm:w-[60%] sm:shrink-0 sm:text-left" : ""
          )}
        >
          <h1 className="text-2xl font-bold text-slate-900 sm:text-3xl">
            {resume.personal.name}
          </h1>
          <p className="text-sm uppercase tracking-wide text-slate-600">
            {resume.personal.title}
          </p>
        </div>
        {contactLinks.length ? (
          <div
            className={clsx(
              "mt-2 text-sm text-slate-700",
              isCenter
                ? "flex flex-wrap justify-center gap-2"
                : "flex flex-wrap gap-2",
              isSplit
                ? "sm:mt-0 sm:w-[40%] sm:flex-col sm:items-end sm:gap-0.5 sm:text-right"
                : ""
            )}
          >
            {contactLinks.map((item) =>
              item.href ? (
                <a
                  key={item.label}
                  href={item.href}
                  className="text-slate-700 underline-offset-2 hover:text-slate-900 hover:underline"
                  rel="noreferrer"
                  target={item.href.startsWith("http") ? "_blank" : undefined}
                >
                  {item.label}
                </a>
              ) : (
                <span key={item.label} className="text-slate-700">
                  {item.label}
                </span>
              )
            )}
          </div>
        ) : null}
      </div>

      {/* Render sections based on sectionOrder */}
      {sectionOrder
        .filter((s) => s.enabled && s.key !== "personal")
        .map((section) => renderSection(section.key))}
    </div>
  );
}

function Section({
  title,
  children,
  gap,
  showDividers = true,
}: {
  title: string;
  children: ReactNode;
  gap: string;
  showDividers?: boolean;
}) {
  return (
    <section
      className={clsx(
        showDividers ? "border-b border-slate-100" : "",
        "pb-4",
        gap,
        "space-y-2"
      )}
    >
      <p className="text-sm font-semibold uppercase tracking-wide text-slate-600">
        {title}
      </p>
      {children}
    </section>
  );
}

type ContactLink = { label: string; href?: string };

function buildContactLinks(personal: Resume["personal"]): ContactLink[] {
  const links: ContactLink[] = [];

  if (personal.email)
    links.push({ label: personal.email, href: `mailto:${personal.email}` });

  if (personal.phone) {
    const tel = personal.phone.replace(/[^+\d]/g, "");
    links.push({ label: personal.phone, href: `tel:${tel || personal.phone}` });
  }

  if (personal.location) links.push({ label: personal.location });

  if (personal.linkedin)
    links.push({
      label: personal.linkedin,
      href: normalizeUrl(personal.linkedin),
    });
  if (personal.github)
    links.push({ label: personal.github, href: normalizeUrl(personal.github) });
  if (personal.portfolio)
    links.push({
      label: personal.portfolio,
      href: normalizeUrl(personal.portfolio),
    });

  return links;
}

function normalizeUrl(url: string): string {
  if (/^https?:\/\//i.test(url)) return url;
  return `https://${url}`;
}

function getStylePreset({
  fontFamily,
  fontSize,
  lineSpacing,
  colorTheme,
}: {
  fontFamily: "geist" | "inter" | "serif";
  fontSize: "sm" | "md" | "lg";
  lineSpacing: "normal" | "relaxed" | "loose";
  colorTheme: "slate" | "indigo" | "emerald";
}) {
  const fontMap = {
    geist: "var(--font-geist-sans), system-ui, -apple-system, sans-serif",
    inter: "Inter, var(--font-geist-sans), system-ui, sans-serif",
    serif: "Georgia, 'Times New Roman', serif",
  };

  const sizeMap = {
    sm: "text-[13px]",
    md: "text-[14px]",
    lg: "text-[15px]",
  };

  const lineMap = {
    normal: "leading-5",
    relaxed: "leading-6",
    loose: "leading-7",
  };

  const theme = {
    slate: {
      pill: "rounded-full bg-slate-100 px-3 py-1",
      softPill: "rounded-full bg-slate-50 px-3 py-1 text-slate-700",
      border: "border-slate-200",
      borderLeft: "border-slate-900",
    },
    indigo: {
      pill: "rounded-full bg-indigo-50 px-3 py-1 text-indigo-800",
      softPill: "rounded-full bg-indigo-100 px-3 py-1 text-indigo-900",
      border: "border-indigo-100",
      borderLeft: "border-indigo-600",
    },
    emerald: {
      pill: "rounded-full bg-emerald-50 px-3 py-1 text-emerald-800",
      softPill: "rounded-full bg-emerald-100 px-3 py-1 text-emerald-900",
      border: "border-emerald-100",
      borderLeft: "border-emerald-600",
    },
  } as const;

  return {
    fontFamily: fontMap[fontFamily],
    baseText: clsx(sizeMap[fontSize], lineMap[lineSpacing], "text-slate-900"),
    bodyLine: clsx(sizeMap[fontSize], lineMap[lineSpacing]),
    listLine: clsx(lineMap[lineSpacing]),
    pill: theme[colorTheme].pill,
    softPill: theme[colorTheme].softPill,
    border: theme[colorTheme].border,
    borderLeft: theme[colorTheme].borderLeft,
  };
}

// ============================================
// Classic Template - Traditional serif-based resume
// ============================================
function ClassicTemplate({
  resume,
  density,
  stylePreset,
  sectionOrder,
  headerLayout,
  showDividers,
}: TemplateProps) {
  const pad = density === "compact" ? "p-6" : "p-10";
  const contactLinks = buildContactLinks(resume.personal);
  const isCenter = headerLayout === "center";
  const isSplit = headerLayout === "split";

  const renderSection = (key: string) => {
    switch (key) {
      case "summary":
        if (!resume.summary) return null;
        return (
          <div
            key={key}
            className={clsx(
              "pb-4",
              showDividers && "border-b border-slate-300"
            )}
          >
            <h2 className="mb-2 text-sm font-bold uppercase tracking-widest text-slate-700">
              Professional Summary
            </h2>
            <p className={clsx("text-slate-700 italic", stylePreset.bodyLine)}>
              {resume.summary}
            </p>
          </div>
        );
      case "experience":
        if (!resume.experience.length) return null;
        return (
          <div
            key={key}
            className={clsx(
              "pb-4",
              showDividers && "border-b border-slate-300"
            )}
          >
            <h2 className="mb-3 text-sm font-bold uppercase tracking-widest text-slate-700">
              Professional Experience
            </h2>
            <div className="space-y-4">
              {resume.experience.map((exp) => (
                <div key={exp.id}>
                  <div className="flex justify-between">
                    <div>
                      <p className="font-bold text-slate-900">{exp.title}</p>
                      <p className="text-slate-600">{exp.company}</p>
                    </div>
                    <p className="text-sm text-slate-500">
                      {exp.startDate} – {exp.endDate || "Present"}
                    </p>
                  </div>
                  <ul className="mt-2 space-y-1">
                    {exp.bullets.map((b, idx) => (
                      <li
                        key={idx}
                        className="flex gap-2 text-sm text-slate-700"
                      >
                        <span>•</span>
                        <span>{b}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </div>
        );
      case "skills":
        if (!resume.skills.length) return null;
        return (
          <div
            key={key}
            className={clsx(
              "pb-4",
              showDividers && "border-b border-slate-300"
            )}
          >
            <h2 className="mb-2 text-sm font-bold uppercase tracking-widest text-slate-700">
              Skills & Expertise
            </h2>
            <div className="space-y-2">
              {resume.skills.map((group) => (
                <p key={group.label} className="text-sm text-slate-700">
                  <span className="font-semibold">{group.label}:</span>{" "}
                  {group.items.join(", ")}
                </p>
              ))}
            </div>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div
      className={clsx(
        "max-w-3xl bg-white font-serif",
        stylePreset.baseText,
        pad
      )}
      style={{ fontFamily: "Georgia, 'Times New Roman', serif" }}
    >
      {/* Header */}
      <header
        className={clsx(
          "mb-6 pb-4",
          showDividers && "border-b-2 border-slate-900",
          isSplit ? "flex items-start justify-between" : ""
        )}
      >
        <div className={clsx(isCenter && "text-center", isSplit && "w-[60%]")}>
          <h1 className="text-3xl font-bold tracking-tight text-slate-900">
            {resume.personal.name}
          </h1>
          <p className="mt-1 text-lg text-slate-600">{resume.personal.title}</p>
        </div>
        {contactLinks.length > 0 && (
          <div
            className={clsx(
              "mt-2 text-sm text-slate-600",
              isCenter ? "text-center" : "",
              isSplit && "w-[40%] text-right"
            )}
          >
            {contactLinks.map((item) =>
              item.href ? (
                <a
                  key={item.label}
                  href={item.href}
                  className="block hover:text-slate-900 hover:underline"
                  rel="noreferrer"
                  target={item.href.startsWith("http") ? "_blank" : undefined}
                >
                  {item.label}
                </a>
              ) : (
                <span key={item.label} className="block">
                  {item.label}
                </span>
              )
            )}
          </div>
        )}
      </header>

      {/* Content */}
      <div className="space-y-4">
        {sectionOrder
          .filter((s) => s.enabled && s.key !== "personal")
          .map((section) => renderSection(section.key))}
      </div>
    </div>
  );
}

// ============================================
// Executive Template - Bold and commanding
// ============================================
function ExecutiveTemplate({
  resume,
  density,
  stylePreset,
  sectionOrder,
  headerLayout,
  showDividers,
}: TemplateProps) {
  const pad = density === "compact" ? "p-6" : "p-10";
  const contactLinks = buildContactLinks(resume.personal);
  const isCenter = headerLayout === "center";
  const isSplit = headerLayout === "split";

  const renderSection = (key: string) => {
    switch (key) {
      case "summary":
        if (!resume.summary) return null;
        return (
          <div
            key={key}
            className={clsx(
              "pb-5",
              showDividers && "border-b border-slate-200"
            )}
          >
            <h2 className="mb-3 text-xs font-bold uppercase tracking-[0.2em] text-slate-500">
              Executive Summary
            </h2>
            <p
              className={clsx(
                "text-slate-700 leading-relaxed",
                stylePreset.bodyLine
              )}
            >
              {resume.summary}
            </p>
          </div>
        );
      case "experience":
        if (!resume.experience.length) return null;
        return (
          <div
            key={key}
            className={clsx(
              "pb-5",
              showDividers && "border-b border-slate-200"
            )}
          >
            <h2 className="mb-4 text-xs font-bold uppercase tracking-[0.2em] text-slate-500">
              Professional Experience
            </h2>
            <div className="space-y-5">
              {resume.experience.map((exp) => (
                <div key={exp.id}>
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <p className="text-lg font-bold text-slate-900">
                        {exp.title}
                      </p>
                      <p className="font-semibold text-slate-700">
                        {exp.company}
                      </p>
                    </div>
                    <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-600">
                      {exp.startDate} – {exp.endDate || "Present"}
                    </span>
                  </div>
                  <ul className="mt-3 space-y-2">
                    {exp.bullets.map((b, idx) => (
                      <li
                        key={idx}
                        className="flex gap-3 text-sm text-slate-600"
                      >
                        <span className="text-slate-400">▸</span>
                        <span>{b}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </div>
        );
      case "skills":
        if (!resume.skills.length) return null;
        return (
          <div
            key={key}
            className={clsx(
              "pb-5",
              showDividers && "border-b border-slate-200"
            )}
          >
            <h2 className="mb-4 text-xs font-bold uppercase tracking-[0.2em] text-slate-500">
              Core Competencies
            </h2>
            <div className="grid grid-cols-2 gap-4">
              {resume.skills.map((group) => (
                <div key={group.label} className="rounded-lg bg-slate-50 p-3">
                  <p className="mb-1 text-xs font-bold uppercase text-slate-600">
                    {group.label}
                  </p>
                  <p className="text-sm text-slate-700">
                    {group.items.join(" • ")}
                  </p>
                </div>
              ))}
            </div>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div
      className={clsx("max-w-3xl bg-white", stylePreset.baseText, pad)}
      style={{ fontFamily: stylePreset.fontFamily }}
    >
      {/* Header with accent bar */}
      <header className="mb-8">
        <div
          className={clsx(
            isSplit ? "flex items-end justify-between" : "",
            isCenter && "text-center"
          )}
        >
          <div className={isSplit ? "w-[60%]" : ""}>
            <h1 className="text-4xl font-black tracking-tight text-slate-900">
              {resume.personal.name}
            </h1>
            <p className="mt-2 text-xl font-light text-slate-600">
              {resume.personal.title}
            </p>
          </div>
          {contactLinks.length > 0 && (
            <div
              className={clsx(
                "mt-4 text-sm",
                isCenter && "flex justify-center gap-4",
                isSplit && "w-[40%] text-right"
              )}
            >
              {contactLinks.map((item) =>
                item.href ? (
                  <a
                    key={item.label}
                    href={item.href}
                    className={clsx(
                      "text-slate-600 hover:text-slate-900",
                      !isCenter && "block"
                    )}
                    rel="noreferrer"
                    target={item.href.startsWith("http") ? "_blank" : undefined}
                  >
                    {item.label}
                  </a>
                ) : (
                  <span
                    key={item.label}
                    className={clsx("text-slate-600", !isCenter && "block")}
                  >
                    {item.label}
                  </span>
                )
              )}
            </div>
          )}
        </div>
        <div className="mt-4 h-1 w-20 bg-slate-900" />
      </header>

      {/* Content */}
      <div className="space-y-6">
        {sectionOrder
          .filter((s) => s.enabled && s.key !== "personal")
          .map((section) => renderSection(section.key))}
      </div>
    </div>
  );
}

// ============================================
// Creative Template - Modern and colorful
// ============================================
function CreativeTemplate({
  resume,
  density,
  stylePreset,
  sectionOrder,
  headerLayout,
  showDividers,
}: TemplateProps) {
  const pad = density === "compact" ? "p-5" : "p-8";
  const contactLinks = buildContactLinks(resume.personal);
  const isCenter = headerLayout === "center";
  const isSplit = headerLayout === "split";

  const renderSection = (key: string) => {
    switch (key) {
      case "summary":
        if (!resume.summary) return null;
        return (
          <div
            key={key}
            className={clsx(
              "pb-4",
              showDividers && "border-b-2 border-dashed border-violet-200"
            )}
          >
            <h2 className="mb-2 inline-block rounded-full bg-violet-100 px-4 py-1 text-xs font-bold uppercase tracking-wide text-violet-700">
              About Me
            </h2>
            <p className={clsx("mt-2 text-slate-600", stylePreset.bodyLine)}>
              {resume.summary}
            </p>
          </div>
        );
      case "experience":
        if (!resume.experience.length) return null;
        return (
          <div
            key={key}
            className={clsx(
              "pb-4",
              showDividers && "border-b-2 border-dashed border-violet-200"
            )}
          >
            <h2 className="mb-4 inline-block rounded-full bg-emerald-100 px-4 py-1 text-xs font-bold uppercase tracking-wide text-emerald-700">
              Experience
            </h2>
            <div className="space-y-4">
              {resume.experience.map((exp, idx) => (
                <div
                  key={exp.id}
                  className="relative pl-4 before:absolute before:left-0 before:top-0 before:h-full before:w-1 before:rounded-full"
                  style={{
                    ["--tw-before-bg" as string]:
                      idx % 2 === 0 ? "#8b5cf6" : "#10b981",
                  }}
                >
                  <div className="relative pl-4 before:absolute before:left-0 before:top-0 before:h-full before:w-1 before:rounded-full before:bg-linear-to-b before:from-violet-500 before:to-emerald-500">
                    <p className="font-bold text-slate-900">{exp.title}</p>
                    <p className="text-sm text-slate-500">
                      {exp.company} • {exp.startDate} –{" "}
                      {exp.endDate || "Present"}
                    </p>
                    <ul className="mt-2 space-y-1">
                      {exp.bullets.map((b, i) => (
                        <li key={i} className="text-sm text-slate-600">
                          → {b}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              ))}
            </div>
          </div>
        );
      case "skills":
        if (!resume.skills.length) return null;
        return (
          <div key={key}>
            <h2 className="mb-3 inline-block rounded-full bg-amber-100 px-4 py-1 text-xs font-bold uppercase tracking-wide text-amber-700">
              Skills
            </h2>
            <div className="flex flex-wrap gap-2">
              {resume.skills.flatMap((group, groupIndex) =>
                group.items.map((skill, skillIndex) => (
                  <span
                    key={`${group.label}-${groupIndex}-${skillIndex}`}
                    className="rounded-full bg-linear-to-r from-violet-100 to-emerald-100 px-3 py-1 text-sm font-medium text-slate-700"
                  >
                    {skill}
                  </span>
                ))
              )}
            </div>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div
      className={clsx("max-w-3xl bg-white", stylePreset.baseText, pad)}
      style={{ fontFamily: stylePreset.fontFamily }}
    >
      {/* Header with gradient accent */}
      <header
        className={clsx(
          "mb-8 rounded-2xl bg-linear-to-r from-violet-500 via-purple-500 to-emerald-500 p-6 text-white",
          isSplit && "flex items-center justify-between"
        )}
      >
        <div className={clsx(isCenter && "text-center", isSplit && "w-[60%]")}>
          <h1 className="text-3xl font-black">{resume.personal.name}</h1>
          <p className="mt-1 text-lg opacity-90">{resume.personal.title}</p>
        </div>
        {contactLinks.length > 0 && (
          <div
            className={clsx(
              "mt-3 text-sm opacity-90",
              isCenter && "text-center",
              isSplit && "w-[40%] text-right"
            )}
          >
            {contactLinks.map((item) =>
              item.href ? (
                <a
                  key={item.label}
                  href={item.href}
                  className="block hover:underline"
                  rel="noreferrer"
                  target={item.href.startsWith("http") ? "_blank" : undefined}
                >
                  {item.label}
                </a>
              ) : (
                <span key={item.label} className="block">
                  {item.label}
                </span>
              )
            )}
          </div>
        )}
      </header>

      {/* Content */}
      <div className="space-y-5">
        {sectionOrder
          .filter((s) => s.enabled && s.key !== "personal")
          .map((section) => renderSection(section.key))}
      </div>
    </div>
  );
}

// ============================================
// Tech Template - Clean developer-focused
// ============================================
function TechTemplate({
  resume,
  density,
  stylePreset,
  sectionOrder,
  headerLayout,
  showDividers,
}: TemplateProps) {
  const pad = density === "compact" ? "p-5" : "p-8";
  const contactLinks = buildContactLinks(resume.personal);
  const isCenter = headerLayout === "center";
  const isSplit = headerLayout === "split";

  const renderSection = (key: string) => {
    switch (key) {
      case "summary":
        if (!resume.summary) return null;
        return (
          <div
            key={key}
            className={clsx(
              "rounded-lg bg-slate-900 p-4 text-slate-100",
              showDividers && "border-l-4 border-cyan-500"
            )}
          >
            <p className="font-mono text-sm">
              <span className="text-cyan-400">{"//"} </span>
              {resume.summary}
            </p>
          </div>
        );
      case "experience":
        if (!resume.experience.length) return null;
        return (
          <div key={key} className="space-y-4">
            <h2 className="flex items-center gap-2 font-mono text-sm font-bold text-slate-900">
              <span className="text-cyan-600">&lt;</span>
              Experience
              <span className="text-cyan-600">/&gt;</span>
            </h2>
            {resume.experience.map((exp) => (
              <div
                key={exp.id}
                className={clsx(
                  "rounded-lg border border-slate-200 p-4",
                  showDividers && "border-l-4 border-l-cyan-500"
                )}
              >
                <div className="flex justify-between">
                  <div>
                    <p className="font-bold text-slate-900">{exp.title}</p>
                    <p className="font-mono text-sm text-slate-500">
                      @{exp.company}
                    </p>
                  </div>
                  <code className="rounded bg-slate-100 px-2 py-1 text-xs text-slate-600">
                    {exp.startDate} → {exp.endDate || "now"}
                  </code>
                </div>
                <ul className="mt-3 space-y-1">
                  {exp.bullets.map((b, idx) => (
                    <li
                      key={idx}
                      className="flex gap-2 font-mono text-sm text-slate-600"
                    >
                      <span className="text-cyan-500">→</span>
                      <span>{b}</span>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        );
      case "skills":
        if (!resume.skills.length) return null;
        return (
          <div key={key}>
            <h2 className="mb-3 flex items-center gap-2 font-mono text-sm font-bold text-slate-900">
              <span className="text-cyan-600">&lt;</span>
              Tech Stack
              <span className="text-cyan-600">/&gt;</span>
            </h2>
            <div className="flex flex-wrap gap-2">
              {resume.skills.flatMap((group, groupIndex) =>
                group.items.map((skill, skillIndex) => (
                  <code
                    key={`${group.label}-${groupIndex}-${skillIndex}`}
                    className="rounded bg-slate-900 px-3 py-1 text-sm text-cyan-400"
                  >
                    {skill}
                  </code>
                ))
              )}
            </div>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div
      className={clsx("max-w-3xl bg-white", stylePreset.baseText, pad)}
      style={{ fontFamily: "ui-monospace, SFMono-Regular, monospace" }}
    >
      {/* Header */}
      <header
        className={clsx(
          "mb-6 rounded-lg bg-slate-900 p-6",
          isSplit && "flex items-center justify-between"
        )}
      >
        <div className={clsx(isCenter && "text-center", isSplit && "w-[60%]")}>
          <h1 className="text-2xl font-bold text-white">
            <span className="text-cyan-400">const</span> developer ={" "}
            <span className="text-emerald-400">
              &quot;{resume.personal.name}&quot;
            </span>
          </h1>
          <p className="mt-1 font-mono text-slate-400">
            {"//"} {resume.personal.title}
          </p>
        </div>
        {contactLinks.length > 0 && (
          <div
            className={clsx(
              "mt-3 font-mono text-sm",
              isCenter && "text-center",
              isSplit && "w-[40%] text-right"
            )}
          >
            {contactLinks.map((item) =>
              item.href ? (
                <a
                  key={item.label}
                  href={item.href}
                  className="block text-cyan-400 hover:text-cyan-300"
                  rel="noreferrer"
                  target={item.href.startsWith("http") ? "_blank" : undefined}
                >
                  {item.label}
                </a>
              ) : (
                <span key={item.label} className="block text-slate-400">
                  {item.label}
                </span>
              )
            )}
          </div>
        )}
      </header>

      {/* Content */}
      <div className="space-y-5">
        {sectionOrder
          .filter((s) => s.enabled && s.key !== "personal")
          .map((section) => renderSection(section.key))}
      </div>
    </div>
  );
}
