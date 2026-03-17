'use client';

import { Button } from '@/components/ui/button';
import { 
  Download, 
  Share2, 
  Type, 
  Layout,
  Save,
  Loader2,
  Languages,
  Sparkles,
  Undo2,
  Redo2,
  ChevronLeft,
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Language, getLanguageName, getAvailableLanguages } from '@/lib/sectionTitles';
import Link from 'next/link';

interface EditorTopBarProps {
  isSaving: boolean;
  lastSaved?: Date;
  language?: Language;
  currentFontSize?: 'small' | 'medium' | 'large';
  onFontSizeChange: (fontSize: 'small' | 'medium' | 'large') => void;
  onLanguageChange: (language: Language) => void;
  onSave: () => void;
  onExportPDF: () => void;
  onShare: () => void;
  onTemplateChange?: () => void;
  onToggleAI?: () => void;
  canUndo?: boolean;
  canRedo?: boolean;
  onUndo?: () => void;
  onRedo?: () => void;
}

const FONT_SIZE_OPTIONS = [
  { label: 'Nhỏ', value: 'small' },
  { label: 'Vừa', value: 'medium' },
  { label: 'To', value: 'large' },
];

const LANGUAGE_OPTIONS: Language[] = getAvailableLanguages();

export function EditorTopBar({
  isSaving,
  lastSaved,
  language = 'vi',
  currentFontSize = 'medium',
  onFontSizeChange,
  onLanguageChange,
  onSave,
  onExportPDF,
  onShare,
  onTemplateChange,
  onToggleAI,
  canUndo = false,
  canRedo = false,
  onUndo,
  onRedo,
}: EditorTopBarProps) {
  const currentFontSizeLabel = FONT_SIZE_OPTIONS.find((option) => option.value === currentFontSize)?.label || 'Vừa';

  return (
    <div className="sticky top-0 z-40 w-full border-b bg-white/95 backdrop-blur supports-[backdrop-filter]:bg-white/80 dark:bg-slate-900/95 dark:supports-[backdrop-filter]:bg-slate-900/80 dark:border-slate-800">
      <div className="flex h-14 items-center justify-between px-4">
        {/* Left: Navigation & History */}
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="icon" asChild className="h-8 w-8 text-gray-500 hover:text-gray-900 dark:text-slate-400 dark:hover:text-slate-100" aria-label="Về trang chủ">
             <Link href="/">
               <ChevronLeft className="h-5 w-5" />
             </Link>
          </Button>
          
          <div className="mx-1 h-5 w-px bg-gray-200 dark:bg-slate-700" />

          <div className="flex items-center gap-1">
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 text-gray-500 dark:text-slate-400"
              onClick={onUndo}
              disabled={!canUndo}
              aria-label="Hoàn tác"
              title="Hoàn tác (Ctrl+Z)"
            >
              <Undo2 className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 text-gray-500 dark:text-slate-400"
              onClick={onRedo}
              disabled={!canRedo}
              aria-label="Làm lại"
              title="Làm lại (Ctrl+Y)"
            >
              <Redo2 className="h-4 w-4" />
            </Button>
          </div>

          <div className="hidden md:flex items-center gap-2 text-xs text-muted-foreground ml-2">
            {isSaving ? (
              <>
                <Loader2 className="h-3 w-3 animate-spin" />
                <span>Đang lưu...</span>
              </>
            ) : lastSaved ? (
              <span>Đã lưu {lastSaved.toLocaleTimeString('vi-VN')}</span>
            ) : (
              <span>Chưa lưu</span>
            )}
          </div>
        </div>

        {/* Center: Main Tools */}
        <div className="flex items-center gap-2">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm" className="h-8 gap-2 border-dashed">
                <Type className="h-4 w-4" />
                <span className="hidden sm:inline">Cỡ chữ: {currentFontSizeLabel}</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="center">
              {FONT_SIZE_OPTIONS.map((size) => (
                <DropdownMenuItem
                  key={size.value}
                  onClick={() => onFontSizeChange(size.value as 'small' | 'medium' | 'large')}
                >
                  <span className="inline-flex items-center gap-2">
                    <span className="inline-block w-3">{currentFontSize === size.value ? '✓' : ''}</span>
                    {size.label}
                  </span>
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>

          <Button
            variant="outline"
            size="sm"
            className="h-8 gap-2"
            onClick={() => onTemplateChange?.()}
            disabled={!onTemplateChange}
          >
            <Layout className="h-4 w-4" />
            <span className="hidden sm:inline">Đổi mẫu</span>
          </Button>

           <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm" className="h-8 gap-2 border-dashed">
                <Languages className="h-4 w-4 text-indigo-600" />
                <span className="hidden sm:inline">{getLanguageName(language)}</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="center">
              {LANGUAGE_OPTIONS.map((lang) => (
                <DropdownMenuItem
                  key={lang}
                  onClick={() => onLanguageChange(lang)}
                  className={language === lang ? 'bg-accent' : ''}
                >
                  {getLanguageName(lang)}
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
          
          <Button
            variant="outline"
            size="sm"
            className="h-8 gap-2 border-blue-200 bg-blue-50 hover:bg-blue-100 text-blue-700"
            onClick={() => onToggleAI?.()}
            disabled={!onToggleAI}
          >
            <Sparkles className="h-3 w-3" />
            AI Assistant
          </Button>
        </div>

        {/* Right: Actions */}
        <div className="flex items-center gap-2">
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={onSave}
            disabled={isSaving}
            className="hidden sm:flex h-8 gap-2 text-gray-600 dark:text-slate-400"
            aria-label="Lưu CV"
            title="Lưu thủ công (Ctrl+S)"
          >
            <Save className="h-4 w-4" />
            <span className="hidden lg:inline">Lưu</span>
          </Button>
          
          <Button 
            variant="outline" 
            size="sm" 
            onClick={onShare} 
            className="hidden sm:flex h-8 gap-2"
          >
            <Share2 className="h-4 w-4" />
            Chia sẻ
          </Button>
          
          <Button size="sm" onClick={onExportPDF} className="h-8 gap-2 bg-gradient-to-r from-blue-600 to-indigo-600 shadow-md hover:shadow-lg transition-all">
            <Download className="h-4 w-4" />
            Tải xuống
          </Button>
        </div>
      </div>
    </div>
  );
}
