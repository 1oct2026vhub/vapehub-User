import React from "react";
import SectionHeading from "@/components/ui/SectionHeading";
import ViewAllLink from "@/components/ui/ViewAllLink";
import ProductsSlider from "@/components/ProductsSlider";

interface MostPopularProps {
  title?: string;
  viewAllHref?: string;
}

export const MostPopularVapes: React.FC<MostPopularProps> = ({
  title = "Most Popular Disposable Vapes",
  viewAllHref = "#",
}) => {
  return (
    <section className="space-y-4.5 md:space-y-7.5 mt-5 lg:mt-10">
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

export const MostPopularSalts: React.FC<MostPopularProps> = ({
    title = "Most Popular Nic Salts",
    viewAllHref = "#",
  }) => {
    return (
      <section className="space-y-4.5 md:space-y-7.5 mt-5 lg:mt-10">
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


