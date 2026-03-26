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

/** Minimal shape we need from each brand in the list response. */
interface BrandEntry {
  slug: string;
  updatedAt: string;
}

interface BrandListPage {
  brands: BrandEntry[];
  pagination: {
    hasNextPage: boolean;
    currentPage: number;
    totalPages: number;
  };
}

/**
 * Generates /sitemap/brands.xml
 *
 * Uses the paginated brands list API (GET /api/brands/list/paginated) which
 * already returns updatedAt on every brand — allowing accurate <lastmod> dates.
 *
 * URL pattern: /brand/{slug}/ — matches the brand/[slug]/page.tsx routing and
 * the middleware special-case for '/brand/' prefixed paths.
 */
export async function GET(request: NextRequest) {
  const baseUrl = getBaseUrl(request);

  try {
    if (!API_URL) throw new Error('NEXT_PUBLIC_VAPE_HUB_API_BASE_URL is not set');

    const apiBase = API_URL.replace(/\/$/, '');
    const allBrands: BrandEntry[] = [];
    let page = 1;
    const limit = 100;
    // Safety cap: prevents infinite loops if pagination metadata is wrong
    const MAX_PAGES = 200;

    while (page <= MAX_PAGES) {
      const res = await fetch(
        `${apiBase}/api/brands/list/paginated?page=${page}&limit=${limit}`,
        { headers: { 'Content-Type': 'application/json' }, cache: 'no-store' },
      );

      if (!res.ok) {
        console.warn(`Brands API page ${page} responded with ${res.status}`);
        break;
      }

      // Backend wraps responses: { success: boolean, data: <payload> }
      const json = await res.json();
      const data: BrandListPage = json?.data ?? json;

      if (Array.isArray(data.brands)) {
        allBrands.push(...data.brands);
      }

      if (!data.pagination?.hasNextPage) break;
      page++;
    }

    const entries = allBrands
      .filter((b) => b.slug)
      .map((b) =>
        urlEntry(buildLoc(baseUrl, `/brand/${b.slug}`), {
          changefreq: 'weekly',
          priority: '0.7',
        }),
      );

    return xmlResponse(urlset(entries));
  } catch (error) {
    console.error(
      'Brands sitemap error:',
      error instanceof Error ? error.message : String(error),
    );
    return xmlResponse(urlset([]));
  }
}
