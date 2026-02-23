'use client';

import Link from "next/link";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { TemplateRegistryItem } from "./registry";
import React, { useMemo, useState, useEffect, useRef } from "react";
import { motion } from "framer-motion";
import { Eye, Sparkles, CheckCircle2, Briefcase, Code, Palette, GraduationCap, Zap, Star } from "lucide-react";

interface TemplateCardProps {
  template: TemplateRegistryItem & {
    dbName?: string;
    dbDescription?: string;
    isPremium?: boolean;
    creditCost?: number;
    tags?: string[];
    thumbnailUrl?: string | null;
  };
}

const getCategoryIcon = (category: string) => {
  switch (category) {
    case 'modern':
      return <Palette className="h-3 w-3" />;
    case 'classic':
      return <Briefcase className="h-3 w-3" />;
    case 'tech':
      return <Code className="h-3 w-3" />;
    case 'creative':
      return <Sparkles className="h-3 w-3" />;
    case 'academic':
      return <GraduationCap className="h-3 w-3" />;
    default:
      return <Briefcase className="h-3 w-3" />;
  }
};

const getCategoryLabel = (category: string) => {
  const map: Record<string, string> = {
    modern: 'Hiện đại',
    classic: 'Cổ điển',
    tech: 'Công nghệ',
    creative: 'Sáng tạo',
    academic: 'Học thuật',
  };
  return map[category] || 'Cơ bản';
};

