import React from "react";
import SectionHeading from "@/components/ui/SectionHeading";
import ViewAllLink from "@/components/ui/ViewAllLink";
import ProductsSlider from "@/components/ProductsSlider";
import { ProductResponseData } from "@/lib/config/product.config";
import EmptyPlaceholder from "@/components/ui/EmptyPlaceholder";
import { ServerActionResponse } from "@/lib/config/app.config";
import { REVIEW_ORDER_RESPONSE } from "@/lib/config/order.config";

interface MostPopularProps {
  title?: string;
  viewAllHref?: string;
  products: ProductResponseData;
  reviews: ServerActionResponse<REVIEW_ORDER_RESPONSE>[];
}

export const MostPopularVapes: React.FC<MostPopularProps> = ({
  title = "Most Popular Big-Puff Vapes",
  viewAllHref = "#",
  products,
  reviews
}) => {
       
  return (
    <section className="space-y-4.5 md:space-y-7.5 mt-5 lg:mt-10">
      <div className="flex items-center justify-between gap-4">
        <SectionHeading title={title} />
        <ViewAllLink href={viewAllHref} />
      </div>
      <div className="slider-container section-slider products-slider">
        {
          products.products.length > 0 ? <ProductsSlider data={products} reviews={reviews} /> : <EmptyPlaceholder title='Uh, oh!' description='No products available' />
        }
      </div>
    </section>
  );
};

export const MostPopularSalts: React.FC<MostPopularProps> = ({
  title = "Most Popular Nic Salts",
  viewAllHref = "#",
  products,
  reviews
}) => {

        console.log("Nicsalt products", products);

  return (
    <section className="space-y-4.5 md:space-y-7.5 mt-5 lg:mt-10">
      <div className="flex items-center justify-between gap-4">
        <SectionHeading title={title} />
        <ViewAllLink href={viewAllHref} />
      </div>
      <div className="slider-container section-slider products-slider">
        {
          products.products.length > 0 ? <ProductsSlider data={products} reviews={reviews} /> : <EmptyPlaceholder title='Uh, oh!' description='No products available' />
        }
      </div>
    </section>
  );
};


