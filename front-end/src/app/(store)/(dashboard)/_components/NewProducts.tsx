import React from "react";
import SectionHeading from "@/components/ui/SectionHeading";
// import ViewAllLink from "@/components/ui/ViewAllLink";
import ProductsSlider from "@/components/ProductsSlider";
import { ProductResponseData } from "@/lib/config/product.config";
import ViewAllLink from "@/components/ui/ViewAllLink";

interface NewProductsProps {
  title?: string;
  viewAllHref?: string;
  products: ProductResponseData;
}

const NewProducts: React.FC<NewProductsProps> = ({
  title = "New Products",
  viewAllHref = "/",
  products
}) => {
  if (!products?.products?.length) {
    return <p>No products available</p>;
  }
 
  return (
    <section className="space-y-4.5 md:space-y-7.5">
      <div className="flex items-center justify-between">
        <SectionHeading title={title} />
        <ViewAllLink href={viewAllHref} />
      </div>
      <div className="slider-container section-slider products-slider">
        <ProductsSlider data={products}/>
      </div>
    </section>
  );
};

export default NewProducts;
