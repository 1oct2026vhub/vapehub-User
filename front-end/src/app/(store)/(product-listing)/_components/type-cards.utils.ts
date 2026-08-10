/** Storefront placeholder for missing / broken type-card images. */
export const TYPE_CARD_NO_IMAGE_SRC = "/images/type-card-no-image.svg";

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
    ` style="display:block!important;position:static!important;float:none!important;width:100%!important;height:180px!important;object-fit:contain!important;margin:0 0 14px 0!important;background:#f1f5f9;" />`
  );
}

/** Remove empty CKEditor <figure> shells left after an image is deleted. */
function stripEmptyFigures(html: string): string {
  return html
    .replace(/<figure\b[^>]*>\s*<\/figure>/gi, "")
    .replace(/<figure\b[^>]*>(?:\s|&nbsp;|<br\s*\/?>)*<\/figure>/gi, "")
    .replace(/<figure\b[^>]*>(?![\s\S]*?<img\b)[\s\S]*?<\/figure>/gi, "");
}

/**
 * Remove CKEditor spacer paragraphs (`<p>&nbsp;</p>`, `<p><br></p>`, etc.).
 * Leading ones inflate the gap between the section border and the card row.
 */
function stripEmptyParagraphs(html: string): string {
  return html.replace(/<p\b[^>]*>(?:\s|&nbsp;|&#160;|<br\s*\/?>)*<\/p>/gi, "");
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
 */
export function normalizeTypeCardsHtml(html: string): string {
  let out = stripEmptyFigures(html);
  out = stripEmptyParagraphs(out);
  out = ensureTypeCardPlaceholders(out);

  out = out.replace(
    /(?:https?:\/\/[^"'>\s]+)?\/assets\/images\/type-card-no-image\.svg(?:\?[^"'>\s]*)?/gi,
    TYPE_CARD_NO_IMAGE_SRC,
  );

  // Normalize inline image heights so CMS 150px and storefront 180px don't fight.
  // Skip additional_text_box (ATB) images — they use their own square aspect ratios.
  out = out.replace(
    /(<img\b[^>]*\bstyle=(["'])[^"'>]*?)height\s*:\s*\d+px([^"'>]*\2)/gi,
    (match, pre: string, _quote: string, post: string) => {
      if (
        /atb-(?:nic|flavour)-card/i.test(match) ||
        /data-atb-(?:nic|flavour)-img/i.test(match)
      ) {
        return match;
      }
      return `${pre}height:180px${post}`;
    },
  );

  out = out.replace(/<img\b([^>]*?)(\/?)>/gi, (match, attrs: string, slash: string) => {
    if (/\bonerror\s*=/i.test(attrs)) return match;
    return `<img${attrs} onerror="this.onerror=null;this.src='${TYPE_CARD_NO_IMAGE_SRC}'"${slash}>`;
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
