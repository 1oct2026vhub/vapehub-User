import { NextRequest } from 'next/server';
import { getBaseUrl, xmlResponse, urlEntry, urlset, buildLoc } from '../_utils';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

/**
 * Static marketing pages — identical list to the original sitemap.xml/route.ts
 * STATIC_PAGES constant, now with per-page changefreq and priority metadata.
 *
 * Excluded (intentionally not indexed):
 *   /login, /register, /my-account, /checkout, /orders, /shopping-cart
 *   /payment-success, /payment-failed, /page-not-found
 */
const STATIC_PAGES: Array<{
  path: string;
  changefreq: string;
  priority: string;
}> = [
  { path: '/',                      changefreq: 'daily',   priority: '1.0' },
  { path: '/shop',                  changefreq: 'daily',   priority: '0.9' },
  { path: '/product-deals',         changefreq: 'daily',   priority: '0.9' },
  { path: '/vapehub-deals',         changefreq: 'daily',   priority: '0.9' },
  { path: '/new-products',          changefreq: 'daily',   priority: '0.8' },
  { path: '/brands',                changefreq: 'weekly',  priority: '0.8' },
  { path: '/blogs',                 changefreq: 'weekly',  priority: '0.7' },
  { path: '/loyalty-points',        changefreq: 'monthly', priority: '0.6' },
  { path: '/faq',                   changefreq: 'monthly', priority: '0.6' },
  { path: '/contact',               changefreq: 'monthly', priority: '0.6' },
  { path: '/social-media',          changefreq: 'monthly', priority: '0.5' },
  { path: '/delivery-information',  changefreq: 'monthly', priority: '0.5' },
  { path: '/privacy-policy',        changefreq: 'monthly', priority: '0.4' },
  { path: '/returns-policy',        changefreq: 'monthly', priority: '0.4' },
  { path: '/terms-conditions',      changefreq: 'monthly', priority: '0.4' },
];

export async function GET(request: NextRequest) {
  const baseUrl = getBaseUrl(request);

  const entries = STATIC_PAGES.map(({ path, changefreq, priority }) =>
    urlEntry(buildLoc(baseUrl, path), { changefreq, priority }),
  );

  return xmlResponse(urlset(entries));
}
