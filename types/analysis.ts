export type SectionScore = {
  label: string;
  score: number;
  suggestions: string[];
};

export type AtsResult = {
  baseScore: number;
  matchScore?: number;
  sections: SectionScore[];
  missingKeywords?: string[];
  suggestions: string[];
};
