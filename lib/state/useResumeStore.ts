"use client";

import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import { nanoid } from "nanoid";
import { AtsResult } from "@/types/analysis";
import {
  Resume,
  defaultResume,
  ExperienceItem,
  SkillGroup,
  InternshipItem,
  VolunteerItem,
  PublicationItem,
  SectionOrderItem,
  defaultSectionOrder,
  CustomSection,
} from "@/types/resume";

export type TemplateId =
  | "modern"
  | "classic"
  | "executive"
  | "creative"
  | "tech";
type FontFamily = "geist" | "inter" | "serif" | "roboto" | "source";
type FontSize = "sm" | "md" | "lg";
type LineSpacing = "normal" | "relaxed" | "loose";
type ColorTheme = "slate" | "indigo" | "emerald";
type HeaderLayout = "left" | "center" | "split";

type ResumeState = {
  showDividers: boolean;
  resume: Resume;
  jobDescription: string;
  template: TemplateId;
  density: "cozy" | "compact";
  fontFamily: FontFamily;
  fontSize: FontSize;
  lineSpacing: LineSpacing;
  colorTheme: ColorTheme;
  headerLayout: HeaderLayout;
  sectionOrder: SectionOrderItem[];
  sidebarWidth: number;
  analysis?: AtsResult;
  isAnalyzing: boolean;
  setResume: (next: Resume) => void;
  setJobDescription: (text: string) => void;
  setTemplate: (id: TemplateId) => void;
  setDensity: (mode: "cozy" | "compact") => void;
  setFontFamily: (font: FontFamily) => void;
  setFontSize: (size: FontSize) => void;
  setLineSpacing: (spacing: LineSpacing) => void;
  setColorTheme: (theme: ColorTheme) => void;
  setHeaderLayout: (layout: HeaderLayout) => void;
  setShowDividers: (show: boolean) => void;
  setSectionOrder: (order: SectionOrderItem[]) => void;
  setSidebarWidth: (width: number) => void;
  reorderSections: (fromIndex: number, toIndex: number) => void;
  toggleSectionEnabled: (key: string) => void;
  updatePersonal: (key: keyof Resume["personal"], value: string) => void;
  updateSummary: (value: string) => void;
  updateSkillGroup: (
    index: number,
    updater: (group: SkillGroup) => SkillGroup
  ) => void;
  addSkillGroup: (label: string) => void;
  removeSkillGroup: (index: number) => void;
  addExperience: () => void;
  updateExperience: (
    id: string,
    updater: (exp: ExperienceItem) => ExperienceItem
  ) => void;
  removeExperience: (id: string) => void;
  addInternship: () => void;
  updateInternship: (
    id: string,
    updater: (item: InternshipItem) => InternshipItem
  ) => void;
  removeInternship: (id: string) => void;
  addVolunteer: () => void;
  updateVolunteer: (
    id: string,
    updater: (item: VolunteerItem) => VolunteerItem
  ) => void;
  removeVolunteer: (id: string) => void;
  addPublication: () => void;
  updatePublication: (
    id: string,
    updater: (item: PublicationItem) => PublicationItem
  ) => void;
  removePublication: (id: string) => void;
  addCustomSection: (title: string) => void;
  updateCustomSection: (id: string, title: string) => void;
  removeCustomSection: (id: string) => void;
  addCustomSectionItem: (sectionId: string) => void;
  updateCustomSectionItem: (
    sectionId: string,
    itemId: string,
    content: string
  ) => void;
  removeCustomSectionItem: (sectionId: string, itemId: string) => void;
  clearPersonal: () => void;
  clearSummary: () => void;
  clearSkills: () => void;
  clearExperience: () => void;
  clearInternships: () => void;
  clearVolunteering: () => void;
  clearPublications: () => void;
  clearCustomSection: (sectionId: string) => void;
  setAnalysis: (data: AtsResult | undefined) => void;
  setAnalyzing: (flag: boolean) => void;
  reset: () => void;
};

type PersistedState = Pick<
  ResumeState,
  | "resume"
  | "jobDescription"
  | "template"
  | "density"
  | "fontFamily"
  | "fontSize"
  | "lineSpacing"
  | "colorTheme"
  | "headerLayout"
  | "showDividers"
  | "sectionOrder"
  | "sidebarWidth"
>;

const memoryStorage: Storage = {
  getItem: () => null,
  setItem: () => void 0,
  removeItem: () => void 0,
  clear: () => void 0,
  key: () => null,
  length: 0,
};

const safeStorage = createJSONStorage<PersistedState>(() =>
  typeof window === "undefined" ? memoryStorage : localStorage
);

