import { NextRequest } from 'next/server';
import {
  getBaseUrl,
  xmlResponse,
  urlEntry,
  urlset,
  buildLoc,
} from '../_utils';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

const API_URL = process.env.NEXT_PUBLIC_VAPE_HUB_API_BASE_URL;

/** Minimal shape we need from each category. */
interface CategoryEntry {
  slug: string;
  updatedAt: string;
}

/**
 * Generates /sitemap/categories.xml
 *
 * Uses GET /api/category which returns all categories in a single response —
 * the same endpoint used by getCategoryList() in server.actions.ts.
 * Each category includes updatedAt, so we get accurate <lastmod> dates.
 *
 * URL pattern: /{slug}/ — matches the [...slug]/page.tsx routing where
 * entity_type === 'category' renders the CategoryProducts component.
 */
export async function GET(request: NextRequest) {
  const baseUrl = getBaseUrl(request);

  try {
    if (!API_URL) throw new Error('NEXT_PUBLIC_VAPE_HUB_API_BASE_URL is not set');

    const apiBase = API_URL.replace(/\/$/, '');

    const res = await fetch(`${apiBase}/api/category`, {
      headers: { 'Content-Type': 'application/json' },
      cache: 'no-store',
    });

    if (!res.ok) throw new Error(`Categories API responded with ${res.status}`);

    // Backend wraps responses: { success: boolean, data: <payload> }
    const json = await res.json();
    const categories: CategoryEntry[] = Array.isArray(json?.data)
      ? json.data
      : Array.isArray(json)
        ? json
        : [];

    const entries = categories
      .filter((c) => c.slug)
      .map((c) =>
        urlEntry(buildLoc(baseUrl, `/${c.slug}`), {
          changefreq: 'weekly',
          priority: '0.8',
        }),
      );

    return xmlResponse(urlset(entries));
  } catch (error) {
    console.error(
      'Categories sitemap error:',
      error instanceof Error ? error.message : String(error),
    );
    return xmlResponse(urlset([]));
  }
}
