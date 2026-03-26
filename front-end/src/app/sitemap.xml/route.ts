import { NextRequest, NextResponse } from 'next/server';

// Force dynamic rendering — the index itself is cheap (no API calls)
export const dynamic = 'force-dynamic';
export const revalidate = 0;

/**
 * Base URL resolution — preserved from original implementation.
 * Prefers NEXTAUTH_URL env var; falls back to request headers.
 */
function getBaseUrl(request?: NextRequest): string {
  if (process.env.NEXTAUTH_URL) {
    return process.env.NEXTAUTH_URL.replace(/\/$/, '');
  }
  if (request) {
    const protocol = request.headers.get('x-forwarded-proto') || 'https';
    const host =
      request.headers.get('host') || request.headers.get('x-forwarded-host');
    if (host) return `${protocol}://${host}`;
  }
  throw new Error(
    'Base URL cannot be determined. Please set NEXTAUTH_URL environment variable.',
  );
}

function getRequestOrigin(request: NextRequest): string {
  const protocol = request.headers.get('x-forwarded-proto') || 'http';
  const host = request.headers.get('host') || request.headers.get('x-forwarded-host');
  if (!host) throw new Error('Request origin cannot be determined from headers.');
  return `${protocol}://${host}`;
}

/**
 * Child sitemap slugs served under /sitemap/<name>.xml
 * Each route handles one content type independently, keeping individual
 * file sizes well under the 50,000-URL / 50 MB sitemap protocol limit.
 * Add numbered shards (e.g. products-2.xml) here if any type exceeds 50k URLs.
 */
const CHILD_SITEMAPS = [
  'static',     // static marketing pages
  'categories', // product categories
  'brands',     // brand pages (includes lastmod from API)
  'products',   // product detail pages
  'blogs',      // blog categories + blog posts (includes lastmod from API)
] as const;

const SITEMAP_URL_LIMIT = 50000;

function extractUrlBlocks(xml: string): string[] {
  const blocks = xml.match(/<url>[\s\S]*?<\/url>/gi);
  return blocks ?? [];
}

export async function GET(request: NextRequest) {
  try {
    const baseUrl = getBaseUrl(request); // canonical URL for XML <loc> tags
    const requestOrigin = getRequestOrigin(request); // runtime origin for internal fetches
    const childUrls = CHILD_SITEMAPS.map((name) => `${requestOrigin}/sitemap/${name}.xml`);

    // Fetch all child sitemaps and count URLs.
    const childXmlResponses = await Promise.all(
      childUrls.map(async (url) => {
        try {
          const res = await fetch(url, { cache: 'no-store' });
          if (!res.ok) return '';
          return await res.text();
        } catch {
          return '';
        }
      }),
    );

    const allUrlBlocks = childXmlResponses.flatMap(extractUrlBlocks);

    // If child fetches fail and no URLs are collected, return sitemap index as
    // a safe fallback instead of emitting an empty urlset.
    if (allUrlBlocks.length === 0) {
      const sitemapEntries = CHILD_SITEMAPS.map(
        (name) =>
          `  <sitemap>\n    <loc>${baseUrl}/sitemap/${name}.xml</loc>\n  </sitemap>`,
      ).join('\n');

      const xml = [
        '<?xml version="1.0" encoding="UTF-8"?>',
        '<sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">',
        sitemapEntries,
        '</sitemapindex>',
      ].join('\n');

      return new NextResponse(xml, {
        status: 200,
        headers: {
          'Content-Type': 'application/xml',
          'Cache-Control': 'public, max-age=3600, s-maxage=3600',
        },
      });
    }

    // Requirement: separate sitemap files only when total URLs exceed 50,000.
    // If under/at threshold, serve a single combined sitemap.
    if (allUrlBlocks.length <= SITEMAP_URL_LIMIT) {
      const xml = [
        '<?xml version="1.0" encoding="UTF-8"?>',
        '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">',
        ...allUrlBlocks,
        '</urlset>',
      ].join('\n');

      return new NextResponse(xml, {
        status: 200,
        headers: {
          'Content-Type': 'application/xml',
          'Cache-Control': 'public, max-age=3600, s-maxage=3600',
        },
      });
    }

    const sitemapEntries = CHILD_SITEMAPS.map(
      (name) =>
        `  <sitemap>\n    <loc>${baseUrl}/sitemap/${name}.xml</loc>\n  </sitemap>`,
    ).join('\n');

    const xml = [
      '<?xml version="1.0" encoding="UTF-8"?>',
      '<sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">',
      sitemapEntries,
      '</sitemapindex>',
    ].join('\n');

    return new NextResponse(xml, {
      status: 200,
      headers: {
        'Content-Type': 'application/xml',
        // Index is lightweight — allow short-lived public caching
        'Cache-Control': 'public, max-age=3600, s-maxage=3600',
      },
    });
  } catch (error) {
    console.error(
      'Sitemap index error:',
      error instanceof Error ? error.message : String(error),
    );
    return new NextResponse('Error generating sitemap index.', { status: 500 });
  }
}
