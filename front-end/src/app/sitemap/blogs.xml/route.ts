import { NextRequest } from 'next/server';
import {
  getBaseUrl,
  xmlResponse,
  urlEntry,
  urlset,
  buildLoc,
  fetchEntitySlugs,
} from '../_utils';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

const API_URL = process.env.NEXT_PUBLIC_VAPE_HUB_API_BASE_URL;

/** Minimal shape needed from each blog post in the list API response. */
interface BlogPostEntry {
  slug: string;
  updated_at: string;
}

interface BlogListPage {
  blogs: BlogPostEntry[];
  pagination: {
    hasNextPage: boolean;
    currentPage: number;
    totalPages: number;
  };
}

/**
 * Generates /sitemap/blogs.xml
 *
 * Two content types are handled:
 *
 * 1. Blog categories (entity_name === 'blog_category' from entity-slugs API)
 *    URL: /{entity_slug}/
 *    Rationale: the [...slug]/page.tsx routing resolves 'blog_category' entity
 *    type for the primary slug — rendering the BlogListView component.
 *
 * 2. Blog posts (from GET /api/blogs/list, paginated)
 *    URL: /{slug}/
 *    Uses the blog list API (not entity-slugs) so that updated_at is available
 *    for accurate <lastmod> dates. BlogContent extends TimeStampFields which
 *    provides updated_at on every post.
 *    Rationale: blog posts resolve as 'blog' entity_type in the [...slug] route
 *    and are always accessed via their direct slug, not via category+post path.
 */
export async function GET(request: NextRequest) {
  const baseUrl = getBaseUrl(request);

  try {
    if (!API_URL) throw new Error('NEXT_PUBLIC_VAPE_HUB_API_BASE_URL is not set');

    const apiBase = API_URL.replace(/\/$/, '');

    // ── 1. Blog category pages (from entity-slugs) ──────────────────────────
    const entities = await fetchEntitySlugs(apiBase);

    const blogCategoryEntries = entities
      .filter((e) => e.entity_name === 'blog_category' && e.entity_slug)
      .map((e) =>
        urlEntry(buildLoc(baseUrl, `/${e.entity_slug}`), {
          changefreq: 'weekly',
          priority: '0.7',
        }),
      );

    // ── 2. Individual blog posts (from blog list API — provides updated_at) ──
    const allPosts: BlogPostEntry[] = [];
    let page = 1;
    const limit = 100;
    const MAX_PAGES = 200; // Safety cap

    while (page <= MAX_PAGES) {
      const res = await fetch(
        `${apiBase}/api/blogs/list?page=${page}&limit=${limit}`,
        { headers: { 'Content-Type': 'application/json' }, cache: 'no-store' },
      );

      if (!res.ok) {
        console.warn(`Blog list API page ${page} responded with ${res.status}`);
        break;
      }

      // Backend wraps responses: { success: boolean, data: <payload> }
      const json = await res.json();
      const data: BlogListPage = json?.data ?? json;

      if (Array.isArray(data.blogs)) {
        allPosts.push(...data.blogs);
      }

      if (!data.pagination?.hasNextPage) break;
      page++;
    }

    const blogPostEntries = allPosts
      .filter((b) => b.slug)
      .map((b) =>
        urlEntry(buildLoc(baseUrl, `/${b.slug}`), {
          changefreq: 'weekly',
          priority: '0.6',
        }),
      );

    return xmlResponse(urlset([...blogCategoryEntries, ...blogPostEntries]));
  } catch (error) {
    console.error(
      'Blogs sitemap error:',
      error instanceof Error ? error.message : String(error),
    );
    return xmlResponse(urlset([]));
  }
}
