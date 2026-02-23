'use client';

import React from 'react';

interface A4PageWrapperProps {
  children: React.ReactNode;
  fontFamily?: string;
  primaryColor?: string;
  widthMm?: number;
  heightMm?: number;
  paddingMm?: number;
  className?: string;
  style?: React.CSSProperties;
}

const DEFAULT_PAGE_WIDTH_MM = 210;
const DEFAULT_PAGE_HEIGHT_MM = 297;
const DEFAULT_PADDING_MM = 18;

export function A4PageWrapper({
  children,
  fontFamily,
  primaryColor,
  widthMm = DEFAULT_PAGE_WIDTH_MM,
  heightMm = DEFAULT_PAGE_HEIGHT_MM,
  paddingMm = DEFAULT_PADDING_MM,
  className,
  style,
}: A4PageWrapperProps) {
  const cssVars: React.CSSProperties & { '--cv-primary-color'?: string } = {};
  if (primaryColor) {
    cssVars['--cv-primary-color'] = primaryColor;
  }

  return (
    <div
      className={`bg-white shadow-lg mx-auto print:shadow-none a4-page ${className ?? ''}`}
      style={{
        width: `${widthMm}mm`,
        height: `${heightMm}mm`,
        padding: `${paddingMm}mm`,
        fontFamily,
        position: 'relative',
        marginBottom: '20px',
        overflow: 'hidden',
        display: 'flex',
        flexDirection: 'column',
        ...cssVars,
        ...style,
      }}
    >
      {children}

      <style jsx global>{`
        * {
          -webkit-print-color-adjust: exact;
          print-color-adjust: exact;
        }

        @media print {
          body {
            margin: 0;
            padding: 0;
          }

          .cv-template-root {
            width: ${widthMm}mm;
            margin: 0;
          }

          .a4-page {
            box-shadow: none !important;
            margin: 0 !important;
            page-break-after: always;
          }

          .a4-page:last-child {
            page-break-after: auto;
          }

          [data-cv-measure='true'] {
            display: none !important;
          }
        }
      `}</style>
    </div>
  );
}
