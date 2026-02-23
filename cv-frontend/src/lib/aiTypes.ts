import type { CVSection } from '@/lib/types';

export type AILanguage = 'vi' | 'en' | 'ja' | 'ko' | 'zh';

export interface AIScoreInsightRequest {
  cvId?: string;
  cvData: unknown;
  jobDescription?: string;
  targetRole?: string;
  language?: AILanguage;
}

export interface AIScoreBreakdownItem {
  criterion:
    | 'technical_skills'
    | 'experience_projects'
    | 'measurable_results'
    | 'ats_presentation'
    | string;
  weight: number;
  score: number;
  note: string;
}

export interface AISectionFeedback {
  section: string;
  issue: string;
  suggestion: string;
}

export interface AIScoreInsightResponse {
  score: number;
  score_breakdown: AIScoreBreakdownItem[];
  improvements: string[];
  missing_keywords: string[];
  section_feedback: AISectionFeedback[];
  creditsSpent: number;
  feature: 'score-insight';
  userId?: string;
}

export interface AIOptimizeBulletRequest {
  field?: string;
  text?: string;
  targetRole?: string;
  keywords?: string[];
  sectionId?: string;
  sectionData?: unknown;
  jobTitle?: string;
  language?: AILanguage;
}

export interface AIOptimizeBulletResponse {
  field: string | null;
  before: string | null;
  after: string | null;
  keywords_used: string[];
  ats_safe: boolean;
  suggested_section: Partial<CVSection> | null;
  summary: string;
  creditsSpent: number;
  feature: 'optimize-bullet';
  userId?: string;
}

export interface AIChatAssistantRequest {
  message: string;
  cvData: unknown;
  language?: AILanguage;
}

export interface AIChatOperation {
  op: 'add_item' | 'update_field' | 'remove_item' | 'rewrite_section' | 'translate_section' | string;
  section: string;
  path: string | null;
  data: Record<string, unknown> | null;
}

export interface AIChatAssistantResponse {
  message: string;
  operations: AIChatOperation[];
  updated_cv: Record<string, unknown> | null;
  creditsSpent: number;
  feature: 'chat-assistant';
  userId?: string;
}

export interface AIApiError {
  message: string;
  statusCode?: number;
}
