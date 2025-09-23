import React from "react";
import SectionHeading from "@/components/ui/SectionHeading";
import ViewAllLink from "@/components/ui/ViewAllLink";
import ProductsSlider from "@/components/ProductsSlider";
import EmptyPlaceholder from "@/components/ui/EmptyPlaceholder";
import { getProductByCategory, 
  // getReviewOrderByProductId 
} from "@/lib/server.actions";
import { 
  // ServerActionResponse,
   ServerActionStatus } from "@/lib/config/app.config";
import { Product, ProductResponseData } from "@/lib/config/product.config";
// import { REVIEW_ORDER_RESPONSE } from "@/lib/config/order.config";

interface MostPopularProps {
  title?: string;
  viewAllHref?: string;
  slug: string;
}

export const MostPopularVapes: React.FC<MostPopularProps> = async ({
  title = "Most Popular Disposable Vapes",
  viewAllHref = "#",
  slug,
}) => {
  const catResponse = await getProductByCategory(slug, { sort_by: "id", order: "ASC", limit: 8, offset: 0 });
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
  // let reviews: ServerActionResponse<REVIEW_ORDER_RESPONSE>[] = [];
  // if (filtered.length > 0) {
  //   reviews = await Promise.all(filtered.map(p => getReviewOrderByProductId(p.id, 1, 1)));
  // }

  return (
    <section className="space-y-4.5 md:space-y-7.5 mt-5 lg:mt-10">
      <div className="flex items-center justify-between gap-4">
        <SectionHeading title={title} />
        <ViewAllLink href={viewAllHref} />
      </div>
      <div className="slider-container section-slider products-slider">
        {
          filtered.length > 0 ? <ProductsSlider data={products}  /> : <EmptyPlaceholder title='Uh, oh!' description='No products available' />
        }
      </div>
    </section>
  );
};

export const MostPopularSalts: React.FC<MostPopularProps> = async ({
  title = "Most Popular Nic Salts",
  viewAllHref = "#",
  slug,
}) => {
  const catResponse = await getProductByCategory(slug, { sort_by: "id", order: "ASC", limit: 8, offset: 0 });
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
  // let reviews: ServerActionResponse<REVIEW_ORDER_RESPONSE>[] = [];
  // if (filtered.length > 0) {
  //   reviews = await Promise.all(filtered.map(p => getReviewOrderByProductId(p.id, 1, 1)));
  // }

  return (
    <section className="space-y-4.5 md:space-y-7.5 mt-5 lg:mt-10">
      <div className="flex items-center justify-between gap-4">
        <SectionHeading title={title} />
        <ViewAllLink href={viewAllHref} />
      </div>
      <div className="slider-container section-slider products-slider">
        {
          filtered.length > 0 ? <ProductsSlider data={products}  /> : <EmptyPlaceholder title='Uh, oh!' description='No products available' />
        }
      </div>
    </section>
  );
};


