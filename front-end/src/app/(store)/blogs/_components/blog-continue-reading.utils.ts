import { resolveCarouselImageUrl } from "@/lib/carousel-image-url";
import { ServerActionStatus } from "@/lib/config/app.config";
import { BlogByCategoryAndSlugResponse, BlogList } from "@/lib/config/blog.config";
import { ContinueReadingArticle } from "@/lib/config/blog-continue-reading.config";
import { getBlogPostList } from "@/lib/server.actions";

type BlogForContinueReading =
  | BlogByCategoryAndSlugResponse["related_blogs"][number]
  | BlogList;

function toPlainText(html: string): string {
  return (html || "")
    .replace(/<!--[\s\S]*?-->/g, " ")
    .replace(/<[^>]+>/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function mapBlogsToContinueReading(blogs: BlogForContinueReading[]): ContinueReadingArticle[] {
  return blogs
    .filter((blog) => Boolean(blog?.slug && blog?.title))
    .slice(0, 3)
    .map((blog) => {
      const slug = blog.slug ?? "";
      return {
        category: (blog.categories?.[0]?.name ?? "Blog").toUpperCase(),
        title: blog.title,
        description: toPlainText(blog.content).slice(0, 180),
        href: slug.startsWith("/") ? slug : `/${slug}`,
        ctaLabel: "READ MORE",
        imageUrl: resolveCarouselImageUrl(blog.image_url, "/images/blog-list-card.jpg"),
        imageAlt: blog.alt_text || blog.title,
      };
    });
}

export function mapRelatedBlogsToContinueReading(
  relatedBlogs: BlogByCategoryAndSlugResponse["related_blogs"],
): ContinueReadingArticle[] {
  return mapBlogsToContinueReading(relatedBlogs);
}

async function fetchCategoryBasedContinueReading(
  blog: BlogByCategoryAndSlugResponse,
): Promise<ContinueReadingArticle[]> {
  const categoryId = blog.categories?.[0]?.id;
  const response = await getBlogPostList(
    {
      ...(categoryId ? { categoryId: String(categoryId) } : {}),
      limit: 4,
      page: 1,
    },
    false,
  );

  if (response.status !== ServerActionStatus.SUCCESS) {
    return [];
  }

  const categoryBlogs = response.data.blogs.filter((item) => item.id !== blog.id);
  return mapBlogsToContinueReading(categoryBlogs);
}

/**
 * Admin-selected related blogs take priority when the API returns them.
 * Otherwise fall back to other posts from the same blog category.
 */
export async function resolveContinueReadingArticles(
  blog: BlogByCategoryAndSlugResponse,
): Promise<ContinueReadingArticle[]> {
  const relatedFromApi = mapRelatedBlogsToContinueReading(blog.related_blogs ?? []);
  if (relatedFromApi.length > 0) {
    return relatedFromApi;
  }

  return fetchCategoryBasedContinueReading(blog);
}