export function TemplateCard({ template }: TemplateCardProps) {
  const TemplateComponent = template.component;
  const containerRef = useRef<HTMLDivElement>(null);
  const [scale, setScale] = useState(0.3);
  const scaleRef = useRef(0.3);
  // Show live preview immediately if no thumbnail is available
  const [enableLivePreview, setEnableLivePreview] = useState(!template.thumbnailUrl);
  
  const displayName = useMemo(() => template.dbName || template.name, [template.dbName, template.name]);
  const displayDescription = useMemo(() => template.dbDescription || template.description, [template.dbDescription, template.description]);

  useEffect(() => {
    const updateScale = () => {
      if (containerRef.current) {
        const containerWidth = containerRef.current.offsetWidth;
        // 210mm = 793.7px. We want to fit the A4 width into the container
        const calculatedScale = containerWidth / 793.7;
        const roundedScale = Number(calculatedScale.toFixed(4));

        if (Math.abs(scaleRef.current - roundedScale) > 0.0001) {
          scaleRef.current = roundedScale;
          setScale(roundedScale);
        }
      }
    };

    updateScale();
    const ro = new ResizeObserver(updateScale);
    if (containerRef.current) ro.observe(containerRef.current);
    
    return () => ro.disconnect();
  }, []);
  
  return (
    <motion.div 
      className="group relative flex flex-col h-full bg-white dark:bg-slate-900 rounded-3xl border border-gray-100 dark:border-slate-800 shadow-[0_2px_12px_-4px_rgba(0,0,0,0.05)] dark:shadow-[0_2px_12px_-4px_rgba(0,0,0,0.3)] hover:shadow-[0_20px_40px_-12px_rgba(0,0,0,0.12)] dark:hover:shadow-[0_20px_40px_-12px_rgba(0,0,0,0.5)] hover:-translate-y-1 transition-all duration-300 ease-out overflow-hidden"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover="hover"
      transition={{ duration: 0.4 }}
      onMouseEnter={() => setEnableLivePreview(true)}
      onFocusCapture={() => setEnableLivePreview(true)}
    >
      {/* HEADER BADGES */}
      <div className="absolute top-4 left-4 right-4 z-20 flex justify-between items-start pointer-events-none">
        {/* ATS Badge */}
        <div className="flex items-center gap-1.5 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md px-2.5 py-1 rounded-full shadow-sm border border-green-100 dark:border-green-900 ring-1 ring-green-500/10">
          <div className="bg-green-100 p-0.5 rounded-full">
            <CheckCircle2 className="h-3 w-3 text-green-600" />
          </div>
          <span className="text-[10px] font-bold text-green-700 uppercase tracking-wide">ATS Friendly</span>
        </div>

        {/* Popular / Premium Badge */}
        {template.featured ? (
          <div className="flex items-center gap-1.5 bg-gradient-to-r from-amber-400 to-orange-500 text-white px-2.5 py-1 rounded-full shadow-lg shadow-orange-500/20">
            <Star className="h-3 w-3 fill-white" />
            <span className="text-[10px] font-bold uppercase tracking-wide">Hot</span>
          </div>
        ) : template.isPremium && (
          <div className="flex items-center gap-1.5 bg-gradient-to-r from-violet-600 to-purple-600 text-white px-2.5 py-1 rounded-full shadow-lg shadow-violet-500/20">
            <Zap className="h-3 w-3 fill-white" />
            <span className="text-[10px] font-bold uppercase tracking-wide">Pro</span>
          </div>
        )}
      </div>

      {/* PREVIEW AREA */}
      <div 
        ref={containerRef} 
        className="relative w-full bg-gray-50 dark:bg-slate-800 overflow-hidden border-b border-gray-100 dark:border-slate-700"
        style={{ aspectRatio: '210/297' }}
      >
        <div 
          className="absolute top-0 left-0 w-full h-full origin-top-left pointer-events-none"
        >
          {enableLivePreview ? (
            <motion.div
              variants={{
                initial: { scale },
                hover: { scale: scale * 1.015 },
              }}
              initial="initial"
              animate="initial"
              transition={{ duration: 0.22, ease: 'easeOut' }}
              style={{
                width: '210mm',
                height: '297mm',
                transformOrigin: 'top left',
                willChange: 'transform',
              }}
            >
              <TemplateComponent data={template.sampleData} previewMode={true} />
            </motion.div>
          ) : (
            // Only shown when template has a thumbnailUrl (live preview used otherwise)
            <div className="absolute inset-0 bg-gradient-to-br from-slate-50 via-white to-blue-50 flex flex-col items-center justify-center p-6">
              <Image 
                src={template.thumbnailUrl!} 
                alt={`Mẫu CV ${displayName}`}
                fill
                className="object-cover object-top"
                sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
              />
            </div>
          )}
        </div>

        {/* Hover Overlay */}
        <div className="absolute inset-0 bg-gray-900/15 transition-opacity duration-200 opacity-0 group-hover:opacity-100 pointer-events-none group-hover:pointer-events-auto flex flex-col items-center justify-center gap-3">
          <motion.div
            className="translate-y-1 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-200"
          >
             <Button className="rounded-full bg-white text-gray-900 hover:bg-white/90 font-semibold shadow-xl h-11 px-6 text-sm" asChild>
                <Link href={`/editor?template=${template.id}`}>
                  <Eye className="mr-2 h-4 w-4" /> Xem chi tiết
                </Link>
             </Button>
          </motion.div>
        </div>
      </div>

      {/* CONTENT AREA */}
      <div className="flex flex-col flex-1 p-5 space-y-3">
        <div>
          <div className="flex items-center justify-between mb-2">
            <h3 className="font-bold text-gray-900 dark:text-slate-100 text-lg group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors line-clamp-1">
              {displayName}
            </h3>
            <div className="flex items-center gap-1 text-gray-500 dark:text-slate-400 bg-gray-100/80 dark:bg-slate-800 px-2 py-1 rounded-md text-[10px] font-semibold uppercase tracking-wider">
               {getCategoryIcon(template.category)}
               <span>{getCategoryLabel(template.category)}</span>
            </div>
          </div>
          
          <p className="text-sm text-gray-500 dark:text-slate-400 line-clamp-2 h-10 leading-relaxed">
            {displayDescription}
          </p>
        </div>

        <div className="pt-2 mt-auto">
          <Button 
            className="w-full h-11 rounded-xl bg-gray-900 dark:bg-slate-100 dark:text-slate-900 dark:hover:bg-white text-white font-semibold shadow-lg hover:bg-blue-600 hover:shadow-blue-500/30 transition-all active:scale-[0.98]"
            asChild
          >
            <Link href={`/editor?template=${template.id}`}>
              <Sparkles className="mr-2 h-4 w-4" />
              Dùng Mẫu Này
            </Link>
          </Button>
        </div>
      </div>
    </motion.div>
  );
}
