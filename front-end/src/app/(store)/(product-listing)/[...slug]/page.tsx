import { getBlogByCategoryAndSlug, getBlogBySlug, getDynamicPageSlug, getProductByCategory, getProductVariantByID, getSeoMetaBySlug, getFaqs, getReviewOrderByProductId } from "@/lib/server.actions";
import CategoryProducts from "../CategoryProducts";
import { ServerActionResponse, ServerActionStatus } from "@/lib/config/app.config";
import { redirect, RedirectType } from 'next/navigation';
import PageNotFound from '@/app/(store)/page-not-found/page';
import ProductView from "../ProductView";
import CategoryBlogs from "../../blogs/_components/CategoryBlog";
import { DynamicPageSlugResponse, SeoMetaResponse } from "@/lib/config/global.config";
import { AttributeProductTerms, AttributeTerms, CategoryResponseData, ProductResponse, Product, ProductReview } from "@/lib/config/product.config";
import { BlogByCategoryAndSlugResponse, BlogBySlugResponse } from "@/lib/config/blog.config";
import BlogListView from "../../blogs/_components/BlogList";
import { PRODUCT_PAYLOAD, PRODUCT_VARIANT_ATTRIBUTE, PRODUCT_VARIANT_PAYLOAD } from "@/lib/api-routes";
import { REVIEW_ORDER_RESPONSE } from "@/lib/config/order.config";
import { unstable_noStore } from "next/cache";
import JsonLd from "@/components/JsonLd";
import { buildProductSchema, buildBreadcrumbSchema, buildFaqSchema, dedupeSchemaGraphNodes, getRatingFromReviewResponse, toAbsoluteUrl, SCHEMA_CONTEXT } from "@/lib/seo-schema";

