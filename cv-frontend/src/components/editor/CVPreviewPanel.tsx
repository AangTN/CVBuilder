'use client';

import { CVData } from '@/lib/types';
import { ZoomIn, ZoomOut } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useState } from 'react';

interface CVPreviewPanelProps {
  data: CVData;
  TemplateComponent: React.ComponentType<{ data: CVData }>;
}

export function CVPreviewPanel({ data, TemplateComponent }: CVPreviewPanelProps) {
  const [zoom, setZoom] = useState(1);

  const handleZoomIn = () => setZoom((prev) => Math.min(prev + 0.1, 2));
  const handleZoomOut = () => setZoom((prev) => Math.max(prev - 0.1, 0.5));

  return (
    <div className="flex h-full flex-col bg-slate-100/50 dark:bg-slate-950">
      {/* Zoom Controls */}
      <div className="flex items-center justify-center gap-2 border-b border-gray-200 bg-white/50 backdrop-blur-sm py-2 dark:border-slate-800 dark:bg-slate-900/60">
        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8 rounded-full"
          onClick={handleZoomOut}
          disabled={zoom <= 0.5}
        >
          <ZoomOut className="h-4 w-4" />
        </Button>
        <span className="text-xs font-semibold min-w-[3rem] text-center text-gray-600 bg-gray-100 rounded-md py-1 dark:text-slate-400 dark:bg-slate-800">
          {Math.round(zoom * 100)}%
        </span>
        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8 rounded-full"
          onClick={handleZoomIn}
          disabled={zoom >= 2}
        >
          <ZoomIn className="h-4 w-4" />
        </Button>
      </div>

      {/* Preview Area */}
      <div className="flex-1 overflow-auto p-8 pb-32 flex justify-center">
        <div 
          className="relative bg-white shadow-2xl transition-transform duration-200 origin-top will-change-transform"
          style={{ 
            transform: `scale(${zoom})`,
            minHeight: '297mm',
            width: '210mm', 
          }}
        >
          <TemplateComponent data={data} />
        </div>
      </div>
    </div>
  );
}
