/** Storefront placeholder for missing / broken type-card images. */
export const TYPE_CARD_NO_IMAGE_SRC = "/images/type-card-no-image.svg";

/**
 * Source upload size (admin). Same 1.65:1 ratio as the card image area
 * (~297×180 CSS px). 891×540 = 3× for sharp retina when CSS scales down.
 * Keep in sync with admin `TYPE_CARD_IMAGE_WIDTH` / `TYPE_CARD_IMAGE_HEIGHT`.
 */
export const TYPE_CARD_SOURCE_WIDTH = 891;
export const TYPE_CARD_SOURCE_HEIGHT = 540;
export const TYPE_CARD_SOURCE_ASPECT_RATIO = `${TYPE_CARD_SOURCE_WIDTH}/${TYPE_CARD_SOURCE_HEIGHT}`;

/** Inline style for type-card imgs: fill card width, keep 891×540 frame, never stretch. */
export const TYPE_CARD_IMG_INLINE_STYLE =
  `display:block!important;position:static!important;float:none!important;` +
  `width:100%!important;max-width:100%!important;height:auto!important;` +
  `aspect-ratio:${TYPE_CARD_SOURCE_ASPECT_RATIO}!important;` +
  `object-fit:contain!important;object-position:center center!important;` +
  `image-rendering:auto!important;margin:0 0 14px 0!important;padding:0!important;` +
  `background:#f1f5f9!important;transform:none!important;`;

