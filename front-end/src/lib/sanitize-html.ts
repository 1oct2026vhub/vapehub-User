import DOMPurify from 'isomorphic-dompurify';

/**
 * Sanitize untrusted HTML before dangerouslySetInnerHTML.
 * Strips scripts, event handlers (e.g. onerror), and other XSS vectors
 * while preserving normal rich-text markup (paragraphs, lists, links, tables).
 */
export function sanitizeHtml(dirty: string | null | undefined): string {
  if (!dirty) return '';
  return DOMPurify.sanitize(dirty, { USE_PROFILES: { html: true } });
}
