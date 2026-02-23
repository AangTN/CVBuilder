'use client';

import * as React from 'react';
import { cn } from '@/lib/utils';
import { AlertCircle } from 'lucide-react';

export interface EnhancedTextareaProps
  extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  error?: string;
  showCharCount?: boolean;
}

const EnhancedTextarea = React.forwardRef<
  HTMLTextAreaElement,
  EnhancedTextareaProps
>(({ className, error, maxLength, showCharCount = true, value, ...props }, ref) => {
  const hasError = !!error;
  const charCount = value?.toString().length || 0;
  const maxChars = maxLength || 0;
  const percentUsed = maxChars ? (charCount / maxChars) * 100 : 0;

  // Auto-resize
  const textareaRef = React.useRef<HTMLTextAreaElement | null>(null);
  
  React.useEffect(() => {
    const textarea = textareaRef.current;
    if (textarea) {
      textarea.style.height = 'auto';
      textarea.style.height = textarea.scrollHeight + 'px';
    }
  }, [value]);

  const setRefs = React.useCallback(
    (node: HTMLTextAreaElement) => {
      textareaRef.current = node;
      if (typeof ref === 'function') {
        ref(node);
      } else if (ref) {
        ref.current = node;
      }
    },
    [ref]
  );

  return (
    <div className="relative">
      <textarea
        className={cn(
          "flex min-h-[100px] w-full rounded-lg border-2 bg-white dark:bg-slate-800 px-4 py-3 text-sm text-foreground transition-all resize-none",
          "placeholder:text-gray-400 dark:placeholder:text-slate-500",
          "disabled:cursor-not-allowed disabled:opacity-50",
          // Default state
          "border-gray-200 hover:border-gray-300 dark:border-slate-600 dark:hover:border-slate-500",
          // Focus state
          "focus-visible:outline-none focus-visible:border-blue-500 focus-visible:ring-4 focus-visible:ring-blue-100 dark:focus-visible:ring-blue-900/50",
          "focus-visible:shadow-[0_0_0_4px_rgba(59,130,246,0.1)]",
          // Error state
          hasError && "border-red-500 focus-visible:border-red-500 focus-visible:ring-red-100",
          // With char count padding
          showCharCount && maxLength && "pb-8",
          className
        )}
        ref={setRefs}
        maxLength={maxLength}
        value={value}
        {...props}
      />
      
      {showCharCount && maxLength && (
        <div
          className={cn(
            "absolute bottom-2 right-3 text-xs font-medium transition-colors",
            percentUsed < 80 && "text-gray-400 dark:text-slate-500",
            percentUsed >= 80 && percentUsed < 95 && "text-amber-500",
            percentUsed >= 95 && "text-red-500"
          )}
        >
          {charCount}/{maxLength}
        </div>
      )}

      {hasError && (
        <div className="mt-1.5 flex items-center gap-1 text-xs text-red-500">
          <AlertCircle className="h-3 w-3" />
          <span>{error}</span>
        </div>
      )}
    </div>
  );
});

EnhancedTextarea.displayName = 'EnhancedTextarea';

export { EnhancedTextarea };
