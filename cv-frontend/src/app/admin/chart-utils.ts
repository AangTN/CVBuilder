export const CHART_WIDTH = 960;
export const CHART_HEIGHT = 280;
export const CHART_PADDING_X = 40;
export const CHART_PADDING_TOP = 20;
export const CHART_PADDING_BOTTOM = 40;

export function areaPath(
  points: Array<{ x: number; y: number }>,
  baselineY: number,
) {
  if (points.length === 0) {
    return '';
  }

  const start = points[0];
  const lines = points
    .slice(1)
    .map((point) => `L ${point.x} ${point.y}`)
    .join(' ');

  return `M ${start.x} ${baselineY} L ${start.x} ${start.y} ${lines} L ${points[points.length - 1].x} ${baselineY} Z`;
}

export function linePath(points: Array<{ x: number; y: number }>) {
  if (points.length === 0) {
    return '';
  }

  return points
    .map((point, index) => `${index === 0 ? 'M' : 'L'} ${point.x} ${point.y}`)
    .join(' ');
}

export function formatBucketLabel(
  bucket: string,
  granularity?: 'hour' | 'day' | 'month' | string,
) {
  const date = new Date(bucket);
  if (Number.isNaN(date.getTime())) {
    return bucket;
  }

  if (granularity === 'hour') {
    return `${date.getUTCHours()}h`;
  }

  if (granularity === 'month') {
    return `T${date.getUTCMonth() + 1}/${date.getUTCFullYear()}`;
  }

  return `${date.getUTCDate()}/${date.getUTCMonth() + 1}`;
}

export function formatDate(value?: string | null) {
  if (!value) {
    return '-';
  }

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return '-';
  }

  return date.toLocaleString('vi-VN');
}