type PageProps = {
  slug: string[];
};
const BASE_URL = (process.env.NEXTAUTH_URL || "https://www.vapehub.co.uk").replace(/\/$/, "");

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
  const dynamicPageSlug: DynamicPageSlugResponse | null = await fetchDynamicPageSlugWithFallback(slug);
  if (!dynamicPageSlug) {
    return <PageNotFound />;
  }

  // SEO redirect for deleted/unpublished slugs (middleware emits 301; this is a safe fallback).
  if ((dynamicPageSlug as unknown as { redirect?: boolean; redirect_url?: string })?.redirect === true) {
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
    const [productRes, faqRes, ratingRes] = await Promise.allSettled([
      fetchProduct(entityId, payload),
      getFaqs("product", entityId, false),
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
    const faqs = faqRes.status === "fulfilled" && faqRes.value?.status === ServerActionStatus.SUCCESS ? faqRes.value.data : [];
    const ratingData = ratingRes.status === "fulfilled" && ratingRes.value?.status === ServerActionStatus.SUCCESS && ratingRes.value.data
      ? getRatingFromReviewResponse(ratingRes.value.data)
      : null;

    const productSchema = buildProductSchema({
      productResponse: data,
      productUrl,
      baseUrl: BASE_URL,
      ratingData,
      currency: "GBP",
    });
    const breadcrumbSchema = buildBreadcrumbSchema({
      baseUrl: BASE_URL,
      categoryName: data.product.category?.name ?? "Category",
      categorySlug: data.product.category?.slug ?? "",
      productName: data.product.name,
      productUrl,
      shopLabel: "Shop",
      shopPath: "/shop",
    });
    const faqSchema = buildFaqSchema(faqs ?? []);
    const graph: Record<string, unknown>[] = dedupeSchemaGraphNodes([
      productSchema,
      breadcrumbSchema,
      ...(faqSchema ? [faqSchema] : []),
    ]);
    const jsonLdData = {
      "@context": SCHEMA_CONTEXT,
      "@graph": graph,
    };

    return (
      <>
        <JsonLd data={jsonLdData} />
        <ProductView data={data} isVariant={true} selectedVariant={variant} />
      </>
    );
  }


  const entityTypeHandlers: Record<string, () => Promise<React.ReactNode>> = {
    blog_category: async () => {
      const blogs = await fetchBlogBySlug(primarySlug);
      return blogs && <BlogListView selectedId={blogs.id.toString()} />;
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
      const [productRes, faqRes, ratingRes] = await Promise.allSettled([
        fetchProduct(entityId, []),
        getFaqs("product", entityId, false),
        getReviewOrderByProductId(entityId, 1, 1),
      ]);

      const data = productRes.status === "fulfilled" ? productRes.value : null;
      if (!data?.product || !data.product.category) {
        return <PageNotFound />;
      }

      const productUrl = toAbsoluteUrl(BASE_URL, `/${data.product.slug}`);
      const faqs = faqRes.status === "fulfilled" && faqRes.value?.status === ServerActionStatus.SUCCESS ? faqRes.value.data : [];
      const ratingData = ratingRes.status === "fulfilled" && ratingRes.value?.status === ServerActionStatus.SUCCESS && ratingRes.value.data
        ? getRatingFromReviewResponse(ratingRes.value.data)
        : null;

      const productSchema = buildProductSchema({
        productResponse: data,
        productUrl,
        baseUrl: BASE_URL,
        ratingData,
        currency: "GBP",
      });
      const breadcrumbSchema = buildBreadcrumbSchema({
        baseUrl: BASE_URL,
        categoryName: data.product.category?.name ?? "Category",
        categorySlug: data.product.category?.slug ?? "",
        productName: data.product.name,
        productUrl,
        shopLabel: "Shop",
        shopPath: "/shop",
      });
      const faqSchema = buildFaqSchema(faqs ?? []);
      const graph: Record<string, unknown>[] = dedupeSchemaGraphNodes([
        productSchema,
        breadcrumbSchema,
        ...(faqSchema ? [faqSchema] : []),
      ]);
      const jsonLdData = {
        "@context": SCHEMA_CONTEXT,
        "@graph": graph,
      };

      return (
        <>
          <JsonLd data={jsonLdData} />
          <ProductView data={data} />
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
// export const revalidate = 60;

// // Allow dynamic params for paths not in generateStaticParams
// export const dynamicParams = true;

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

const fetchDynamicPageSlug = async (slug: string): Promise<DynamicPageSlugResponse | null> => {
  const response = await getDynamicPageSlug(slug);
  if (response.status === ServerActionStatus.ERROR) {
    return null;
  }
  return response.data;
};

/**
 * Keep current single-slug behavior first, then fallback to full path lookup
 * for legacy URLs like /2022/12/30/elux-legend-3500-review/.
 */
const fetchDynamicPageSlugWithFallback = async (slugParts: string[]): Promise<DynamicPageSlugResponse | null> => {
  const primarySlug = slugParts[0];
  if (!primarySlug) {
    return null;
  }

  const primaryResult = await fetchDynamicPageSlug(primarySlug);
  if (primaryResult) {
    return primaryResult;
  }

  if (slugParts.length <= 1) {
    return null;
  }

  const fullPathSlug = slugParts.filter(Boolean).join("/");
  if (!fullPathSlug || fullPathSlug === primarySlug) {
    return null;
  }

  return await fetchDynamicPageSlug(fullPathSlug);
};

const fetchCategory = async (
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

const fetchProduct = async (id: number, params: PRODUCT_VARIANT_ATTRIBUTE[]): Promise<ProductResponse | null> => {

  const payload: PRODUCT_VARIANT_PAYLOAD = {
    product_id: id,
    attribute_terms: params
  }

  const response = await getProductVariantByID(payload);

  if (response.status === ServerActionStatus.ERROR) {
    return null;
  }
  return response.data;
};

const fetchBlogByCategoryAndSlug = async (categorySlug: string): Promise<BlogByCategoryAndSlugResponse | null> => {
  const response = await getBlogByCategoryAndSlug(categorySlug);
  if (response.status === ServerActionStatus.ERROR) {
    return null;
  }
  return response.data;
};

const fetchBlogBySlug = async (slug: string): Promise<BlogBySlugResponse | null> => {
  const response = await getBlogBySlug(slug);
  if (response.status === ServerActionStatus.ERROR) {
    return null;
  }
  return response.data;
};

const fetchSeoMetaBySlug = async (slug: string): Promise<SeoMetaResponse | null> => {
  const response = await getSeoMetaBySlug(slug);
  if (response.status === ServerActionStatus.ERROR) {
    return null;
  }
  return response.data;
};

const buildVariantParams = (searchParamsData: Record<string, string>, defaultParams: PRODUCT_PAYLOAD) => {
  const variantParams = Object.entries(searchParamsData)
    .reduce((acc: Record<string, unknown>, [key, value]) => {
      if (key.startsWith('attribute_')) {
        const attributeId = key.replace('attribute_', '');
        const values = value.split(',').map(Number);

        // Build variant object
        const variantObj = acc.variant ? JSON.parse(acc.variant as string) : {};
        variantObj[attributeId] = values;

        // Encode variant object as URL parameter
        acc.variant = JSON.stringify(variantObj);
      } else {
        acc[key] = value;
      }
      return acc;
    }, { ...defaultParams });

  return Object.keys(variantParams).length > 1 ? variantParams : defaultParams;
};

function normalizeRedirectUrl(input?: string): string | null {
  let dest = (input ?? '').trim();
  if (!dest) return null;

  // Some API responses come as "/https://example.com/path" – fix that
  if (dest.startsWith('/http://') || dest.startsWith('/https://')) {
    dest = dest.slice(1);
  }

  // If it's relative but missing a leading slash, add it
  if (!/^https?:\/\//i.test(dest) && !dest.startsWith('/')) {
    dest = `/${dest}`;
  }

  return dest;
}

export async function generateMetadata({ params, searchParams }: {
  params: Promise<PageProps>,
  searchParams: Promise<Record<string, string>>
}) {
  const slug = (await params).slug;
  const primarySlug: string | null = slug[0];
  const secondarySlug: string | null = slug[1];
  // const defaultParams = { sort_by: "id", order: "DESC", limit: 12, offset: 0 } as const;
  const searchParamsData = await searchParams;

  const dynamicPageSlug: DynamicPageSlugResponse | null = await fetchDynamicPageSlugWithFallback(slug);
  if (!dynamicPageSlug) {
    return <PageNotFound />;
  }

  // Pagination links must reflect the current URL (searchParams). Opt out of static metadata cache for categories.
  if (dynamicPageSlug.entity_type === "category") {
    unstable_noStore();
  }

  // If this slug is configured to redirect, avoid generating metadata for the old URL.
  // (Actual redirect is handled by middleware; Page has a permanentRedirect fallback.)
  if ((dynamicPageSlug as unknown as { redirect?: boolean })?.redirect === true) {
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

    const data = await fetchProduct(dynamicPageSlug?.entity_id ?? 0, payload);
    if(data &&!data.variants.length) {
       return {
        title: dynamicPageSlug.seo?.title ?? data.product.name,
        description: dynamicPageSlug.seo?.description ?? data.product.description,
        openGraph: {
          title: dynamicPageSlug.seo?.title ?? data.product.name,
          description: dynamicPageSlug.seo?.description ?? data.product.description,
          
        }
       };
    }
   
    
     if (!variant || !data || !data.variants.length || !data.product || !data.product.category) {
      return <PageNotFound />;
    }
     
    return {
      title: dynamicPageSlug.seo?.title ?? (variant ? `${variant.terms.name} - ${data.product.name}` : data.product.name),
      description: dynamicPageSlug.seo?.description ?? data.product.description,
      openGraph: {
        title: dynamicPageSlug.seo?.title ?? (variant ? `${variant.terms.name} - ${data.product.name}` : data.product.name),
        description: dynamicPageSlug.seo?.description ?? data.product.description,
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
    <PageNotFound />;
  }

  const metadata = dynamicPageSlug ? await handler() : null;
  const paginationLinks = await getCategoryPaginationLinks({
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

async function getCategoryPaginationLinks({
  dynamicPageSlug,
  primarySlug,
  searchParamsData,
}: {
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
    prev: prevPage ? toAbsoluteUrl(BASE_URL, prevPage === 1 ? basePath : `${basePath}?page=${prevPage}`) : undefined,
    next: nextPage ? toAbsoluteUrl(BASE_URL, `${basePath}?page=${nextPage}`) : undefined,
  };
}
