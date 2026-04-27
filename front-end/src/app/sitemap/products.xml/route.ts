import { NextRequest } from 'next/server';
import {
  getBaseUrl,
  xmlResponse,
  urlEntry,
  urlset,
  buildLoc,
  fetchSeoLastmodMap,
  isIndexableCanonicalPath,
} from '../_utils';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

const API_URL = process.env.NEXT_PUBLIC_VAPE_HUB_API_BASE_URL;

/** Minimal shape we need from each product. */
interface ProductEntry {
  slug: string;
  deleted_at?: string | null;
}

interface ProductPagination {
  total_count: number;
  total_pages: number;
  current_page: number;
  limit: number;
  offset: number;
}

interface ProductListPage {
  products: ProductEntry[];
  pagination: ProductPagination;
}

/**
 * Generates /sitemap/products.xml
 *
 * Uses GET /api/product (paginated via limit/offset) — the same endpoint used
 * by getProducts() in server.actions.ts.
 *
 * <lastmod> is sourced from the backend /api/seo/sitemap.xml which already
 * carries accurate per-product lastmod dates. The two fetches (product list +
 * SEO sitemap) run in parallel so there is no extra latency cost.
 * If a product has no lastmod entry in the SEO sitemap, <lastmod> is omitted.
 *
 * Deleted products (deleted_at !== null) are excluded — they are no longer
 * reachable and should not appear in the sitemap.
 *
 * If total products exceed 50,000, split into products-1.xml / products-2.xml
 * and register the additional shard in sitemap.xml/route.ts CHILD_SITEMAPS.
 */
export async function GET(request: NextRequest) {
  const baseUrl = getBaseUrl(request);

  try {
    if (!API_URL) throw new Error('NEXT_PUBLIC_VAPE_HUB_API_BASE_URL is not set');

    const apiBase = API_URL.replace(/\/$/, '');

    // Fetch product list pages + SEO lastmod map in parallel
    const [lastmodMap] = await Promise.all([
      fetchSeoLastmodMap(apiBase),
    ]);

    const allProducts: ProductEntry[] = [];
    const limit = 200;
    let offset = 0;
    const MAX_ITERATIONS = 500; // Safety cap — handles up to 100k products
    let iterations = 0;

    while (iterations < MAX_ITERATIONS) {
      const res = await fetch(
        `${apiBase}/api/product?limit=${limit}&offset=${offset}&sort_by=id&order=ASC`,
        { headers: { 'Content-Type': 'application/json' }, cache: 'no-store' },
      );

      if (!res.ok) {
        console.warn(`Products API (offset=${offset}) responded with ${res.status}`);
        break;
      }

      // Backend wraps responses: { success: boolean, data: <payload> }
      const json = await res.json();
      const data: ProductListPage = json?.data ?? json;

      if (!Array.isArray(data.products) || data.products.length === 0) break;

      allProducts.push(...data.products);

      const { total_count } = data.pagination ?? {};
      if (!total_count || offset + limit >= total_count) break;

      offset += limit;
      iterations++;
    }

    const entries = allProducts
      .filter((p) => p.slug && !p.deleted_at)
      .filter((p) => isIndexableCanonicalPath(`/${p.slug}`))
      .map((p) =>
        urlEntry(buildLoc(baseUrl, `/${p.slug}`), {
          // Look up lastmod from the backend SEO sitemap (most accurate source).
          // The map key matches the path slug without leading/trailing slashes.
          lastmod: lastmodMap.get(p.slug) ?? null,
          changefreq: 'weekly',
          priority: '0.7',
        }),
      );

    return xmlResponse(urlset(entries));
  } catch (error) {
    console.error(
      'Products sitemap error:',
      error instanceof Error ? error.message : String(error),
    );
    return xmlResponse(urlset([]));
  }
}
