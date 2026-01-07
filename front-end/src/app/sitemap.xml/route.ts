import { NextRequest, NextResponse } from 'next/server';

const API_URL = process.env.NEXT_PUBLIC_VAPE_HUB_API_BASE_URL;
const STATIC_PAGES = ['/', '/shop', '/brands', '/blogs', '/vapehub-deals', '/new-products', '/faq', '/contact', '/delivery-information', '/privacy-policy', '/returns-policy', '/terms-conditions', '/loyalty-points', '/social-media'];

function getBaseUrl(request?: NextRequest): string {
  if (process.env.NEXTAUTH_URL) return process.env.NEXTAUTH_URL;
  if (process.env.NEXT_PUBLIC_SITE_URL) return process.env.NEXT_PUBLIC_SITE_URL;
  if (request) {
    const protocol = request.headers.get('x-forwarded-proto') || 'https';
    const host = request.headers.get('host') || request.headers.get('x-forwarded-host');
    if (host) return `${protocol}://${host}`;
  }
  throw new Error('Base URL cannot be determined. Please set NEXTAUTH_URL or NEXT_PUBLIC_SITE_URL environment variable.');
}

export async function GET(request: NextRequest) {
  try {
    if (!API_URL) throw new Error('NEXT_PUBLIC_VAPE_HUB_API_BASE_URL environment variable is not set');

    const apiBaseUrl = API_URL.endsWith('/') ? API_URL : `${API_URL}/`;
    const possiblePaths = [
      `${apiBaseUrl}api/seo/sitemap.xml`,
      `${apiBaseUrl}seo/sitemap.xml`,
      `${apiBaseUrl}api/sitemap.xml`,
      `${apiBaseUrl}sitemap.xml`,
    ];
    
    let lastError: Error | null = null;
    
    for (const fullUrl of possiblePaths) {
      try {
        const response = await fetch(fullUrl, {
          headers: { Accept: 'application/xml' },
          next: { revalidate: 86400 },
        });

        if (response.ok) {
          const apiSitemapContent = await response.text();
          const siteBaseUrl = getBaseUrl(request);
          const mergedSitemap = mergeStaticPagesWithSitemap(apiSitemapContent, siteBaseUrl);
          return new NextResponse(mergedSitemap, {
            status: 200,
            headers: { 'Content-Type': 'application/xml' },
          });
        }
        
        if (response.status === 404) {
          lastError = new Error(`Endpoint not found: ${response.status} ${response.statusText}`);
          continue;
        }
        throw new Error(`Failed to fetch sitemap: ${response.status} ${response.statusText}`);
      } catch (error) {
        if (error instanceof TypeError && error.message.includes('fetch failed')) {
          lastError = error as Error;
          continue;
        }
        throw error;
      }
    }
    
    throw lastError || new Error('Failed to fetch sitemap from all possible endpoints');
  } catch (error) {
    console.error('Sitemap Fetch Error:', error instanceof Error ? error.message : String(error));
    return new NextResponse('Error generating sitemap.', { status: 500 });
  }
}

function mergeStaticPagesWithSitemap(apiSitemap: string, baseUrl: string): string {
  const cleanBaseUrl = baseUrl.endsWith('/') ? baseUrl.slice(0, -1) : baseUrl;
  const staticPagesXml = STATIC_PAGES.map(path => {
    const cleanPath = path === '/' ? '' : (path.startsWith('/') ? path : `/${path}`);
    return `  <url>
    <loc>${cleanBaseUrl}${cleanPath}</loc>
    <changefreq>weekly</changefreq>
    <priority>0.8</priority>
  </url>`;
  }).join('\n');

  const urlsetTag = '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">';
  const xmlHeader = '<?xml version="1.0" encoding="UTF-8"?>';
  
  if (apiSitemap.includes('</urlset>')) {
    return apiSitemap.replace('</urlset>', `${staticPagesXml}\n</urlset>`);
  }
  return `${xmlHeader}\n${urlsetTag}\n${staticPagesXml}\n</urlset>`;
} 