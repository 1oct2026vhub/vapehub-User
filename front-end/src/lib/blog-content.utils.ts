/**
 * Normalizes blog HTML from the API so headings, lists, and tables render with `.rich-text` styles.
 * Handles escaped HTML and content pasted as plain lines (often one <p> per line).
 *
 * Entity-decoding is private and only runs inside prepareBlogHtml, which always
 * sanitizes afterward so decode cannot re-enable script/event-handler markup.
 */

import { sanitizeHtml } from '@/lib/sanitize-html';

const BLOCK_TAG_RE = /<(p|div|h[1-6]|ul|ol|li|table|figure|blockquote)\b/i;

/** Decode entity-escaped HTML when tags were stored as text. Not exported — always followed by sanitize. */
function decodeBlogHtmlIfEscaped(html: string): string {
  const trimmed = html.trim();
  if (!trimmed || BLOCK_TAG_RE.test(trimmed)) return html;
  if (!/&lt;\s*\/?\s*(p|div|h[1-6]|ul|ol|table|br)\b/i.test(trimmed)) return html;

  return trimmed
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&amp;/g, '&');
}

/** Plain text (no tags) → paragraphs, headings, and simple lists. */
export function plainTextToBlogHtml(text: string): string {
  const lines = text.split(/\r?\n/).map((line) => line.trim());
  const parts: string[] = [];
  let listBuffer: string[] = [];

  const flushList = () => {
    if (listBuffer.length === 0) return;
    parts.push(`<ul>${listBuffer.map((item) => `<li>${escapeHtml(item)}</li>`).join('')}</ul>`);
    listBuffer = [];
  };

  for (const line of lines) {
    if (!line) {
      flushList();
      continue;
    }

    const heading = line.match(/^(#{1,6})\s+(.+)$/);
    if (heading) {
      flushList();
      const level = Math.min(heading[1].length, 6);
      parts.push(`<h${level}>${escapeHtml(heading[2])}</h${level}>`);
      continue;
    }

    const bullet = line.match(/^[-*•]\s+(.+)$/);
    if (bullet) {
      listBuffer.push(bullet[1]);
      continue;
    }

    flushList();
    parts.push(`<p>${escapeHtml(line)}</p>`);
  }

  flushList();
  return parts.join('');
}

function escapeHtml(text: string): string {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

/** Extract inner text from a <p>...</p> chunk (editor output). */
function paragraphText(pTag: string): string {
  return pTag.replace(/^<p[^>]*>/i, '').replace(/<\/p>$/i, '').trim();
}

function isTableHeaderParagraph(text: string): boolean {
  return /^(feature|category)$/i.test(text);
}

function isSectionLabelParagraph(text: string): boolean {
  return /^(pros|cons)\s*:?\s*$/i.test(text);
}

/** "Pros:" / "Cons:" followed by <p> lines → labelled list. */
export function convertLabelledParagraphLists(html: string): string {
  const paragraphBlocks = html.split(/(?=<p[\s>])/i).filter(Boolean);
  if (paragraphBlocks.length < 2) return html;

  const result: string[] = [];
  let i = 0;

  while (i < paragraphBlocks.length) {
    const block = paragraphBlocks[i];
    const labelMatch = block.match(/^<p[^>]*>\s*(?:<strong>)?(Pros|Cons)\s*:?(?:<\/strong>)?\s*<\/p>$/i);
    if (!labelMatch) {
      result.push(block);
      i += 1;
      continue;
    }

    const label = labelMatch[1];
    const items: string[] = [];
    i += 1;

    while (i < paragraphBlocks.length) {
      const next = paragraphBlocks[i];
      if (!/^<p[\s>]/i.test(next)) break;
      const text = paragraphText(next);
      if (isSectionLabelParagraph(text)) break;
      if (isTableHeaderParagraph(text)) break;
      if (/^#{1,6}\s/.test(text)) break;
      items.push(text);
      i += 1;
    }

    if (items.length > 0) {
      result.push(
        `<p><strong>${label}:</strong></p><ul>${items.map((t) => `<li>${t}</li>`).join('')}</ul>`,
      );
    } else {
      result.push(block);
    }
  }

  return result.join('');
}

/**
 * Detects comparison tables stored as repeated <p> rows (3 cells per row) and rebuilds a <table>.
 */
export function convertParagraphTablesToHtml(html: string): string {
  const paragraphBlocks = html.match(/<p[^>]*>[\s\S]*?<\/p>/gi);
  if (!paragraphBlocks || paragraphBlocks.length < 6) return html;

  const texts = paragraphBlocks.map(paragraphText);
  const featureIdx = texts.findIndex((t) => /^(feature|category)$/i.test(t));
  if (featureIdx === -1 || featureIdx + 2 >= texts.length) return html;

  const headerLabel = texts[featureIdx];
  const col1 = texts[featureIdx + 1];
  const col2 = texts[featureIdx + 2];
  const dataStart = featureIdx + 3;
  const dataTexts = texts.slice(dataStart);
  if (dataTexts.length < 3 || dataTexts.length % 3 !== 0) return html;

  const rows: string[][] = [];
  for (let i = 0; i < dataTexts.length; i += 3) {
    rows.push([dataTexts[i], dataTexts[i + 1], dataTexts[i + 2]]);
  }

  const tableHtml = [
    '<table>',
    '<thead><tr>',
    `<th>${headerLabel}</th><th>${col1}</th><th>${col2}</th>`,
    '</tr></thead>',
    '<tbody>',
    ...rows.map(
      ([feature, a, b]) => `<tr><td>${feature}</td><td>${a}</td><td>${b}</td></tr>`,
    ),
    '</tbody></table>',
  ].join('');

  const firstTableParagraph = paragraphBlocks[featureIdx];
  const lastTableParagraph = paragraphBlocks[dataStart + dataTexts.length - 1];
  const tableStart = html.indexOf(firstTableParagraph);
  if (tableStart === -1) return html;
  const tableEnd = html.indexOf(lastTableParagraph, tableStart) + lastTableParagraph.length;

  return `${html.slice(0, tableStart)}${tableHtml}${html.slice(tableEnd)}`;
}

/** Main entry: normalize blog body HTML before dangerouslySetInnerHTML. */
export function prepareBlogHtml(content: string): string {
  if (!content?.trim()) return '';

  let html = decodeBlogHtmlIfEscaped(content.trim());

  if (!BLOCK_TAG_RE.test(html)) {
    html = plainTextToBlogHtml(html);
  }

  if (/<p[\s>]/i.test(html)) {
    html = convertLabelledParagraphLists(html);
    html = convertParagraphTablesToHtml(html);
  }

  return sanitizeHtml(html);
}
