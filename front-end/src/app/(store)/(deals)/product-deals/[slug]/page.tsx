import { getAllDeals, getProductsByDealSlug, getReviewOrderByProductId, getDynamicPageSlug } from "@/lib/server.actions";
import { ServerActionResponse, ServerActionStatus } from "@/lib/config/app.config";
import { redirect } from 'next/navigation';
import PageNotFound from '@/app/(store)/page-not-found/page';
import { Deal } from "@/lib/config/deal.config";
import DealProduct from "../_components/DealProduct";
import { Metadata } from "next";
import { REVIEW_ORDER_RESPONSE } from "@/lib/config/order.config";
import { DynamicPageSlugResponse } from "@/lib/config/global.config";

type PageProps = {
  slug: string;
};

const Page = async ({ params, searchParams }: {
  params: Promise<PageProps>,
  searchParams: Promise<Record<string, string>>
}) => {
  const { slug } = await params;
  const searchParamsData = await searchParams;

  // Fetch dynamic page slug data
  const dynamicPageSlug: DynamicPageSlugResponse | null = await fetchDynamicPageSlug(slug);
  if (!dynamicPageSlug) {
    return <PageNotFound />;
  }

  // SEO redirect for deleted/unpublished deal slugs (middleware emits 301; this is a safe fallback).
  if ((dynamicPageSlug as unknown as { redirect?: boolean; redirect_url?: string })?.redirect) {
    const dest = normalizeRedirectUrl((dynamicPageSlug as unknown as { redirect_url?: string })?.redirect_url);
    if (dest) {
      redirect(dest);
    }
  }

  // Try to fetch deals with a reasonable limit (API has validation limits, max seems to be around 100-200)
  // We'll fetch in batches if needed
  let deal: Deal | null = null;
  const limit = 100; // Use a reasonable limit that the API accepts
  let offset = 0;
  let hasMore = true;
  let allDeals: Deal[] = [];
  
  // Fetch deals in batches until we find the deal or exhaust all pages
  while (hasMore && !deal) {
    const dealResponse = await getAllDeals({ limit, offset, deal_type: 'BUY_N_FOR_FIXED' }, false);    
    if (dealResponse.status === ServerActionStatus.SUCCESS && dealResponse.data) {
      const batchDeals = dealResponse.data.deals || [];
      allDeals = [...allDeals, ...batchDeals];      
      // Check if we found the deal in this batch
      deal = batchDeals.find((d: Deal) => d.slug.replace(/ /g, '-') === slug) || null;
      
      if (deal) {
        break;
      }
      
      // Check if there are more pages
      const pagination = dealResponse.data.pagination;
      hasMore = pagination?.has_next || false;
      offset += limit;
      
      // Safety check: don't loop forever
      if (offset > 1000) {
        hasMore = false;
      }
    } else {
      hasMore = false;
    }
  }
  

  // Default to popularity sorting when no sort params are provided (same as brand/category pages)
  const defaultParams = { sort_by: 'popularity', limit: 12, offset: 0 } as const;

  // Process search parameters with proper attribute filter handling
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
    
  const combinedParams = { ...defaultParams, ...variantParams };
  const productsResponse = await getProductsByDealSlug(slug, combinedParams);
  if (productsResponse.status === ServerActionStatus.ERROR) {
    return <PageNotFound />;
  }

  const products = productsResponse.data?.products || [];
  // if (products.length === 0) {
  //   return notFound();
  // }

  // If we don't have the deal object from getAllDeals, try to get it from dynamicPageSlug
  // The dynamicPageSlug response might contain deal information
  if (!deal && dynamicPageSlug?.deals && dynamicPageSlug.deals.length > 0) {
    const dealFromSlug = dynamicPageSlug.deals.find((d) => d.slug.replace(/ /g, '-') === slug);
    if (dealFromSlug) {
      // Convert the deal from dynamicPageSlug to the Deal type
      deal = {
        id: dealFromSlug.id,
        name: dealFromSlug.name,
        slug: dealFromSlug.slug,
        deal_type: dealFromSlug.deal_type,
        required_qty: dealFromSlug.required_qty,
        get_qty: dealFromSlug.get_qty || null,
        fixed_price: dealFromSlug.fixed_price,
        discount_percent: dealFromSlug.discount_percent || null,
        tiered_qty_json: dealFromSlug.tiered_qty_json || null,
        valid_from: dealFromSlug.valid_from,
        valid_to: dealFromSlug.valid_to,
        createdAt: dealFromSlug.createdAt,
        bundle_product_ids_json: dealFromSlug.bundle_product_ids_json 
          ? (() => {
              try {
                return typeof dealFromSlug.bundle_product_ids_json === 'string' 
                  ? JSON.parse(dealFromSlug.bundle_product_ids_json) 
                  : dealFromSlug.bundle_product_ids_json;
              } catch {
                return null;
              }
            })()
          : null,
        image_url: dealFromSlug.image_url || undefined,
      };
    }
  }
  
  // If still not found, try fetching without deal_type filter
  // The deal might be a different type than BUY_N_FOR_FIXED
  if (!deal) {    
    // Try fetching without deal_type filter
    const dealResponseWithoutType = await getAllDeals({ limit: 100, offset: 0 }, false);
    if (dealResponseWithoutType.status === ServerActionStatus.SUCCESS && dealResponseWithoutType.data) {
      const dealsWithoutType = dealResponseWithoutType.data.deals || [];
      deal = dealsWithoutType.find((d: Deal) => d.slug.replace(/ /g, '-') === slug) || null;
      
      if (deal) {
      }
    }
  }
  
  // Final check: if we still don't have a deal, return notFound
  // We need the deal object for the component to work properly
  if (!deal) {
    return <PageNotFound />;
  }

  const reviews: ServerActionResponse<REVIEW_ORDER_RESPONSE>[] = products.length > 0 ? await Promise.all(
    products.map(p => getReviewOrderByProductId(p.id, 1, 1))
  ) : [];
  
  const responseData = productsResponse.data;
  if (!responseData) {
    return <PageNotFound />;
  }
  
  return <DealProduct 
    deal={deal} 
    data={{
      products: products,
      category: responseData.category_items,
      brand: responseData.brand_items,
      attributes: responseData.attributes,
      price_ranges: responseData.price_ranges,
      pagination: responseData.pagination
    }} 
    reviews={reviews} 
    dynamicPageSlug={dynamicPageSlug}
  />;
};

