/**
 * Normalizes blog HTML from the API so headings, lists, and tables render with `.rich-text` styles.
 * Handles escaped HTML and content pasted as plain lines (often one <p> per line).
 */

import {
  BLOG_INDUSTRY_QUOTE_TEST_MODE,
  DEFAULT_INDUSTRY_QUOTE,
} from "@/lib/config/blog-industry-quote.config";
import {
  BLOG_RENDER_INDUSTRY_QUOTE,
  BLOG_RENDER_PROMO_BANNER,
  BLOG_RENDER_WAREHOUSE_CALLOUT,
} from "@/lib/config/blog-optional-blocks.config";
import {
  BLOG_PROMO_BANNER_TEST_MODE,
  DEFAULT_PROMO_BANNER,
} from "@/lib/config/blog-promo-banner.config";
import {
  BLOG_WAREHOUSE_CALLOUT_TEST_MODE,
  DEFAULT_WAREHOUSE_CALLOUT,
} from "@/lib/config/blog-warehouse-callout.config";
import {
  BlogFirstPersonCallout,
  BlogInlineProductCard,
  BlogPullQuote,
  BlogSourceItem,
} from "@/lib/config/blog.config";

const BLOCK_TAG_RE = /<(p|div|h[1-6]|ul|ol|li|table|figure|blockquote)\b/i;

