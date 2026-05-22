import { getBlogList, getBlogPostList, getFaqs, getReviewOrderByProductId } from "@/lib/server.actions";
import CategoryProducts from "../CategoryProducts";
import { ServerActionResponse, ServerActionStatus } from "@/lib/config/app.config";
import { redirect, RedirectType } from 'next/navigation';
import PageNotFound from '@/app/(store)/page-not-found/page';
import ProductView from "../ProductView";
import CategoryBlogs from "../../blogs/_components/CategoryBlog";
import { DynamicPageSlugResponse, FaqResponse } from "@/lib/config/global.config";
import { AttributeProductTerms, AttributeTerms, Product, ProductReview } from "@/lib/config/product.config";
import BlogListView from "../../blogs/_components/BlogList";
import { PRODUCT_PAYLOAD, PRODUCT_VARIANT_ATTRIBUTE } from "@/lib/api-routes";
import { REVIEW_ORDER_RESPONSE } from "@/lib/config/order.config";
import JsonLd from "@/components/JsonLd";
import {
  buildVariantFirstDescription,
  buildVariantFirstTitle,
  getRatingFromReviewResponse,
  htmlToPlainText,
  toAbsoluteUrl,
} from "@/lib/seo-schema";
import {
  buildProductJsonLdData,
  buildVariantParams,
  fetchBlogByCategoryAndSlug,
  fetchBlogBySlug,
  fetchCategory,
  fetchDynamicPageSlugWithFallback,
  fetchProduct,
  fetchSeoMetaBySlug,
  getCategoryPaginationLinks,
  normalizeRedirectUrl,
  resolveBaseUrl,
} from "./page.helpers";

type PageProps = {
  slug: string[];
};
const BASE_URL = resolveBaseUrl();

const extractFaqList = (payload: unknown): FaqResponse[] => {
  if (Array.isArray(payload)) return payload as FaqResponse[];
  if (!payload || typeof payload !== "object") return [];

  const candidate = payload as { faqs?: unknown; items?: unknown; rows?: unknown; data?: unknown };
  if (Array.isArray(candidate.faqs)) return candidate.faqs as FaqResponse[];
  if (Array.isArray(candidate.items)) return candidate.items as FaqResponse[];
  if (Array.isArray(candidate.rows)) return candidate.rows as FaqResponse[];
  if (Array.isArray(candidate.data)) return candidate.data as FaqResponse[];

  return [];
};

const resolveServerFaqs = async ({
  productId,
  entityId,
  variantId,
  variantTermId,
  categoryId,
}: {
  productId: number;
  entityId?: number;
  variantId?: number;
  variantTermId?: number;
  categoryId?: number;
}) => {
  const requests: Array<Promise<ServerActionResponse<unknown>>> = [
    getFaqs("product", productId),
  ];

  if (entityId && entityId !== productId) {
    requests.push(getFaqs("product", entityId));
  }

  if (variantId) {
    requests.push(getFaqs("variant", variantId));
  }

  if (variantTermId && variantTermId !== variantId) {
    requests.push(getFaqs("variant", variantTermId));
  }

  if (categoryId) {
    requests.push(getFaqs("category", categoryId));
  }

  const responses = await Promise.all(requests);
  for (const response of responses) {
    if (response.status === ServerActionStatus.SUCCESS) {
      const faqList = extractFaqList(response.data);
      if (faqList.length > 0) {
        return faqList;
      }
    }
  }

  return [];
};

