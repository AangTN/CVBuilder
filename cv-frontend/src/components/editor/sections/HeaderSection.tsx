'use client';

import Image from 'next/image';
import { CVSection } from '@/lib/types';
import { AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { EnhancedInput } from '@/components/ui/enhanced-input';
import { ValidatedInput } from '@/components/ui/validated-input';
import { EnhancedTextarea } from '@/components/ui/enhanced-textarea';
import { SectionHeader } from '@/components/ui/section-header';
import { FieldGroup } from '@/components/ui/field-group';
import { Plus, Trash2, Lightbulb, Upload, X, User, Mail, Phone, MapPin, Globe, Linkedin, Github, Eye, EyeOff } from 'lucide-react';
import { useState } from 'react';
import { toast } from 'sonner';
import { Language, getSectionTitle } from '@/lib/sectionTitles';
import { getFieldLabel, getFieldPlaceholder } from '@/lib/sectionFields';

interface HeaderSectionProps {
  section: CVSection;
  language: Language;
  onUpdate: (sectionId: string, updates: Partial<CVSection>) => void;
  onToggleVisibility: (sectionId: string, currentVisibility: boolean) => void;
}

const standardHeaderFields = ['full_name', 'title', 'email', 'phone', 'location', 'website', 'linkedin', 'github', 'photo_url', 'summary'];

const HEADER_TEXTS: Record<Language, { customFieldKey: string; customFieldValue: string }> = {
  vi: { customFieldKey: 'Tên trường...', customFieldValue: 'Giá trị...' },
  en: { customFieldKey: 'Field name...', customFieldValue: 'Value...' },
  ja: { customFieldKey: '項目名...', customFieldValue: '値...' },
  ko: { customFieldKey: '필드 이름...', customFieldValue: '값...' },
  zh: { customFieldKey: '字段名...', customFieldValue: '值...' },
};

export function HeaderSection({ section, language, onUpdate, onToggleVisibility }: HeaderSectionProps) {
  const text = HEADER_TEXTS[language] || HEADER_TEXTS.en;
  const [customFieldInputs, setCustomFieldInputs] = useState<{ key: string; value: string }>({ key: '', value: '' });

  const headerContent = section.items[0]?.content ?? {};
  const getStringContent = (key: string): string => {
    const value = headerContent[key];
    return typeof value === 'string' ? value : '';
  };

  const updateItemField = (field: string, value: unknown) => {
    const newItems = [...section.items];
    newItems[0] = {
      ...newItems[0],
      content: { ...newItems[0].content, [field]: value }
    };
    onUpdate(section.id, { items: newItems });
  };

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Check file size (max 2MB)
      if (file.size > 2 * 1024 * 1024) {
        toast.error('Kích thước ảnh không được vượt quá 2MB');
        return;
      }

      // Check file type
      if (!file.type.startsWith('image/')) {
        toast.error('Vui lòng chọn file ảnh hợp lệ');
        return;
      }

      const reader = new FileReader();
      reader.onloadend = () => {
        updateItemField('photo_url', reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const removePhoto = () => {
    updateItemField('photo_url', '');
  };

  const removeCustomField = (fieldKey: string) => {
    const newItems = [...section.items];
    const restContent = Object.fromEntries(
      Object.entries(newItems[0].content).filter(([key]) => key !== fieldKey),
    );
    newItems[0] = { ...newItems[0], content: restContent };
    onUpdate(section.id, { items: newItems });
  };

  const addCustomFieldInline = () => {
    if (customFieldInputs.key.trim() && customFieldInputs.value.trim()) {
      updateItemField(customFieldInputs.key.trim(), customFieldInputs.value.trim());
      setCustomFieldInputs({ key: '', value: '' });
    }
  };

  return (
    <AccordionItem value="header" className="border-2 border-gray-200 rounded-xl px-1 bg-white dark:border-slate-700 dark:bg-card">
      <div className="flex items-center justify-between pr-4">
        <AccordionTrigger className="hover:no-underline px-4 py-4 flex-1">
          <SectionHeader
            icon={User}
            title={getSectionTitle('header', language)}
            isRequired
          />
        </AccordionTrigger>
        <Button
          variant="ghost"
          size="sm"
          onClick={(e) => {
            e.stopPropagation();
            onToggleVisibility(section.id, section.is_visible ?? true);
          }}
          className="h-8 w-8 p-0"
          title={section.is_visible !== false ? 'Ẩn section' : 'Hiện section'}
        >
          {section.is_visible !== false ? <Eye className="h-4 w-4" /> : <EyeOff className="h-4 w-4" />}
        </Button>
      </div>
      <AccordionContent className="px-4 pb-4">
        <div className="space-y-6 pt-4">
          <FieldGroup title="Thông Tin Cơ Bản">
            <div>
              <Label htmlFor="fullName" className="text-sm font-medium text-gray-700 dark:text-slate-300">
                {getFieldLabel('header', 'full_name', language)} <span className="text-red-500">*</span>
              </Label>
              <EnhancedInput
                id="fullName"
                icon={User}
                placeholder={getFieldPlaceholder('header', 'full_name', language)}
                autoComplete="name"
                value={getStringContent('full_name')}
                onChange={(e) => updateItemField('full_name', e.target.value)}
                success={!!getStringContent('full_name')}
              />
            </div>

            <div>
              <Label htmlFor="title" className="text-sm font-medium text-gray-700 dark:text-slate-300">
                {getFieldLabel('header', 'title', language)} <span className="text-red-500">*</span>
              </Label>
              <EnhancedInput
                id="title"
                placeholder={getFieldPlaceholder('header', 'role', language)}
                autoComplete="organization-title"
                value={getStringContent('title')}
                onChange={(e) => updateItemField('title', e.target.value)}
                success={!!getStringContent('title')}
              />
            </div>

            <div>
              <Label htmlFor="photo" className="text-sm font-medium text-gray-700 dark:text-slate-300">
                {getFieldLabel('header', 'photo_url', language)}
              </Label>
              <div className="space-y-2">
                {getStringContent('photo_url') ? (
                  <div className="relative inline-block">
                    <Image
                      src={getStringContent('photo_url')}
                      alt="Profile"
                      width={96}
                      height={96}
                      unoptimized
                      className="h-24 w-24 rounded-full object-cover border-2 border-gray-200 shadow-sm"
                    />
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={removePhoto}
                      className="absolute -top-2 -right-2 h-7 w-7 rounded-full p-0 shadow-md"
                    >
                      <X className="h-3.5 w-3.5" />
                    </Button>
                  </div>
                ) : (
                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => document.getElementById('photo-upload')?.click()}
                      className="gap-2 border-2 hover:border-blue-500 hover:bg-blue-50"
                    >
                      <Upload className="h-4 w-4" />
                      Chọn ảnh đại diện
                    </Button>
                    <span className="text-xs text-gray-500 dark:text-slate-400">Tối đa 2MB</span>
                  </div>
                )}

                {/* Image URL input - allow user to paste an external image link */}
                <div>
                  <ValidatedInput
                    id="photo-url"
                    type="url"
                    icon={Globe}
                    validationType="url"
                    autoComplete="url"
                    placeholder="https://example.com/my-photo.jpg"
                    value={getStringContent('photo_url')}
                    onChange={(e) => updateItemField('photo_url', e.target.value)}
                  />
                  <div className="text-xs text-gray-500 dark:text-slate-400 mt-1">Bạn có thể dán đường dẫn ảnh hoặc tải lên file.</div>
                </div>

                <input
                  id="photo-upload"
                  type="file"
                  accept="image/*"
                  onChange={handlePhotoUpload}
                  className="hidden"
                />
              </div>
            </div>
          </FieldGroup>

          <FieldGroup title="Thông Tin Liên Hệ">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="email" className="text-sm font-medium text-gray-700 dark:text-slate-300">
                  {getFieldLabel('header', 'email', language)}
                </Label>
                <ValidatedInput
                  id="email"
                  type="email"
                  icon={Mail}
                  validationType="email"
                  autoComplete="email"
                  placeholder={getFieldPlaceholder('header', 'email', language)}
                  value={getStringContent('email')}
                  onChange={(e) => updateItemField('email', e.target.value)}
                />
              </div>
              <div>
                <Label htmlFor="phone" className="text-sm font-medium text-gray-700 dark:text-slate-300">
                  {getFieldLabel('header', 'phone', language)}
                </Label>
                <ValidatedInput
                  id="phone"
                  type="tel"
                  icon={Phone}
                  validationType="phone"
                  autoComplete="tel"
                  placeholder={getFieldPlaceholder('header', 'phone', language)}
                  value={getStringContent('phone')}
                  onChange={(e) => updateItemField('phone', e.target.value)}
                />
              </div>
            </div>

            <div>
              <Label htmlFor="location" className="text-sm font-medium text-gray-700 dark:text-slate-300">
                {getFieldLabel('header', 'location', language)}
              </Label>
              <EnhancedInput
                id="location"
                icon={MapPin}
                placeholder="City, Country"
                autoComplete="address-level2"
                value={getStringContent('location')}
                onChange={(e) => updateItemField('location', e.target.value)}
              />
            </div>
          </FieldGroup>

          <FieldGroup title="Liên Kết Mạng Xã Hội">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="website" className="text-sm font-medium text-gray-700 dark:text-slate-300">
                  {getFieldLabel('header', 'website', language)}
                </Label>
                <ValidatedInput
                  id="website"
                  type="url"
                  icon={Globe}
                  validationType="url"
                  autoComplete="url"
                  placeholder="https://myportfolio.com"
                  value={getStringContent('website')}
                  onChange={(e) => updateItemField('website', e.target.value)}
                />
              </div>
              <div>
                <Label htmlFor="linkedin" className="text-sm font-medium text-gray-700 dark:text-slate-300">
                  {getFieldLabel('header', 'linkedin', language)}
                </Label>
                <ValidatedInput
                  id="linkedin"
                  type="url"
                  icon={Linkedin}
                  validationType="url"
                  autoComplete="url"
                  placeholder="https://linkedin.com/in/username"
                  value={getStringContent('linkedin')}
                  onChange={(e) => updateItemField('linkedin', e.target.value)}
                />
              </div>
            </div>

            <div>
              <Label htmlFor="github" className="text-sm font-medium text-gray-700 dark:text-slate-300">
                {getFieldLabel('header', 'github', language)}
              </Label>
              <ValidatedInput
                id="github"
                type="url"
                icon={Github}
                validationType="url"
                autoComplete="url"
                placeholder="https://github.com/username"
                value={getStringContent('github')}
                onChange={(e) => updateItemField('github', e.target.value)}
              />
            </div>
          </FieldGroup>

          <FieldGroup title="Giới Thiệu Bản Thân">
            <div>
              <Label htmlFor="summary" className="text-sm font-medium text-gray-700 dark:text-slate-300">
                {getFieldLabel('header', 'summary', language)}
              </Label>
              <EnhancedTextarea
                id="summary"
                placeholder={getFieldPlaceholder('header', 'description', language)}
                maxLength={500}
                value={getStringContent('summary')}
                onChange={(e) => updateItemField('summary', e.target.value)}
              />
              <Button variant="ghost" size="sm" className="mt-2 gap-2 text-blue-600 hover:text-blue-700 hover:bg-blue-50">
                <Lightbulb className="h-4 w-4" />
                Gợi ý từ AI
              </Button>
            </div>
          </FieldGroup>

          {/* Custom Fields */}
          {section.items[0] && Object.entries(section.items[0].content)
            .filter(([key]) => !standardHeaderFields.includes(key))
            .length > 0 && (
            <FieldGroup title="Thông Tin Khác">
              {Object.entries(section.items[0].content)
                .filter(([key]) => !standardHeaderFields.includes(key))
                .map(([key, value]) => (
                  <div key={key} className="flex gap-2 items-start">
                    <div className="w-1/3 min-w-[140px]">
                      <EnhancedInput value={key} disabled className="w-full bg-gray-50 dark:bg-slate-800" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <EnhancedInput 
                        value={String(value)} 
                        onChange={(e) => updateItemField(key, e.target.value)}
                        className="w-full"
                      />
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => removeCustomField(key)}
                      className="h-11 w-11 p-0 text-red-500 hover:text-red-700 hover:bg-red-50"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                ))
              }
            </FieldGroup>
          )}
          
          <div className="pt-2">
            <div className="flex gap-2 items-start">
              <div className="w-1/3 min-w-[140px]">
                <EnhancedInput 
                  placeholder={text.customFieldKey}
                  value={customFieldInputs.key}
                  onChange={(e) => setCustomFieldInputs(prev => ({ ...prev, key: e.target.value }))}
                  className="w-full"
                />
              </div>
              <div className="flex-1 min-w-0">
                <EnhancedInput 
                  placeholder={text.customFieldValue}
                  value={customFieldInputs.value}
                  onChange={(e) => setCustomFieldInputs(prev => ({ ...prev, value: e.target.value }))}
                  className="w-full"
                />
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={addCustomFieldInline}
                className="h-11 w-11 p-0 border-2 hover:border-blue-500 hover:bg-blue-50"
              >
                <Plus className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      </AccordionContent>
    </AccordionItem>
  );
}
