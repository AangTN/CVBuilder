'use client';

import { motion } from 'framer-motion';
import { LucideIcon } from 'lucide-react';
import { Badge } from './badge';
import { cn } from '@/lib/utils';

interface SectionHeaderProps {
  icon: LucideIcon;
  title: string;
  itemCount?: number;
  isRequired?: boolean;
  className?: string;
}

export function SectionHeader({ 
  icon: Icon, 
  title, 
  itemCount, 
  isRequired,
  className 
}: SectionHeaderProps) {
  return (
    <div className={cn("flex items-center gap-3 flex-1", className)}>
      <motion.div 
        className="h-10 w-10 rounded-lg bg-blue-100 dark:bg-blue-900/40 flex items-center justify-center group-hover:bg-blue-500 dark:group-hover:bg-blue-600 transition-colors"
        whileHover={{ scale: 1.05 }}
      >
        <Icon className="h-5 w-5 text-blue-600 dark:text-blue-400 group-hover:text-white transition-colors" />
      </motion.div>
      <div className="flex-1 text-left">
        <div className="font-semibold text-base text-gray-900 dark:text-slate-100">{title}</div>
        {itemCount !== undefined && (
          <div className="text-xs text-gray-500 dark:text-slate-400">
            {itemCount} {itemCount === 1 ? 'mục' : 'mục'}
          </div>
        )}
      </div>
      {isRequired && (
        <Badge variant="secondary" className="mr-2 bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-900/30 dark:text-blue-400 dark:border-blue-800">
          Bắt buộc
        </Badge>
      )}
    </div>
  );
}
