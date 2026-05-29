import { cache } from "react";
import {
  getBlogByCategoryAndSlug,
  getBlogBySlug,
  getDynamicPageSlug,
  getProductByCategory,
  getProductDescription,
  getProductVariantByID,
  getSeoMetaBySlug,
} from "@/lib/server.actions";
import { ServerActionStatus } from "@/lib/config/app.config";
import { DynamicPageSlugResponse, FaqResponse, SeoMetaResponse } from "@/lib/config/global.config";
import {
  CategoryResponseData,
  ProductDescriptionResponse,
  ProductResponse,
} from "@/lib/config/product.config";
import { BlogByCategoryAndSlugResponse, BlogBySlugResponse } from "@/lib/config/blog.config";
import { PRODUCT_DESCRIPTION_QUERY, PRODUCT_PAYLOAD, PRODUCT_VARIANT_ATTRIBUTE, PRODUCT_VARIANT_PAYLOAD } from "@/lib/api-routes";
import { resolveDescriptionHtml } from "@/lib/product-description.utils";
import {
  buildProductSchema,
  buildBreadcrumbSchema,
  buildFaqSchema,
  dedupeSchemaGraphNodes,
  getRatingFromReviewResponse,
  toAbsoluteUrl,
  SCHEMA_CONTEXT,
} from "@/lib/seo-schema";
import { resolveSiteUrl } from "@/lib/site-url";

export const resolveBaseUrl = (): string => {
  return resolveSiteUrl();
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

    // Prefer full-path slug (variant URL) for variant-specific SEO when available.
    const [primaryResult, fullPathResult] = await Promise.all([
      fetchDynamicPageSlug(primarySlug),
      fetchDynamicPageSlug(fullPathSlug),
    ]);
    return fullPathResult ?? primaryResult;
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

export const fetchProductDescription = cache(async (
  productId: number,
  attributeTerms: PRODUCT_VARIANT_ATTRIBUTE[] = [],
): Promise<string> => {
  const params: PRODUCT_DESCRIPTION_QUERY | undefined = attributeTerms.length
    ? { attribute_terms: attributeTerms }
    : undefined;
  const response = await getProductDescription(productId, params, true);
  if (response.status === ServerActionStatus.ERROR || !response.data) {
    return "";
  }
  return resolveDescriptionHtml(response.data);
});

export const fetchProductDescriptionData = cache(async (
  productId: number,
  attributeTerms: PRODUCT_VARIANT_ATTRIBUTE[] = [],
): Promise<ProductDescriptionResponse | null> => {
  const params: PRODUCT_DESCRIPTION_QUERY | undefined = attributeTerms.length
    ? { attribute_terms: attributeTerms }
    : undefined;
  const response = await getProductDescription(productId, params, true);
  if (response.status === ServerActionStatus.ERROR || !response.data) {
    return null;
  }
  return response.data;
});

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
  schemaDescription,
  schemaName,
}: {
  baseUrl: string;
  data: ProductResponse;
  productUrl: string;
  faqs: FaqResponse[];
  ratingData: ReturnType<typeof getRatingFromReviewResponse> | null;
  schemaDescription?: string;
  schemaName?: string;
}) => {
  const productSchema = buildProductSchema({
    productResponse: data,
    productUrl,
    baseUrl,
    ratingData,
    currency: "GBP",
    descriptionOverride: schemaDescription,
    nameOverride: schemaName,
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
