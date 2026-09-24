import React from "react";
import SectionHeading from "@/components/ui/SectionHeading";
import ProductsSlider from "@/components/ProductsSlider";
import ViewAllLink from "@/components/ui/ViewAllLink";
import { getProductList } from "@/lib/server.actions";
import { ServerActionStatus, ServerActionResponse } from "@/lib/config/app.config";
import { Product, ProductResponseData } from "@/lib/config/product.config";
import { REVIEW_ORDER_RESPONSE } from "@/lib/config/order.config";
import { ROUTES } from "@/lib/routes";

interface ComingSoonProductsProps {
  title?: string;
  viewAllHref?: string;
}

const ComingSoonProducts: React.FC<ComingSoonProductsProps> = async ({
  title = "Coming Soon",
  viewAllHref = ROUTES.COMING_SOON,
}) => {
  const productsResponse = await getProductList({
    sort_by: "id",
    order: "DESC",
    limit: 10,
    offset: 0,
    is_coming_soon: true,
  });
  if (productsResponse.status !== ServerActionStatus.SUCCESS) {
    return null;
  }

  const products: ProductResponseData = productsResponse.data;
  const comingSoonProducts: Product[] =
    products?.products?.filter((product: Product) => product.Category !== null) ?? [];

  if (comingSoonProducts.length === 0) {
    return null;
  }

  const reviews: ServerActionResponse<REVIEW_ORDER_RESPONSE>[] = comingSoonProducts.map(
    (product: Product) => ({
      status: ServerActionStatus.SUCCESS,
      data: {
        reviews: (product.reviews || []).map((review) => ({
          ...review,
          product_id: product.id,
          is_visible: true,
          updated_at: review.created_at,
          verified_by: Boolean(review.verified_by),
          product: {
            id: product.id,
            name: product.name,
            slug: product.slug,
          },
          media: [],
        })),
        pagination: {
          total: product.review_stats?.total_reviews || 0,
          page: 1,
          limit: 1,
          totalPages: 1,
        },
        average_rating: String(product.review_stats?.average_rating || 0),
        total_reviews: product.review_stats?.total_reviews || 0,
      },
    })
  );

  return (
    <section className="md:space-y-5 max-sm:mb-5">
      <div className="flex items-center justify-between">
        <SectionHeading title={title} />
        <ViewAllLink href={viewAllHref} />
      </div>
      <div className="slider-container section-slider products-slider">
        <ProductsSlider data={products} reviews={reviews} maxNoJsProducts={5} />
      </div>
    </section>
  );
};

export default ComingSoonProducts;
