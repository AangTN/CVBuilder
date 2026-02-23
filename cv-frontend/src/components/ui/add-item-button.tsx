'use client';

import { motion } from 'framer-motion';
import { Plus, LucideIcon } from 'lucide-react';
import { cn } from '@/lib/utils';

interface AddItemButtonProps {
  onClick: () => void;
  label: string;
  icon?: LucideIcon;
  className?: string;
}

export function AddItemButton({ 
  onClick, 
  label, 
  icon: Icon = Plus,
  className 
}: AddItemButtonProps) {
  return (
    <motion.button
      whileHover={{ scale: 1.01 }}
      whileTap={{ scale: 0.99 }}
      onClick={onClick}
      className={cn(
        "w-full border-2 border-dashed border-blue-200 rounded-lg p-4",
        "hover:border-blue-400 hover:bg-blue-50 transition-all",
        "group",
        className
      )}
    >
      <div className="flex items-center justify-center gap-2 text-blue-600">
        <Icon className="h-5 w-5 group-hover:scale-110 transition-transform" />
        <span className="font-medium">{label}</span>
      </div>
    </motion.button>
  );
}
