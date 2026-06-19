import { BlogByCategoryAndSlugResponse } from "@/lib/config/blog.config";
import { ContinueReadingArticle } from "@/lib/config/blog-continue-reading.config";

function toPlainText(html: string): string {
  return (html || "")
    .replace(/<!--[\s\S]*?-->/g, " ")
    .replace(/<[^>]+>/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

export function mapRelatedBlogsToContinueReading(
  relatedBlogs: BlogByCategoryAndSlugResponse["related_blogs"],
): ContinueReadingArticle[] {
  return relatedBlogs
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
        imageUrl: blog.image_url || "/images/blog-list-card.jpg",
        imageAlt: blog.alt_text || blog.title,
      };
    });
}
