import { NextRequest, NextResponse } from 'next/server';

// ---------------------------------------------------------------------------
// Base URL resolution — identical logic to the existing sitemap.xml/route.ts
// ---------------------------------------------------------------------------
export function getBaseUrl(request?: NextRequest): string {
  if (process.env.NEXTAUTH_URL) {
    return process.env.NEXTAUTH_URL.replace(/\/$/, '');
  }
  if (request) {
    const protocol = request.headers.get('x-forwarded-proto') || 'https';
    const host =
      request.headers.get('host') || request.headers.get('x-forwarded-host');
    if (host) return `${protocol}://${host}`;
  }
  return 'https://www.vapehub.co.uk';
}

// ---------------------------------------------------------------------------
// HTTP response helper
// ---------------------------------------------------------------------------
const XML_HEADERS: HeadersInit = {
  'Content-Type': 'application/xml',
  // Cache child sitemaps for 1 hour; crawlers re-fetch infrequently
  'Cache-Control': 'public, max-age=3600, s-maxage=3600',
};

export function xmlResponse(body: string, status = 200): NextResponse {
  return new NextResponse(body, { status, headers: XML_HEADERS });
}

// ---------------------------------------------------------------------------
// lastmod helpers
// ---------------------------------------------------------------------------

/** Convert any ISO date string to YYYY-MM-DD (W3C date format for sitemaps). */
export function toLastmod(dateStr?: string | null): string | null {
  if (!dateStr) return null;
  try {
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) return null;
    return d.toISOString().split('T')[0];
  } catch {
    return null;
  }
}

// ---------------------------------------------------------------------------
// XML building helpers
// ---------------------------------------------------------------------------

interface UrlEntryOptions {
  lastmod?: string | null;
  changefreq?: string;
  priority?: string;
}

/** Build a single <url> block for a urlset sitemap. */
export function urlEntry(
  locValue: string,
  options: UrlEntryOptions = {},
): string {
  const { lastmod, changefreq = 'weekly', priority = '0.8' } = options;
  const lastmodLine = lastmod ? `\n    <lastmod>${lastmod}</lastmod>` : '';
  return [
    '  <url>',
    `    <loc>${locValue}</loc>${lastmodLine}`,
    `    <changefreq>${changefreq}</changefreq>`,
    `    <priority>${priority}</priority>`,
    '  </url>',
  ].join('\n');
}

/** Wrap url entries in a full urlset XML document. */
export function urlset(entries: string[]): string {
  return [
    '<?xml version="1.0" encoding="UTF-8"?>',
    '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">',
    ...entries,
    '</urlset>',
  ].join('\n');
}

// ---------------------------------------------------------------------------
// Canonical URL builder
// ---------------------------------------------------------------------------

/**
 * Build a canonical <loc> value from base URL + path.
 *
 * Rules (matching existing sitemap behaviour):
 *  - Home page ("/")   → baseUrl with NO trailing slash
 *  - All other pages   → baseUrl + path WITH trailing slash
 *  - Query strings and hash fragments are never included
 */
export function buildLoc(baseUrl: string, path: string): string {
  const clean = baseUrl.replace(/\/$/, '');
  if (!path || path === '/') return clean;
  // Strip any accidental query params or fragments
  const sanitized = path.split('?')[0].split('#')[0];
  const p = sanitized.startsWith('/') ? sanitized : `/${sanitized}`;
  return clean + (p.endsWith('/') ? p : `${p}/`);
}

// ---------------------------------------------------------------------------
// Entity-slug types (matches backend API response shape)
// ---------------------------------------------------------------------------

export interface EntitySlug {
  entity_id: number;
  /** 'product' | 'category' | 'brand' | 'blog' | 'blog_category' | 'deal' */
  entity_name: string;
  entity_slug: string;
  /**
   * For blog posts: the parent blog-category slug (may be empty).
   * NOTE: once the backend adds updated_at here, replace the fallback logic.
   */
  slug_relation: string;
  /** Not yet returned by the API — add when backend supports it. */
  updated_at?: string | null;
}

export interface EntitySlugsResponse {
  entities: EntitySlug[];
  total_found: number;
}

// ---------------------------------------------------------------------------
// Backend SEO sitemap lastmod map
// ---------------------------------------------------------------------------

/**
 * Fetches the backend /api/seo/sitemap.xml and parses every <url> block into
 * a Map keyed by the URL's path slug (without leading/trailing slashes).
 *
 * Examples from the backend XML:
 *   /aspire-bp80-pod-kit-80-watt/  → key: "aspire-bp80-pod-kit-80-watt"
 *   /brand/aisu-by-zap/            → key: "brand/aisu-by-zap"
 *   /product-deals/buy-3-for-14/   → key: "product-deals/buy-3-for-14"
 *
 * Only entries that have a <lastmod> tag are stored. Entries without lastmod
 * are absent from the map so callers can gracefully omit the tag.
 *
 * Returns an empty Map on any network or parse failure so callers degrade
 * gracefully without crashing.
 */
export async function fetchSeoLastmodMap(
  apiBase: string,
): Promise<Map<string, string>> {
  const map = new Map<string, string>();
  try {
    const apiUrl = apiBase.replace(/\/$/, '');
    const res = await fetch(`${apiUrl}/api/seo/sitemap.xml`, {
      headers: { Accept: 'application/xml' },
      cache: 'no-store',
    });
    if (!res.ok) {
      console.warn(`SEO sitemap API responded with ${res.status}`);
      return map;
    }

    const xml = await res.text();

    // Iterate over every <url>…</url> block
    const urlBlockRe = /<url>([\s\S]*?)<\/url>/gi;
    let block: RegExpExecArray | null;

    while ((block = urlBlockRe.exec(xml)) !== null) {
      const inner = block[1];
      const locMatch = inner.match(/<loc>\s*([^<\s]+)\s*<\/loc>/i);
      const lastmodMatch = inner.match(/<lastmod>\s*([^<\s]+)\s*<\/lastmod>/i);

      if (!locMatch || !lastmodMatch) continue; // skip entries with no lastmod

      try {
        // Extract the path, strip leading & trailing slashes → becomes the key
        const pathname = new URL(locMatch[1].trim()).pathname;
        const slug = pathname.replace(/^\/+|\/+$/g, '');
        if (slug) map.set(slug, lastmodMatch[1].trim());
      } catch {
        // skip any malformed <loc> URLs
      }
    }
  } catch (err) {
    console.error(
      'fetchSeoLastmodMap error:',
      err instanceof Error ? err.message : String(err),
    );
  }
  return map;
}

/** Fetch all entity slugs from the backend. Returns empty array on failure. */
export async function fetchEntitySlugs(apiBase: string): Promise<EntitySlug[]> {
  try {
    const res = await fetch(`${apiBase}/api/home/entity-slugs`, {
      headers: { 'Content-Type': 'application/json' },
      cache: 'no-store',
    });
    if (!res.ok) {
      console.error(`entity-slugs API responded with ${res.status}`);
      return [];
    }
    // All backend responses are wrapped: { success: boolean, data: <payload> }
    const json = await res.json();
    const payload: EntitySlugsResponse = json?.data ?? json;
    return Array.isArray(payload?.entities) ? payload.entities : [];
  } catch (err) {
    console.error('fetchEntitySlugs error:', err instanceof Error ? err.message : String(err));
    return [];
  }
}
