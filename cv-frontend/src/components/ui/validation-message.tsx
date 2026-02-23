import { AlertCircle, CheckCircle } from 'lucide-react';
import { cn } from '@/lib/utils';

interface ValidationMessageProps {
  message?: string;
  type?: 'error' | 'success' | 'warning';
  className?: string;
}

export function ValidationMessage({ message, type = 'error', className }: ValidationMessageProps) {
  if (!message) return null;

  const Icon = type === 'success' ? CheckCircle : AlertCircle;

  const colorClasses = {
    error: 'text-red-600',
    success: 'text-green-600',
    warning: 'text-amber-600',
  };

  return (
    <p className={cn('text-xs flex items-center gap-1 mt-1 animate-in fade-in slide-in-from-top-1', colorClasses[type], className)}>
      <Icon className="h-3 w-3" />
      {message}
    </p>
  );
}
