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
