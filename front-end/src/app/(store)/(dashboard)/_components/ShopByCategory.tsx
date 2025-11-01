import React, { FunctionComponent, ReactElement } from "react";
import CategorySlider from "@/components/CategorySlider";
import { CategoryDetails } from "@/lib/config/category.config";
import EmptyPlaceholder from "@/components/ui/EmptyPlaceholder";
import { getCategoryList } from "@/lib/server.actions";
import { ServerActionStatus } from "@/lib/config/app.config";

const ShopByCategory: FunctionComponent = async (): Promise<ReactElement> => {
  const categoriesResponse = await getCategoryList();
  if (categoriesResponse.status !== ServerActionStatus.SUCCESS) {
    return <EmptyPlaceholder title='Uh, oh!' description='Failed to load categories' />;
  }
  const categories = categoriesResponse.data;
  if (!categories?.length) {
    return <EmptyPlaceholder title='Uh, oh!' description='No categories available' />;
  }
   
  return (
    <section className="space-y-4.5 md:space-y-7.5">
      <div className="flex items-center justify-between">
        <h1 className="text-h5 md:text-h3 w-fit font-semibold primary-gradient-100">{CategoryDetails.title}</h1>
        {/* <ViewAllLink href={CategoryDetails.viewAllHref} /> */}
      </div>
      <div className="slider-container section-slider">
        <CategorySlider categories={categories.slice(0, 8)}/>
      </div>
    </section>
  );
};

export default ShopByCategory;
