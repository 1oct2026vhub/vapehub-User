import React from "react";
import CategorySlider from "@/components/CategorySlider";
import SectionHeading from "@/components/ui/SectionHeading";
import ViewAllLink from "@/components/ui/ViewAllLink";

interface ShopByCategoryProps {
  title?: string;
  viewAllHref?: string;
}

const ShopByCategory: React.FC<ShopByCategoryProps> = ({
  title = "Shop By Category",
  viewAllHref = "#",
}) => {
  return (
    <section className="space-y-4.5 md:space-y-7.5">
      <div className="flex items-center justify-between">
        <SectionHeading title={title} />
        <ViewAllLink href={viewAllHref} />
      </div>
      <div className="slider-container section-slider">
        <CategorySlider />
      </div>
    </section>
  );
};

export default ShopByCategory;
