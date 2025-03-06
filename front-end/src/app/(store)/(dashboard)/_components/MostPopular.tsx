import React from "react";
import SectionHeading from "@/components/ui/SectionHeading";
import ViewAllLink from "@/components/ui/ViewAllLink";
import ProductsSlider from "@/components/ProductsSlider";
import { AsyncReactElement, ServerActionStatus } from "@/lib/config/app.config";
import { getProductByCategory } from "@/lib/server.actions";

interface MostPopularProps {
  title?: string;
  viewAllHref?: string;
}

export const MostPopularVapes: React.FC<MostPopularProps> = async ({
  title = "Most Popular Disposable Vapes",
  viewAllHref = "#",
}):AsyncReactElement => {
  const response = await getProductByCategory(viewAllHref, {sort_by:"id",order:"ASC",limit:10,offset:0});
  
    if(response.status == ServerActionStatus.ERROR) {
      return (<p>{response.message}</p>);
    }
    
  return (
    <section className="space-y-4.5 md:space-y-7.5 mt-5 lg:mt-10">
      <div className="flex items-center justify-between gap-4">
        <SectionHeading title={title} />
        <ViewAllLink href={viewAllHref} />
      </div>
      <div className="slider-container section-slider products-slider">
        <ProductsSlider data={response.data}/>
      </div>
    </section>
  );
};

export const MostPopularSalts: React.FC<MostPopularProps> = async ({
    title = "Most Popular Nic Salts",
    viewAllHref = "#",
  }): AsyncReactElement => {
    const response = await getProductByCategory(viewAllHref, {sort_by:"id",order:"ASC",limit:10,offset:0});
    if(response.status == ServerActionStatus.ERROR) {
      return (<p>{response.message}</p>);
    }
    
    return (
      <section className="space-y-4.5 md:space-y-7.5 mt-5 lg:mt-10">
        <div className="flex items-center justify-between gap-4">
          <SectionHeading title={title} />
          <ViewAllLink href={viewAllHref} />
        </div>
        <div className="slider-container section-slider products-slider">
          <ProductsSlider data={response.data}/>
        </div>
      </section>
    );
  };