const Page = async ({
  params,
  searchParams,
}: {
  params: Promise<PageProps>,
  searchParams: Promise<Record<string, string>>
}) => {

  const slug = (await params).slug;
  // Default to popularity sorting when no sort params are provided
  // This ensures products are sorted by popularity without modifying the URL
  const defaultParams = { sort_by: "popularity", limit: 12, offset: 0 } as const;
  const searchParamsData = await searchParams;
  const primarySlug: string | null = slug[0];
  const secondarySlug: string | null = slug[1];
  const dynamicPageSlug: DynamicPageSlugResponse | null = await fetchDynamicPageSlugWithFallback(slug.join("/"));
  if (!dynamicPageSlug) {
    return <PageNotFound />;
  }

  // SEO redirect for deleted/unpublished slugs (middleware emits 301; this is a safe fallback).
  if ((dynamicPageSlug as unknown as { redirect?: boolean; redirect_url?: string })?.redirect) {
    const dest = normalizeRedirectUrl((dynamicPageSlug as unknown as { redirect_url?: string })?.redirect_url);
    if (dest) {
      redirect(dest);
    }
  }

  // Only handle product variants when entity_type is "product" and there are two slugs
  if (primarySlug && secondarySlug && dynamicPageSlug?.entity_type === 'product') {
    const response = await fetchProduct(dynamicPageSlug?.entity_id ?? 0, []);
    const variantTerms: AttributeTerms[] | undefined = response?.product.attribute_terms.filter((attrTerm: AttributeTerms) => attrTerm.attribute.used_in_variation === true);
    
    const variant: AttributeProductTerms | null = variantTerms?.reduce((result: AttributeProductTerms | null, attrTerm: AttributeTerms) => {

      const matchingTerm = attrTerm.terms.find(term => term.slug === secondarySlug);
      if (matchingTerm) {
        return {
          attribute: attrTerm.attribute,
          terms: matchingTerm
        };
      } 
      return result;
    }, null) ?? null;

    const payload: PRODUCT_VARIANT_ATTRIBUTE[] = [];

    // Add variant payload if exists
    if (variant) {
      payload.push({
        attribute_id: variant.attribute.id,
        term_id: variant.terms.id
      });
    } 
    // Add search params payload
    if (searchParamsData) {
      Object.entries(searchParamsData).forEach(([attributeId, termSlug]) => {
        const term = variantTerms?.find(term => term.attribute.id === parseInt(attributeId) && term.terms.find(t => t.slug === termSlug));
        // Skip if this attribute is already in payload from variant
        if (attributeId !== variant?.attribute.id.toString()) {
          payload.push({
            attribute_id: parseInt(attributeId),
            term_id: term?.terms.find(t => t.slug === termSlug)?.id ?? 0
          });
        }
      });
    }

    // Parallel fetch: Product (required), FAQ, Rating (optional)
    const entityId = dynamicPageSlug?.entity_id ?? 0;
    const [productRes, , ratingRes] = await Promise.allSettled([
      fetchProduct(entityId, payload),
      getFaqs("product", entityId),
      getReviewOrderByProductId(entityId, 1, 1),
    ]);

    const data = productRes.status === "fulfilled" ? productRes.value : null;
    if (data && !data.variants.length) {
      const lastPayload = payload[payload.length - 1];
      const newSlug = data?.filtered_attribute_terms.find(term => term.attribute.id === lastPayload.attribute_id)?.terms.find(t => t.id === lastPayload.term_id)?.slug;
      if (newSlug) {
        redirect(`/${data.product.slug}/${newSlug}`, RedirectType.replace);
      } else {
        return <PageNotFound />;
      }
    }

    if (!variant || !data || !data.variants.length || !data.product || !data.product.category) {
      return <PageNotFound />;
    }

    const productUrl = toAbsoluteUrl(BASE_URL, `/${data.product.slug}/${secondarySlug}`);
    const faqs = await resolveServerFaqs({
      productId: data.product.id,
      entityId,
      variantId: data.variants?.[0]?.id,
      variantTermId: variant?.terms?.id,
      categoryId: data.product.category?.id,
    });
    const ratingData = ratingRes.status === "fulfilled" && ratingRes.value?.status === ServerActionStatus.SUCCESS && ratingRes.value.data
      ? getRatingFromReviewResponse(ratingRes.value.data)
      : null;

    const parentPage = primarySlug ? await fetchDynamicPageSlugWithFallback(primarySlug) : null;
    const parentSeoDescription = parentPage?.seo?.description?.trim() ?? "";
    const parentSeoTitle = parentPage?.seo?.title?.trim() ?? data.product.name;
    const variantName = variant.terms.name.trim();
    const variantDescription = buildVariantFirstDescription(
      variantName,
      data.product.name,
      parentSeoDescription,
      data.product.description,
    );
    const variantTitle = buildVariantFirstTitle(variantName, parentSeoTitle);

    const jsonLdData = buildProductJsonLdData({
      baseUrl: BASE_URL,
      data,
      productUrl,
      faqs,
      ratingData,
      schemaDescription: variantDescription,
      schemaName: variantTitle.replace(/\s*\|\s*vapehub\s*$/i, "").trim(),
    });

    return (
      <>
        <JsonLd data={jsonLdData} />
        <ProductView
          data={data}
          isVariant={true}
          selectedVariant={variant}
          productFaqs={faqs}
          parentSeoDescription={parentSeoDescription}
          parentSeoTitle={parentSeoTitle}
        />
      </>
    );
  }


  const entityTypeHandlers: Record<string, () => Promise<React.ReactNode>> = {
    blog_category: async () => {
      const blogs = await fetchBlogBySlug(primarySlug);
      const pageFromQuery = Number.parseInt(searchParamsData.page ?? "1", 10);
      const page = Number.isNaN(pageFromQuery) || pageFromQuery < 1 ? 1 : pageFromQuery;
      const selectedCategoryId = blogs?.id?.toString() ?? "0";
      const [categoriesResponse, blogsResponse] = await Promise.all([
        getBlogList(),
        selectedCategoryId === "0"
          ? getBlogPostList({ limit: 9, page })
          : getBlogPostList({ categoryId: selectedCategoryId, limit: 9, page }),
      ]);

      const allTab = {
        id: 0,
        name: "All",
        slug: "all",
        description: "",
        image_url: "",
        blogs: [],
        blog_count: 0,
      };

      const initialTabs = categoriesResponse.status === ServerActionStatus.SUCCESS
        ? [allTab, ...categoriesResponse.data]
        : [allTab];
      const initialBlogs = blogsResponse.status === ServerActionStatus.SUCCESS ? blogsResponse.data.blogs : [];
      const initialTotalPages = blogsResponse.status === ServerActionStatus.SUCCESS ? blogsResponse.data.pagination.totalPages : 1;

      return blogs && (
        <BlogListView
          selectedId={selectedCategoryId}
          page={page}
          pathnameBase={`/${primarySlug}`}
          lockCategory
          initialTabs={initialTabs}
          initialBlogs={initialBlogs}
          initialPage={page}
          initialTotalPages={initialTotalPages}
        />
      );
    },
    blog: async () => {
      // For blog posts with two slugs (category/blog), use the secondary slug (blog post slug)
      // For single slug, use primary slug
      const blogSlug = secondarySlug || primarySlug;
      const categoryBlogs = await fetchBlogByCategoryAndSlug(blogSlug);
      if (!categoryBlogs) {
      }
      return categoryBlogs && <CategoryBlogs data={categoryBlogs} />;
    },
    category: async () => {
      // Normalize pagination: use SEO-friendly `page` in the URL, convert to `offset` for the API.
      const normalizedSearchParams: Record<string, string> = { ...searchParamsData };
      const pageFromUrl = parseInt(normalizedSearchParams.page ?? "1", 10);
      const limit = Number(defaultParams.limit) || 12;

      if (!Number.isNaN(pageFromUrl) && pageFromUrl > 1) {
        normalizedSearchParams.offset = String((pageFromUrl - 1) * limit);
      } else {
        // Ensure we always have a deterministic offset value
        normalizedSearchParams.offset = "0";
      }
      delete normalizedSearchParams.page;

      const combinedParams = buildVariantParams(normalizedSearchParams, defaultParams);
      const category = await fetchCategory(primarySlug, combinedParams as PRODUCT_PAYLOAD);
      if (category) {
        // Extract review data from products and format for CategoryProducts
        const reviews: ServerActionResponse<REVIEW_ORDER_RESPONSE>[] = category.products ? category.products.map((product: Product) => ({
          status: ServerActionStatus.SUCCESS,
          data: {
            reviews: (product.reviews || []).map((review: ProductReview) => ({
              ...review,
              product_id: product.id,
              is_visible: true,
              updated_at: review.created_at,
              verified_by: Boolean(review.verified_by),
              user: review.user ? {
                id: review.user.id,
                first_name: review.user.first_name,
                last_name: review.user.last_name,
                profile_pic_url: review.user.profile_pic_url
              } : null,
              order: review.order ? {
                id: review.order.id,
                order_unique_id: review.order.order_unique_id
              } : null,
              product: {
                id: product.id,
                name: product.name,
                slug: product.slug
              },
              media: []
            })),
            pagination: {
              total: product.review_stats?.total_reviews || 0,
              page: 1,
              limit: 1,
              totalPages: 1
            },
            average_rating: String(product.review_stats?.average_rating || 0),
            total_reviews: product.review_stats?.total_reviews || 0
          }
        })) : [];
        return (
          <>
            <CategoryProducts data={category} reviews={reviews} dynamicPageSlug={dynamicPageSlug} />
          </>
        );
      }
      return null;
    },
    product: async () => {
      const entityId = dynamicPageSlug?.entity_id ?? 0;
      const [productRes, , ratingRes] = await Promise.allSettled([
        fetchProduct(entityId, []),
        getFaqs("product", entityId),
        getReviewOrderByProductId(entityId, 1, 1),
      ]);

      const data = productRes.status === "fulfilled" ? productRes.value : null;
      if (!data?.product || !data.product.category) {
        return <PageNotFound />;
      }

      const productUrl = toAbsoluteUrl(BASE_URL, `/${data.product.slug}`);
      const faqs = await resolveServerFaqs({
        productId: data.product.id,
        entityId,
        variantId: data.variants?.[0]?.id,
        categoryId: data.product.category?.id,
      });
      const ratingData = ratingRes.status === "fulfilled" && ratingRes.value?.status === ServerActionStatus.SUCCESS && ratingRes.value.data
        ? getRatingFromReviewResponse(ratingRes.value.data)
        : null;
      const parentSeoDescription = dynamicPageSlug.seo?.description?.trim() ?? "";
      const parentSeoTitle = dynamicPageSlug.seo?.title?.trim() ?? data.product.name;
      const jsonLdData = buildProductJsonLdData({
        baseUrl: BASE_URL,
        data,
        productUrl,
        faqs,
        ratingData,
      });
      return (
        <>
          <JsonLd data={jsonLdData} />
          <ProductView
            data={data}
            productFaqs={faqs}
            parentSeoDescription={parentSeoDescription}
            parentSeoTitle={parentSeoTitle}
          />
        </>
      );
    }
  };

  const handler: () => Promise<React.ReactNode> = entityTypeHandlers[dynamicPageSlug?.entity_type ?? ""];
  if (!handler) {
    return <PageNotFound />;
  }

  const result: React.ReactNode = dynamicPageSlug ? await handler() : null;
  if (!result) {
    return <PageNotFound />;
  }

  return result;
}

