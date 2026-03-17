const ALLOWED_HTTP_PROTOCOLS = new Set(['http:', 'https:']);

export function getSafeImageSrc(value: unknown): string | undefined {
  if (typeof value !== 'string') {
    return undefined;
  }

  const raw = value.trim();
  if (!raw) {
    return undefined;
  }

  if (raw.startsWith('/')) {
    return raw;
  }

  if (raw.startsWith('uploads/')) {
    return `/${raw}`;
  }

  if (raw.startsWith('./uploads/')) {
    return raw.slice(1);
  }

  if (raw.startsWith('data:image/')) {
    return raw;
  }

  try {
    const parsed = new URL(raw);
    if (ALLOWED_HTTP_PROTOCOLS.has(parsed.protocol)) {
      return raw;
    }
  } catch {
    // Ignore malformed URL and mark as invalid.
  }

  return undefined;
}