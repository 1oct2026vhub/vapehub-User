import type { NextRequest, NextResponse } from 'next/server';

/**
 * Category/brand listing edge cache.
 * Keep a short fresh window; do not serve long stale HTML after CMS updates
 * (previous SWR=600 could hide admin content for ~10 more minutes).
 */
export const LISTING_EDGE_S_MAXAGE = 30;
export const LISTING_EDGE_STALE_WHILE_REVALIDATE = 0;

const CACHEABLE_LISTING_ENTITY_TYPES = new Set(['category', 'brand']);

export function buildListingEdgeCacheControl(): string {
  return `public, s-maxage=${LISTING_EDGE_S_MAXAGE}, stale-while-revalidate=${LISTING_EDGE_STALE_WHILE_REVALIDATE}`;
}

/**
 * Set edge-cache headers for category/brand listing HTML.
 * Uses CDN-Cache-Control so Cloudflare can cache even when Next.js sends private browser headers.
 */
export function applyListingEdgeCacheHeaders(response: NextResponse): void {
  const cacheControl = buildListingEdgeCacheControl();
  response.headers.set('Cache-Control', cacheControl);
  response.headers.set('CDN-Cache-Control', cacheControl);
  response.headers.set('Surrogate-Control', `max-age=${LISTING_EDGE_S_MAXAGE}`);
}

function hasAuthSession(request: NextRequest): boolean {
  return Boolean(
    request.cookies.get('next-auth.session-token')?.value
    || request.cookies.get('__Secure-next-auth.session-token')?.value,
  );
}

function isBrandListingPath(pathname: string): boolean {
  return /^\/brand\/[^/]+\/?$/.test(pathname);
}

function isBrandsIndexPath(pathname: string): boolean {
  return pathname === '/brands' || pathname === '/brands/';
}

export function shouldApplyListingEdgeCache(
  request: NextRequest,
  slugEntityType: string | undefined,
  slugResultType: 'next' | 'redirect' | 'not-found',
  responseStatus: number,
): boolean {
  if (request.method !== 'GET' && request.method !== 'HEAD') return false;
  if (slugResultType !== 'next') return false;
  if (responseStatus === 404) return false;
  if (hasAuthSession(request)) return false;
  if (request.nextUrl.searchParams.has('referral_code')) return false;

  const pathname = request.nextUrl.pathname;
  if (isBrandsIndexPath(pathname) || isBrandListingPath(pathname)) return true;

  return Boolean(
    slugEntityType && CACHEABLE_LISTING_ENTITY_TYPES.has(slugEntityType),
  );
}