/** Decode entity-escaped HTML when tags were stored as text. */
export function decodeBlogHtmlIfEscaped(html: string): string {
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

export interface BlogHeading {
  id: string;
  text: string;
  index: number;
}

function slugifyHeading(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^\w\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .trim();
}

function stripHtmlTags(html: string): string {
  return html.replace(/<[^>]+>/g, '').trim();
}

/** Split the opening paragraph from the rest of the article body. */
export function splitBlogIntroAndBody(html: string): { introHtml: string; bodyHtml: string } {
  const trimmed = html.trim();
  const match = trimmed.match(/^<p[^>]*>[\s\S]*?<\/p>/i);
  if (!match) return { introHtml: '', bodyHtml: trimmed };

  return {
    introHtml: match[0],
    bodyHtml: trimmed.slice(match[0].length).trim(),
  };
}

/** Add stable ids to h2 headings and collect them for the table of contents. */
export function injectBlogHeadingIds(html: string): { html: string; headings: BlogHeading[] } {
  const usedIds = new Map<string, number>();
  const headings: BlogHeading[] = [];
  let index = 0;

  const updatedHtml = html.replace(
    /<h2([^>]*)>([\s\S]*?)<\/h2>/gi,
    (match, attrs, inner) => {
      const text = stripHtmlTags(inner);
      if (!text) return match;

      const existingId = attrs.match(/\bid=["']([^"']+)["']/i)?.[1];
      if (existingId) {
        headings.push({ id: existingId, text, index });
        index += 1;
        return match;
      }

      const baseId = slugifyHeading(text);
      const count = usedIds.get(baseId) ?? 0;
      usedIds.set(baseId, count + 1);
      const id = count > 0 ? `${baseId}-${count}` : baseId;

      headings.push({ id, text, index });
      index += 1;
      return `<h2${attrs} id="${id}">${inner}</h2>`;
    },
  );

  return { html: updatedHtml, headings };
}

const BLOG_SOURCES_SECTION_RE =
  /<(?:section|div)[^>]*\bclass=["'][^"']*\bblog-sources\b[^"']*["'][^>]*>[\s\S]*?<\/(?:section|div)>/gi;

function parseSourcesFromListHtml(innerHtml: string): BlogSourceItem[] {
  const items: BlogSourceItem[] = [];

  for (const match of innerHtml.matchAll(/<li[^>]*>([\s\S]*?)<\/li>/gi)) {
    const liContent = match[1];
    const href = liContent.match(/<a[^>]+href=["']([^"']+)["']/i)?.[1];
    const label = stripHtmlTags(liContent.match(/<a[^>]*>([\s\S]*?)<\/a>/i)?.[1] ?? "");
    const description = stripHtmlTags(
      liContent.replace(/<a[\s\S]*?<\/a>/i, "").replace(/^[\s—–-]+/, "").trim(),
    );

    if (href && label) {
      items.push({ label, href, description });
    }
  }

  return items;
}

/** Pull optional CMS sources block from article HTML and remove it from the body. */
export function extractAndStripBlogSources(html: string): {
  html: string;
  sources: BlogSourceItem[];
} {
  const sectionMatch = html.match(BLOG_SOURCES_SECTION_RE);
  if (!sectionMatch) return { html, sources: [] };

  const section = sectionMatch[0];
  const openTag = section.match(/^<(?:section|div)[^>]*>/i)?.[0] ?? "";
  const dataSources = openTag.match(/data-sources=["']([^"']*)["']/i)?.[1];
  let sources: BlogSourceItem[] = [];

  if (dataSources) {
    try {
      const parsed = JSON.parse(dataSources.replace(/&quot;/g, '"')) as unknown;
      if (Array.isArray(parsed)) {
        sources = parsed
          .filter((item): item is BlogSourceItem => {
            return (
              typeof item === "object" &&
              item !== null &&
              typeof (item as BlogSourceItem).label === "string" &&
              typeof (item as BlogSourceItem).href === "string"
            );
          })
          .map((item) => ({
            label: item.label,
            href: item.href,
            description: item.description ?? "",
          }));
      }
    } catch {
      sources = [];
    }
  }

  if (!sources.length) {
    sources = parseSourcesFromListHtml(section);
  }

  return {
    html: html.replace(section, "").trim(),
    sources,
  };
}

/** Keep in-body superscript citation anchors pointed at numbered source ids. */
export function normalizeBlogCitationLinks(html: string): string {
  return html.replace(
    /<sup([^>]*)>\s*<a([^>]*?)href=["']#s(\d+)["']([^>]*)>/gi,
    (_match, supAttrs, before, sourceNumber, after) =>
      `<sup${supAttrs}><a${before}href="#s${sourceNumber}"${after}>`,
  );
}

export interface BlogWarehouseCalloutSegment {
  type: "warehouse-callout";
  label: string;
  title: string;
  bodyHtml: string;
}

export interface BlogIndustryQuoteSegment {
  type: "industry-quote";
  quote: string;
  attribution: string;
}

export interface BlogPromoBannerSegment {
  type: "promo-banner";
  badge?: string;
  title: string;
  description: string;
  buttonLabel: string;
  buttonHref: string;
  imageUrl: string;
  imageAlt: string;
}

export interface BlogHtmlSegment {
  type: "html";
  content: string;
}

export type BlogBodySegment =
  | BlogHtmlSegment
  | BlogWarehouseCalloutSegment
  | BlogIndustryQuoteSegment
  | BlogPromoBannerSegment;

export interface BlogOptionalBlocks {
  pullQuote?: BlogPullQuote | null;
  inlineProductCard?: BlogInlineProductCard | null;
}

function normalizeBlogProductHref(url: string): string {
  if (!url) return "/";
  if (url.match(/^(https?:\/\/|mailto:|tel:|#|\/)/)) return url;
  return `/${url}`;
}

function hasPullQuoteData(pullQuote?: BlogPullQuote | null): pullQuote is BlogPullQuote {
  return Boolean(pullQuote?.body?.trim());
}

function hasInlineProductCardData(
  inlineProductCard?: BlogInlineProductCard | null,
): inlineProductCard is BlogInlineProductCard {
  const product = inlineProductCard?.product;
  return Boolean(product?.title?.trim() && product?.url?.trim() && product?.image?.trim());
}

function mapPullQuoteToSegment(pullQuote: BlogPullQuote): BlogIndustryQuoteSegment {
  return {
    type: "industry-quote",
    quote: pullQuote.body.trim(),
    attribution: pullQuote.attribution?.trim() ?? "",
  };
}

function mapInlineProductCardToSegment(
  inlineProductCard: BlogInlineProductCard,
): BlogPromoBannerSegment {
  const product = inlineProductCard.product;

  return {
    type: "promo-banner",
    badge: DEFAULT_PROMO_BANNER.badge,
    title: product.title.trim(),
    description: product.blurb?.trim() ?? "",
    buttonLabel: inlineProductCard.cta_label?.trim() || "Shop now",
    buttonHref: normalizeBlogProductHref(product.url.trim()),
    imageUrl: product.image.trim(),
    imageAlt: product.title.trim(),
  };
}

const WAREHOUSE_CALLOUT_DIV_RE =
  /<div[^>]*\bclass=["'][^"']*\bblog-warehouse-callout\b[^"']*["'][^>]*(?:\/>|>[\s\S]*?<\/div>)/gi;

const INDUSTRY_QUOTE_DIV_RE =
  /<div[^>]*\bclass=["'][^"']*\bblog-industry-quote\b[^"']*["'][^>]*\s*\/?>/gi;

const PROMO_BANNER_DIV_RE =
  /<div[^>]*\bclass=["'][^"']*\bblog-promo-banner\b[^"']*["'][^>]*\s*\/?>/gi;

const BLOCK_OR_P_RE = /<(?:p|h[2-6])[^>]*>[\s\S]*?<\/(?:p|h[2-6])>/gi;

function escapeCalloutAttr(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/"/g, "&quot;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}

function decodeCalloutAttr(value: string): string {
  return value
    .replace(/&quot;/g, '"')
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&amp;/g, "&");
}

function buildIndustryQuoteDiv(quote: string, attribution: string): string {
  return `<div class="blog-industry-quote" data-quote="${escapeCalloutAttr(quote)}" data-attribution="${escapeCalloutAttr(attribution)}"></div>`;
}

function buildDefaultIndustryQuoteDiv(): string {
  return buildIndustryQuoteDiv(
    DEFAULT_INDUSTRY_QUOTE.quote,
    DEFAULT_INDUSTRY_QUOTE.attribution,
  );
}

function hasIndustryQuoteMarker(html: string): boolean {
  return /blog-industry-quote/i.test(html);
}

function buildPromoBannerDiv(
  badge: string,
  title: string,
  description: string,
  buttonLabel: string,
  buttonHref: string,
  imageUrl: string,
  imageAlt: string,
): string {
  return `<div class="blog-promo-banner" data-badge="${escapeCalloutAttr(badge)}" data-title="${escapeCalloutAttr(title)}" data-description="${escapeCalloutAttr(description)}" data-button-label="${escapeCalloutAttr(buttonLabel)}" data-button-href="${escapeCalloutAttr(buttonHref)}" data-image-url="${escapeCalloutAttr(imageUrl)}" data-image-alt="${escapeCalloutAttr(imageAlt)}"></div>`;
}

function buildDefaultPromoBannerDiv(): string {
  return buildPromoBannerDiv(
    DEFAULT_PROMO_BANNER.badge,
    DEFAULT_PROMO_BANNER.title,
    DEFAULT_PROMO_BANNER.description,
    DEFAULT_PROMO_BANNER.buttonLabel,
    DEFAULT_PROMO_BANNER.buttonHref,
    DEFAULT_PROMO_BANNER.imageUrl,
    DEFAULT_PROMO_BANNER.imageAlt,
  );
}

function hasPromoBannerMarker(html: string): boolean {
  return /blog-promo-banner/i.test(html);
}

function buildWarehouseCalloutDiv(label: string, title: string, bodyHtml: string): string {
  return `<div class="blog-warehouse-callout" data-label="${escapeCalloutAttr(label)}" data-title="${escapeCalloutAttr(title)}" data-body-html="${escapeCalloutAttr(bodyHtml)}"></div>`;
}

const PARAGRAPH_TAG_RE = /<p[^>]*>[\s\S]*?<\/p>/gi;

function insertAfterParagraph(html: string, paragraphIndex: number, insertHtml: string): string {
  if (paragraphIndex < 1 || !insertHtml) return html;

  const paragraphRanges: Array<{ end: number }> = [];
  for (const match of html.matchAll(PARAGRAPH_TAG_RE)) {
    if (match.index !== undefined) {
      paragraphRanges.push({ end: match.index + match[0].length });
    }
  }

  const target = paragraphRanges[paragraphIndex - 1];
  if (!target) return html;

  return `${html.slice(0, target.end)}${insertHtml}${html.slice(target.end)}`;
}

/** Insert API first_person_callouts as warehouse callout markers at 1-based paragraph positions. */
export function insertApiFirstPersonCallouts(
  html: string,
  callouts?: BlogFirstPersonCallout[] | null,
): string {
  if (!callouts?.length) return html;

  const sortedCallouts = [...callouts].sort(
    (a, b) => b.insert_after_paragraph - a.insert_after_paragraph,
  );

  return sortedCallouts.reduce((result, callout) => {
    const heading = callout.heading?.trim();
    const body = callout.body?.trim();
    if (!heading || !body || callout.insert_after_paragraph < 1) return result;

    const marker = buildWarehouseCalloutDiv(
      callout.label?.trim() || DEFAULT_WAREHOUSE_CALLOUT.label,
      heading,
      body,
    );

    return insertAfterParagraph(result, callout.insert_after_paragraph, marker);
  }, html);
}

function buildDefaultWarehouseCalloutDiv(): string {
  return buildWarehouseCalloutDiv(
    DEFAULT_WAREHOUSE_CALLOUT.label,
    DEFAULT_WAREHOUSE_CALLOUT.title,
    DEFAULT_WAREHOUSE_CALLOUT.bodyHtml,
  );
}

function hasWarehouseCalloutMarker(html: string): boolean {
  return /blog-warehouse-callout/i.test(html);
}

/** Convert blockquote warehouse notes into callout markers. */
export function convertWarehouseCalloutBlockquotes(html: string): string {
  return html.replace(/<blockquote([^>]*)>([\s\S]*?)<\/blockquote>/gi, (match, _attrs, inner) => {
    if (!/from our warehouse/i.test(inner)) return match;

    const paragraphs = inner.match(/<p[^>]*>[\s\S]*?<\/p>/gi) ?? [];
    if (paragraphs.length < 2) return match;

    const label = stripHtmlTags(paragraphs[0]);
    const title = stripHtmlTags(paragraphs[1]);
    const bodyHtml = paragraphs.slice(2).join("");

    return buildWarehouseCalloutDiv(label, title, bodyHtml);
  });
}

/** Convert label/title/body blocks (p or h3–h6) into a callout marker. */
export function convertWarehouseCalloutFlexible(html: string): string {
  if (hasWarehouseCalloutMarker(html)) return html;

  const pattern =
    /<(?:p|h[2-6])[^>]*>[\s\S]*?FROM OUR WAREHOUSE[\s\S]*?<\/(?:p|h[2-6])>\s*<(?:p|h[2-6])[^>]*>[\s\S]*?<\/(?:p|h[2-6])>\s*<p[^>]*>[\s\S]*?<\/p>/gi;

  return html.replace(pattern, (fullMatch) => {
    const blocks = fullMatch.match(/<(?:p|h[2-6])[^>]*>[\s\S]*?<\/(?:p|h[2-6])>/gi) ?? [];
    if (blocks.length < 3) return fullMatch;

    const label = stripHtmlTags(blocks[0] ?? "");
    const title = stripHtmlTags(blocks[1] ?? "");
    const bodyHtml = blocks[2] ?? "";

    if (!title || !bodyHtml) return fullMatch;

    return buildWarehouseCalloutDiv(label, title, bodyHtml);
  });
}

/** Convert a 3-paragraph warehouse note sequence into a callout marker. */
export function convertWarehouseCalloutParagraphs(html: string): string {
  if (hasWarehouseCalloutMarker(html)) return html;

  const pattern =
    /<p[^>]*>\s*(?:<(?:strong|b|em|span)[^>]*>\s*)?FROM OUR WAREHOUSE(?:\s*<\/(?:strong|b|em|span)>)?\s*<\/p>\s*<p[^>]*>\s*(?:<(?:strong|b)>)?([\s\S]*?)(?:<\/(?:strong|b)>)?\s*<\/p>\s*<p[^>]*>([\s\S]*?)<\/p>/gi;

  return html.replace(pattern, (_match, titleRaw, bodyRaw) => {
    const title = stripHtmlTags(titleRaw);
    const bodyHtml = bodyRaw.trim();
    return buildWarehouseCalloutDiv("FROM OUR WAREHOUSE", title, bodyHtml);
  });
}

/** Extract trailing warehouse paragraphs and replace with a callout marker. */
function tryExtractTrailingWarehouseCallout(html: string): { prefix: string; calloutHtml: string } | null {
  const warehouseIdx = html.search(/FROM OUR WAREHOUSE|rotate stock by batch code|VapeHub turns over thousands of bottles/i);
  if (warehouseIdx === -1) return null;

  const tail = html.slice(warehouseIdx);
  const blocks = tail.match(BLOCK_OR_P_RE);
  if (!blocks || blocks.length < 2) return null;

  let label = "FROM OUR WAREHOUSE";
  let titleBlockIdx = 0;
  let bodyBlockIdx = 1;

  if (/FROM OUR WAREHOUSE/i.test(blocks[0])) {
    if (blocks.length < 3) return null;
    label = stripHtmlTags(blocks[0]);
    titleBlockIdx = 1;
    bodyBlockIdx = 2;
  }

  const title = stripHtmlTags(blocks[titleBlockIdx]);
  const bodyHtml = blocks[bodyBlockIdx];
  const consumedLength = blocks
    .slice(0, bodyBlockIdx + 1)
    .reduce((sum, block) => sum + block.length, 0);

  const prefix = html.slice(0, warehouseIdx) + tail.slice(consumedLength);
  const calloutHtml = buildWarehouseCalloutDiv(label, title, bodyHtml);

  return { prefix, calloutHtml };
}

function findSignsHeadingIndex(html: string): number {
  const headingRe = /<h[2-4][^>]*>[\s\S]*?<\/h[2-4]>/gi;

  for (const match of html.matchAll(headingRe)) {
    const headingText = stripHtmlTags(match[0]);
    if (
      /signs/i.test(headingText) &&
      /(?:out[\s-]*of[\s-]*date|expired|spoiled|e-liquid|eliquid|vape\s*juice)/i.test(
        headingText,
      )
    ) {
      return match.index ?? -1;
    }
  }

  for (const match of html.matchAll(headingRe)) {
    const headingText = stripHtmlTags(match[0]);
    if (/signs/i.test(headingText)) {
      return match.index ?? -1;
    }
  }

  return -1;
}

/** Insert callout before the "signs of out of date" section when structure matches the design. */
export function injectWarehouseCalloutByPosition(html: string): string {
  if (hasWarehouseCalloutMarker(html)) return html;

  const insertCalloutBefore = (insertAt: number): string | null => {
    if (insertAt < 0) return null;

    const before = html.slice(0, insertAt);
    const extracted = tryExtractTrailingWarehouseCallout(before);
    if (extracted) {
      return extracted.prefix + extracted.calloutHtml + html.slice(insertAt);
    }

    return before + buildDefaultWarehouseCalloutDiv() + html.slice(insertAt);
  };

  const signsIndex = findSignsHeadingIndex(html);
  if (signsIndex >= 0) {
    const result = insertCalloutBefore(signsIndex);
    if (result) return result;
  }

  const openingEnd = findOpeningSectionEndIndex(html);
  if (openingEnd >= 0) {
    const result = insertCalloutBefore(openingEnd);
    if (result) return result;
  }

  const extracted = tryExtractTrailingWarehouseCallout(html);
  if (extracted) {
    return extracted.prefix + extracted.calloutHtml;
  }

  return html;
}

function findOpeningSectionEndIndex(html: string): number {
  const headingRe = /<h[23][^>]*>[\s\S]*?<\/h[23]>/gi;

  for (const match of html.matchAll(headingRe)) {
    const headingText = stripHtmlTags(match[0]);
    if (
      /(?:off after opening|after opening|go(?:es)?\s+off|shelf\s*life|go\s+out\s+of\s+date)/i.test(
        headingText,
      )
    ) {
      const sectionStart = (match.index ?? 0) + match[0].length;
      const afterSection = html.slice(sectionStart);
      const nextHeading = afterSection.search(/<h[23][\s>]/i);
      return nextHeading === -1 ? html.length : sectionStart + nextHeading;
    }
  }

  return -1;
}

/** Inject default test callout when CMS content has none (testing only). */
export function injectTestWarehouseCallout(html: string): string {
  if (!BLOG_WAREHOUSE_CALLOUT_TEST_MODE || hasWarehouseCalloutMarker(html)) {
    return html;
  }

  const signsIndex = findSignsHeadingIndex(html);
  if (signsIndex >= 0) {
    return html.slice(0, signsIndex) + buildDefaultWarehouseCalloutDiv() + html.slice(signsIndex);
  }

  const openingEnd = findOpeningSectionEndIndex(html);
  if (openingEnd >= 0) {
    return html.slice(0, openingEnd) + buildDefaultWarehouseCalloutDiv() + html.slice(openingEnd);
  }

  const firstHeadingEnd = html.search(/<\/h[2-4]>/i);
  if (firstHeadingEnd >= 0) {
    const splitAt = firstHeadingEnd + 5;
    return html.slice(0, splitAt) + buildDefaultWarehouseCalloutDiv() + html.slice(splitAt);
  }

  return buildDefaultWarehouseCalloutDiv() + html;
}

/** Ensure parsed segments include a test callout when enabled. */
export function ensureTestWarehouseCalloutSegments(segments: BlogBodySegment[]): BlogBodySegment[] {
  if (!BLOG_WAREHOUSE_CALLOUT_TEST_MODE) return segments;
  if (segments.some((segment) => segment.type === "warehouse-callout")) return segments;

  const callout: BlogWarehouseCalloutSegment = {
    type: "warehouse-callout",
    label: DEFAULT_WAREHOUSE_CALLOUT.label,
    title: DEFAULT_WAREHOUSE_CALLOUT.title,
    bodyHtml: DEFAULT_WAREHOUSE_CALLOUT.bodyHtml,
  };

  if (segments.length === 1 && segments[0].type === "html") {
    const html = segments[0].content;
    const signsIndex = findSignsHeadingIndex(html);
    if (signsIndex > 0) {
      const nextSegments: BlogBodySegment[] = [
        { type: "html", content: html.slice(0, signsIndex).trim() },
        callout,
        { type: "html", content: html.slice(signsIndex).trim() },
      ];
      return nextSegments.filter(
        (segment) => segment.type !== "html" || segment.content.length > 0,
      );
    }

    const openingEnd = findOpeningSectionEndIndex(html);
    if (openingEnd > 0) {
      const nextSegments: BlogBodySegment[] = [
        { type: "html", content: html.slice(0, openingEnd).trim() },
        callout,
        { type: "html", content: html.slice(openingEnd).trim() },
      ];
      return nextSegments.filter(
        (segment) => segment.type !== "html" || segment.content.length > 0,
      );
    }
  }

  if (segments.length === 0) return [callout];

  return [segments[0], callout, ...segments.slice(1)];
}

function findVapesOutOfDateHeadingIndex(html: string): number {
  const headingRe = /<h[2-4][^>]*>[\s\S]*?<\/h[2-4]>/gi;

  for (const match of html.matchAll(headingRe)) {
    const headingText = stripHtmlTags(match[0]);
    if (/can vapes go out of date|vapes go out of date/i.test(headingText)) {
      return match.index ?? -1;
    }
  }

  for (const match of html.matchAll(headingRe)) {
    const headingText = stripHtmlTags(match[0]);
    if (/vapes/i.test(headingText) && /out[\s-]*of[\s-]*date/i.test(headingText)) {
      return match.index ?? -1;
    }
  }

  return -1;
}

function findFallbackIndustryQuoteIndex(html: string): number {
  const headingRe = /<h[2-4][^>]*>[\s\S]*?<\/h[2-4]>/gi;
  let count = 0;

  for (const match of html.matchAll(headingRe)) {
    count += 1;
    if (count === 3) return match.index ?? -1;
  }

  count = 0;
  for (const match of html.matchAll(headingRe)) {
    count += 1;
    if (count === 2) return match.index ?? -1;
  }

  return -1;
}

function findIndustryQuoteInsertIndex(html: string): number {
  const primary = findVapesOutOfDateHeadingIndex(html);
  if (primary >= 0) return primary;
  return findFallbackIndustryQuoteIndex(html);
}

/** Insert industry quote before the vapes expiry section when CMS markers are missing. */
export function injectIndustryQuoteByPosition(html: string): string {
  if (hasIndustryQuoteMarker(html)) return html;

  const insertAt = findIndustryQuoteInsertIndex(html);
  if (insertAt < 0) return html;

  return html.slice(0, insertAt) + buildDefaultIndustryQuoteDiv() + html.slice(insertAt);
}

/** Insert promo banner before the industry quote block when CMS markers are missing. */
export function injectPromoBannerByPosition(html: string): string {
  if (hasPromoBannerMarker(html)) return html;

  const industryMatch = html.match(/<div[^>]*\bblog-industry-quote\b[^>]*\s*\/?>/i);
  if (industryMatch?.index !== undefined) {
    return (
      html.slice(0, industryMatch.index) +
      buildDefaultPromoBannerDiv() +
      html.slice(industryMatch.index)
    );
  }

  const insertAt = findIndustryQuoteInsertIndex(html);
  if (insertAt < 0) return html;

  return html.slice(0, insertAt) + buildDefaultPromoBannerDiv() + html.slice(insertAt);
}

/** Inject default industry quote for testing before the vapes expiry section. */
export function injectTestIndustryQuote(html: string): string {
  if (!BLOG_INDUSTRY_QUOTE_TEST_MODE || hasIndustryQuoteMarker(html)) {
    return html;
  }

  const insertAt = findIndustryQuoteInsertIndex(html);
  if (insertAt < 0) return html;

  return html.slice(0, insertAt) + buildDefaultIndustryQuoteDiv() + html.slice(insertAt);
}

/** Inject default promo banner for testing before the industry quote block. */
export function injectTestPromoBanner(html: string): string {
  if (!BLOG_PROMO_BANNER_TEST_MODE || hasPromoBannerMarker(html)) {
    return html;
  }

  const industryMatch = html.match(/<div[^>]*\bblog-industry-quote\b[^>]*\s*\/?>/i);
  if (industryMatch?.index !== undefined) {
    return (
      html.slice(0, industryMatch.index) +
      buildDefaultPromoBannerDiv() +
      html.slice(industryMatch.index)
    );
  }

  const insertAt = findIndustryQuoteInsertIndex(html);
  if (insertAt < 0) return html;

  return html.slice(0, insertAt) + buildDefaultPromoBannerDiv() + html.slice(insertAt);
}

function insertPromoBannerSegment(
  segments: BlogBodySegment[],
  banner: BlogPromoBannerSegment,
): BlogBodySegment[] {
  const quoteIndex = segments.findIndex((segment) => segment.type === "industry-quote");
  if (quoteIndex >= 0) {
    return [...segments.slice(0, quoteIndex), banner, ...segments.slice(quoteIndex)];
  }

  if (segments.length === 1 && segments[0].type === "html") {
    const html = segments[0].content;
    const insertAt = findIndustryQuoteInsertIndex(html);
    if (insertAt > 0) {
      const nextSegments: BlogBodySegment[] = [
        { type: "html", content: html.slice(0, insertAt).trim() },
        banner,
        { type: "html", content: html.slice(insertAt).trim() },
      ];
      return nextSegments.filter(
        (segment) => segment.type !== "html" || segment.content.length > 0,
      );
    }
  }

  if (segments.length >= 2) {
    return [segments[0], banner, ...segments.slice(1)];
  }

  if (segments.length === 1) {
    return [segments[0], banner];
  }

  return [banner];
}

/** Ensure parsed segments include a promo banner when CMS markers are missing. */
export function ensurePromoBannerSegments(segments: BlogBodySegment[]): BlogBodySegment[] {
  if (segments.some((segment) => segment.type === "promo-banner")) return segments;

  const banner: BlogPromoBannerSegment = {
    type: "promo-banner",
    badge: DEFAULT_PROMO_BANNER.badge,
    title: DEFAULT_PROMO_BANNER.title,
    description: DEFAULT_PROMO_BANNER.description,
    buttonLabel: DEFAULT_PROMO_BANNER.buttonLabel,
    buttonHref: DEFAULT_PROMO_BANNER.buttonHref,
    imageUrl: DEFAULT_PROMO_BANNER.imageUrl,
    imageAlt: DEFAULT_PROMO_BANNER.imageAlt,
  };

  return insertPromoBannerSegment(segments, banner);
}

/** Ensure parsed segments include a test promo banner when enabled. */
export function ensureTestPromoBannerSegments(segments: BlogBodySegment[]): BlogBodySegment[] {
  if (!BLOG_PROMO_BANNER_TEST_MODE) return ensurePromoBannerSegments(segments);
  return ensurePromoBannerSegments(segments);
}

function insertIndustryQuoteSegment(
  segments: BlogBodySegment[],
  callout: BlogIndustryQuoteSegment,
): BlogBodySegment[] {
  if (segments.length === 1 && segments[0].type === "html") {
    const html = segments[0].content;
    const insertAt = findIndustryQuoteInsertIndex(html);
    if (insertAt > 0) {
      const nextSegments: BlogBodySegment[] = [
        { type: "html", content: html.slice(0, insertAt).trim() },
        callout,
        { type: "html", content: html.slice(insertAt).trim() },
      ];
      return nextSegments.filter(
        (segment) => segment.type !== "html" || segment.content.length > 0,
      );
    }
  }

  if (segments.length === 0) return [callout];

  return [segments[0], callout, ...segments.slice(1)];
}

/** Ensure parsed segments include an industry quote when CMS markers are missing. */
export function ensureIndustryQuoteSegments(segments: BlogBodySegment[]): BlogBodySegment[] {
  if (segments.some((segment) => segment.type === "industry-quote")) return segments;

  const quote: BlogIndustryQuoteSegment = {
    type: "industry-quote",
    quote: DEFAULT_INDUSTRY_QUOTE.quote,
    attribution: DEFAULT_INDUSTRY_QUOTE.attribution,
  };

  return insertIndustryQuoteSegment(segments, quote);
}

/** Ensure parsed segments include a test industry quote when enabled. */
export function ensureTestIndustryQuoteSegments(segments: BlogBodySegment[]): BlogBodySegment[] {
  if (!BLOG_INDUSTRY_QUOTE_TEST_MODE) return ensureIndustryQuoteSegments(segments);
  return ensureIndustryQuoteSegments(segments);
}

/** Apply API-driven optional body blocks when present. */
export function ensureBlogBodySegments(
  segments: BlogBodySegment[],
  optionalBlocks?: BlogOptionalBlocks,
): BlogBodySegment[] {
  let result = segments;

  if (BLOG_RENDER_WAREHOUSE_CALLOUT) {
    result = ensureTestWarehouseCalloutSegments(result);
  }

  if (BLOG_RENDER_INDUSTRY_QUOTE && hasPullQuoteData(optionalBlocks?.pullQuote)) {
    if (!result.some((segment) => segment.type === "industry-quote")) {
      result = insertIndustryQuoteSegment(result, mapPullQuoteToSegment(optionalBlocks.pullQuote));
    }
  }

  if (BLOG_RENDER_PROMO_BANNER && hasInlineProductCardData(optionalBlocks?.inlineProductCard)) {
    if (!result.some((segment) => segment.type === "promo-banner")) {
      result = insertPromoBannerSegment(
        result,
        mapInlineProductCardToSegment(optionalBlocks.inlineProductCard),
      );
    }
  }

  return result;
}

/** @deprecated Use ensureBlogBodySegments */
export function ensureTestBlogBodySegments(segments: BlogBodySegment[]): BlogBodySegment[] {
  return ensureBlogBodySegments(segments);
}

/** Run optional body-block transforms on article HTML. */
export function processBlogBodyHtml(
  html: string,
  options?: { skipWarehouseHeuristics?: boolean },
): string {
  let result = html;

  if (BLOG_RENDER_WAREHOUSE_CALLOUT && !options?.skipWarehouseHeuristics) {
    result = convertWarehouseCalloutBlockquotes(result);
    result = convertWarehouseCalloutFlexible(result);
    result = convertWarehouseCalloutParagraphs(result);
    result = injectWarehouseCalloutByPosition(result);
    result = injectTestWarehouseCallout(result);
  }

  result = wrapBlogTablesForScroll(result);
  return result;
}

function parsePromoBannerDiv(fullMatch: string): BlogPromoBannerSegment {
  const openTag = fullMatch.match(/^<div[^>]*>/i)?.[0] ?? "";

  return {
    type: "promo-banner",
    badge: openTag.match(/data-badge=["']([^"']*)["']/i)?.[1] ?? DEFAULT_PROMO_BANNER.badge,
    title: openTag.match(/data-title=["']([^"']*)["']/i)?.[1] ?? DEFAULT_PROMO_BANNER.title,
    description:
      openTag.match(/data-description=["']([^"']*)["']/i)?.[1] ??
      DEFAULT_PROMO_BANNER.description,
    buttonLabel:
      openTag.match(/data-button-label=["']([^"']*)["']/i)?.[1] ??
      DEFAULT_PROMO_BANNER.buttonLabel,
    buttonHref:
      openTag.match(/data-button-href=["']([^"']*)["']/i)?.[1] ??
      DEFAULT_PROMO_BANNER.buttonHref,
    imageUrl:
      openTag.match(/data-image-url=["']([^"']*)["']/i)?.[1] ?? DEFAULT_PROMO_BANNER.imageUrl,
    imageAlt:
      openTag.match(/data-image-alt=["']([^"']*)["']/i)?.[1] ?? DEFAULT_PROMO_BANNER.imageAlt,
  };
}

function parseIndustryQuoteDiv(fullMatch: string): BlogIndustryQuoteSegment {
  const openTag = fullMatch.match(/^<div[^>]*>/i)?.[0] ?? "";
  const quote =
    openTag.match(/data-quote=["']([^"']*)["']/i)?.[1] ?? DEFAULT_INDUSTRY_QUOTE.quote;
  const attribution =
    openTag.match(/data-attribution=["']([^"']*)["']/i)?.[1] ??
    DEFAULT_INDUSTRY_QUOTE.attribution;

  return { type: "industry-quote", quote, attribution };
}

type BodyMarkerMatch = {
  index: number;
  length: number;
  segment: BlogBodySegment;
};

function collectBodyMarkers(html: string): BodyMarkerMatch[] {
  const markers: BodyMarkerMatch[] = [];

  for (const match of html.matchAll(WAREHOUSE_CALLOUT_DIV_RE)) {
    markers.push({
      index: match.index ?? 0,
      length: match[0].length,
      segment: parseWarehouseCalloutDiv(match[0]),
    });
  }

  for (const match of html.matchAll(INDUSTRY_QUOTE_DIV_RE)) {
    markers.push({
      index: match.index ?? 0,
      length: match[0].length,
      segment: parseIndustryQuoteDiv(match[0]),
    });
  }

  for (const match of html.matchAll(PROMO_BANNER_DIV_RE)) {
    markers.push({
      index: match.index ?? 0,
      length: match[0].length,
      segment: parsePromoBannerDiv(match[0]),
    });
  }

  return markers.sort((a, b) => a.index - b.index);
}

function parseWarehouseCalloutDiv(fullMatch: string): BlogWarehouseCalloutSegment {
  const openTag = fullMatch.match(/^<div[^>]*>/i)?.[0] ?? "";
  const inner = fullMatch.replace(/^<div[^>]*>/i, "").replace(/<\/div>\s*$/i, "").trim();
  const paragraphs = inner.match(/<p[^>]*>[\s\S]*?<\/p>/gi) ?? [];

  const label =
    openTag.match(/data-label=["']([^"']*)["']/i)?.[1] ??
    (paragraphs[0] ? stripHtmlTags(paragraphs[0]) : "FROM OUR WAREHOUSE");
  const title =
    openTag.match(/data-title=["']([^"']*)["']/i)?.[1] ??
    (paragraphs[1] ? stripHtmlTags(paragraphs[1]) : "");
  const bodyFromAttr = openTag.match(/data-body-html=["']([^"']*)["']/i)?.[1];
  const bodyHtml = bodyFromAttr
    ? decodeCalloutAttr(bodyFromAttr)
    : paragraphs.length >= 3
      ? paragraphs.slice(2).join("")
      : inner;

  return { type: "warehouse-callout", label, title, bodyHtml };
}

/** Split article HTML into regular content and embedded blog components. */
export function parseBlogBodySegments(html: string): BlogBodySegment[] {
  const markers = collectBodyMarkers(html);

  if (!markers.length) {
    return html.trim() ? [{ type: "html", content: html }] : [];
  }

  const segments: BlogBodySegment[] = [];
  let lastIndex = 0;

  for (const marker of markers) {
    if (marker.index > lastIndex) {
      const chunk = html.slice(lastIndex, marker.index).trim();
      if (chunk) segments.push({ type: "html", content: chunk });
    }

    segments.push(marker.segment);
    lastIndex = marker.index + marker.length;
  }

  const remainder = html.slice(lastIndex).trim();
  if (remainder) segments.push({ type: "html", content: remainder });

  return segments;
}

const TABLE_SCROLL_WRAPPER_START =
  '<div class="blog-table-scroll" tabindex="0" role="region" aria-label="Scrollable table">';
const TABLE_SCROLL_WRAPPER_END = "</div>";

/** Wrap CKEditor tables for horizontal scroll on mobile without changing table markup. */
export function wrapBlogTablesForScroll(html: string): string {
  if (!/<table\b/i.test(html)) return html;

  let result = html;

  result = result.replace(
    /<figure[^>]*>[\s\S]*?<table[\s\S]*?<\/table>[\s\S]*?<\/figure>/gi,
    (block) => {
      if (/blog-table-scroll/.test(block)) return block;
      return `${TABLE_SCROLL_WRAPPER_START}${block}${TABLE_SCROLL_WRAPPER_END}`;
    },
  );

  result = result.replace(/<table[\s\S]*?<\/table>/gi, (tableHtml) => {
    if (/blog-table-scroll/.test(tableHtml)) return tableHtml;
    return `${TABLE_SCROLL_WRAPPER_START}${tableHtml}${TABLE_SCROLL_WRAPPER_END}`;
  });

  return result.replace(
    /<div class="blog-table-scroll"[^>]*>\s*<div class="blog-table-scroll"[^>]*>/gi,
    '<div class="blog-table-scroll" tabindex="0" role="region" aria-label="Scrollable table">',
  );
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

  html = wrapBlogTablesForScroll(html);

  return html;
}
