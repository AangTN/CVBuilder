'use client';

import { ReactNode } from 'react';
import { cn } from '@/lib/utils';

interface FieldGroupProps {
  title?: string;
  children: ReactNode;
  className?: string;
}

export function FieldGroup({ title, children, className }: FieldGroupProps) {
  return (
    <div className={cn("space-y-4", className)}>
      {title && (
        <div className="flex items-center gap-3 text-sm font-semibold text-gray-700 dark:text-slate-300">
          <div className="h-px flex-1 bg-gradient-to-r from-transparent via-gray-200 dark:via-slate-700 to-transparent" />
          <span>{title}</span>
          <div className="h-px flex-1 bg-gradient-to-r from-gray-200 dark:from-slate-700 via-transparent" />
        </div>
      )}
      {children}
    </div>
  );
}
