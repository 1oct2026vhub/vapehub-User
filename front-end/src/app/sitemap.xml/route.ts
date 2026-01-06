import { NextResponse } from 'next/server';
import { getBaseUrl } from '@/lib/utils/metadata';

const API_URL = process.env.NEXT_PUBLIC_VAPE_HUB_API_BASE_URL;

// Static pages that should always be included in the sitemap
const STATIC_PAGES = [
  '/',
  '/shop',
  '/brands',
  '/blogs',
  '/vapehub-deals',
  '/new-products',
  '/faq',
  '/contact',
  '/delivery-information',
  '/privacy-policy',
  '/returns-policy',
  '/terms-conditions',
  '/loyalty-points',
  '/social-media',
];

// Log environment variable at module load time (runs once when server starts)
console.log('=== Sitemap Route Environment Check ===');
console.log('NEXT_PUBLIC_VAPE_HUB_API_BASE_URL:', process.env.NEXT_PUBLIC_VAPE_HUB_API_BASE_URL);
console.log('API_URL (final):', API_URL);
console.log('All NEXT_PUBLIC_ env vars:', Object.keys(process.env).filter(key => key.startsWith('NEXT_PUBLIC_')));
console.log('=====================================');

// export async function GET(_: NextRequest) {
export async function GET() {
  try {
    // Validate that API_URL is set
    if (!API_URL) {
      throw new Error('NEXT_PUBLIC_VAPE_HUB_API_BASE_URL environment variable is not set');
    }

    // Ensure API_URL ends with / and construct possible endpoint paths
    const baseUrl = API_URL.endsWith('/') ? API_URL : `${API_URL}/`;
    
    // Try multiple possible endpoint paths (most common first)
    const possiblePaths = [
      `${baseUrl}api/seo/sitemap.xml`,  // Most likely based on api-routes.ts pattern
      `${baseUrl}seo/sitemap.xml`,      // Original path (without /api)
      `${baseUrl}api/sitemap.xml`,      // Alternative without /seo
      `${baseUrl}sitemap.xml`,          // Direct path
    ];
    
    let lastError: Error | null = null;
    
    // Try each possible path
    for (const fullUrl of possiblePaths) {
      console.log('[Sitemap Request] Trying:', fullUrl);
      
      try {
        const response = await fetch(fullUrl, {
          headers: {
            Accept: 'application/xml',
          },
          next: {
            // Revalidate every 24 hours
            revalidate: 86400,
          },
        });

        if (response.ok) {
          console.log(`[Sitemap Request] Success! Found at: ${fullUrl}`);
          const apiSitemapContent = await response.text();          
          // Merge static pages with API sitemap
          const mergedSitemap = mergeStaticPagesWithSitemap(apiSitemapContent);
          
          return new NextResponse(mergedSitemap, {
            status: 200,
            headers: {
              'Content-Type': 'application/xml',
            },
          });
        } else {
          // Log the failed attempt but continue to next path
          console.log(`[Sitemap Request] Failed (${response.status}): ${fullUrl}`);
          if (response.status === 404) {
            lastError = new Error(`Endpoint not found: ${response.status} ${response.statusText}`);
            continue; // Try next path
          } else {
            // For non-404 errors, throw immediately
            throw new Error(`Failed to fetch sitemap: ${response.status} ${response.statusText}`);
          }
        }
      } catch (error) {
        // If it's a network error, try next path
        if (error instanceof TypeError && error.message.includes('fetch failed')) {
          console.log(`[Sitemap Request] Network error for: ${fullUrl}`);
          lastError = error as Error;
          continue;
        }
        // For other errors, rethrow
        throw error;
      }
    }
    
    // If we get here, all paths failed
    console.error('[Sitemap Request] All endpoint paths failed. Tried:');
    possiblePaths.forEach(path => console.error(`  - ${path}`));
    
    throw lastError || new Error('Failed to fetch sitemap from all possible endpoints');
  } catch (error) {
    console.error('=== Sitemap Fetch Error ===');
    console.error('Error type:', error instanceof Error ? error.constructor.name : typeof error);
    console.error('Error message:', error instanceof Error ? error.message : String(error));
    console.error('API_URL used:', API_URL);
    if (error instanceof Error && 'cause' in error) {
      console.error('Error cause:', error.cause);
    }
    console.error('===========================');
    return new NextResponse('Error generating sitemap.', { status: 500 });
  }
}

/**
 * Merge static pages with the API sitemap XML
 * Adds static page URLs before the closing </urlset> tag
 */
function mergeStaticPagesWithSitemap(apiSitemap: string): string {
  const baseUrl = getBaseUrl();
  // const currentDate = new Date().toISOString().split('T')[0]; // YYYY-MM-DD format
  
  // Remove trailing slash from baseUrl to avoid double slashes
  const cleanBaseUrl = baseUrl.endsWith('/') ? baseUrl.slice(0, -1) : baseUrl;
  
  // Generate XML entries for static pages
  const staticPagesXml = STATIC_PAGES.map(path => {
    // Ensure path starts with / (or is empty for homepage)
    const cleanPath = path === '/' ? '' : (path.startsWith('/') ? path : `/${path}`);
    const fullUrl = `${cleanBaseUrl}${cleanPath}`;
    return `  <url>
    <loc>${fullUrl}</loc>
    <changefreq>weekly</changefreq>
    <priority>0.8</priority>
  </url>`;
  }).join('\n');

  // Check if the API sitemap has a proper XML structure
  if (apiSitemap.includes('</urlset>')) {
    // Insert static pages before the closing </urlset> tag
    return apiSitemap.replace('</urlset>', `${staticPagesXml}\n</urlset>`);
  } else if (apiSitemap.includes('<?xml')) {
    // If it's XML but no urlset, wrap it properly
    return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${staticPagesXml}
</urlset>`;
  } else {
    // If API sitemap is empty or invalid, create a new one with static pages
    return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${staticPagesXml}
</urlset>`;
  }
} 