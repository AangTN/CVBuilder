import sanitizeHtml from 'sanitize-html';

type JsonObject = Record<string, unknown>;

const SANITIZE_OPTIONS: sanitizeHtml.IOptions = {
  allowedTags: [
    'b',
    'strong',
    'i',
    'em',
    'u',
    'p',
    'br',
    'ul',
    'ol',
    'li',
    'span',
    'a',
  ],
  allowedAttributes: {
    a: ['href', 'target', 'rel'],
    span: [],
  },
  allowedSchemes: ['http', 'https', 'mailto', 'tel'],
  disallowedTagsMode: 'discard',
  parser: {
    lowerCaseTags: true,
  },
  enforceHtmlBoundary: true,
};

function isJsonObject(value: unknown): value is JsonObject {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

export function sanitizeContent(value: unknown): unknown {
  if (value === null || value === undefined) {
    return value;
  }

  if (typeof value === 'string') {
    return sanitizeHtml(value, SANITIZE_OPTIONS);
  }

  if (Array.isArray(value)) {
    return value.map((item) => sanitizeContent(item));
  }

  if (isJsonObject(value)) {
    const sanitizedEntries = Object.entries(value).map(([key, entryValue]) => [
      key,
      sanitizeContent(entryValue),
    ]);
    return Object.fromEntries(sanitizedEntries);
  }

  return value;
}

export function getPhotoUrlFromContent(content: unknown): string | undefined {
  if (!isJsonObject(content)) {
    return undefined;
  }

  const photoUrl = content.photo_url;
  return typeof photoUrl === 'string' ? photoUrl : undefined;
}

export function isJsonContentObject(value: unknown): value is JsonObject {
  return isJsonObject(value);
}
