import React from "react";
import SectionHeading from "@/components/ui/SectionHeading";
import ViewAllLink from "@/components/ui/ViewAllLink";
import ProductsSlider from "@/components/ProductsSlider";
import { AsyncReactElement, ServerActionStatus } from "@/lib/config/app.config";
import { getProductList } from "@/lib/server.actions"; 

interface NewProductsProps {
  title?: string;
  viewAllHref?: string;
}

const NewProducts: React.FC<NewProductsProps> = async ({
  title = "New Products",
  viewAllHref = "#",
}): AsyncReactElement => {
  const response = await getProductList({sort_by:"id",order:"DESC",limit:20,offset:0});
  if(response.status == ServerActionStatus.ERROR) {
    return (<p> No Products Available</p>);
  }
 
  return (
    <section className="space-y-4.5 md:space-y-7.5">
      <div className="flex items-center justify-between">
        <SectionHeading title={title} />
        <ViewAllLink href={viewAllHref} />
      </div>
      <div className="slider-container section-slider products-slider">
        <ProductsSlider data={response.data}/>
      </div>
    </section>
  );
};

export default NewProducts;
