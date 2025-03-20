import React from "react";
import SectionHeading from "@/components/ui/SectionHeading";
import ViewAllLink from "@/components/ui/ViewAllLink";
import ProductsSlider from "@/components/ProductsSlider";
import { getProductByCategory } from "@/lib/server.actions";
import { AsyncReactElement, ServerActionStatus } from "@/lib/config/app.config";
import { Product, ProductResponseData } from "@/lib/config/product.config";

interface RelatedProductsProps {
  title?: string;
  viewAllHref?: string; 
  currentProductId: Product["id"];
 }

const RelatedProducts: React.FC<RelatedProductsProps> = async ({
  title = "More Like This",
  viewAllHref = "#", 
  currentProductId
}): AsyncReactElement => {
   const response = await getProductByCategory(viewAllHref, {sort_by: "id", order: "ASC", limit: 10, offset: 0});
    if (response.status === ServerActionStatus.ERROR) {
      return <p>No Product Available</p>
    }
    
    const categoryProduct: ProductResponseData = response.data;
    const relatedProducts = {...categoryProduct, ...{products: categoryProduct.products.filter((x) => currentProductId !== x.id)}};
    
  return (
    <section className="space-y-4.5 md:space-y-7.5">
      <div className="flex items-center justify-between">
        <SectionHeading title={title} />
        <ViewAllLink href={viewAllHref} />
      </div>
      <div className="slider-container section-slider products-slider">
        <ProductsSlider data={relatedProducts}/>
      </div>
    </section>
  );
};

export default RelatedProducts;
