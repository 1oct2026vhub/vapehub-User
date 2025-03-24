import React, { FunctionComponent, ReactElement } from "react";
import CategorySlider from "@/components/CategorySlider";
import SectionHeading from "@/components/ui/SectionHeading";
// import ViewAllLink from "@/components/ui/ViewAllLink";
import { Category, CategoryDetails } from "@/lib/config/category.config";
import EmptyPlaceholder from "@/components/ui/EmptyPlaceholder";

interface ShopByCategoryProps {
  categories: Category[];
}

const ShopByCategory: FunctionComponent<ShopByCategoryProps> = ({ categories }): ReactElement => {
  if (!categories?.length) {
    return  <EmptyPlaceholder title='Uh, oh!' description='No categories available' />;
  }
   
  return (
    <section className="space-y-4.5 md:space-y-7.5">
      <div className="flex items-center justify-between">
        <SectionHeading title={CategoryDetails.title} />
        {/* <ViewAllLink href={CategoryDetails.viewAllHref} /> */}
      </div>
      <div className="slider-container section-slider">
        <CategorySlider categories={categories.slice(0, 8)}/>
      </div>
    </section>
  );
};

export default ShopByCategory;
