"use client";

import { useState, ReactNode, useRef, useCallback, useEffect } from "react";
import Link from "next/link";
import { HackoraLogo } from "@/components/HackoraLogo";
import { SectionIcon } from "@/components/SectionIcon";
import { PersonalSection } from "@/components/builder/PersonalSection";
import { SummarySection } from "@/components/builder/SummarySection";
import { SkillsSection } from "@/components/builder/SkillsSection";
import { ExperienceSection } from "@/components/builder/ExperienceSection";
import { ResumePreview } from "@/components/builder/ResumePreview";
import { InternshipsSection } from "@/components/builder/InternshipsSection";
import { VolunteeringSection } from "@/components/builder/VolunteeringSection";
import { PublicationsSection } from "@/components/builder/PublicationsSection";
import { CustomSectionEditor } from "@/components/builder/CustomSection";
import { ATSAnalyzerV2 } from "@/components/builder/ATSAnalyzerV2";
import { LoginModal } from "@/components/auth/LoginModal";
import { useAuth } from "@/lib/appwrite/auth";
import { useResumeStore } from "@/lib/state/useResumeStore";
import { useResumeStorage } from "@/lib/appwrite/hooks";
import { exportToPDF, exportToDOCX } from "@/lib/export/exportResume";

export default function Home() {
  const { isAuthenticated, logout, loading: authLoading } = useAuth();
  const { saveResume } = useResumeStorage();
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [saving, setSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [openSection, setOpenSection] = useState<string | null>("personal");
  const [mobileView, setMobileView] = useState<"edit" | "preview">("edit");
  const [sidebarTab, setSidebarTab] = useState<"edit" | "ai" | "ats">("edit");
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);
  const [isResizing, setIsResizing] = useState(false);
  const sidebarRef = useRef<HTMLDivElement>(null);

  // Store state
  const resume = useResumeStore((s) => s.resume);
  const template = useResumeStore((s) => s.template);
  const fontFamily = useResumeStore((s) => s.fontFamily);
  const density = useResumeStore((s) => s.density);
  const headerLayout = useResumeStore((s) => s.headerLayout);
  const showDividers = useResumeStore((s) => s.showDividers);
  const sectionOrder = useResumeStore((s) => s.sectionOrder);
  const sidebarWidth = useResumeStore((s) => s.sidebarWidth);
  const setTemplate = useResumeStore((s) => s.setTemplate);
  const setFontFamily = useResumeStore((s) => s.setFontFamily);
  const setDensity = useResumeStore((s) => s.setDensity);
  const setHeaderLayout = useResumeStore((s) => s.setHeaderLayout);
  const setShowDividers = useResumeStore((s) => s.setShowDividers);
  const reorderSections = useResumeStore((s) => s.reorderSections);
  const setSidebarWidth = useResumeStore((s) => s.setSidebarWidth);
  const addCustomSection = useResumeStore((s) => s.addCustomSection);

  // Template access control: logged-out users can only use Modern
  useEffect(() => {
    if (!authLoading && !isAuthenticated && template !== "modern") {
      setTemplate("modern");
    }
  }, [authLoading, isAuthenticated, template, setTemplate]);

  const allowedTemplateOptions = !isAuthenticated
    ? [{ value: "modern", label: "Modern" }]
    : [
        { value: "modern", label: "Modern" },
        { value: "minimal", label: "Minimal" },
        { value: "classic", label: "Classic" },
        { value: "executive", label: "Executive" },
        { value: "creative", label: "Creative" },
        { value: "tech", label: "Tech" },
      ];

  const toggleSection = (key: string) => {
    setOpenSection(openSection === key ? null : key);
  };

  const handleSaveSection = () => {
    if (openSection) {
      const enabledSections = sectionOrder.filter((s) => s.enabled);
      const currentIdx = enabledSections.findIndex(
        (s) => s.key === openSection
      );
      if (currentIdx < enabledSections.length - 1) {
        setOpenSection(enabledSections[currentIdx + 1].key);
      } else {
        setOpenSection(null);
      }
    }
  };

  // Drag and drop handlers
  const handleDragStart = (index: number) => {
    setDraggedIndex(index);
  };

  const handleDragOver = (e: React.DragEvent, index: number) => {
    e.preventDefault();
    if (draggedIndex !== null && draggedIndex !== index) {
      reorderSections(draggedIndex, index);
      setDraggedIndex(index);
    }
  };

  const handleDragEnd = () => {
    setDraggedIndex(null);
  };

  // Resize handler
  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    setIsResizing(true);
  }, []);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!isResizing) return;
      const newWidth = Math.min(Math.max(280, e.clientX), 600);
      setSidebarWidth(newWidth);
    };

    const handleMouseUp = () => {
      setIsResizing(false);
    };

    if (isResizing) {
      document.addEventListener("mousemove", handleMouseMove);
      document.addEventListener("mouseup", handleMouseUp);
    }

    return () => {
      document.removeEventListener("mousemove", handleMouseMove);
      document.removeEventListener("mouseup", handleMouseUp);
    };
  }, [isResizing, setSidebarWidth]);

  const renderSectionContent = (key: string) => {
    if (key.startsWith("custom-")) {
      const customId = key.replace("custom-", "");
      const section = resume.customSections.find((s) => s.id === customId);
      if (section) return <CustomSectionEditor section={section} />;
      return null;
    }
    switch (key) {
      case "personal":
        return <PersonalSection />;
      case "summary":
        return <SummarySection />;
      case "skills":
        return <SkillsSection />;
      case "experience":
        return <ExperienceSection />;
      case "internships":
        return <InternshipsSection />;
      case "volunteering":
        return <VolunteeringSection />;
      case "publications":
        return <PublicationsSection />;
      default:
        return null;
    }
  };

  const handleExportPDF = () => {
    exportToPDF(resume);
  };

  const handleExportDOCX = () => {
    exportToDOCX(resume);
  };

  const handleSaveToCloud = async () => {
    if (!isAuthenticated) {
      setShowLoginModal(true);
      return;
    }

    setSaving(true);
    setSaveSuccess(false);
    try {
      const title = resume.personal.name
        ? `${resume.personal.name}'s Resume`
        : resume.personal.title
        ? `${resume.personal.title} Resume`
        : "My Resume";
      await saveResume(resume, title);
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
    } catch (err) {
      console.error("Failed to save:", err);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="flex h-screen flex-col bg-slate-50">
      {/* Top Navbar */}
      <header className="z-40 flex h-14 shrink-0 items-center justify-between bg-white px-4 shadow-sm">
        <Link href="/" className="flex items-center">
          <HackoraLogo size="sm" />
        </Link>

        {/* Template & Theme Controls in Navbar */}
        <div className="hidden items-center gap-1 lg:flex">
          <NavDropdown
            label="Template"
            value={
              template === "modern"
                ? "Modern"
                : template === "minimal"
                ? "Minimal"
                : template === "classic"
                ? "Classic"
                : template === "executive"
                ? "Executive"
                : template === "creative"
                ? "Creative"
                : "Tech"
            }
            options={allowedTemplateOptions}
            onChange={(v) => {
              const next = v as
                | "modern"
                | "minimal"
                | "classic"
                | "executive"
                | "creative"
                | "tech";
              if (!isAuthenticated && next !== "modern") {
                setShowLoginModal(true);
                return;
              }
              setTemplate(next);
            }}
          />
          <NavDropdown
            label="Lines"
            value={showDividers ? "Yes" : "No"}
            options={[
              { value: "yes", label: "Yes" },
              { value: "no", label: "No" },
            ]}
            onChange={(v) => setShowDividers(v === "yes")}
          />
          <NavDropdown
            label="Font"
            value={fontFamily.charAt(0).toUpperCase() + fontFamily.slice(1)}
            options={[
              { value: "geist", label: "Geist" },
              { value: "inter", label: "Inter" },
              { value: "serif", label: "Serif" },
            ]}
            onChange={(v) => setFontFamily(v as "geist" | "inter" | "serif")}
          />
          <NavDropdown
            label="Density"
            value={density === "cozy" ? "Cozy" : "Compact"}
            options={[
              { value: "cozy", label: "Cozy" },
              { value: "compact", label: "Compact" },
            ]}
            onChange={(v) => setDensity(v as "cozy" | "compact")}
          />
          <NavDropdown
            label="Header"
            value={
              headerLayout === "left"
                ? "Left"
                : headerLayout === "center"
                ? "Center"
                : "Split"
            }
            options={[
              { value: "left", label: "Left" },
              { value: "center", label: "Center" },
              { value: "split", label: "Split" },
            ]}
            onChange={(v) => setHeaderLayout(v as "left" | "center" | "split")}
          />
        </div>

        {/* Export & Mobile Toggle */}
        <div className="flex items-center gap-2">
          {/* Save to Cloud Button */}
          {isAuthenticated && (
            <button
              onClick={handleSaveToCloud}
              disabled={saving}
              className={`hidden rounded-lg px-3 py-1.5 text-xs font-medium transition sm:block ${
                saveSuccess
                  ? "bg-emerald-100 text-emerald-700"
                  : "bg-violet-100 text-violet-700 hover:bg-violet-200"
              }`}
            >
              {saving ? "💾 Saving..." : saveSuccess ? "✓ Saved!" : "💾 Save"}
            </button>
          )}
          <button
            onClick={handleExportPDF}
            className="hidden rounded-lg bg-slate-100 px-3 py-1.5 text-xs font-medium text-slate-700 transition hover:bg-slate-200 sm:block"
          >
            📥 PDF
          </button>
          <button
            onClick={handleExportDOCX}
            className="hidden rounded-lg bg-slate-900 px-3 py-1.5 text-xs font-medium text-white transition hover:bg-slate-800 sm:block"
          >
            📥 DOCX
          </button>

          {/* Auth Buttons */}
          {!authLoading &&
            (isAuthenticated ? (
              <div className="hidden items-center gap-2 sm:flex">
                <Link
                  href="/dashboard"
                  className="rounded-lg bg-violet-50 px-3 py-1.5 text-xs font-medium text-violet-700 transition hover:bg-violet-100"
                >
                  Dashboard
                </Link>
                <button
                  onClick={() => logout()}
                  className="rounded-lg bg-slate-100 px-3 py-1.5 text-xs font-medium text-slate-600 transition hover:bg-slate-200"
                >
                  Logout
                </button>
              </div>
            ) : (
              <button
                onClick={() => setShowLoginModal(true)}
                className="hidden rounded-lg bg-slate-900 px-3 py-1.5 text-xs font-medium text-white transition hover:bg-slate-800 sm:block"
              >
                Login
              </button>
            ))}

          <button
            onClick={() =>
              setMobileView(mobileView === "edit" ? "preview" : "edit")
            }
            className="rounded-lg bg-slate-900 px-3 py-1.5 text-xs font-medium text-white lg:hidden"
          >
            {mobileView === "edit" ? "Preview" : "Edit"}
          </button>
        </div>
      </header>

      {/* Mobile Template Controls */}
      <div className="flex flex-wrap items-center gap-2 bg-white px-4 py-2 shadow-sm lg:hidden">
        <MobileSelect
          value={template}
          onChange={(v) => {
            const next = v as
              | "modern"
              | "minimal"
              | "classic"
              | "executive"
              | "creative"
              | "tech";
            if (!isAuthenticated && next !== "modern") {
              setShowLoginModal(true);
              return;
            }
            setTemplate(next);
          }}
          options={allowedTemplateOptions}
        />
        <MobileSelect
          value={showDividers ? "yes" : "no"}
          onChange={(v) => setShowDividers(v === "yes")}
          options={[
            { value: "yes", label: "Lines" },
            { value: "no", label: "No Lines" },
          ]}
        />
        <MobileSelect
          value={fontFamily}
          onChange={(v) => setFontFamily(v as "geist" | "inter" | "serif")}
          options={[
            { value: "geist", label: "Geist" },
            { value: "inter", label: "Inter" },
            { value: "serif", label: "Serif" },
          ]}
        />
        <MobileSelect
          value={headerLayout}
          onChange={(v) => setHeaderLayout(v as "left" | "center" | "split")}
          options={[
            { value: "left", label: "Left" },
            { value: "center", label: "Center" },
            { value: "split", label: "Split" },
          ]}
        />
        {isAuthenticated && (
          <button
            onClick={handleSaveToCloud}
            disabled={saving}
            className={`rounded-md px-2 py-1.5 text-xs font-medium ${
              saveSuccess
                ? "bg-emerald-100 text-emerald-700"
                : "bg-violet-100 text-violet-700"
            }`}
          >
            {saving ? "..." : saveSuccess ? "✓" : "💾"}
          </button>
        )}
        <button
          onClick={handleExportPDF}
          className="rounded-md bg-slate-100 px-2 py-1.5 text-xs font-medium text-slate-700"
        >
          PDF
        </button>
        <button
          onClick={handleExportDOCX}
          className="rounded-md bg-slate-900 px-2 py-1.5 text-xs font-medium text-white"
        >
          DOCX
        </button>
      </div>

      {/* Main Content */}
      <div className="flex flex-1 overflow-hidden">
        {/* Left Sidebar - Resizable */}
        <aside
          ref={sidebarRef}
          style={{ width: mobileView === "preview" ? 0 : sidebarWidth }}
          className={`relative flex flex-col overflow-hidden bg-white transition-all lg:flex ${
            mobileView === "preview"
              ? "hidden lg:flex"
              : "flex w-full lg:w-auto"
          }`}
        >
          {/* Sidebar Tabs */}
          <div className="flex border-b border-slate-200">
            <button
              onClick={() => setSidebarTab("edit")}
              className={`flex-1 flex items-center justify-center gap-1.5 px-3 py-2.5 text-xs font-medium transition ${
                sidebarTab === "edit"
                  ? "border-b-2 border-violet-600 text-violet-600"
                  : "text-slate-500 hover:text-slate-700"
              }`}
            >
              <svg
                className="h-4 w-4"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth={2}
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7" />
                <path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z" />
              </svg>
              Edit
            </button>
            <button
              onClick={() => setSidebarTab("ats")}
              className={`flex-1 flex items-center justify-center gap-1.5 px-3 py-2.5 text-xs font-medium transition ${
                sidebarTab === "ats"
                  ? "border-b-2 border-violet-600 text-violet-600"
                  : "text-slate-500 hover:text-slate-700"
              }`}
            >
              <svg
                className="h-4 w-4"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth={2}
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M18 20V10" />
                <path d="M12 20V4" />
                <path d="M6 20v-6" />
              </svg>
              ATS
            </button>
          </div>

          {/* Tab Content */}
          {sidebarTab === "edit" && (
            <>
              {/* Add Custom Section Button */}
              <div className="border-b border-slate-100 p-3">
                <button
                  onClick={() => addCustomSection("Custom Section")}
                  className="w-full rounded-lg border border-dashed border-slate-300 py-2 text-xs font-medium text-slate-600 transition hover:border-slate-400 hover:bg-slate-50"
                >
                  + Add Custom Section
                </button>
                <p className="mt-2 text-center text-xs text-slate-400">
                  Drag sections to reorder
                </p>
              </div>

              <div className="flex-1 overflow-y-auto">
                {sectionOrder
                  .filter((s) => s.enabled)
                  .map((section, index) => {
                    const isPersonal = section.key === "personal";
                    return (
                      <AccordionSection
                        key={section.key}
                        index={index}
                        icon={section.icon}
                        label={section.label}
                        isOpen={openSection === section.key}
                        onToggle={() => toggleSection(section.key)}
                        onSave={handleSaveSection}
                        onDragStart={() =>
                          !isPersonal && handleDragStart(index)
                        }
                        onDragOver={(e) =>
                          !isPersonal && handleDragOver(e, index)
                        }
                        onDragEnd={handleDragEnd}
                        isDragging={!isPersonal && draggedIndex === index}
                        draggable={!isPersonal}
                      >
                        {renderSectionContent(section.key)}
                      </AccordionSection>
                    );
                  })}
              </div>
            </>
          )}

          {sidebarTab === "ats" && (
            <div className="flex-1 overflow-y-auto p-4">
              <ATSAnalyzerV2 />
            </div>
          )}

          {/* Resize Handle */}
          <div
            onMouseDown={handleMouseDown}
            className="absolute right-0 top-0 z-10 hidden h-full w-1 cursor-ew-resize bg-slate-200 opacity-0 transition-opacity hover:opacity-100 lg:block"
            style={{ opacity: isResizing ? 1 : undefined }}
          />
        </aside>

        {/* Right Panel - Live Preview */}
        <main
          className={`flex-1 overflow-y-auto bg-slate-100 p-4 lg:p-6 ${
            mobileView === "edit" ? "hidden lg:block" : "block"
          }`}
        >
          <div className="mx-auto max-w-4xl">
            <ResumePreview />
          </div>
        </main>
      </div>

      {/* Login Modal */}
      <LoginModal
        isOpen={showLoginModal}
        onClose={() => setShowLoginModal(false)}
      />
    </div>
  );
}

