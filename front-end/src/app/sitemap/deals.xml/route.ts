import { NextRequest } from 'next/server';
import {
  getBaseUrl,
  xmlResponse,
  urlEntry,
  urlset,
  buildLoc,
  fetchEntitySlugs,
  fetchSeoLastmodMap,
  isIndexableCanonicalPath,
} from '../_utils';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

const API_URL = process.env.NEXT_PUBLIC_VAPE_HUB_API_BASE_URL;

/**
 * Generates /sitemap/deals.xml
 *
 * Includes canonical deal detail URLs:
 *   /product-deals/{deal-slug}/
 *
 * Deal slugs come from entity-slugs API (entity_name === 'deal').
 * <lastmod> is resolved from backend SEO sitemap when available.
 */
export async function GET(request: NextRequest) {
  const baseUrl = getBaseUrl(request);

  try {
    if (!API_URL) throw new Error('NEXT_PUBLIC_VAPE_HUB_API_BASE_URL is not set');

    const apiBase = API_URL.replace(/\/$/, '');
    const [entities, lastmodMap] = await Promise.all([
      fetchEntitySlugs(apiBase),
      fetchSeoLastmodMap(apiBase),
    ]);

    // Primary source: entity-slugs API. Fallback source: backend SEO sitemap keys.
    // This keeps sitemap URLs fresh even when one backend feed lags behind.
    const dealSlugs = new Set<string>();

    for (const e of entities) {
      if (e.entity_name === 'deal' && e.entity_slug) {
        dealSlugs.add(e.entity_slug.trim().replace(/ /g, '-'));
      }
    }

    for (const key of lastmodMap.keys()) {
      if (key.startsWith('product-deals/')) {
        const slug = key.slice('product-deals/'.length).trim();
        if (slug) dealSlugs.add(slug);
      }
    }

    const entries = Array.from(dealSlugs)
      .filter((slug) => isIndexableCanonicalPath(`/product-deals/${slug}`))
      .map((slug) => {
        const path = `/product-deals/${slug}`;
        return urlEntry(buildLoc(baseUrl, path), {
          lastmod: lastmodMap.get(`product-deals/${slug}`) ?? null,
          changefreq: 'weekly',
          priority: '0.8',
        });
      });

    return xmlResponse(urlset(entries));
  } catch (error) {
    console.error(
      'Deals sitemap error:',
      error instanceof Error ? error.message : String(error),
    );
    return xmlResponse(urlset([]));
  }
}
