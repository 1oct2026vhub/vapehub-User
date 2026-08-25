import React, { FunctionComponent, ReactElement } from "react";
import SectionHeading from "@/components/ui/SectionHeading";
import ViewAllLink from "@/components/ui/ViewAllLink";
import ProductsSlider from "@/components/ProductsSlider";
import EmptyPlaceholder from "@/components/ui/EmptyPlaceholder";
import { getHomeBlocks } from "@/lib/server.actions";
import { cachedGetCategoryProducts } from "@/lib/cached.server";
import { ServerActionResponse, ServerActionStatus } from "@/lib/config/app.config";
import { Product, ProductResponseData } from "@/lib/config/product.config";
import { REVIEW_ORDER_RESPONSE } from "@/lib/config/order.config";

const PopularCategories: FunctionComponent = async (): Promise<ReactElement> => {
  // Fetch popular categories from home blocks API
  const homeBlocksResponse = await getHomeBlocks();
  
  if (homeBlocksResponse.status !== ServerActionStatus.SUCCESS) {
    return <EmptyPlaceholder title='Uh, oh!' description='Failed to load popular categories' />;
  }

  const popularCategories = homeBlocksResponse.data?.popularCategories || [];
  
  if (!popularCategories.length) {
    return <EmptyPlaceholder title='Uh, oh!' description='No popular categories available' />;
  }

  // Filter active categories and sort by order
  const activeCategories = popularCategories
    .filter(item => item.status && item.category)
    .sort((a, b) => a.order - b.order);

  if (!activeCategories.length) {
    return <EmptyPlaceholder title='Uh, oh!' description='No active popular categories available' />;
  }

  // Fetch products for all categories in parallel
  const categorySections = await Promise.all(
    activeCategories.map(async (popularCategory) => {
      const category = popularCategory.category;
      const slug = category.slug;
      const title = popularCategory.title;
      const description = popularCategory.description;
      const viewAllHref = `/${slug}`;

      // Omit homepage=1 so listing includes variants.regular_price for sale display
      const catResponse = await cachedGetCategoryProducts(slug, { order: "DESC", limit: 10, offset: 0 });
      if (catResponse.status !== ServerActionStatus.SUCCESS) {
        return null;
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

      return {
        id: popularCategory.id,
        title,
        description,
        viewAllHref,
        products,
        reviews,
        filtered
      };
    })
  );

  const validSections = categorySections.filter((section): section is NonNullable<typeof section> => section !== null);

  if (!validSections.length) {
    return <EmptyPlaceholder title='Uh, oh!' description='No products available in popular categories' />;
  }

  return (
    <>
      {validSections.map((section) => (
        <section key={section.id} className="md:space-y-5 max-sm:mb-5">
          <div className="flex items-center justify-between gap-4">
            <div className="flex-1 min-w-0">
              <SectionHeading title={section.title} />
              {section.description && (
                <p className="text-title-2 text-skin-neutral-300 font-semibold mt-2 truncate">
                  {section.description}
                </p>
              )}
            </div>
            <ViewAllLink href={section.viewAllHref} />
          </div>
          <div className="slider-container section-slider products-slider">
            {
              section.filtered.length > 0 ? (
                <ProductsSlider data={section.products} reviews={section.reviews} maxNoJsProducts={5} />
              ) : (
                <EmptyPlaceholder title='Uh, oh!' description='No products available' />
              )
            }
          </div>
        </section>
      ))}
    </>
  );
};

export default PopularCategories;

