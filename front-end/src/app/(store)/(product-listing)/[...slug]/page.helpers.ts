import { cache } from "react";
import {
  getBlogByCategoryAndSlug,
  getBlogBySlug,
  getDynamicPageSlug,
  getProductByCategory,
  getProductVariantByID,
  getSeoMetaBySlug,
} from "@/lib/server.actions";
import { ServerActionStatus } from "@/lib/config/app.config";
import { DynamicPageSlugResponse, FaqResponse, SeoMetaResponse } from "@/lib/config/global.config";
import {
  CategoryResponseData,
  ProductResponse,
} from "@/lib/config/product.config";
import { BlogByCategoryAndSlugResponse, BlogBySlugResponse } from "@/lib/config/blog.config";
import { PRODUCT_PAYLOAD, PRODUCT_VARIANT_ATTRIBUTE, PRODUCT_VARIANT_PAYLOAD } from "@/lib/api-routes";
import {
  buildProductSchema,
  buildBreadcrumbSchema,
  buildFaqSchema,
  dedupeSchemaGraphNodes,
  getRatingFromReviewResponse,
  toAbsoluteUrl,
  SCHEMA_CONTEXT,
} from "@/lib/seo-schema";

export const resolveBaseUrl = (): string => {
  const configuredUrl = process.env.NEXTAUTH_URL;
  if (configuredUrl) {
    return configuredUrl.replace(/\/$/, "");
  }

  if (process.env.NODE_ENV !== "development") {
    throw new Error("NEXTAUTH_URL is required in non-development environments");
  }

  return "http://localhost:3000";
};

const fetchDynamicPageSlug = cache(async (slug: string): Promise<DynamicPageSlugResponse | null> => {
  const response = await getDynamicPageSlug(slug);
  if (response.status === ServerActionStatus.ERROR) {
    return null;
  }
  return response.data;
});

export const fetchDynamicPageSlugWithFallback = cache(
  async (slugPath: string): Promise<DynamicPageSlugResponse | null> => {
    const slugParts = slugPath.split("/").filter(Boolean);
    const primarySlug = slugParts[0];
    if (!primarySlug) {
      return null;
    }

    if (slugParts.length <= 1) {
      return await fetchDynamicPageSlug(primarySlug);
    }

    const fullPathSlug = slugParts.join("/");
    if (!fullPathSlug || fullPathSlug === primarySlug) {
      return await fetchDynamicPageSlug(primarySlug);
    }

    // Resolve both candidates in parallel and keep primary precedence.
    const [primaryResult, fullPathResult] = await Promise.all([
      fetchDynamicPageSlug(primarySlug),
      fetchDynamicPageSlug(fullPathSlug),
    ]);
    return primaryResult ?? fullPathResult;
  }
);

export const fetchCategory = async (
  slug: string,
  params: PRODUCT_PAYLOAD,
  canCache: boolean = true,
): Promise<CategoryResponseData | null> => {
  const response = await getProductByCategory(slug, params, canCache);
  if (response.status === ServerActionStatus.ERROR) {
    return null;
  }
  return response.data;
};

export const fetchProduct = async (id: number, params: PRODUCT_VARIANT_ATTRIBUTE[]): Promise<ProductResponse | null> => {
  const payload: PRODUCT_VARIANT_PAYLOAD = {
    product_id: id,
    attribute_terms: params
  };

  const response = await getProductVariantByID(payload);
  if (response.status === ServerActionStatus.ERROR) {
    return null;
  }
  return response.data;
};

export const fetchBlogByCategoryAndSlug = async (categorySlug: string): Promise<BlogByCategoryAndSlugResponse | null> => {
  const response = await getBlogByCategoryAndSlug(categorySlug);
  if (response.status === ServerActionStatus.ERROR) {
    return null;
  }
  return response.data;
};

export const fetchBlogBySlug = async (slug: string): Promise<BlogBySlugResponse | null> => {
  const response = await getBlogBySlug(slug);
  if (response.status === ServerActionStatus.ERROR) {
    return null;
  }
  return response.data;
};

export const fetchSeoMetaBySlug = async (slug: string): Promise<SeoMetaResponse | null> => {
  const response = await getSeoMetaBySlug(slug);
  if (response.status === ServerActionStatus.ERROR) {
    return null;
  }
  return response.data;
};

