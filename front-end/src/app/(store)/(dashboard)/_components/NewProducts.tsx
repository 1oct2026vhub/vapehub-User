import React from "react";
import SectionHeading from "@/components/ui/SectionHeading";
// import ViewAllLink from "@/components/ui/ViewAllLink";
import ProductsSlider from "@/components/ProductsSlider";
import { Product, ProductResponseData } from "@/lib/config/product.config";
import ViewAllLink from "@/components/ui/ViewAllLink";
import EmptyPlaceholder from "@/components/ui/EmptyPlaceholder";
import { ServerActionResponse } from "@/lib/config/app.config";
import { REVIEW_ORDER_RESPONSE } from "@/lib/config/order.config";

interface NewProductsProps {
  title?: string;
  viewAllHref?: string;
  products: ProductResponseData;
  reviews: ServerActionResponse<REVIEW_ORDER_RESPONSE>[];
}

const NewProducts: React.FC<NewProductsProps> = ({
  title = "New Products",
  viewAllHref = "/",
  products,
  reviews
}) => {
  const newProducts:Product[] = products?.products?.filter((product: Product) => product.Category !== null) ?? [];
 
  return (
    <section className="space-y-4.5 md:space-y-7.5">
      <div className="flex items-center justify-between">
        <SectionHeading title={title} />
        <ViewAllLink href={viewAllHref} />
      </div>
      <div className="slider-container section-slider products-slider">
        {newProducts.length > 0 ? (
          <ProductsSlider data={products} reviews={reviews} />
        ) : (
          <EmptyPlaceholder title='Uh, oh!' description='No products available' />
        )}
      </div>
    </section>
  );
};

export default NewProducts;