export default Page;

// Enable ISR with revalidation every 60 seconds
export const revalidate = 60;

// Allow dynamic params for paths not in generateStaticParams
export const dynamicParams = true;

// export async function generateStaticParams() {
//   // Static product slugs for ISR - no API calls needed
//   const productSlugs = [
//     'ivg-intense-salts-e-liquid',
//     'crystal-prime-nic-salts',
//     'vnsn-quake-10000-pods',
//     'vnsn-quake-10000-prefilled-pod-kit'
//   ];

//   return productSlugs.map((slug) => ({
//     slug: [slug]
//   }));
// }


export async function generateMetadata({ params, searchParams }: {
  params: Promise<PageProps>,
  searchParams: Promise<Record<string, string>>
}) {
  const slug = (await params).slug;
  const primarySlug: string | null = slug[0];
  const secondarySlug: string | null = slug[1];
  // const defaultParams = { sort_by: "id", order: "DESC", limit: 12, offset: 0 } as const;
  const searchParamsData = await searchParams;

  const dynamicPageSlug: DynamicPageSlugResponse | null = await fetchDynamicPageSlugWithFallback(slug.join("/"));
  if (!dynamicPageSlug) {
    return {};
  }

  // If this slug is configured to redirect, avoid generating metadata for the old URL.
  // (Actual redirect is handled by middleware; Page has a permanentRedirect fallback.)
  if ((dynamicPageSlug as unknown as { redirect?: boolean })?.redirect) {
    return {};
  }

  // Only handle product variants when entity_type is "product" and there are two slugs
  if (primarySlug && secondarySlug && dynamicPageSlug?.entity_type === 'product') {
    const response = await fetchProduct(dynamicPageSlug?.entity_id ?? 0, []);
    const variant: AttributeProductTerms | null = response?.product.attribute_terms?.reduce((result: AttributeProductTerms | null, attrTerm: AttributeTerms) => {
      const matchingTerm = attrTerm.terms.find(term => term.slug === secondarySlug);
      if (matchingTerm) {
        return {
          attribute: attrTerm.attribute,
          terms: matchingTerm
        };
      }
      return result;
    }, null) ?? null;
    const payload = [];

    // Add variant payload if exists
    if (variant) {
      payload.push({
        attribute_id: variant.attribute.id,
        term_id: variant.terms.id
      });
    }

    // Add search params payload
    if (searchParamsData) {
      Object.entries(searchParamsData).forEach(([attributeId, termSlug]) => {
        const term = response?.product.attribute_terms?.find(term => term.attribute.id === parseInt(attributeId) && term.terms.find(t => t.slug === termSlug));
        // Skip if this attribute is already in payload from variant
        if (attributeId !== variant?.attribute.id.toString()) {
          payload.push({
            attribute_id: parseInt(attributeId),
            term_id: term?.terms.find(t => t.slug === termSlug)?.id ?? 0
          });
        }
      });
    }

    const parentPage = primarySlug ? await fetchDynamicPageSlugWithFallback(primarySlug) : null;
    const parentSeoDescription = parentPage?.seo?.description?.trim() ?? "";
    const parentSeoTitle = parentPage?.seo?.title?.trim() ?? "";
    const productMetaDescription =
      parentSeoDescription || dynamicPageSlug.seo?.description?.trim() || "";

    const data = await fetchProduct(dynamicPageSlug?.entity_id ?? 0, payload);
    if (data && !data.variants.length) {
      const variantName = variant?.terms.name?.trim();
      const titleBase = (parentSeoTitle || dynamicPageSlug.seo?.title || data.product.name || "").trim();
      const title = variantName ? buildVariantFirstTitle(variantName, titleBase || data.product.name) : titleBase;
      const description = variantName
        ? buildVariantFirstDescription(
            variantName,
            data.product.name,
            productMetaDescription,
            data.product.description,
          )
        : productMetaDescription || htmlToPlainText(data.product.description ?? "");
      return {
        title,
        description,
        openGraph: {
          title,
          description,
        },
      };
    }

    if (!variant || !data || !data.variants.length || !data.product || !data.product.category) {
      return {};
    }

    const variantName = variant.terms.name.trim();
    const titleBase = parentSeoTitle || dynamicPageSlug.seo?.title?.trim() || data.product.name;
    const title = buildVariantFirstTitle(variantName, titleBase);
    const description = buildVariantFirstDescription(
      variantName,
      data.product.name,
      productMetaDescription,
      data.product.description,
    );
    const variantCanonicalUrl = toAbsoluteUrl(BASE_URL, `/${primarySlug}/${secondarySlug}`);

    return {
      title,
      description,
      alternates: {
        canonical: variantCanonicalUrl,
      },
      openGraph: {
        title,
        description,
        images: data.variants[0].primary_image?.url ? [{
          url: data.variants[0].primary_image?.url,
          width: 1200,
          height: 630
        }] : undefined
      }
    };

  } else if (primarySlug && secondarySlug) {
  }


  const metadataHandlers = {
    blog_category: async () => {
      if (dynamicPageSlug.seo) {
        return {
          title: dynamicPageSlug.seo.title,
          description: dynamicPageSlug.seo.description,
          openGraph: {
            title: dynamicPageSlug.seo.title,
            description: dynamicPageSlug.seo.description,
            images: dynamicPageSlug.seo.ogImage ? [{
              url: dynamicPageSlug.seo.ogImage,
              width: 1200,
              height: 630
            }] : undefined
          }
        };
      }
      const blogs = await fetchBlogBySlug(primarySlug);
      if (!blogs) return null;

      return {
        title: `${blogs.name} | VapeHub`,
        description: "",
        openGraph: {
          title: `${blogs.name} | VapeHub`,
          description: "",
          images: blogs.image_url ? [{
            url: blogs.image_url,
            width: 1200,
            height: 630
          }] : undefined
        }
      };
    },

    blog: async () => {
      if (dynamicPageSlug.seo) {
        return {
          title: dynamicPageSlug.seo.title,
          description: dynamicPageSlug.seo.description,
          openGraph: {
            title: dynamicPageSlug.seo.title,
            description: dynamicPageSlug.seo.description,
            images: dynamicPageSlug.seo.ogImage ? [{
              url: dynamicPageSlug.seo.ogImage,
              width: 1200,
              height: 630
            }] : undefined
          }
        };
      }
      // For blog posts with two slugs (category/blog), use the secondary slug (blog post slug)
      const blogSlug = secondarySlug || primarySlug;
      const categoryBlogs = await fetchBlogByCategoryAndSlug(blogSlug);
      if (!categoryBlogs) {
        return null;
      }

      return {
        title: `${categoryBlogs.title} | VapeHub`,
        description: "",
        openGraph: {
          title: `${categoryBlogs.title} | VapeHub`,
          description: "",
          images: categoryBlogs.image_url ? [{
            url: categoryBlogs.image_url,
            width: 1200,
            height: 630
          }] : undefined
        }
      };
    },

    category: async () => {
      if (dynamicPageSlug.seo) {
        return {
          title: dynamicPageSlug.seo.title,
          description: dynamicPageSlug.seo.description,
          openGraph: {
            title: dynamicPageSlug.seo.title,
            description: dynamicPageSlug.seo.description,
            images: dynamicPageSlug.seo.ogImage ? [{
              url: dynamicPageSlug.seo.ogImage,
              width: 1200,
              height: 630
            }] : undefined
          }
        };
      }
      
      // Use the new SEO meta API instead of fetchCategory
      const seoMeta = await fetchSeoMetaBySlug(primarySlug);
      if (!seoMeta) return null;

      return {
        title:`${seoMeta.name} | VapeHub`,
        description: seoMeta.description,
        openGraph: {
          title: `${seoMeta.name} | VapeHub`,
          description: seoMeta.description,
          images: seoMeta.logo_url ? [{
            url: seoMeta.logo_url,
            width: 1200,
            height: 630
          }] : undefined
        }
      };
    },

    product: async () => {
      if (dynamicPageSlug.seo) {
        return {
          title: dynamicPageSlug.seo.title,
          description: dynamicPageSlug.seo.description,
          openGraph: {
            title: dynamicPageSlug.seo.title,
            description: dynamicPageSlug.seo.description,
            images: dynamicPageSlug.seo.ogImage ? [{
              url: dynamicPageSlug.seo.ogImage,
              width: 1200,
              height: 630
            }] : undefined
          }
        };
      }
      const data = await fetchProduct(dynamicPageSlug?.entity_id ?? 0, []);
      if (!data?.product || !data.product.category) return null;

        return {
          title: data.product.name,
        description: data.product.description,
        openGraph: {
          title: data.product.name,
          description: data.product.description,
          images: data.product.primary_image?.url ? [{
            url: data.product.primary_image?.url,
            width: 1200,
            height: 630
          }] : undefined
        }
      };
    },

    brand: async () => {
      if (dynamicPageSlug.seo) {
        return {
          title: dynamicPageSlug.seo.title,
          description: dynamicPageSlug.seo.description,
          openGraph: {
            title: dynamicPageSlug.seo.title,
            description: dynamicPageSlug.seo.description,
            images: dynamicPageSlug.seo.ogImage ? [{
              url: dynamicPageSlug.seo.ogImage,
              width: 1200,
              height: 630
            }] : undefined
          }
        };
      }
      
      // Use the new SEO meta API for brand
      const seoMeta = await fetchSeoMetaBySlug(primarySlug);
      if (!seoMeta) return null;

      return {
        title: `${seoMeta.name} | VapeHub`,
        description: seoMeta.description,
        openGraph: {
          title: `${seoMeta.name} | VapeHub`,
          description: seoMeta.description,
          images: seoMeta.logo_url ? [{
            url: seoMeta.logo_url,
            width: 1200,
            height: 630
          }] : undefined
        }
      };
    },

    deal: async () => {
      if (dynamicPageSlug.seo) {
        return {
          title: dynamicPageSlug.seo.title,
          description: dynamicPageSlug.seo.description,
          openGraph: {
            title: dynamicPageSlug.seo.title,
            description: dynamicPageSlug.seo.description,
            images: dynamicPageSlug.seo.ogImage ? [{
              url: dynamicPageSlug.seo.ogImage,
              width: 1200,
              height: 630
            }] : undefined
          }
        };
      }
      
      // Use the new SEO meta API for deal
      const seoMeta = await fetchSeoMetaBySlug(primarySlug);
      if (!seoMeta) return null;

      return {
        title: `${seoMeta.name} | VapeHub`,
        description: seoMeta.description,
        openGraph: {
          title: `${seoMeta.name} | VapeHub`,
          description: seoMeta.description,
          images: seoMeta.logo_url ? [{
            url: seoMeta.logo_url,
            width: 1200,
            height: 630
          }] : undefined
        }
      };
    }
  };

  const handler = metadataHandlers[dynamicPageSlug?.entity_type ?? ""];
  if (!handler) {
    return {};
  }

  const metadata = dynamicPageSlug ? await handler() : null;
  const paginationLinks = await getCategoryPaginationLinks({
    baseUrl: BASE_URL,
    dynamicPageSlug,
    primarySlug,
    searchParamsData,
  });
  const paginationIconLinks = [
    ...(paginationLinks.prev ? [{ rel: "prev" as const, url: paginationLinks.prev }] : []),
    ...(paginationLinks.next ? [{ rel: "next" as const, url: paginationLinks.next }] : []),
  ];

  // Add self-referencing canonical URLs for paginated and filtered pages.
  // We prefer a stable canonical that includes the current page number when present.
  const pageParam = searchParamsData.page;
  const pageNumber = Number.parseInt(pageParam ?? "1", 10);
  const hasValidPage = !Number.isNaN(pageNumber) && pageNumber > 1;

  const basePath = `/${primarySlug ?? ""}`.replace(/\/+$/, "") || "/";
  const canonicalPath = hasValidPage ? `${basePath}?page=${pageNumber}` : basePath;
  const canonicalUrl = toAbsoluteUrl(BASE_URL, canonicalPath);

  if (!metadata) {
    return {
      alternates: {
        canonical: canonicalUrl,
      },
      ...(paginationIconLinks.length
        ? {
            icons: {
              other: paginationIconLinks,
            },
          }
        : {}),
    };
  }

  const typedMetadata = metadata as {
    alternates?: { canonical?: string };
    icons?: { other?: Array<{ rel?: string; url?: string }> };
  };

  return {
    ...typedMetadata,
    alternates: {
      ...(typedMetadata.alternates ?? {}),
      canonical: canonicalUrl,
    },
    icons: paginationIconLinks.length
      ? {
          ...(typedMetadata.icons ?? {}),
          other: [...(typedMetadata.icons?.other ?? []), ...paginationIconLinks],
        }
      : typedMetadata.icons,
  };
}

