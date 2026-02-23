'use client';

import * as React from 'react';
import { cn } from '@/lib/utils';
import { Check, AlertCircle, LucideIcon } from 'lucide-react';

export interface EnhancedInputProps
  extends React.InputHTMLAttributes<HTMLInputElement> {
  icon?: LucideIcon;
  error?: string;
  success?: boolean;
  showValidation?: boolean;
}

const EnhancedInput = React.forwardRef<HTMLInputElement, EnhancedInputProps>(
  ({ className, type, icon: Icon, error, success, showValidation = true, ...props }, ref) => {
    const hasIcon = !!Icon;
    const hasError = !!error;
    const hasSuccess = success && !error;

    return (
      <div className="relative">
        {hasIcon && (
          <Icon className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 dark:text-slate-500 pointer-events-none" />
        )}
        <input
          type={type}
          className={cn(
            "flex h-11 w-full rounded-lg border-2 bg-white dark:bg-slate-800 px-4 py-3 text-sm text-foreground transition-all",
            "file:border-0 file:bg-transparent file:text-sm file:font-medium",
            "placeholder:text-gray-400 dark:placeholder:text-slate-500",
            "disabled:cursor-not-allowed disabled:opacity-50",
            // Default state
            "border-gray-200 hover:border-gray-300 dark:border-slate-600 dark:hover:border-slate-500",
            // Focus state
            "focus-visible:outline-none focus-visible:border-blue-500 focus-visible:ring-4 focus-visible:ring-blue-100 dark:focus-visible:ring-blue-900/50",
            "focus-visible:shadow-[0_0_0_4px_rgba(59,130,246,0.1)]",
            // With icon padding
            hasIcon && "pl-10",
            // Validation padding
            (hasError || hasSuccess) && showValidation && "pr-10",
            // Error state
            hasError && "border-red-500 focus-visible:border-red-500 focus-visible:ring-red-100",
            // Success state
            hasSuccess && "border-green-500 focus-visible:border-green-500 focus-visible:ring-green-100",
            className
          )}
          ref={ref}
          {...props}
        />
        {showValidation && (
          <>
            {hasError && (
              <AlertCircle className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-red-500" />
            )}
            {hasSuccess && (
              <Check className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-green-500" />
            )}
          </>
        )}
      </div>
    );
  }
);

EnhancedInput.displayName = 'EnhancedInput';

export { EnhancedInput };