export const buildVariantParams = (searchParamsData: Record<string, string>, defaultParams: PRODUCT_PAYLOAD) => {
  const variantParams = Object.entries(searchParamsData)
    .reduce((acc: Record<string, unknown>, [key, value]) => {
      if (key.startsWith('attribute_')) {
        const attributeId = key.replace('attribute_', '');
        const values = value.split(',').map(Number);

        const variantObj = acc.variant ? JSON.parse(acc.variant as string) : {};
        variantObj[attributeId] = values;
        acc.variant = JSON.stringify(variantObj);
      } else {
        acc[key] = value;
      }
      return acc;
    }, { ...defaultParams });

  return Object.keys(variantParams).length > 1 ? variantParams : defaultParams;
};

export function normalizeRedirectUrl(input?: string): string | null {
  let dest = (input ?? '').trim();
  if (!dest) return null;

  if (dest.startsWith('/http://') || dest.startsWith('/https://')) {
    dest = dest.slice(1);
  }

  if (!/^https?:\/\//i.test(dest) && !dest.startsWith('/')) {
    dest = `/${dest}`;
  }

  return dest;
}

export const buildProductJsonLdData = ({
  baseUrl,
  data,
  productUrl,
  faqs,
  ratingData,
}: {
  baseUrl: string;
  data: ProductResponse;
  productUrl: string;
  faqs: FaqResponse[];
  ratingData: ReturnType<typeof getRatingFromReviewResponse> | null;
}) => {
  const productSchema = buildProductSchema({
    productResponse: data,
    productUrl,
    baseUrl,
    ratingData,
    currency: "GBP",
  });
  const breadcrumbSchema = buildBreadcrumbSchema({
    baseUrl,
    categoryName: data.product.category?.name ?? "Category",
    categorySlug: data.product.category?.slug ?? "",
    productName: data.product.name,
    productUrl,
    shopLabel: "Shop",
    shopPath: "/shop",
  });
  const faqSchema = buildFaqSchema(faqs ?? [], productUrl);
  const graph: Record<string, unknown>[] = dedupeSchemaGraphNodes([
    productSchema,
    breadcrumbSchema,
    ...(faqSchema ? [faqSchema] : []),
  ]);

  return {
    "@context": SCHEMA_CONTEXT,
    "@graph": graph,
  };
};

export async function getCategoryPaginationLinks({
  baseUrl,
  dynamicPageSlug,
  primarySlug,
  searchParamsData,
}: {
  baseUrl: string;
  dynamicPageSlug: DynamicPageSlugResponse | null;
  primarySlug: string | null;
  searchParamsData: Record<string, string>;
}) {
  if (!primarySlug || dynamicPageSlug?.entity_type !== "category") {
    return {};
  }

  const defaultParams = { sort_by: "popularity", limit: 12, offset: 0 } as const;
  const normalizedSearchParams: Record<string, string> = { ...searchParamsData };
  const parsedPage = Number.parseInt(normalizedSearchParams.page ?? "1", 10);
  const pageNumber = !Number.isNaN(parsedPage) && parsedPage > 0 ? parsedPage : 1;
  const limit = Number(defaultParams.limit) || 12;

  normalizedSearchParams.offset = pageNumber > 1 ? String((pageNumber - 1) * limit) : "0";
  delete normalizedSearchParams.page;

  const combinedParams = buildVariantParams(normalizedSearchParams, defaultParams);
  const category = await fetchCategory(primarySlug, combinedParams as PRODUCT_PAYLOAD, false);
  const totalPages = Math.max(1, category?.pagination?.total_pages ?? 1);
  const prevPage = pageNumber > 1 ? pageNumber - 1 : undefined;
  const nextPage = pageNumber < totalPages ? pageNumber + 1 : undefined;
  const basePath = `/${primarySlug}`.replace(/\/+$/, "") || "/";

  return {
    prev: prevPage ? toAbsoluteUrl(baseUrl, prevPage === 1 ? basePath : `${basePath}?page=${prevPage}`) : undefined,
    next: nextPage ? toAbsoluteUrl(baseUrl, `${basePath}?page=${nextPage}`) : undefined,
  };
}
