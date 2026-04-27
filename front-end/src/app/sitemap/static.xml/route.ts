import { xmlResponse, urlset } from '../_utils';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

const API_URL = process.env.NEXT_PUBLIC_VAPE_HUB_API_BASE_URL;

/**
 * Returns the backend sitemap XML directly (no filtering/transformation).
 */
export async function GET() {
  if (!API_URL) {
    console.error('Static sitemap proxy error: NEXT_PUBLIC_VAPE_HUB_API_BASE_URL is not set');
    return xmlResponse(urlset([]));
  }

  try {
    const apiBase = API_URL.replace(/\/$/, '');
    const res = await fetch(`${apiBase}/api/seo/sitemap.xml`, {
      headers: { Accept: 'application/xml' },
      cache: 'no-store',
    });

    if (!res.ok) {
      console.error(`Static sitemap proxy error: API responded with ${res.status}`);
      return xmlResponse(urlset([]));
    }

    const xml = await res.text();
    return xmlResponse(xml);
  } catch (error) {
    console.error(
      'Static sitemap proxy error:',
      error instanceof Error ? error.message : String(error),
    );
    return xmlResponse(urlset([]));
  }
}
