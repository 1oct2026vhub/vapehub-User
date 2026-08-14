import { cache } from "react";
import { ContinueReadingArticle, DEFAULT_CONTINUE_READING } from "@/lib/config/blog-continue-reading.config";
import { BlogList, ProductRelatedBlogCard } from "@/lib/config/blog.config";
import { ServerActionStatus } from "@/lib/config/app.config";
import {
  getBlogPostList,
  getCategoryRelatedGuides,
  getProductRelatedBlogs,
} from "@/lib/server.actions";
import { Product } from "@/lib/config/product.config";

export const RELATED_GUIDES_LIMIT = 3;

const EMPTY_AUTHOR = {
  id: 0,
  first_name: null,
  last_name: null,
  email: "",
};

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

function mapProductRelatedBlogsToBlogList(blogs: ProductRelatedBlogCard[]): BlogList[] {
  return blogs.slice(0, RELATED_GUIDES_LIMIT).map((blog) => {
    const publishedAt = blog.published_at || new Date().toISOString();
    return {
      id: blog.id,
      title: blog.title,
      slug: blog.slug,
      content: "",
      image_url: blog.image_url ?? "",
      alt_text: blog.alt_text ?? undefined,
      author_id: 0,
      published_at: publishedAt,
      created_at: publishedAt,
      updated_at: publishedAt,
      deleted_at: null,
      updated_by: 0,
      author: EMPTY_AUTHOR,
      categories: (blog.categories ?? []).map((category) => ({
        id: category.id,
        name: category.name,
        slug: category.slug,
        description: "",
        image_url: "",
        created_at: publishedAt,
        updated_at: publishedAt,
        deleted_at: null,
        updated_by: 0,
      })),
    };
  });
}

/** Cached fetch for PDP — share request with page-level prefetch. */
export const fetchProductRelatedGuides = cache(async (productId: number): Promise<BlogList[]> => {
  const response = await getProductRelatedBlogs(productId, true);
  if (response.status === ServerActionStatus.SUCCESS && response.data?.related_blogs?.length) {
    return mapProductRelatedBlogsToBlogList(response.data.related_blogs);
  }
  return [];
});

export async function fetchRelatedGuides({
  productId,
  categoryId,
}: {
  productId?: Product["id"];
  categoryId?: number;
}): Promise<BlogList[]> {
  if (productId) {
    // Dedicated endpoint only — hide section when empty (no list/static fallback).
    return fetchProductRelatedGuides(productId);
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
