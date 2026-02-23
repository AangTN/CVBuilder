const ALLOWED_TAGS = new Set([
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
]);

const SAFE_URL_PROTOCOLS = ['http:', 'https:', 'mailto:'];

const stripDangerousPatterns = (value: string): string => {
  return value
    .replace(/<script[\s\S]*?>[\s\S]*?<\/script>/gi, '')
    .replace(/<\/?(iframe|object|embed|svg|math|style|link|meta)[^>]*>/gi, '')
    .replace(/\s+on[a-z]+\s*=\s*(['"]).*?\1/gi, '')
    .replace(/\s+on[a-z]+\s*=\s*[^\s>]+/gi, '')
    .replace(/javascript\s*:/gi, '')
    .replace(/data\s*:\s*text\/html/gi, '');
};

export const sanitizeRichText = (input?: string | null): string => {
  if (!input) return '';

  const preSanitized = stripDangerousPatterns(input);

  if (typeof window === 'undefined' || typeof DOMParser === 'undefined') {
    return preSanitized;
  }

  const parser = new DOMParser();
  const doc = parser.parseFromString(preSanitized, 'text/html');

  const walk = (node: Node) => {
    if (node.nodeType === Node.ELEMENT_NODE) {
      const element = node as HTMLElement;
      const tagName = element.tagName.toLowerCase();

      if (!ALLOWED_TAGS.has(tagName)) {
        const parent = element.parentNode;
        if (parent) {
          while (element.firstChild) {
            parent.insertBefore(element.firstChild, element);
          }
          parent.removeChild(element);
          return;
        }
      } else {
        const attrs = Array.from(element.attributes);
        attrs.forEach((attr) => {
          const attrName = attr.name.toLowerCase();
          const attrValue = attr.value;

          if (attrName.startsWith('on')) {
            element.removeAttribute(attr.name);
            return;
          }

          if (tagName === 'a' && attrName === 'href') {
            try {
              const parsed = new URL(attrValue, window.location.origin);
              if (!SAFE_URL_PROTOCOLS.includes(parsed.protocol)) {
                element.removeAttribute(attr.name);
              }
            } catch {
              element.removeAttribute(attr.name);
            }
            return;
          }

          if (!(tagName === 'a' && (attrName === 'href' || attrName === 'target' || attrName === 'rel'))) {
            element.removeAttribute(attr.name);
          }
        });

        if (tagName === 'a' && element.hasAttribute('target')) {
          element.setAttribute('rel', 'noopener noreferrer');
        }
      }
    }

    Array.from(node.childNodes).forEach(walk);
  };

  Array.from(doc.body.childNodes).forEach(walk);
  return doc.body.innerHTML;
};
