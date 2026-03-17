'use client';

import { useEffect, useState } from 'react';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';
import { Language } from '@/lib/sectionTitles';
import { normalizeMonthYearValue, toMonthYearDisplay } from '@/lib/cvDate';

interface MonthYearInputProps {
  id?: string;
  value?: string;
  onChange: (value: string) => void;
  language: Language;
  disabled?: boolean;
  className?: string;
  placeholder?: string;
}

const MONTH_YEAR_INPUT_TEXTS: Record<Language, { hint: string; placeholder: string }> = {
  vi: {
    hint: 'Hỗ trợ: MM/YYYY, YYYY-MM hoặc YYYY',
    placeholder: 'MM/YYYY hoặc YYYY',
  },
  en: {
    hint: 'Supported: MM/YYYY, YYYY-MM or YYYY',
    placeholder: 'MM/YYYY or YYYY',
  },
  ja: {
    hint: '入力形式: MM/YYYY, YYYY-MM または YYYY',
    placeholder: 'MM/YYYY または YYYY',
  },
  ko: {
    hint: '지원 형식: MM/YYYY, YYYY-MM 또는 YYYY',
    placeholder: 'MM/YYYY 또는 YYYY',
  },
  zh: {
    hint: '支持格式：MM/YYYY、YYYY-MM 或 YYYY',
    placeholder: 'MM/YYYY 或 YYYY',
  },
};

export function MonthYearInput({
  id,
  value,
  onChange,
  language,
  disabled,
  className,
  placeholder,
}: MonthYearInputProps) {
  const text = MONTH_YEAR_INPUT_TEXTS[language] || MONTH_YEAR_INPUT_TEXTS.en;
  const [draftValue, setDraftValue] = useState<string>(toMonthYearDisplay(value));

  useEffect(() => {
    setDraftValue(toMonthYearDisplay(value));
  }, [value]);

  const commitValue = () => {
    const normalizedValue = normalizeMonthYearValue(draftValue);
    onChange(normalizedValue);
    setDraftValue(toMonthYearDisplay(normalizedValue));
  };

  return (
    <div>
      <Input
        id={id}
        value={draftValue}
        onChange={(event) => setDraftValue(event.target.value)}
        onBlur={commitValue}
        onKeyDown={(event) => {
          if (event.key === 'Enter') {
            event.preventDefault();
            commitValue();
          }
        }}
        disabled={disabled}
        placeholder={placeholder || text.placeholder}
        className={cn(
          'h-11 rounded-lg border-2 border-gray-200 bg-white px-3 py-2 text-sm text-gray-900 transition-all',
          'placeholder:text-gray-400 focus-visible:border-blue-500 focus-visible:ring-4 focus-visible:ring-blue-100',
          'dark:border-slate-600 dark:bg-slate-800 dark:text-slate-100 dark:placeholder:text-slate-400',
          'dark:focus-visible:border-blue-400 dark:focus-visible:ring-blue-500/30',
          className,
        )}
      />
      <p className="mt-1 text-[11px] text-muted-foreground">{text.hint}</p>
    </div>
  );
}
