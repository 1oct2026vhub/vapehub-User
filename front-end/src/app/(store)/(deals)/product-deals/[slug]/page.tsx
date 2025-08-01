import { getAllDeals, getProductsByDealSlug, getReviewOrderByProductId, getDynamicPageSlug } from "@/lib/server.actions";
import { ServerActionResponse, ServerActionStatus } from "@/lib/config/app.config";
import { notFound } from 'next/navigation';
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
  console.log('📋 Product Deals Page - Dynamic Page Slug Response:', {
    slug: slug,
    dynamicPageSlug: dynamicPageSlug,
    dealsText: dynamicPageSlug?.deals_text,
    deals: dynamicPageSlug?.deals,
    seo: dynamicPageSlug?.seo
  });
  if (!dynamicPageSlug) {
    return notFound();
  }

  const dealResponse = await getAllDeals();
  
  if (dealResponse.status === ServerActionStatus.ERROR) {
    return notFound();
  }

  const deal = dealResponse.data.deals.find((d: Deal) => d.slug.replace(/ /g, '-') === slug);
  
  if (!deal) {
    return notFound();
  }

  const defaultParams = { sort_by: 'id', order: 'ASC', limit: 12, offset: 0 } as const;
  
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

  // Log the parameters being passed to the API
  console.log('📋 Product Deals Page - API Parameters:', {
    slug: slug,
    searchParamsData: searchParamsData,
    defaultParams: defaultParams,
    variantParams: variantParams,
    combinedParams: combinedParams,
    fullUrl: `${process.env.NEXT_PUBLIC_VAPE_HUB_API_BASE_URL}/api/deals/slug/${slug}?${new URLSearchParams(Object.fromEntries(Object.entries(combinedParams).map(([key, value]) => [key, String(value)]))).toString()}`
  });

  const productsResponse = await getProductsByDealSlug(slug, combinedParams);
  console.log("Products response deals", productsResponse);
  if (productsResponse.status === ServerActionStatus.ERROR || !productsResponse.data?.products) {
    return notFound();
  }

  const reviews: ServerActionResponse<REVIEW_ORDER_RESPONSE>[] = productsResponse.status === ServerActionStatus.SUCCESS && productsResponse.data.products ? await Promise.all(
    productsResponse.data.products.map(p => getReviewOrderByProductId(p.id, 1, 1))
  ) : [];
  
  return <DealProduct 
    deal={deal} 
    data={{
      products: productsResponse.data.products,
      category: productsResponse.data.category_items,
      brand: productsResponse.data.brand_items,
      attributes: productsResponse.data.attributes,
      price_ranges: productsResponse.data.price_ranges,
      pagination: productsResponse.data.pagination
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
  return response.data;
};

export async function generateMetadata({ params, searchParams }: {
  params: Promise<PageProps>,
  searchParams: Promise<Record<string, string>>
}): Promise<Metadata> {
  const { slug } = await params;
  const searchParamsData = await searchParams;

  // Fetch dynamic page slug data for metadata
  const dynamicPageSlug: DynamicPageSlugResponse | null = await fetchDynamicPageSlug(slug);
  if (!dynamicPageSlug) {
    return {
      title: 'Deal not found',
    };
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
  return {
    title: 'Deal not found',
  };
} 