'use client';

import { motion } from 'framer-motion';
import { GripVertical, Trash2 } from 'lucide-react';
import { Button } from './button';
import { Badge } from './badge';
import { ReactNode } from 'react';
import { cn } from '@/lib/utils';

interface ItemCardProps {
  index: number;
  onDelete: () => void;
  children: ReactNode;
  className?: string;
  dragHandleProps?: React.HTMLAttributes<HTMLButtonElement>;
}

export function ItemCard({ 
  index, 
  onDelete, 
  children, 
  className,
  dragHandleProps 
}: ItemCardProps) {
  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, x: -100 }}
      transition={{ duration: 0.3 }}
      className={cn(
        "rounded-xl border-2 border-gray-200 bg-white p-5 space-y-4",
        "hover:border-blue-200 hover:shadow-md transition-all",
        className
      )}
    >
      <div className="flex items-center justify-between">
        <Badge variant="secondary" className="bg-blue-50 text-blue-700">
          Mục {index + 1}
        </Badge>
        <div className="flex gap-1">
          {dragHandleProps && (
            <Button 
              variant="ghost" 
              size="sm" 
              {...dragHandleProps}
              className="h-8 w-8 p-0 cursor-grab active:cursor-grabbing"
            >
              <GripVertical className="h-4 w-4 text-gray-400" />
            </Button>
          )}
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={onDelete}
            className="h-8 w-8 p-0 text-red-500 hover:text-red-700 hover:bg-red-50"
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      </div>
      {children}
    </motion.div>
  );
}
