import { NextRequest, NextResponse } from 'next/server';

const API_URL = process.env.NEXT_PUBLIC_VAPE_HUB_API_BASE_URL;
const STATIC_PAGES = ['/', '/shop', '/brands', '/blogs', '/vapehub-deals', '/new-products', '/faq', '/contact', '/delivery-information', '/privacy-policy', '/returns-policy', '/terms-conditions', '/loyalty-points', '/social-media'];

function getBaseUrl(request?: NextRequest): string {
  if (process.env.NEXTAUTH_URL) return process.env.NEXTAUTH_URL;
  if (request) {
    const protocol = request.headers.get('x-forwarded-proto') || 'https';
    const host = request.headers.get('host') || request.headers.get('x-forwarded-host');
    if (host) return `${protocol}://${host}`;
  }
  throw new Error('Base URL cannot be determined. Please set NEXTAUTH_URL environment variable.');
}

export async function GET(request: NextRequest) {
  try {
    if (!API_URL) throw new Error('NEXT_PUBLIC_VAPE_HUB_API_BASE_URL environment variable is not set');

    const apiBaseUrl = API_URL.endsWith('/') ? API_URL : `${API_URL}/`;
    const sitemapUrl = `${apiBaseUrl}api/seo/sitemap.xml`;
    
    const response = await fetch(sitemapUrl, {
      headers: { Accept: 'application/xml' },
      next: { revalidate: 86400 },
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch sitemap: ${response.status} ${response.statusText}`);
    }

    const apiSitemapContent = await response.text();
    const siteBaseUrl = getBaseUrl(request);
    const mergedSitemap = mergeStaticPagesWithSitemap(apiSitemapContent, siteBaseUrl);
    
    return new NextResponse(mergedSitemap, {
      status: 200,
      headers: { 'Content-Type': 'application/xml' },
    });
  } catch (error) {
    console.error('Sitemap Fetch Error:', error instanceof Error ? error.message : String(error));
    return new NextResponse('Error generating sitemap.', { status: 500 });
  }
}

function normalizeSitemapUrls(sitemapContent: string, baseUrl: string): string {
  // Clean base URL - remove trailing slash
  const cleanBaseUrl = baseUrl.endsWith('/') ? baseUrl.slice(0, -1) : baseUrl;
  
  // Extract the path from any URL and replace with the correct base URL
  // This regex matches <loc>...</loc> tags (with optional whitespace) and extracts the URL
  // Using [\s\S]*? to match across newlines if needed
  return sitemapContent.replace(/<loc>([\s\S]*?)<\/loc>/gi, (match, url) => {
    const trimmedUrl = url.trim();
    
    // If already using the correct base URL, keep it as is
    if (trimmedUrl.startsWith(cleanBaseUrl)) {
      return match;
    }
    
    try {
      // Try to parse as a full URL
      const urlObj = new URL(trimmedUrl);
      const path = urlObj.pathname;
      const search = urlObj.search;
      const hash = urlObj.hash;
      // Reconstruct with the correct base URL
      return `<loc>${cleanBaseUrl}${path}${search}${hash}</loc>`;
    } catch {
      // If URL parsing fails, check if it's a relative path
      if (trimmedUrl.startsWith('/')) {
        return `<loc>${cleanBaseUrl}${trimmedUrl}</loc>`;
      }
      
      // Try to extract path from any absolute URL pattern (http:// or https://)
      const absoluteUrlMatch = trimmedUrl.match(/https?:\/\/[^\/\s]+(\/[^\s]*)?/);
      if (absoluteUrlMatch) {
        // Extract the path part (everything after the domain)
        const fullMatch = absoluteUrlMatch[0];
        const pathMatch = fullMatch.match(/https?:\/\/[^\/]+(\/.*)/);
        if (pathMatch && pathMatch[1]) {
          return `<loc>${cleanBaseUrl}${pathMatch[1]}</loc>`;
        } else {
          // Just the domain, no path
          return `<loc>${cleanBaseUrl}/</loc>`;
        }
      }
      
      // If we can't parse it, return as is (shouldn't happen with valid sitemap)
      return match;
    }
  });
}

function mergeStaticPagesWithSitemap(apiSitemap: string, baseUrl: string): string {
  const cleanBaseUrl = baseUrl.endsWith('/') ? baseUrl.slice(0, -1) : baseUrl;
  
  // Normalize URLs in the API sitemap to use the correct base URL
  const normalizedApiSitemap = normalizeSitemapUrls(apiSitemap, baseUrl);
  
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
  
  if (normalizedApiSitemap.includes('</urlset>')) {
    return normalizedApiSitemap.replace('</urlset>', `${staticPagesXml}\n</urlset>`);
  }
  return `${xmlHeader}\n${urlsetTag}\n${staticPagesXml}\n</urlset>`;
} 