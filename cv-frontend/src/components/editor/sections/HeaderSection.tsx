'use client';

import { CVSection } from '@/lib/types';
import { AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Eye, EyeOff } from 'lucide-react';
import { Language, getSectionTitle } from '@/lib/sectionTitles';
import { getFieldLabel, getFieldPlaceholder } from '@/lib/sectionFields';

interface HeaderSectionProps {
  section: CVSection;
  language: Language;
  onUpdate: (sectionId: string, updates: Partial<CVSection>) => void;
  onToggleVisibility: (sectionId: string, currentVisibility: boolean) => void;
}

const PRIMARY_FIELDS = ['full_name', 'title', 'email', 'phone', 'location'];
const PERSONAL_FIELDS = ['date_of_birth', 'gender'];
const SOCIAL_FIELDS = ['website', 'linkedin', 'github', 'facebook', 'twitter', 'instagram'];

const createItemId = (): string => `header-item-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;

export function HeaderSection({ section, language, onUpdate, onToggleVisibility }: HeaderSectionProps) {
  const headerItem = section.items[0];
  const headerContent = (headerItem?.content || {}) as Record<string, unknown>;

  const getStringContent = (key: string): string => {
    const value = headerContent[key];
    return typeof value === 'string' ? value : '';
  };

  const updateField = (field: string, value: string) => {
    const currentItem =
      section.items[0] || {
        id: createItemId(),
        section_id: section.id,
        content: {},
      };

    const updatedItem = {
      ...currentItem,
      content: {
        ...currentItem.content,
        [field]: value,
      },
    };

    onUpdate(section.id, { items: [updatedItem, ...section.items.slice(1)] });
  };

  const renderInput = (field: string, type: 'text' | 'email' | 'url' = 'text') => {
    const required = field === 'full_name' || field === 'title';

    return (
      <div key={field}>
        <Label>{getFieldLabel('header', field, language)}{required ? ' *' : ''}</Label>
        <Input
          type={type}
          placeholder={getFieldPlaceholder('header', field, language)}
          value={getStringContent(field)}
          onChange={(e) => updateField(field, e.target.value)}
        />
      </div>
    );
  };

  return (
    <AccordionItem value="header" className="rounded-xl border-2 border-gray-200 bg-white px-1 dark:border-slate-700 dark:bg-card">
      <div className="flex items-center justify-between pr-4">
        <AccordionTrigger
          className={`flex-1 px-4 py-4 text-lg font-semibold hover:no-underline ${!section.is_visible ? 'opacity-50' : ''}`}
        >
          {getSectionTitle('header', language)}
        </AccordionTrigger>
        <Button
          variant="ghost"
          size="sm"
          onClick={(e) => {
            e.stopPropagation();
            onToggleVisibility(section.id, section.is_visible ?? true);
          }}
          className="h-8 w-8 p-0"
        >
          {section.is_visible !== false ? <Eye className="h-4 w-4" /> : <EyeOff className="h-4 w-4" />}
        </Button>
      </div>

      <AccordionContent className="px-4 pb-4">
        <div className="space-y-5 pt-4">
          <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
            {PRIMARY_FIELDS.map((field) => renderInput(field, field === 'email' ? 'email' : 'text'))}
          </div>

          <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
            {PERSONAL_FIELDS.map((field) => renderInput(field))}
            {renderInput('photo_url', 'url')}
          </div>

          <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
            {SOCIAL_FIELDS.map((field) => renderInput(field, 'url'))}
          </div>

          <div>
            <Label>{getFieldLabel('header', 'summary', language)}</Label>
            <Textarea
              rows={4}
              placeholder={getFieldPlaceholder('header', 'summary', language)}
              value={getStringContent('summary')}
              onChange={(e) => updateField('summary', e.target.value)}
            />
          </div>
        </div>
      </AccordionContent>
    </AccordionItem>
  );
}