/* ─────────────────────────────────────────────────────────────────────────────
   Accordion Section Component
   ───────────────────────────────────────────────────────────────────────────── */
function AccordionSection({
  icon,
  label,
  index,
  isOpen,
  onToggle,
  onSave,
  onDragStart,
  onDragOver,
  onDragEnd,
  isDragging,
  draggable = true,
  children,
}: {
  icon: string;
  label: string;
  index: number;
  isOpen: boolean;
  onToggle: () => void;
  onSave: () => void;
  onDragStart: () => void;
  onDragOver: (e: React.DragEvent) => void;
  onDragEnd: () => void;
  isDragging: boolean;
  draggable?: boolean;
  children: ReactNode;
}) {
  const canDrag = draggable !== false;
  return (
    <div
      draggable={canDrag}
      onDragStart={canDrag ? onDragStart : undefined}
      onDragOver={canDrag ? onDragOver : undefined}
      onDragEnd={canDrag ? onDragEnd : undefined}
      className={`border-b border-slate-100 transition-all ${
        isDragging ? "opacity-50 bg-slate-100" : ""
      }`}
    >
      <button
        onClick={onToggle}
        className="flex w-full items-center justify-between px-4 py-3 text-left transition hover:bg-slate-50"
      >
        <div className="flex items-center gap-3">
          {/* Drag Handle - only show if draggable */}
          {canDrag ? (
            <div className="flex cursor-grab items-center text-slate-300 hover:text-slate-500">
              <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 20 20">
                <path d="M7 2a2 2 0 1 0 0 4 2 2 0 0 0 0-4zM7 8a2 2 0 1 0 0 4 2 2 0 0 0 0-4zM7 14a2 2 0 1 0 0 4 2 2 0 0 0 0-4zM13 2a2 2 0 1 0 0 4 2 2 0 0 0 0-4zM13 8a2 2 0 1 0 0 4 2 2 0 0 0 0-4zM13 14a2 2 0 1 0 0 4 2 2 0 0 0 0-4z" />
              </svg>
            </div>
          ) : (
            <div className="w-4" />
          )}
          {/* Order Number */}
          <span className="flex h-5 w-5 items-center justify-center rounded bg-slate-200 text-xs font-semibold text-slate-600">
            {index + 1}
          </span>
          <span className="text-emerald-600">
            <SectionIcon name={icon} className="h-5 w-5" />
          </span>
          <span className="text-sm font-medium text-slate-800">{label}</span>
        </div>
        <svg
          className={`h-4 w-4 text-slate-400 transition-transform duration-200 ${
            isOpen ? "rotate-180" : ""
          }`}
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M19 9l-7 7-7-7"
          />
        </svg>
      </button>
      <div
        className={`transition-all duration-200 ease-in-out ${
          isOpen
            ? "max-h-[70vh] opacity-100"
            : "max-h-0 opacity-0 overflow-hidden"
        }`}
      >
        <div className="bg-slate-50/50 px-4 pb-4 pt-2 max-h-[calc(70vh-60px)] overflow-y-auto">
          {children}
          <button
            onClick={onSave}
            className="mt-4 w-full rounded-lg bg-slate-900 py-2.5 text-sm font-medium text-white transition hover:bg-slate-800"
          >
            Save & Continue →
          </button>
        </div>
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────────────────────────────────────────
   Navbar Dropdown Component
   ───────────────────────────────────────────────────────────────────────────── */
function NavDropdown({
  label,
  value,
  options,
  onChange,
}: {
  label: string;
  value: string;
  options: { value: string; label: string }[];
  onChange: (value: string) => void;
}) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        onBlur={() => setTimeout(() => setIsOpen(false), 150)}
        className="flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-medium text-slate-600 transition hover:bg-slate-100"
      >
        <span className="text-slate-400">{label}:</span>
        <span className="text-slate-800">{value}</span>
        <svg
          className={`h-3 w-3 text-slate-400 transition-transform ${
            isOpen ? "rotate-180" : ""
          }`}
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M19 9l-7 7-7-7"
          />
        </svg>
      </button>
      {isOpen && (
        <div className="absolute right-0 top-full z-50 mt-1 min-w-32 overflow-hidden rounded-lg bg-white py-1 shadow-lg ring-1 ring-black/5">
          {options.map((opt) => (
            <button
              key={opt.value}
              onClick={() => {
                onChange(opt.value);
                setIsOpen(false);
              }}
              className={`block w-full px-3 py-1.5 text-left text-xs transition hover:bg-slate-50 ${
                value === opt.label
                  ? "bg-slate-50 font-medium text-slate-900"
                  : "text-slate-600"
              }`}
            >
              {opt.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

/* ─────────────────────────────────────────────────────────────────────────────
   Mobile Select Component
   ───────────────────────────────────────────────────────────────────────────── */
function MobileSelect({
  value,
  options,
  onChange,
}: {
  value: string;
  options: { value: string; label: string }[];
  onChange: (value: string) => void;
}) {
  return (
    <select
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className="rounded-md bg-slate-100 px-2 py-1.5 text-xs font-medium text-slate-700 outline-none"
    >
      {options.map((opt) => (
        <option key={opt.value} value={opt.value}>
          {opt.label}
        </option>
      ))}
    </select>
  );
}
