'use client';

import React from 'react';

export type CVPageEngineItemType = 'header' | 'title' | 'spacer' | 'content';

export interface CVPageEngineItem {
  id: string;
  type?: CVPageEngineItemType;
}

interface CVPageEngineProps<T extends CVPageEngineItem> {
  items: T[];
  renderItem: (item: T) => React.ReactNode;
  children: (pages: T[][]) => React.ReactNode;
  measurementClassName?: string;
  pageWidthMm?: number;
  pageHeightMm?: number;
  paddingMm?: number;
  reservedHeightMm?: number;
  bufferPx?: number;
}

const DEFAULT_PAGE_WIDTH_MM = 210;
const DEFAULT_PAGE_HEIGHT_MM = 297;
const DEFAULT_PADDING_MM = 18;
const DEFAULT_BUFFER_PX = 5;

export function CVPageEngine<T extends CVPageEngineItem>({
  items,
  renderItem,
  children,
  measurementClassName,
  pageWidthMm = DEFAULT_PAGE_WIDTH_MM,
  pageHeightMm = DEFAULT_PAGE_HEIGHT_MM,
  paddingMm = DEFAULT_PADDING_MM,
  reservedHeightMm = 0,
  bufferPx = DEFAULT_BUFFER_PX,
}: CVPageEngineProps<T>) {
  const [pages, setPages] = React.useState<T[][]>([]);
  const measureRef = React.useRef<HTMLDivElement>(null);

  const itemsById = React.useMemo(() => {
    const map = new Map<string, T>();
    items.forEach((item) => map.set(item.id, item));
    return map;
  }, [items]);

  const getItemType = React.useCallback((item: T | undefined) => item?.type ?? 'content', []);

  React.useLayoutEffect(() => {
    if (!measureRef.current) return;

    if (!items.length) {
      setPages([]);
      return;
    }

    const tempDiv = document.createElement('div');
    tempDiv.style.height = `${pageHeightMm}mm`;
    tempDiv.style.position = 'absolute';
    tempDiv.style.visibility = 'hidden';
    document.body.appendChild(tempDiv);
    const pageHeightPx = tempDiv.offsetHeight;
    document.body.removeChild(tempDiv);

    const contentHeight = pageHeightPx * ((pageHeightMm - paddingMm * 2 - reservedHeightMm) / pageHeightMm);
    const maxHeight = contentHeight - bufferPx;

    const newPages: T[][] = [];
    let currentPage: T[] = [];
    let currentHeight = 0;

    const childrenNodes = Array.from(measureRef.current.children) as HTMLElement[];

    childrenNodes.forEach((child, index) => {
      const id = child.dataset.id;
      if (!id) return;

      const item = itemsById.get(id);
      if (!item) return;

      const height = child.offsetHeight;
      const type = getItemType(item);

      let shouldBreak = false;

      if (type === 'title' && index + 1 < childrenNodes.length) {
        const nextChild = childrenNodes[index + 1];
        const nextId = nextChild.dataset.id;
        const nextItem = nextId ? itemsById.get(nextId) : undefined;
        const nextType = getItemType(nextItem);

        if (nextType === 'content') {
          const nextHeight = nextChild.offsetHeight;
          if (currentHeight + height + nextHeight > maxHeight) {
            shouldBreak = true;
          }
        } else if (currentHeight + height > maxHeight) {
          shouldBreak = true;
        }
      } else if (currentHeight + height > maxHeight) {
        shouldBreak = true;
      }

      if (shouldBreak && currentPage.length > 0) {
        newPages.push(currentPage);
        currentPage = [];
        currentHeight = 0;
      }

      currentPage.push(item);
      currentHeight += height;
    });

    if (currentPage.length > 0) {
      newPages.push(currentPage);
    }

    setPages(newPages);
  }, [items, itemsById, pageHeightMm, paddingMm, reservedHeightMm, bufferPx, getItemType]);

  return (
    <>
      <div
        ref={measureRef}
        data-cv-measure="true"
        className={measurementClassName}
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          opacity: 0,
          pointerEvents: 'none',
          width: `${pageWidthMm}mm`,
          padding: '0',
          zIndex: -1,
          visibility: 'hidden',
        }}
      >
        {items.map((item) => (
          <div key={item.id} data-id={item.id} style={{ overflow: 'hidden', width: '100%' }}>
            {renderItem(item)}
          </div>
        ))}
      </div>

      {children(pages)}
    </>
  );
}
