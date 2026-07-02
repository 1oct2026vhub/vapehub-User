import { ContinueReadingArticle, DEFAULT_CONTINUE_READING } from "@/lib/config/blog-continue-reading.config";
import { BlogList, ProductRelatedBlog } from "@/lib/config/blog.config";
import { ServerActionStatus } from "@/lib/config/app.config";
import { getBlogPostList, getCategoryRelatedGuides, getProductRelatedBlogs } from "@/lib/server.actions";
import { Product } from "@/lib/config/product.config";

export const RELATED_GUIDES_LIMIT = 3;

const EMPTY_AUTHOR = {
  id: 0,
  first_name: null,
  last_name: null,
  email: "",
};

export function mapProductRelatedBlogsToBlogList(blogs: ProductRelatedBlog[]): BlogList[] {
  const timestamp = new Date().toISOString();

  return blogs.map((blog) => ({
    id: blog.id,
    title: blog.title,
    slug: blog.slug,
    content: "",
    image_url: blog.image_url ?? "",
    alt_text: blog.alt_text ?? undefined,
    author_id: 0,
    published_at: blog.published_at,
    created_at: blog.published_at,
    updated_at: blog.published_at,
    deleted_at: null,
    updated_by: 0,
    author: EMPTY_AUTHOR,
    categories: blog.categories.map((category) => ({
      id: category.id,
      name: category.name,
      slug: category.slug,
      description: "",
      image_url: "",
      created_at: timestamp,
      updated_at: timestamp,
      deleted_at: null,
      updated_by: 0,
    })),
  }));
}

export function parseProductRelatedBlogsPayload(payload: unknown): BlogList[] {
  if (!payload || typeof payload !== "object") return [];

  const candidate = payload as { related_blogs?: unknown };
  if (!Array.isArray(candidate.related_blogs)) return [];

  return mapProductRelatedBlogsToBlogList(candidate.related_blogs as ProductRelatedBlog[]);
}

function mapArticlesToBlogList(articles: ContinueReadingArticle[]): BlogList[] {
  const publishedAt = new Date().toISOString();

  return articles.slice(0, RELATED_GUIDES_LIMIT).map((article, index) => ({
    id: -(index + 1),
    title: article.title,
    slug: article.href.replace(/^\//, ""),
    content: `<p>${article.description}</p>`,
    image_url: article.imageUrl,
    alt_text: article.imageAlt,
    author_id: 0,
    published_at: publishedAt,
    created_at: publishedAt,
    updated_at: publishedAt,
    deleted_at: null,
    updated_by: 0,
    author: EMPTY_AUTHOR,
    categories: [
      {
        id: 0,
        name: article.category,
        slug: "blog",
        description: "",
        image_url: "",
        created_at: publishedAt,
        updated_at: publishedAt,
        deleted_at: null,
        updated_by: 0,
      },
    ],
  }));
}

export async function fetchProductRelatedBlogs(productId: Product["id"]): Promise<BlogList[]> {
  const response = await getProductRelatedBlogs(productId, { limit: RELATED_GUIDES_LIMIT }, true);
  if (response.status !== ServerActionStatus.SUCCESS || !response.data) {
    return [];
  }

  return parseProductRelatedBlogsPayload(response.data).slice(0, RELATED_GUIDES_LIMIT);
}

export async function fetchRelatedGuides({
  productId,
  categoryId,
}: {
  productId?: Product["id"];
  categoryId?: number;
}): Promise<BlogList[]> {
  if (productId) {
    return fetchProductRelatedBlogs(productId);
  }

  if (categoryId) {
    const response = await getCategoryRelatedGuides({ category_id: categoryId, limit: RELATED_GUIDES_LIMIT });
    if (response.status === ServerActionStatus.SUCCESS && response.data?.guides?.length) {
      return response.data.guides.slice(0, RELATED_GUIDES_LIMIT);
    }
  }

  const fallback = await getBlogPostList({ limit: RELATED_GUIDES_LIMIT, page: 1 });
  if (fallback.status === ServerActionStatus.SUCCESS && fallback.data?.blogs?.length) {
    return fallback.data.blogs.slice(0, RELATED_GUIDES_LIMIT);
  }

  return mapArticlesToBlogList(DEFAULT_CONTINUE_READING.articles);
}

export type RelatedGuidesRenderProps = {
  title?: string;
  viewAllHref?: string;
  currentProductId?: Product["id"];
  currentCategoryId?: number;
  initialBlogs?: BlogList[];
  embedded?: boolean;
};

export async function resolveRelatedGuidesGuides({
  currentProductId,
  currentCategoryId,
}: Pick<RelatedGuidesRenderProps, "currentProductId" | "currentCategoryId">): Promise<BlogList[]> {
  if (!currentProductId && !currentCategoryId) {
    return [];
  }

  return fetchRelatedGuides({
    productId: currentProductId,
    categoryId: currentCategoryId,
  });
}
