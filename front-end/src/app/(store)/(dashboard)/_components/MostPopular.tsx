import React from "react";
import SectionHeading from "@/components/ui/SectionHeading";
import ViewAllLink from "@/components/ui/ViewAllLink";
import ProductsSlider from "@/components/ProductsSlider";
import EmptyPlaceholder from "@/components/ui/EmptyPlaceholder";
import { getProductByCategory } from "@/lib/server.actions";
import { ServerActionResponse,ServerActionStatus } from "@/lib/config/app.config";
import { Product, ProductResponseData } from "@/lib/config/product.config";
import { REVIEW_ORDER_RESPONSE } from "@/lib/config/order.config";

interface MostPopularProps {
  title?: string;
  viewAllHref?: string;
  slug: string;
}



export const MostPopularSalts: React.FC<MostPopularProps> = async ({
  title = "Most Popular Nic Salts",
  viewAllHref = "#",
  slug,
}) => {
  const catResponse = await getProductByCategory(slug, { sort_by: "id", order: "DESC", limit: 8, offset: 0, homepage: 1 });
  if (catResponse.status !== ServerActionStatus.SUCCESS) {
    return <EmptyPlaceholder title='Uh, oh!' description='Failed to load products' />;
  }
  const products: ProductResponseData = {
    products: catResponse.data.products,
    pagination: catResponse.data.pagination,
    attributes: catResponse.data.attributes,
    price_ranges: catResponse.data.price_ranges,
    brand: catResponse.data.brand,
    category: catResponse.data.category || []
  };
  const filtered: Product[] = products.products?.filter((p: Product) => p.Category !== null) ?? [];

  // Extract review data from products and format for ProductsSlider
  const reviews: ServerActionResponse<REVIEW_ORDER_RESPONSE>[] = filtered.map((product: Product) => ({
    status: ServerActionStatus.SUCCESS,
    data: {
      reviews: (product.reviews || []).map(review => ({
        ...review,
        product_id: product.id,
        is_visible: true,
        updated_at: review.created_at,
        verified_by: Boolean(review.verified_by),
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
  }));

  return (
    <section className="md:space-y-5 max-sm:mb-5">
      <div className="flex items-center justify-between gap-4">
        <SectionHeading title={title} />
        <ViewAllLink href={viewAllHref} />
      </div>
      <div className="slider-container section-slider products-slider">
        {
          filtered.length > 0 ? <ProductsSlider data={products} reviews={reviews} /> : <EmptyPlaceholder title='Uh, oh!' description='No products available' />
        }
      </div>
    </section>
  );
};


export const MostPopularVapes: React.FC<MostPopularProps> = async ({
  title = "Most Popular Big-Puff Vapes",
  viewAllHref = "#",
  slug,
}) => {
  const catResponse = await getProductByCategory(slug, { sort_by: "id", order: "DESC", limit: 8, offset: 0, homepage: 1 });
  if (catResponse.status !== ServerActionStatus.SUCCESS) {
    return <EmptyPlaceholder title='Uh, oh!' description='Failed to load products' />;
  }
  const products: ProductResponseData = {
    products: catResponse.data.products,
    pagination: catResponse.data.pagination,
    attributes: catResponse.data.attributes,
    price_ranges: catResponse.data.price_ranges,
    brand: catResponse.data.brand,
    category: catResponse.data.category || []
  };
  const filtered: Product[] = products.products?.filter((p: Product) => p.Category !== null) ?? [];

  // Extract review data from products and format for ProductsSlider
  const reviews: ServerActionResponse<REVIEW_ORDER_RESPONSE>[] = filtered.map((product: Product) => ({
    status: ServerActionStatus.SUCCESS,
    data: {
      reviews: (product.reviews || []).map(review => ({
        ...review,
        product_id: product.id,
        is_visible: true,
        updated_at: review.created_at,
        verified_by: Boolean(review.verified_by),
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
  }));

  return (
    <section className="md:space-y-5 max-sm:mb-5">
      <div className="flex items-center justify-between gap-4">
        <SectionHeading title={title} />
        <ViewAllLink href={viewAllHref} />
      </div>
      <div className="slider-container section-slider products-slider">
        {
          filtered.length > 0 ? <ProductsSlider data={products} reviews={reviews} /> : <EmptyPlaceholder title='Uh, oh!' description='No products available' />
        }
      </div>
    </section>
  );
};

interface MostPopularPodsProps {
  title?: string;
  viewAllHref?: string;
  prefilledSlug: string;
  refillableSlug: string;
}

export const MostPopularPods: React.FC<MostPopularPodsProps> = async ({
  title = "Most Popular Pods",
  viewAllHref = "#",
  prefilledSlug,
  refillableSlug,
}) => {
  // Fetch products from both categories
  const [prefilledResponse, refillableResponse] = await Promise.all([
    getProductByCategory(prefilledSlug, { sort_by: "id", order: "DESC", limit: 4, offset: 0, homepage: 1 }),
    getProductByCategory(refillableSlug, { sort_by: "id", order: "DESC", limit: 4, offset: 0, homepage: 1 })
  ]);

  if (prefilledResponse.status !== ServerActionStatus.SUCCESS && refillableResponse.status !== ServerActionStatus.SUCCESS) {
    return <EmptyPlaceholder title='Uh, oh!' description='Failed to load products' />;
  }

  // Combine products from both categories
  const prefilledProducts = prefilledResponse.status === ServerActionStatus.SUCCESS ? prefilledResponse.data.products : [];
  const refillableProducts = refillableResponse.status === ServerActionStatus.SUCCESS ? refillableResponse.data.products : [];
  const combinedProducts = [...prefilledProducts, ...refillableProducts];

  const products: ProductResponseData = {
    products: combinedProducts,
    pagination: {
      current_page: 1,
      limit: 8,
      offset: 0,
      total_count: combinedProducts.length,
      total_pages: 1
    },
    attributes: (prefilledResponse.status === ServerActionStatus.SUCCESS ? prefilledResponse.data?.attributes : undefined) || 
                (refillableResponse.status === ServerActionStatus.SUCCESS ? refillableResponse.data?.attributes : undefined) || [],
    price_ranges: (prefilledResponse.status === ServerActionStatus.SUCCESS ? prefilledResponse.data?.price_ranges : undefined) || 
                  (refillableResponse.status === ServerActionStatus.SUCCESS ? refillableResponse.data?.price_ranges : undefined) || [],
    brand: (prefilledResponse.status === ServerActionStatus.SUCCESS ? prefilledResponse.data?.brand : undefined) || 
           (refillableResponse.status === ServerActionStatus.SUCCESS ? refillableResponse.data?.brand : undefined) || [],
    category: [
      ...((prefilledResponse.status === ServerActionStatus.SUCCESS ? prefilledResponse.data?.category : undefined) || []),
      ...((refillableResponse.status === ServerActionStatus.SUCCESS ? refillableResponse.data?.category : undefined) || [])
    ]
  };

  const filtered: Product[] = products.products?.filter((p: Product) => p.Category !== null) ?? [];

  // Extract review data from products and format for ProductsSlider
  const reviews: ServerActionResponse<REVIEW_ORDER_RESPONSE>[] = filtered.map((product: Product) => ({
    status: ServerActionStatus.SUCCESS,
    data: {
      reviews: (product.reviews || []).map(review => ({
        ...review,
        product_id: product.id,
        is_visible: true,
        updated_at: review.created_at,
        verified_by: Boolean(review.verified_by),
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
  }));

  return (
    <section className="md:space-y-5">
      <div className="flex items-center justify-between gap-4">
        <SectionHeading title={title} />
        <ViewAllLink href={viewAllHref} />
      </div>
      <div className="slider-container section-slider products-slider">
        {
          filtered.length > 0 ? <ProductsSlider data={products} reviews={reviews} /> : <EmptyPlaceholder title='Uh, oh!' description='No products available' />
        }
      </div>
    </section>
  );
};


