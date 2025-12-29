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
  const [isMounted, setIsMounted] = useState(false);
  const sidebarRef = useRef<HTMLDivElement>(null);

  // Fix hydration error
  useEffect(() => {
    setIsMounted(true);
  }, []);

  // Store state
  const resume = useResumeStore((s) => s.resume);
  const template = useResumeStore((s) => s.template);
  const fontFamily = useResumeStore((s) => s.fontFamily);
  const density = useResumeStore((s) => s.density);
  const headerLayout = useResumeStore((s) => s.headerLayout);
  const showDividers = useResumeStore((s) => s.showDividers);
  const colorTheme = useResumeStore((s) => s.colorTheme);
  const sectionOrder = useResumeStore((s) => s.sectionOrder);
  const sidebarWidth = useResumeStore((s) => s.sidebarWidth);
  const setTemplate = useResumeStore((s) => s.setTemplate);
  const setFontFamily = useResumeStore((s) => s.setFontFamily);
  const setDensity = useResumeStore((s) => s.setDensity);
  const setHeaderLayout = useResumeStore((s) => s.setHeaderLayout);
  const setShowDividers = useResumeStore((s) => s.setShowDividers);
  const setColorTheme = useResumeStore((s) => s.setColorTheme);
  const reorderSections = useResumeStore((s) => s.reorderSections);
  const setSidebarWidth = useResumeStore((s) => s.setSidebarWidth);
  const addCustomSection = useResumeStore((s) => s.addCustomSection);

  // Template access control: logged-out users can only use Modern
  useEffect(() => {
    if (!authLoading && !isAuthenticated && template !== "modern") {
      setTemplate("modern");
    }
  }, [authLoading, isAuthenticated, template, setTemplate]);

  const allTemplateOptions = [
    { value: "modern", label: "Modern", locked: false },
    { value: "classic", label: "Classic", locked: !isAuthenticated },
    { value: "executive", label: "Executive", locked: !isAuthenticated },
    { value: "creative", label: "Creative", locked: !isAuthenticated },
    { value: "tech", label: "Tech", locked: !isAuthenticated },
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
    <div className="flex h-screen h-[100dvh] flex-col bg-slate-50">
      {/* Top Navbar */}
      <header className="z-40 flex h-14 md:h-16 shrink-0 items-center justify-between bg-white px-3 sm:px-4 md:px-6 shadow-sm border-b border-slate-200">
        <Link href="/" className="flex items-center transition-transform hover:scale-[1.02] active:scale-[0.98]">
          <HackoraLogo size="sm" />
        </Link>

        {/* Template & Theme Controls in Navbar */}
        <div className="hidden items-center gap-0.5 xl:gap-1 lg:flex">
          <NavDropdown
            label="Template"
            value={
              template === "modern"
                ? "Modern"
                : template === "classic"
                ? "Classic"
                : template === "executive"
                ? "Executive"
                : template === "creative"
                ? "Creative"
                : "Tech"
            }
            options={allTemplateOptions}
            onChange={(v) => {
              const next = v as
                | "modern"
                | "classic"
                | "executive"
                | "creative"
                | "tech";
              const option = allTemplateOptions.find(opt => opt.value === next);
              if (option?.locked) {
                setShowLoginModal(true);
                return;
              }
              setTemplate(next);
            }}
            showLocks={true}
          />
          
          {/* Common: Header Layout */}
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

          {/* Modern: Lines, Font, Density */}
          {template === "modern" && (
            <>
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
            </>
          )}

          {/* Classic: Lines, Font */}
          {template === "classic" && (
            <>
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
            </>
          )}

          {/* Executive (Amazon): Lines, Density */}
          {template === "executive" && (
            <>
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
                label="Density"
                value={density === "cozy" ? "Cozy" : "Compact"}
                options={[
                  { value: "cozy", label: "Cozy" },
                  { value: "compact", label: "Compact" },
                ]}
                onChange={(v) => setDensity(v as "cozy" | "compact")}
              />
            </>
          )}

          {/* Creative (Meta): Theme/Color */}
          {template === "creative" && (
            <NavDropdown
              label="Theme"
              value={colorTheme.charAt(0).toUpperCase() + colorTheme.slice(1)}
              options={[
                { value: "slate", label: "Slate" },
                { value: "indigo", label: "Indigo" },
                { value: "emerald", label: "Emerald" },
              ]}
              onChange={(v) => setColorTheme(v as "slate" | "indigo" | "emerald")}
            />
          )}

          {/* Tech: Lines */}
          {template === "tech" && (
            <NavDropdown
              label="Lines"
              value={showDividers ? "Yes" : "No"}
              options={[
                { value: "yes", label: "Yes" },
                { value: "no", label: "No" },
              ]}
              onChange={(v) => setShowDividers(v === "yes")}
            />
          )}
        </div>

        {/* Export & Mobile Toggle */}
        <div className="flex items-center gap-1.5 sm:gap-2">
          {/* Save to Cloud Button */}
          {isAuthenticated && (
            <button
              onClick={handleSaveToCloud}
              disabled={saving}
              className={`hidden px-3 md:px-4 py-2 text-xs font-semibold transition-all duration-200 sm:flex items-center gap-1.5 ${
                saveSuccess
                  ? "bg-emerald-600 text-white"
                  : "bg-slate-900 text-white hover:bg-slate-800"
              }`}
            >
              {saving ? (
                <><svg className="h-3.5 w-3.5 animate-spin" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}><circle cx="12" cy="12" r="10" className="opacity-25" /><path d="M4 12a8 8 0 018-8" className="opacity-75" /></svg> Saving...</>
              ) : saveSuccess ? (
                <><svg className="h-3.5 w-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}><path d="M5 13l4 4L19 7" /></svg> Saved!</>
              ) : (
                <><svg className="h-3.5 w-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}><path d="M19 21H5a2 2 0 01-2-2V5a2 2 0 012-2h11l5 5v11a2 2 0 01-2 2z" /><path d="M17 21v-8H7v8" /><path d="M7 3v5h8" /></svg> Save</>
              )}
            </button>
          )}
          <button
            onClick={handleExportPDF}
            className="hidden bg-slate-100 hover:bg-slate-200 px-3 md:px-4 py-2 text-xs font-semibold text-slate-700 transition-all duration-200 sm:flex items-center gap-1.5 border border-slate-200 hover:border-slate-300"
          >
            <svg className="h-3.5 w-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}><path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z" /><path d="M14 2v6h6" /><path d="M12 18v-6" /><path d="M9 15l3 3 3-3" /></svg>
            PDF
          </button>
          <button
            onClick={handleExportDOCX}
            className="hidden bg-slate-900 hover:bg-slate-800 px-3 md:px-4 py-2 text-xs font-semibold text-white transition-all duration-200 sm:flex items-center gap-1.5"
          >
            <svg className="h-3.5 w-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}><path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z" /><path d="M14 2v6h6" /><path d="M12 18v-6" /><path d="M9 15l3 3 3-3" /></svg>
            DOCX
          </button>

          {/* Auth Buttons */}
          {!authLoading &&
            (isAuthenticated ? (
              <div className="hidden items-center gap-1.5 sm:flex">
                <Link
                  href="/dashboard"
                  className="bg-emerald-50 hover:bg-emerald-100 px-3 md:px-4 py-2 text-xs font-semibold text-emerald-700 transition-all duration-200 flex items-center gap-1.5 border border-emerald-200"
                >
                  <svg className="h-3.5 w-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}><path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z" /><path d="M9 22V12h6v10" /></svg>
                  Dashboard
                </Link>
                <button
                  onClick={() => logout()}
                  className="bg-slate-100 hover:bg-slate-200 px-3 py-2 text-xs font-semibold text-slate-600 transition-all duration-200 border border-slate-200"
                >
                  Logout
                </button>
              </div>
            ) : (
              <button
                onClick={() => setShowLoginModal(true)}
                className="hidden bg-slate-900 hover:bg-slate-800 px-4 py-2 text-xs font-semibold text-white transition-all duration-200 sm:flex items-center gap-1.5"
              >
                <svg className="h-3.5 w-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}><path d="M15 3h4a2 2 0 012 2v14a2 2 0 01-2 2h-4" /><path d="M10 17l5-5-5-5" /><path d="M15 12H3" /></svg>
                Login
              </button>
            ))}

          <button
            onClick={() =>
              setMobileView(mobileView === "edit" ? "preview" : "edit")
            }
            className="bg-slate-900 px-4 py-2.5 text-xs font-semibold text-white lg:hidden flex items-center gap-1.5 active:scale-[0.98] transition-all"
          >
            {mobileView === "edit" ? (
              <><svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" /><circle cx="12" cy="12" r="3" /></svg> Preview</>
            ) : (
              <><svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}><path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7" /><path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z" /></svg> Edit</>
            )}
          </button>
        </div>
      </header>

      {/* Mobile Template Controls */}
      <div className="flex flex-wrap items-center gap-1.5 bg-white px-3 py-2.5 border-b border-slate-200 lg:hidden">
        <div className="flex items-center gap-1.5 flex-shrink-0">
          <MobileSelect
            value={template}
            onChange={(v) => {
              const next = v as
                | "modern"
                | "classic"
                | "executive"
                | "creative"
                | "tech";
              const option = allTemplateOptions.find(opt => opt.value === next);
              if (option?.locked) {
                setShowLoginModal(true);
                return;
              }
              setTemplate(next);
            }}
            options={allTemplateOptions}
            showLocks={true}
          />
          
          {/* Common: Header Layout */}
          <MobileSelect
            value={headerLayout}
            onChange={(v) => setHeaderLayout(v as "left" | "center" | "split")}
            options={[
              { value: "left", label: "Left" },
              { value: "center", label: "Center" },
              { value: "split", label: "Split" },
            ]}
          />

          {/* Modern: Lines, Font, Density */}
          {template === "modern" && (
            <>
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
                value={density}
                onChange={(v) => setDensity(v as "cozy" | "compact")}
                options={[
                  { value: "cozy", label: "Cozy" },
                  { value: "compact", label: "Compact" },
                ]}
              />
            </>
          )}

          {/* Classic: Lines, Font */}
          {template === "classic" && (
            <>
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
            </>
          )}

          {/* Executive: Lines, Density */}
          {template === "executive" && (
            <>
              <MobileSelect
                value={showDividers ? "yes" : "no"}
                onChange={(v) => setShowDividers(v === "yes")}
                options={[
                  { value: "yes", label: "Lines" },
                  { value: "no", label: "No Lines" },
                ]}
              />
              <MobileSelect
                value={density}
                onChange={(v) => setDensity(v as "cozy" | "compact")}
                options={[
                  { value: "cozy", label: "Cozy" },
                  { value: "compact", label: "Compact" },
                ]}
              />
            </>
          )}

          {/* Creative: Theme */}
          {template === "creative" && (
            <MobileSelect
              value={colorTheme}
              onChange={(v) => setColorTheme(v as "slate" | "indigo" | "emerald")}
              options={[
                { value: "slate", label: "Slate" },
                { value: "indigo", label: "Indigo" },
                { value: "emerald", label: "Emerald" },
              ]}
            />
          )}

          {/* Tech: Lines */}
          {template === "tech" && (
            <MobileSelect
              value={showDividers ? "yes" : "no"}
              onChange={(v) => setShowDividers(v === "yes")}
              options={[
                { value: "yes", label: "Lines" },
                { value: "no", label: "No Lines" },
              ]}
            />
          )}
        </div>
        <div className="flex items-center gap-1.5 flex-shrink-0 pl-1.5 border-l border-slate-200">
          {isAuthenticated && (
            <button
              onClick={handleSaveToCloud}
              disabled={saving}
              className={`px-2.5 py-1.5 text-xs font-semibold flex items-center gap-1 transition-all ${
                saveSuccess
                  ? "bg-emerald-600 text-white"
                  : "bg-slate-900 text-white"
              }`}
            >
              {saving ? <span className="animate-pulse">...</span> : saveSuccess ? "✓" : <svg className="h-3.5 w-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}><path d="M19 21H5a2 2 0 01-2-2V5a2 2 0 012-2h11l5 5v11a2 2 0 01-2 2z" /></svg>}
            </button>
          )}
          <button
            onClick={handleExportPDF}
            className="bg-slate-100 border border-slate-200 px-2.5 py-1.5 text-xs font-semibold text-slate-700 transition-all active:scale-95"
          >
            PDF
          </button>
          <button
            onClick={handleExportDOCX}
            className="bg-slate-900 px-2.5 py-1.5 text-xs font-semibold text-white transition-all active:scale-95"
          >
            DOCX
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex flex-1 overflow-hidden">
        {/* Left Sidebar - Full Width on Mobile */}
        <aside
          ref={sidebarRef}
          style={isMounted && window.innerWidth >= 1024 ? { width: sidebarWidth } : undefined}
          className={`relative flex flex-col overflow-hidden bg-white border-r border-slate-200 transition-all duration-200 ${
            mobileView === "preview"
              ? "hidden lg:flex lg:w-auto"
              : "flex w-full lg:w-auto"
          }`}
        >
          {/* Sidebar Tabs */}
          <div className="flex bg-slate-50 border-b border-slate-200">
            <button
              onClick={() => setSidebarTab("edit")}
              className={`flex-1 flex items-center justify-center gap-2 px-4 py-3.5 text-sm font-semibold transition-all duration-200 relative ${
                sidebarTab === "edit"
                  ? "text-emerald-700 bg-white"
                  : "text-slate-500 hover:text-slate-700 hover:bg-slate-100"
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
              <span className="hidden sm:inline">Edit Resume</span>
              <span className="sm:hidden">Edit</span>
              {sidebarTab === "edit" && (
                <span className="absolute bottom-0 left-1/2 -translate-x-1/2 w-12 h-0.5 bg-emerald-500" />
              )}
            </button>
            <button
              onClick={() => setSidebarTab("ats")}
              className={`flex-1 flex items-center justify-center gap-2 px-4 py-3.5 text-sm font-semibold transition-all duration-200 relative ${
                sidebarTab === "ats"
                  ? "text-emerald-700 bg-white"
                  : "text-slate-500 hover:text-slate-700 hover:bg-slate-100"
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
              <span className="hidden sm:inline">ATS Score</span>
              <span className="sm:hidden">ATS</span>
              {sidebarTab === "ats" && (
                <span className="absolute bottom-0 left-1/2 -translate-x-1/2 w-12 h-0.5 bg-emerald-500" />
              )}
            </button>
          </div>

          {/* Tab Content */}
          {sidebarTab === "edit" && (
            <>
              {/* Add Custom Section Button */}
              <div className="p-3 sm:p-4 bg-slate-50">
                <button
                  onClick={() => addCustomSection("Custom Section")}
                  className="w-full border-2 border-dashed border-slate-300 py-3 text-sm font-semibold text-slate-600 transition-all duration-200 hover:border-emerald-400 hover:bg-emerald-50 hover:text-emerald-700 flex items-center justify-center gap-2 group"
                >
                  <svg className="h-4 w-4 text-slate-400 group-hover:text-emerald-500 transition-colors" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}><path d="M12 5v14M5 12h14" /></svg>
                  Add Custom Section
                </button>
                <p className="mt-2.5 text-center text-xs text-slate-400 flex items-center justify-center gap-1">
                  <svg className="h-3 w-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}><path d="M7 16V4m0 0L3 8m4-4l4 4M17 8v12m0 0l4-4m-4 4l-4-4" /></svg>
                  Drag sections to reorder
                </p>
              </div>

              <div className="flex-1 overflow-y-auto scrollbar-hide">
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
            <div className="flex-1 overflow-y-auto p-3 sm:p-4 bg-slate-50">
              <ATSAnalyzerV2 />
            </div>
          )}

          {/* Resize Handle */}
          <div
            onMouseDown={handleMouseDown}
            className="absolute right-0 top-0 z-10 hidden h-full w-1.5 cursor-ew-resize bg-transparent hover:bg-emerald-400/50 transition-all lg:block group"
            style={{ opacity: isResizing ? 1 : undefined }}
          >
            <div className="absolute right-0 top-1/2 -translate-y-1/2 w-1 h-8 bg-slate-300 group-hover:bg-emerald-500 transition-colors" />
          </div>
        </aside>

        {/* Right Panel - Live Preview */}
        <main
          className={`flex-1 overflow-auto bg-slate-200/50 ${
            mobileView === "edit" ? "hidden lg:block" : "block"
          }`}
        >
          <div className="flex justify-center min-h-full py-6 px-4">
            <div className="animate-fade-in">
              <ResumePreview />
            </div>
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
      className={`border-b border-slate-100 transition-all duration-200 ${
        isDragging ? "opacity-50 bg-emerald-50 scale-[0.98]" : ""
      }`}
    >
      <button
        onClick={onToggle}
        className="flex w-full items-center justify-between px-3 sm:px-4 py-3.5 text-left transition-all duration-200 hover:bg-slate-50/80 group"
      >
        <div className="flex items-center gap-2.5 sm:gap-3">
          {/* Drag Handle - only show if draggable */}
          {canDrag ? (
            <div className="flex cursor-grab items-center text-slate-300 group-hover:text-slate-400 transition-colors">
              <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 20 20">
                <path d="M7 2a2 2 0 1 0 0 4 2 2 0 0 0 0-4zM7 8a2 2 0 1 0 0 4 2 2 0 0 0 0-4zM7 14a2 2 0 1 0 0 4 2 2 0 0 0 0-4zM13 2a2 2 0 1 0 0 4 2 2 0 0 0 0-4zM13 8a2 2 0 1 0 0 4 2 2 0 0 0 0-4zM13 14a2 2 0 1 0 0 4 2 2 0 0 0 0-4z" />
              </svg>
            </div>
          ) : (
            <div className="w-4" />
          )}
          {/* Order Number */}
          <span className="flex h-6 w-6 items-center justify-center bg-slate-100 text-xs font-bold text-slate-600">
            {index + 1}
          </span>
          <span className="text-emerald-600">
            <SectionIcon name={icon} className="h-5 w-5" />
          </span>
          <span className="text-sm font-semibold text-slate-800">{label}</span>
        </div>
        <svg
          className={`h-4 w-4 text-slate-400 transition-transform duration-300 ${
            isOpen ? "rotate-180 text-emerald-500" : ""
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
        className={`transition-all duration-300 ease-out ${
          isOpen
            ? "max-h-[70vh] opacity-100"
            : "max-h-0 opacity-0 overflow-hidden"
        }`}
      >
        <div className="bg-slate-50 px-3 sm:px-4 pb-4 pt-2 max-h-[calc(70vh-60px)] overflow-y-auto">
          {children}
          <button
            onClick={onSave}
            className="mt-5 w-full bg-slate-900 py-3 text-sm font-semibold text-white transition-all duration-200 hover:bg-slate-800 flex items-center justify-center gap-2 active:scale-[0.98]"
          >
            Save & Continue
            <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}><path d="M9 5l7 7-7 7" /></svg>
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
  showLocks = false,
}: {
  label: string;
  value: string;
  options: { value: string; label: string; locked?: boolean }[];
  onChange: (value: string) => void;
  showLocks?: boolean;
}) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        onBlur={() => setTimeout(() => setIsOpen(false), 150)}
        className="flex items-center gap-1.5 px-2.5 xl:px-3 py-2 text-xs font-medium text-slate-600 transition-all duration-200 hover:bg-slate-100 hover:text-slate-900"
      >
        <span className="text-slate-400 hidden xl:inline">{label}:</span>
        <span className="text-slate-800 font-semibold">{value}</span>
        <svg
          className={`h-3 w-3 text-slate-400 transition-transform duration-200 ${
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
        <div className="absolute right-0 top-full z-50 mt-1.5 min-w-36 overflow-hidden bg-white py-1.5 shadow-lg ring-1 ring-black/5 animate-fade-in">
          {options.map((opt) => (
            <button
              key={opt.value}
              onClick={() => {
                onChange(opt.value);
                setIsOpen(false);
              }}
              className={`block w-full px-3.5 py-2 text-left text-xs transition-all duration-150 hover:bg-slate-50 ${
                value === opt.label
                  ? "bg-emerald-50 font-semibold text-emerald-700"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              <span className="flex items-center justify-between gap-2">
                <span className="flex items-center gap-2">
                  {value === opt.label && (
                    <svg className="h-3 w-3 text-emerald-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={3}><path d="M5 13l4 4L19 7" /></svg>
                  )}
                  {opt.label}
                </span>
                {showLocks && opt.locked && (
                  <svg className="h-3.5 w-3.5 text-slate-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
                    <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/>
                    <path d="M7 11V7a5 5 0 0110 0v4"/>
                  </svg>
                )}
              </span>
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
  showLocks = false,
}: {
  value: string;
  options: { value: string; label: string; locked?: boolean }[];
  onChange: (value: string) => void;
  showLocks?: boolean;
}) {
  return (
    <select
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className="bg-slate-100 border border-slate-200 px-2.5 py-2 text-xs font-semibold text-slate-700 outline-none appearance-none cursor-pointer transition-all duration-200 hover:bg-slate-200 focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-400"
      style={{ backgroundImage: `url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='%236b7280' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='M6 8l4 4 4-4'/%3e%3c/svg%3e")`, backgroundPosition: 'right 0.25rem center', backgroundRepeat: 'no-repeat', backgroundSize: '1.25em 1.25em', paddingRight: '1.75rem' }}
    >
      {options.map((opt) => (
        <option key={opt.value} value={opt.value}>
          {opt.label}{showLocks && opt.locked ? ' 🔒' : ''}
        </option>
      ))}
    </select>
  );
}
