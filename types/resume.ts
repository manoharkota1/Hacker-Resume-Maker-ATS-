export type SkillCategory = "technical" | "tools" | "languages" | "soft";

export type SkillGroup = {
  label: string;
  items: string[];
};

export type ExperienceItem = {
  id: string;
  title: string;
  company: string;
  startDate: string;
  endDate: string;
  bullets: string[];
};

export type EducationItem = {
  id: string;
  school: string;
  degree: string;
  startDate: string;
  endDate: string;
};

export type ProjectItem = {
  id: string;
  name: string;
  description: string;
  link?: string;
};

export type CertificationItem = {
  id: string;
  name: string;
  issuer: string;
  year: string;
};

export type AchievementItem = {
  id: string;
  description: string;
};

export type InternshipItem = {
  id: string;
  title: string;
  organization: string;
  startDate: string;
  endDate: string;
  bullets: string[];
};

export type VolunteerItem = {
  id: string;
  organization: string;
  role: string;
  year: string;
  bullets: string[];
};

export type PublicationItem = {
  id: string;
  title: string;
  outlet: string;
  year: string;
  link?: string;
};

export type CustomSectionItem = {
  id: string;
  content: string;
};

export type CustomSection = {
  id: string;
  title: string;
  items: CustomSectionItem[];
};

export type SectionOrderItem = {
  id: string;
  key: string;
  label: string;
  icon: string;
  enabled: boolean;
};

export type Resume = {
  personal: {
    name: string;
    title: string;
    email: string;
    phone: string;
    location: string;
    linkedin: string;
    github: string;
    portfolio: string;
  };
  summary: string;
  skills: SkillGroup[];
  experience: ExperienceItem[];
  education: EducationItem[];
  projects: ProjectItem[];
  certifications: CertificationItem[];
  achievements: AchievementItem[];
  internships: InternshipItem[];
  volunteering: VolunteerItem[];
  publications: PublicationItem[];
  customSections: CustomSection[];
};

export const defaultResume: Resume = {
  personal: {
    name: "Alex Candidate",
    title: "Product-Focused Full-Stack Engineer",
    email: "alex@example.com",
    phone: "(555) 123-4567",
    location: "Remote / SF Bay Area",
    linkedin: "linkedin.com/in/example",
    github: "github.com/example",
    portfolio: "example.dev",
  },
  summary:
    "Full-stack engineer with 5+ years building data-rich web apps. Strong in TypeScript, React, and systems thinking; known for clear execution and measurable impact.",
  skills: [
    {
      label: "Technical",
      items: ["TypeScript", "React", "Next.js", "Node.js", "PostgreSQL"],
    },
    { label: "Tools", items: ["Git", "Playwright", "Vercel", "Docker"] },
    { label: "Languages", items: ["JavaScript", "TypeScript", "SQL"] },
    { label: "Soft", items: ["Mentorship", "Roadmapping", "Stakeholder mgmt"] },
  ],
  experience: [
    {
      id: "exp-1",
      title: "Senior Software Engineer",
      company: "Acme Corp",
      startDate: "2022",
      endDate: "Present",
      bullets: [
        "Led migration to Next.js App Router, improving TTFB by 35%",
        "Shipped ATS scoring prototype that increased applicant throughput by 18%",
      ],
    },
  ],
  education: [
    {
      id: "edu-1",
      school: "State University",
      degree: "B.S. Computer Science",
      startDate: "2016",
      endDate: "2020",
    },
  ],
  projects: [
    {
      id: "proj-1",
      name: "Smart Resume Builder",
      description:
        "AI-assisted resume builder with ATS scoring and template system.",
      link: "https://example.dev",
    },
  ],
  certifications: [
    { id: "cert-1", name: "AWS SAA", issuer: "Amazon", year: "2023" },
  ],
  achievements: [
    { id: "ach-1", description: "Mentored 4 junior engineers to promotion" },
  ],
  internships: [
    {
      id: "int-1",
      title: "Software Engineering Intern",
      organization: "Beta Labs",
      startDate: "Summer 2021",
      endDate: "Summer 2021",
      bullets: ["Prototyped dashboard widgets in React/TypeScript."],
    },
  ],
  volunteering: [
    {
      id: "vol-1",
      organization: "Open Source Collective",
      role: "Contributor",
      year: "2023",
      bullets: ["Maintained documentation and resolved community issues."],
    },
  ],
  publications: [
    {
      id: "pub-1",
      title: "Designing ATS-friendly resumes",
      outlet: "Tech Careers Blog",
      year: "2024",
      link: "https://example.dev/ats",
    },
  ],
  customSections: [],
};

export const defaultSectionOrder: SectionOrderItem[] = [
  {
    id: "s1",
    key: "personal",
    label: "Personal Info",
    icon: "user",
    enabled: true,
  },
  {
    id: "s2",
    key: "summary",
    label: "Summary",
    icon: "sparkles",
    enabled: true,
  },
  { id: "s3", key: "skills", label: "Skills", icon: "cube", enabled: true },
  {
    id: "s4",
    key: "experience",
    label: "Experience",
    icon: "briefcase",
    enabled: true,
  },
  {
    id: "s5",
    key: "internships",
    label: "Internships",
    icon: "academic",
    enabled: true,
  },
  {
    id: "s6",
    key: "volunteering",
    label: "Volunteering",
    icon: "heart",
    enabled: true,
  },
  {
    id: "s7",
    key: "publications",
    label: "Publications",
    icon: "document",
    enabled: true,
  },
];
