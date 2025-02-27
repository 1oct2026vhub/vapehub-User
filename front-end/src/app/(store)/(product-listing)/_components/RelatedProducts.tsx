import React from "react";
import SectionHeading from "@/components/ui/SectionHeading";
import ViewAllLink from "@/components/ui/ViewAllLink";
import ProductsSlider from "@/components/ProductsSlider";

interface RelatedProductsProps {
  title?: string;
  viewAllHref?: string;
}

const RelatedProducts: React.FC<RelatedProductsProps> = ({
  title = "More Like This",
  viewAllHref = "#",
}) => {
  return (
    <section className="space-y-4.5 md:space-y-7.5">
      <div className="flex items-center justify-between">
        <SectionHeading title={title} />
        <ViewAllLink href={viewAllHref} />
      </div>
      <div className="slider-container section-slider products-slider">
        <ProductsSlider />
      </div>
    </section>
  );
};

export default RelatedProducts;
