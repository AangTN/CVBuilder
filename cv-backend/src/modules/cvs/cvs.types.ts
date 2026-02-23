import { Prisma } from '@prisma/client';

export const SECTION_TYPES = [
  'header',
  'experience',
  'education',
  'skills',
  'projects',
  'languages',
  'custom',
] as const;

export type SectionType = (typeof SECTION_TYPES)[number];

export interface CreateCvDto {
  template_id: string;
  name?: string;
  language?: string;
  settings?: Prisma.InputJsonValue;
  sections: Array<{
    section_type: string;
    title: string;
    is_visible?: boolean;
    items: Array<{
      content: unknown;
      position?: number;
    }>;
  }>;
}

export interface UpdateCvDto extends Partial<CreateCvDto> {
  status?: 'active' | 'deleted';
}

export interface ExportCvDto {
  cvId: string;
  filename?: string;
}