export default Page;

const fetchDynamicPageSlug = async (slug: string): Promise<DynamicPageSlugResponse | null> => {
  const response = await getDynamicPageSlug(slug);
  if (response.status === ServerActionStatus.ERROR) {
    return null;
  }
  
  const data = response.data;
  return data || null;
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
}): Promise<Metadata> {
  const { slug } = await params;
  const searchParamsData = await searchParams;

  // Fetch dynamic page slug data for metadata
  const dynamicPageSlug: DynamicPageSlugResponse | null = await fetchDynamicPageSlug(slug);
  if (!dynamicPageSlug) {
    return {};
  }
  // If this slug is configured to redirect, avoid generating metadata for the old URL.
  if ((dynamicPageSlug as unknown as { redirect?: boolean })?.redirect) {
    return {};
  }

  const dealResponse = await getAllDeals();
  
  if (dealResponse.status === ServerActionStatus.SUCCESS) {
    const deal = dealResponse.data.deals.find((d: Deal) => d.slug.replace(/ /g, '-') === slug);

    if (deal) {
      const defaultParams = { sort_by: 'id', order: 'ASC', limit: 12, offset: 0 } as const;
      
      // Process search parameters with proper attribute filter handling for metadata
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
        
      const combinedParams = { ...defaultParams, ...variantParams };
      const productsResponse = await getProductsByDealSlug(slug, combinedParams);
      
      if (productsResponse.status === ServerActionStatus.SUCCESS) {
        // Use dynamic page slug SEO data if available, otherwise fall back to deal data
        const seoTitle = dynamicPageSlug.seo?.title || deal.name;
        const seoDescription = dynamicPageSlug.seo?.description || deal.name;
        const seoImage = dynamicPageSlug.seo?.ogImage || productsResponse.data.products[0]?.primary_image?.url;
        
        return {
          title: seoTitle,
          description: seoDescription,
          openGraph: {
            title: seoTitle,
            description: seoDescription,
            images: seoImage ? [{
              url: seoImage,
              width: 1200,
              height: 630
            }] : undefined
          }
        };
      }
    }
  }
  return {};
}