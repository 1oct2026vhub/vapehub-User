import React, { FunctionComponent, ReactElement } from "react";
import CategorySlider from "@/components/CategorySlider";
import SectionHeading from "@/components/ui/SectionHeading";
import ViewAllLink from "@/components/ui/ViewAllLink";
import { Category, CategoryDetails } from "@/lib/config/category.config";
import { getCategoryList } from "@/lib/server.actions";
import { ServerActionStatus } from "@/lib/config/app.config";


const ShopByCategory: FunctionComponent = async ():Promise<ReactElement> => {
   const response = await getCategoryList();
    if(response.status !== ServerActionStatus.SUCCESS) {
      return <div>{response.message}</div>;
    }
    const categories:Category[] = response.data ?? [];
   
  return (
    <section className="space-y-4.5 md:space-y-7.5">
      <div className="flex items-center justify-between">
        <SectionHeading title={CategoryDetails.title} />
        <ViewAllLink href={CategoryDetails.viewAllHref} />
      </div>
      <div className="slider-container section-slider">
        <CategorySlider categories={categories}/>
      </div>
    </section>
  );
};

export default ShopByCategory;
