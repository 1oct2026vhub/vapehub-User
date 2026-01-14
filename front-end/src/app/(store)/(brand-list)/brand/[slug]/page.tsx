import { AsyncReactElement, RouteParams, ServerActionResponse, ServerActionStatus } from '@/lib/config/app.config';
import { NextPage } from 'next';
import React from 'react';
import BrandProducts from '../_components/BrandProducts';
import { getProductByBrand, getDynamicPageSlug } from '@/lib/server.actions';
import { notFound } from 'next/navigation';
import { PRODUCT_PAYLOAD } from '@/lib/api-routes';
import { REVIEW_ORDER_RESPONSE } from '@/lib/config/order.config';
import { DynamicPageSlugResponse } from '@/lib/config/global.config';
import { Product, ProductReview } from '@/lib/config/product.config';


interface Props {
  params: Promise<RouteParams>; 
  searchParams: Promise<Record<string, string>>
}

const BrandPage: NextPage<Props> = async ({
  params,
  searchParams }): AsyncReactElement => {
  const slug = (await params).slug as string;
  const defaultParams = { sort_by: "id", order: "ASC", limit: 10, offset: 0 } as const;
  const searchParamsData = await searchParams;
  
  // Fetch dynamic page slug data
  const dynamicPageSlug: DynamicPageSlugResponse | null = await fetchDynamicPageSlug(slug);
  if (!dynamicPageSlug) {
    return notFound();
  }
  // Convert search params to variant structure
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


  const brandProduct = await fetchBrandProduct(slug, combinedParams);
  if (brandProduct) {
    // Extract review data from products and format for BrandProducts
    const reviews: ServerActionResponse<REVIEW_ORDER_RESPONSE>[] = brandProduct.products ? brandProduct.products.map((product: Product) => ({
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
      <BrandProducts data={brandProduct} reviews={reviews} dynamicPageSlug={dynamicPageSlug} />
    );
  }
  notFound();

};


export default BrandPage;
 
const fetchDynamicPageSlug = async (slug: string): Promise<DynamicPageSlugResponse | null> => {
  const response = await getDynamicPageSlug(slug);
  if (response.status === ServerActionStatus.ERROR) {
    return null;
  }
  return response.data;
};

const fetchBrandProduct = async (slug: string, params: PRODUCT_PAYLOAD) => {
  const response = await getProductByBrand(slug, params);
  if (response.status === ServerActionStatus.ERROR) {
    return null;
  }
  return response.data;
};



export async function generateMetadata({ params, searchParams }: {
  params: Promise<RouteParams>,
  searchParams: Promise<Record<string, string>>
}) {
  const slug = (await params).slug as string;
  const defaultParams = { sort_by: "id", order: "ASC", limit: 10, offset: 0 } as const;
  const combinedParams = { ...defaultParams, ...await searchParams };
  const dynamicPageSlug: DynamicPageSlugResponse | null = await fetchDynamicPageSlug(slug);
  
  const brandProduct = await fetchBrandProduct(slug, combinedParams);
  if (brandProduct) {
    return {
      title: `${dynamicPageSlug?.seo?.title || brandProduct.name} | VapeHub`,
      description: dynamicPageSlug?.seo?.description || "",
      openGraph: {
        title: `${dynamicPageSlug?.seo?.title || brandProduct.name} | VapeHub`,
        description: dynamicPageSlug?.seo?.description || "",
        images: dynamicPageSlug?.seo?.ogImage ? [{
          url: dynamicPageSlug?.seo?.ogImage,
          width: 1200,
          height: 630
        }] : brandProduct.logo_url ? [{
          url: brandProduct.logo_url,
          width: 1200,
          height: 630
        }] : undefined
      }
    };
  }
}