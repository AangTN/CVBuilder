import { ModernTemplate } from "./ModernTemplate";
import { ClassicSplitTemplate } from "./ClassicSplitTemplate";
import { TechTerminalTemplate } from "./TechTerminalTemplate";
import { ElectricGradientTemplate } from "./ElectricGradientTemplate";
import { NeonPulseTemplate } from "./NeonPulseTemplate";
import { ScholarEliteTemplate } from "./ScholarEliteTemplate";
import {
  MODERN_SAMPLE_DATA,
  CLASSIC_SPLIT_SAMPLE_DATA,
  TECH_TERMINAL_SAMPLE_DATA,
  ELECTRIC_GRADIENT_SAMPLE_DATA,
  NEON_PULSE_SAMPLE_DATA,
  SCHOLAR_ELITE_SAMPLE_DATA,
} from "./sampleData";
import { CVData } from "@/lib/types";

export interface TemplateRegistryItem {
  id: string;
  name: string;
  component: React.ComponentType<{ data: CVData; previewMode?: boolean }>;
  sampleData: CVData;
  description: string;
  category: 'modern' | 'classic' | 'tech' | 'creative' | 'academic';
  featured?: boolean;
}

export const TEMPLATE_REGISTRY: Record<string, TemplateRegistryItem> = {
  "c24aa22b-194a-404a-a9d4-9626e58b8f7b": {
    id: "c24aa22b-194a-404a-a9d4-9626e58b8f7b",
    name: "Modern Minimalist",
    component: ModernTemplate,
    sampleData: MODERN_SAMPLE_DATA,
    description: "Modern minimalist layout with clean design",
    category: 'modern',
    featured: true,
  },
  "7c8883a7-d0c9-435a-a8c8-9aa75d1f1165": {
    id: "7c8883a7-d0c9-435a-a8c8-9aa75d1f1165",
    name: "The Classic Split",
    component: ClassicSplitTemplate,
    sampleData: CLASSIC_SPLIT_SAMPLE_DATA,
    description: "Classic split layout with a dark sidebar and clean timeline",
    category: 'classic',
  },
  "d0535d74-e3cb-453d-b4fb-224ed0084632": {
    id: "d0535d74-e3cb-453d-b4fb-224ed0084632",
    name: "The Tech Terminal",
    component: TechTerminalTemplate,
    sampleData: TECH_TERMINAL_SAMPLE_DATA,
    description: "Command-line inspired CV with mono font and terminal styling",
    category: 'tech',
  },
  "b043cc09-d9e3-4579-a08c-c7eaac82b26b": {
    id: "b043cc09-d9e3-4579-a08c-c7eaac82b26b",
    name: "Electric Gradient",
    component: ElectricGradientTemplate,
    sampleData: ELECTRIC_GRADIENT_SAMPLE_DATA,
    description: "Bold gradient flow with modern visual rhythm and artistic impact",
    category: 'creative',
    featured: true,
  },
  "ffa13d75-13e4-47c2-a583-5b988f43650a": {
    id: "ffa13d75-13e4-47c2-a583-5b988f43650a",
    name: "Neon Pulse",
    component: NeonPulseTemplate,
    sampleData: NEON_PULSE_SAMPLE_DATA,
    description: "Dark neon energy with bold tech personality and strong visual impact",
    category: 'creative',
    featured: true,
  },
  "7a24c891-6f61-44c7-be80-34c84372e387": {
    id: "7a24c891-6f61-44c7-be80-34c84372e387",
    name: "The Scholar Elite",
    component: ScholarEliteTemplate,
    sampleData: SCHOLAR_ELITE_SAMPLE_DATA,
    description: "Academic-first layout for scholarships, RA/TA applications, and research profiles",
    category: 'academic',
    featured: true,
  }
};

export function getTemplate(templateId: string): TemplateRegistryItem | null {
  return TEMPLATE_REGISTRY[templateId] || null;
}

export function getAllTemplates(): TemplateRegistryItem[] {
  return Object.values(TEMPLATE_REGISTRY);
}