const escapeHtmlAttr = (value: string) =>
  value
    .replace(/&/g, "&amp;")
    .replace(/"/g, "&quot;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");

function buildStorefrontPlaceholderImg(slot: string, alt: string): string {
  const safeSlot = escapeHtmlAttr(slot);
  const safeAlt = escapeHtmlAttr(alt || "Category image");
  return (
    `<img class="type-card__img-placeholder type-card__img type-card__img--${safeSlot}"` +
    ` data-type-card-img="${safeSlot}" data-type-card-placeholder="1"` +
    ` src="${TYPE_CARD_NO_IMAGE_SRC}" alt="${safeAlt}"` +
    ` width="${TYPE_CARD_SOURCE_WIDTH}" height="${TYPE_CARD_SOURCE_HEIGHT}" decoding="async"` +
    ` style="${TYPE_CARD_IMG_INLINE_STYLE}" />`
  );
}

/** Remove empty CKEditor <figure> shells left after an image is deleted. */
function stripEmptyFigures(html: string): string {
  return html
    .replace(/<figure\b[^>]*>\s*<\/figure>/gi, "")
    .replace(/<figure\b[^>]*>(?:\s|&nbsp;|<br\s*\/?>)*<\/figure>/gi, "")
    .replace(/<figure\b[^>]*>(?![\s\S]*?<img\b)[\s\S]*?<\/figure>/gi, "");
}

const EMPTY_PARAGRAPH_OPEN_RE =
  /<p\b[^>]*>(?:\s|&nbsp;|&#160;|<br\s*\/?>)*<\/p>/i;

/**
 * Remove only leading/trailing CKEditor spacer paragraphs (`<p>&nbsp;</p>`,
 * `<p><br></p>`, etc.). Keep mid-content spacers so Additional Text Box
 * gaps editors insert between copy and card grids survive on the storefront.
 */
function stripEmptyParagraphs(html: string): string {
  let out = html.trim();
  if (!out) return out;

  // Leading spacers inflate the gap between the section border and content.
  const leading = new RegExp(`^${EMPTY_PARAGRAPH_OPEN_RE.source}`, "i");
  while (leading.test(out)) {
    out = out.replace(leading, "").trimStart();
  }

  // Trailing spacers are often editor caret targets, not intentional layout.
  const trailing = new RegExp(`${EMPTY_PARAGRAPH_OPEN_RE.source}\\s*$`, "i");
  while (trailing.test(out)) {
    out = out.replace(trailing, "").trimEnd();
  }

  return out;
}

/**
 * When admin removed a card image without leaving a placeholder, inject one
 * so the row stays aligned with neighboring cards.
 */
export function ensureTypeCardPlaceholders(html: string): string {
  if (!html || !/\btype-card\b/i.test(html)) return html;

  return html.replace(
    /<(article|div)\b([^>]*\btype-card\b[^>]*)>([\s\S]*?)<\/\1>/gi,
    (full, tag: string, attrs: string, inner: string) => {
      let cleaned = stripEmptyFigures(inner);

      if (/<img\b/i.test(cleaned)) {
        return cleaned === inner ? full : `<${tag}${attrs}>${cleaned}</${tag}>`;
      }

      const variant =
        attrs.match(/\btype-card--([a-z0-9_-]+)\b/i)?.[1] ||
        `card-${Math.random().toString(36).slice(2, 8)}`;
      const title =
        cleaned.match(/<h3\b[^>]*>([\s\S]*?)<\/h3>/i)?.[1]?.replace(/<[^>]+>/g, "").trim() ||
        "Category image";
      const placeholder = buildStorefrontPlaceholderImg(variant, title);

      const bodyOpen = cleaned.match(/<div\b[^>]*\btype-card__body\b[^>]*>/i);
      if (bodyOpen && bodyOpen.index != null) {
        const insertAt = bodyOpen.index + bodyOpen[0].length;
        cleaned = cleaned.slice(0, insertAt) + placeholder + cleaned.slice(insertAt);
      } else {
        cleaned = placeholder + cleaned;
      }

      return `<${tag}${attrs}>${cleaned}</${tag}>`;
    },
  );
}

/**
 * Point admin placeholder paths at the storefront asset and attach an onerror
 * fallback so broken S3/CMS URLs show the "No image" graphic (alt text kept).
 *
 * Also prepares type-card images for 891×540 sources:
 * - Drop CKEditor `image_resized` (can leave small fixed widths that look soft)
 * - Rewrite legacy 297×180 aspect frames to 891×540 (same ratio, retina source)
 * - Prefer height:auto + aspect-ratio over fixed px heights so CSS scales down
 *   high-res uploads into the card slot (never upscales the display area)
 */
export function normalizeTypeCardsHtml(html: string): string {
  let out = stripEmptyFigures(html);
  out = stripEmptyParagraphs(out);
  out = ensureTypeCardPlaceholders(out);

  out = out.replace(
    /(?:https?:\/\/[^"'>\s]+)?\/assets\/images\/type-card-no-image\.svg(?:\?[^"'>\s]*)?/gi,
    TYPE_CARD_NO_IMAGE_SRC,
  );

  // Embedded CMS CSS + inline styles: legacy 297×180 → 891×540 (identical ratio).
  out = out.replace(/aspect-ratio\s*:\s*297\s*\/\s*180/gi, `aspect-ratio:${TYPE_CARD_SOURCE_ASPECT_RATIO}`);

  // Normalize type-card (not ATB) inline heights to height:auto + 891×540 frame.
  out = out.replace(
    /(<img\b[^>]*\bstyle=(["'])[^"'>]*?)height\s*:\s*(?:\d+px|auto)([^"'>]*\2)/gi,
    (match, pre: string, _quote: string, post: string) => {
      if (
        /atb-(?:nic|flavour)-card/i.test(match) ||
        /data-atb-(?:nic|flavour)-img/i.test(match)
      ) {
        return match;
      }
      // Only rewrite known type-card / related-card imgs (ATB/misc HTML shares this helper).
      if (
        !/type-card/i.test(match) &&
        !/data-type-card-img/i.test(match) &&
        !/vss-related-card/i.test(match)
      ) {
        return match;
      }
      let next = `${pre}height:auto${post}`;
      if (!/aspect-ratio\s*:/i.test(next)) {
        next = next.replace(
          /height\s*:\s*auto/i,
          `height:auto;aspect-ratio:${TYPE_CARD_SOURCE_ASPECT_RATIO};object-fit:contain;object-position:center center`,
        );
      }
      return next;
    },
  );

  out = out.replace(/<img\b([^>]*?)(\/?)>/gi, (match, attrs: string, slash: string) => {
    const isAtb =
      /atb-(?:nic|flavour)-card/i.test(attrs) ||
      /data-atb-(?:nic|flavour)-img/i.test(attrs);
    const isTypeCard =
      /type-card/i.test(attrs) ||
      /data-type-card-img/i.test(attrs) ||
      /vss-related-card/i.test(attrs);
    let nextAttrs = attrs;

    if (!isAtb && isTypeCard) {
      // CKEditor ImageResize leftovers fight width:100% / high-res sources.
      nextAttrs = nextAttrs.replace(
        /\s*class=(["'])([^"']*)\1/i,
        (_m: string, q: string, cls: string) => {
          const cleaned = cls
            .split(/\s+/)
            .filter((c) => c && c !== "image_resized")
            .join(" ");
          return cleaned ? ` class=${q}${cleaned}${q}` : "";
        },
      );

      // Intrinsic size hints for 891×540 uploads (CSS still scales to card width).
      if (/\bwidth\s*=/i.test(nextAttrs)) {
        nextAttrs = nextAttrs.replace(/\bwidth\s*=\s*(["']?)\d+\1/i, `width="${TYPE_CARD_SOURCE_WIDTH}"`);
      } else {
        nextAttrs += ` width="${TYPE_CARD_SOURCE_WIDTH}"`;
      }
      if (/\bheight\s*=/i.test(nextAttrs)) {
        nextAttrs = nextAttrs.replace(/\bheight\s*=\s*(["']?)\d+\1/i, `height="${TYPE_CARD_SOURCE_HEIGHT}"`);
      } else {
        nextAttrs += ` height="${TYPE_CARD_SOURCE_HEIGHT}"`;
      }
    }

    if (/\bonerror\s*=/i.test(nextAttrs)) {
      return nextAttrs === attrs ? match : `<img${nextAttrs}${slash}>`;
    }
    return `<img${nextAttrs} onerror="this.onerror=null;this.src='${TYPE_CARD_NO_IMAGE_SRC}'"${slash}>`;
  });

  return out;
}

/** Client: swap any already-broken images to the placeholder without losing alt. */
export function bindTypeCardImageFallbacks(root: ParentNode | null): void {
  if (!root) return;

  root.querySelectorAll("img").forEach((node) => {
    const img = node as HTMLImageElement;
    if (img.dataset.noImageBound === "1") return;
    img.dataset.noImageBound = "1";

    const applyFallback = () => {
      if (img.getAttribute("src")?.includes("type-card-no-image.svg")) return;
      img.src = TYPE_CARD_NO_IMAGE_SRC;
    };

    img.addEventListener("error", applyFallback);

    if (img.complete && img.naturalWidth === 0 && Boolean(img.getAttribute("src"))) {
      applyFallback();
    }
  });
}

/** Extract card outer HTML from CKEditor type-cards markup. */

export function extractTypeCardHtml(html: string): string[] {
  const byClass = extractByClassName(html);
  if (byClass.length > 0) return byClass;
  return extractContainerChildren(html);
}

/** Client/browser: prefer DOMParser for reliable card extraction. */
export function extractTypeCardHtmlFromDom(html: string): string[] {
  if (typeof DOMParser === "undefined") {
    return extractTypeCardHtml(html);
  }

  const doc = new DOMParser().parseFromString(html, "text/html");
  const named = doc.querySelectorAll(".type-card, .vss-related-card");
  if (named.length > 0) {
    return Array.from(named).map((el) => el.outerHTML);
  }

  const container = doc.querySelector(".type-cards, .vss-related-cards");
  if (container && container.children.length > 0) {
    return Array.from(container.children).map((el) => (el as Element).outerHTML);
  }

  // Last resort: top-level children inside raw-html-embed / body
  const embed = doc.querySelector(".raw-html-embed") ?? doc.body;
  const kids = Array.from(embed.children).filter((el) => {
    const tag = el.tagName.toLowerCase();
    return tag === "div" || tag === "article" || tag === "section";
  });
  if (kids.length > 1) {
    return kids.map((el) => el.outerHTML);
  }

  return extractTypeCardHtml(html);
}

const ATB_CARD_SELECTOR = ".atb-nic-card, .atb-flavour-card";
const ATB_GRID_SELECTOR = ".atb-nic-cards, .atb-flavour-cards";

/** Extract nicotine / flavour cards from additional_text_box HTML. */
export function extractAtbCardHtml(html: string): string[] {
  if (typeof DOMParser !== "undefined") {
    return extractAtbCardHtmlFromDom(html);
  }
  return extractAtbCardsByRegex(html);
}

export function extractAtbCardHtmlFromDom(html: string): string[] {
  if (typeof DOMParser === "undefined") {
    return extractAtbCardsByRegex(html);
  }

  const doc = new DOMParser().parseFromString(html, "text/html");
  const named = doc.querySelectorAll(ATB_CARD_SELECTOR);
  if (named.length > 0) {
    return Array.from(named).map((el) => el.outerHTML);
  }

  const container = doc.querySelector(ATB_GRID_SELECTOR);
  if (container && container.children.length > 0) {
    return Array.from(container.children).map((el) => (el as Element).outerHTML);
  }

  return extractAtbCardsByRegex(html);
}

export type AtbMobileSegment =
  | { type: "html"; html: string }
  | { type: "cards"; cards: string[] };

/**
 * Split additional_text_box into markup + card-grid segments for mobile.
 * Card grids become carousels; surrounding HTML (intro, tables, styles) is kept.
 */
export function splitAtbHtmlForMobile(html: string): AtbMobileSegment[] {
  if (typeof DOMParser === "undefined") {
    const cards = extractAtbCardsByRegex(html);
    return cards.length > 0 ? [{ type: "cards", cards }] : [{ type: "html", html }];
  }

  const doc = new DOMParser().parseFromString(html, "text/html");
  const styleHtml = Array.from(doc.querySelectorAll("style"))
    .map((el) => el.outerHTML)
    .join("");
  doc.querySelectorAll("style").forEach((el) => el.remove());

  const segments: AtbMobileSegment[] = [];
  let htmlBuf = styleHtml;

  const flushHtml = () => {
    if (htmlBuf.trim()) {
      segments.push({ type: "html", html: htmlBuf });
      htmlBuf = "";
    }
  };

  const pushCardGrid = (grid: Element) => {
    const cards = Array.from(grid.children)
      .filter((el) => {
        const className = (el as Element).className?.toString?.() ?? "";
        return (
          /(?:^|\s)(?:atb-nic-card|atb-flavour-card)(?:\s|$)/i.test(className) ||
          el.tagName === "ARTICLE" ||
          el.tagName === "DIV"
        );
      })
      .map((el) => (el as Element).outerHTML)
      .filter(Boolean);

    if (cards.length > 0) {
      flushHtml();
      segments.push({ type: "cards", cards });
    } else {
      htmlBuf += grid.outerHTML;
    }
  };

  const walk = (parent: Element) => {
    Array.from(parent.children).forEach((child) => {
      if (child.matches(ATB_GRID_SELECTOR)) {
        pushCardGrid(child);
        return;
      }
      if (child.querySelector(ATB_GRID_SELECTOR)) {
        walk(child);
        return;
      }
      // Lone cards outside a grid wrapper
      if (child.matches(ATB_CARD_SELECTOR)) {
        flushHtml();
        const last = segments[segments.length - 1];
        if (last?.type === "cards") {
          last.cards.push(child.outerHTML);
        } else {
          segments.push({ type: "cards", cards: [child.outerHTML] });
        }
        return;
      }
      htmlBuf += child.outerHTML;
    });
  };

  walk(doc.body);
  flushHtml();

  if (segments.length === 0) {
    return [{ type: "html", html }];
  }

  // No card segments found — keep original markup (tables, plain HTML).
  if (!segments.some((s) => s.type === "cards")) {
    return [{ type: "html", html }];
  }

  return segments;
}

function extractAtbCardsByRegex(html: string): string[] {
  const cards: string[] = [];
  // Prefer article cards (templates use <article class="atb-*-card">)
  const articleRe = /<article\b[^>]*\bclass\s*=\s*["'][^"']*\batb-(?:nic|flavour)-card\b[^"']*["'][^>]*>/gi;
  let match: RegExpExecArray | null;
  while ((match = articleRe.exec(html)) !== null) {
    const fragment = extractBalancedTag(html, match.index, "article");
    if (fragment) {
      cards.push(fragment);
      articleRe.lastIndex = match.index + fragment.length;
    }
  }
  if (cards.length > 0) return cards;

  const divRe = /<div\b[^>]*\bclass\s*=\s*["'][^"']*\batb-(?:nic|flavour)-card\b[^"']*["'][^>]*>/gi;
  while ((match = divRe.exec(html)) !== null) {
    const classMatch = match[0].match(/\bclass\s*=\s*["']([^"']*)["']/i);
    const classNames = classMatch?.[1] ?? "";
    if (/(?:^|\s)(?:atb-nic-cards|atb-flavour-cards)(?:\s|$)/i.test(classNames)) continue;
    const fragment = extractBalancedDiv(html, match.index);
    if (fragment) {
      cards.push(fragment);
      divRe.lastIndex = match.index + fragment.length;
    }
  }
  return cards;
}

function extractBalancedTag(html: string, start: number, tag: string): string | null {
  const open = new RegExp(`^<${tag}\\b`, "i");
  if (!open.test(html.slice(start))) return null;

  const tagRe = new RegExp(`</?${tag}\\b[^>]*>`, "gi");
  tagRe.lastIndex = start;
  let depth = 0;
  let m: RegExpExecArray | null;

  while ((m = tagRe.exec(html)) !== null) {
    const isClosing = m[0].startsWith("</");
    const isSelfClosing = /\/>\s*$/.test(m[0]);

    if (isClosing) {
      depth -= 1;
      if (depth === 0) {
        return html.slice(start, m.index + m[0].length);
      }
    } else if (!isSelfClosing) {
      depth += 1;
    }
  }

  return null;
}

function extractByClassName(html: string): string[] {
  const cards: string[] = [];
  const openRe = /<div\b[^>]*>/gi;
  let match: RegExpExecArray | null;

  while ((match = openRe.exec(html)) !== null) {
    const classMatch = match[0].match(/\bclass\s*=\s*["']([^"']*)["']/i);
    const classNames = classMatch?.[1] ?? "";
    if (!/(?:^|\s)(?:type-card|vss-related-card)(?:\s|$)/i.test(classNames)) continue;
    if (/(?:^|\s)(?:type-cards|vss-related-cards)(?:\s|$)/i.test(classNames)) continue;

    const fragment = extractBalancedDiv(html, match.index);
    if (fragment) {
      cards.push(fragment);
      openRe.lastIndex = match.index + fragment.length;
    }
  }

  return cards;
}

function extractContainerChildren(html: string): string[] {
  const containerRe =
    /<div\b[^>]*\bclass\s*=\s*["'][^"']*\b(?:type-cards|vss-related-cards)\b[^"']*["'][^>]*>/i;
  const containerMatch = containerRe.exec(html);
  if (!containerMatch) return [];

  const containerHtml = extractBalancedDiv(html, containerMatch.index);
  if (!containerHtml) return [];

  const openEnd = containerMatch[0].length;
  const inner = containerHtml.slice(openEnd, containerHtml.lastIndexOf("</div>"));
  const children: string[] = [];
  let i = 0;

  while (i < inner.length) {
    const slice = inner.slice(i);
    const nextTag = slice.search(/<\s*div\b/i);
    if (nextTag === -1) break;
    const absStart = i + nextTag;
    const child = extractBalancedDiv(inner, absStart);
    if (!child) break;
    children.push(child.trim());
    i = absStart + child.length;
  }

  return children.filter(Boolean);
}

function extractBalancedDiv(html: string, start: number): string | null {
  if (!/^<div\b/i.test(html.slice(start))) return null;

  const tagRe = /<\/?div\b[^>]*>/gi;
  tagRe.lastIndex = start;
  let depth = 0;
  let tag: RegExpExecArray | null;

  while ((tag = tagRe.exec(html)) !== null) {
    const isClosing = tag[0].startsWith("</");
    const isSelfClosing = /\/>\s*$/.test(tag[0]);

    if (isClosing) {
      depth -= 1;
      if (depth === 0) {
        return html.slice(start, tag.index + tag[0].length);
      }
    } else if (!isSelfClosing) {
      depth += 1;
    }
  }

  return null;
}