export const useResumeStore = create<ResumeState>()(
  persist(
    (set) => ({
      resume: defaultResume,
      jobDescription: "",
      template: "modern",
      density: "cozy",
      fontFamily: "geist",
      fontSize: "md",
      lineSpacing: "relaxed",
      colorTheme: "slate",
      headerLayout: "left",
      showDividers: true,
      sectionOrder: defaultSectionOrder,
      sidebarWidth: 380,
      analysis: undefined,
      isAnalyzing: false,
      setResume: (next: Resume) => set({ resume: next }),
      setJobDescription: (text: string) => set({ jobDescription: text }),
      setTemplate: (id: TemplateId) => set({ template: id }),
      setDensity: (mode: "cozy" | "compact") => set({ density: mode }),
      setFontFamily: (font: FontFamily) => set({ fontFamily: font }),
      setFontSize: (size: FontSize) => set({ fontSize: size }),
      setLineSpacing: (spacing: LineSpacing) => set({ lineSpacing: spacing }),
      setColorTheme: (theme: ColorTheme) => set({ colorTheme: theme }),
      setHeaderLayout: (layout: HeaderLayout) => set({ headerLayout: layout }),
      setShowDividers: (show: boolean) => set({ showDividers: show }),
      setSectionOrder: (order: SectionOrderItem[]) =>
        set({ sectionOrder: order }),
      setSidebarWidth: (width: number) => set({ sidebarWidth: width }),
      reorderSections: (fromIndex: number, toIndex: number) =>
        set((state) => {
          const newOrder = [...state.sectionOrder];
          const [removed] = newOrder.splice(fromIndex, 1);
          newOrder.splice(toIndex, 0, removed);
          return { sectionOrder: newOrder };
        }),
      toggleSectionEnabled: (key: string) =>
        set((state) => ({
          sectionOrder: state.sectionOrder.map((s) =>
            s.key === key ? { ...s, enabled: !s.enabled } : s
          ),
        })),
      updatePersonal: (key: keyof Resume["personal"], value: string) =>
        set((state) => ({
          resume: {
            ...state.resume,
            personal: { ...state.resume.personal, [key]: value },
          },
        })),
      updateSummary: (value: string) =>
        set((state) => ({
          resume: { ...state.resume, summary: value },
        })),
      updateSkillGroup: (
        index: number,
        updater: (group: SkillGroup) => SkillGroup
      ) =>
        set((state) => {
          const next = [...state.resume.skills];
          if (!next[index]) return {} as ResumeState;
          next[index] = updater(next[index]);
          return { resume: { ...state.resume, skills: next } };
        }),
      addSkillGroup: (label: string) =>
        set((state) => ({
          resume: {
            ...state.resume,
            skills: [...state.resume.skills, { label, items: [] }],
          },
        })),
      removeSkillGroup: (index: number) =>
        set((state) => {
          const next = [...state.resume.skills];
          next.splice(index, 1);
          return { resume: { ...state.resume, skills: next } };
        }),
      addExperience: () =>
        set((state) => ({
          resume: {
            ...state.resume,
            experience: [
              ...state.resume.experience,
              {
                id: nanoid(6),
                title: "",
                company: "",
                startDate: "",
                endDate: "",
                bullets: [""],
              },
            ],
          },
        })),
      updateExperience: (
        id: string,
        updater: (exp: ExperienceItem) => ExperienceItem
      ) =>
        set((state) => ({
          resume: {
            ...state.resume,
            experience: state.resume.experience.map((exp) =>
              exp.id === id ? updater(exp) : exp
            ),
          },
        })),
      removeExperience: (id: string) =>
        set((state) => ({
          resume: {
            ...state.resume,
            experience: state.resume.experience.filter((exp) => exp.id !== id),
          },
        })),
      addInternship: () =>
        set((state) => ({
          resume: {
            ...state.resume,
            internships: [
              ...state.resume.internships,
              {
                id: nanoid(6),
                title: "",
                organization: "",
                startDate: "",
                endDate: "",
                bullets: [""],
              },
            ],
          },
        })),
      updateInternship: (
        id: string,
        updater: (item: InternshipItem) => InternshipItem
      ) =>
        set((state) => ({
          resume: {
            ...state.resume,
            internships: state.resume.internships.map((item) =>
              item.id === id ? updater(item) : item
            ),
          },
        })),
      removeInternship: (id: string) =>
        set((state) => ({
          resume: {
            ...state.resume,
            internships: state.resume.internships.filter(
              (item) => item.id !== id
            ),
          },
        })),
      addVolunteer: () =>
        set((state) => ({
          resume: {
            ...state.resume,
            volunteering: [
              ...state.resume.volunteering,
              {
                id: nanoid(6),
                organization: "",
                role: "",
                year: "",
                bullets: [""],
              },
            ],
          },
        })),
      updateVolunteer: (
        id: string,
        updater: (item: VolunteerItem) => VolunteerItem
      ) =>
        set((state) => ({
          resume: {
            ...state.resume,
            volunteering: state.resume.volunteering.map((item) =>
              item.id === id ? updater(item) : item
            ),
          },
        })),
      removeVolunteer: (id: string) =>
        set((state) => ({
          resume: {
            ...state.resume,
            volunteering: state.resume.volunteering.filter(
              (item) => item.id !== id
            ),
          },
        })),
      addPublication: () =>
        set((state) => ({
          resume: {
            ...state.resume,
            publications: [
              ...state.resume.publications,
              { id: nanoid(6), title: "", outlet: "", year: "", link: "" },
            ],
          },
        })),
      updatePublication: (
        id: string,
        updater: (item: PublicationItem) => PublicationItem
      ) =>
        set((state) => ({
          resume: {
            ...state.resume,
            publications: state.resume.publications.map((item) =>
              item.id === id ? updater(item) : item
            ),
          },
        })),
      removePublication: (id: string) =>
        set((state) => ({
          resume: {
            ...state.resume,
            publications: state.resume.publications.filter(
              (item) => item.id !== id
            ),
          },
        })),
      addCustomSection: (title: string) =>
        set((state) => {
          const newSection: CustomSection = {
            id: nanoid(6),
            title,
            items: [{ id: nanoid(6), content: "" }],
          };
          const newSectionOrder: SectionOrderItem = {
            id: nanoid(6),
            key: `custom-${newSection.id}`,
            label: title,
            icon: "📌",
            enabled: true,
          };
          return {
            resume: {
              ...state.resume,
              customSections: [...state.resume.customSections, newSection],
            },
            sectionOrder: [...state.sectionOrder, newSectionOrder],
          };
        }),
      updateCustomSection: (id: string, title: string) =>
        set((state) => ({
          resume: {
            ...state.resume,
            customSections: state.resume.customSections.map((s) =>
              s.id === id ? { ...s, title } : s
            ),
          },
          sectionOrder: state.sectionOrder.map((s) =>
            s.key === `custom-${id}` ? { ...s, label: title } : s
          ),
        })),
      removeCustomSection: (id: string) =>
        set((state) => ({
          resume: {
            ...state.resume,
            customSections: state.resume.customSections.filter(
              (s) => s.id !== id
            ),
          },
          sectionOrder: state.sectionOrder.filter(
            (s) => s.key !== `custom-${id}`
          ),
        })),
      addCustomSectionItem: (sectionId: string) =>
        set((state) => ({
          resume: {
            ...state.resume,
            customSections: state.resume.customSections.map((s) =>
              s.id === sectionId
                ? { ...s, items: [...s.items, { id: nanoid(6), content: "" }] }
                : s
            ),
          },
        })),
      updateCustomSectionItem: (
        sectionId: string,
        itemId: string,
        content: string
      ) =>
        set((state) => ({
          resume: {
            ...state.resume,
            customSections: state.resume.customSections.map((s) =>
              s.id === sectionId
                ? {
                    ...s,
                    items: s.items.map((i) =>
                      i.id === itemId ? { ...i, content } : i
                    ),
                  }
                : s
            ),
          },
        })),
      removeCustomSectionItem: (sectionId: string, itemId: string) =>
        set((state) => ({
          resume: {
            ...state.resume,
            customSections: state.resume.customSections.map((s) =>
              s.id === sectionId
                ? { ...s, items: s.items.filter((i) => i.id !== itemId) }
                : s
            ),
          },
        })),
      clearPersonal: () =>
        set((state) => ({
          resume: {
            ...state.resume,
            personal: {
              name: "",
              title: "",
              email: "",
              phone: "",
              location: "",
              linkedin: "",
              github: "",
              portfolio: "",
            },
          },
        })),
      clearSummary: () =>
        set((state) => ({
          resume: { ...state.resume, summary: "" },
        })),
      clearSkills: () =>
        set((state) => ({
          resume: { ...state.resume, skills: [] },
        })),
      clearExperience: () =>
        set((state) => ({
          resume: { ...state.resume, experience: [] },
        })),
      clearInternships: () =>
        set((state) => ({
          resume: { ...state.resume, internships: [] },
        })),
      clearVolunteering: () =>
        set((state) => ({
          resume: { ...state.resume, volunteering: [] },
        })),
      clearPublications: () =>
        set((state) => ({
          resume: { ...state.resume, publications: [] },
        })),
      clearCustomSection: (sectionId: string) =>
        set((state) => ({
          resume: {
            ...state.resume,
            customSections: state.resume.customSections.map((s) =>
              s.id === sectionId ? { ...s, items: [] } : s
            ),
          },
        })),
      setAnalysis: (data: AtsResult | undefined) => set({ analysis: data }),
      setAnalyzing: (flag: boolean) => set({ isAnalyzing: flag }),
      reset: () =>
        set({
          resume: defaultResume,
          jobDescription: "",
          analysis: undefined,
          sectionOrder: defaultSectionOrder,
        }),
    }),
    {
      name: "resume-builder-store",
      storage: safeStorage,
      partialize: (state) => ({
        resume: state.resume,
        jobDescription: state.jobDescription,
        template: state.template,
        density: state.density,
        fontFamily: state.fontFamily,
        fontSize: state.fontSize,
        lineSpacing: state.lineSpacing,
        colorTheme: state.colorTheme,
        headerLayout: state.headerLayout,
        showDividers: state.showDividers,
        sectionOrder: state.sectionOrder,
        sidebarWidth: state.sidebarWidth,
      }),
      skipHydration: true,
    }
  )
);
