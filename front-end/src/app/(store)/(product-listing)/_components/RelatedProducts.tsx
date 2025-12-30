import React from "react";
import SectionHeading from "@/components/ui/SectionHeading";
// import ViewAllLink from "@/components/ui/ViewAllLink";
import ProductsSlider from "@/components/ProductsSlider";
import { getMoreLikeThis } from "@/lib/server.actions";
import { AsyncReactElement, ServerActionStatus } from "@/lib/config/app.config";
import { Product, ProductResponseData, SimilarProduct } from "@/lib/config/product.config";
import EmptyPlaceholder from "@/components/ui/EmptyPlaceholder";

interface RelatedProductsProps {
  title?: string;
  viewAllHref?: string; 
  currentProductId: Product["id"];
}

const RelatedProducts: React.FC<RelatedProductsProps> = async ({
  title = "More Like This",
  // viewAllHref = "#", 
  currentProductId
}): AsyncReactElement => {
  const response = await getMoreLikeThis({product_id: currentProductId, limit: 10, offset: 0});
  console.log("responseRelatedProducts",response);
  if (response.status === ServerActionStatus.ERROR) {
    return <EmptyPlaceholder title='Uh, oh!' description={response.message} />
  }
    
  const productResponse: ProductResponseData = {
    products: response.data.similar_products.map((p: SimilarProduct) => ({
      ...p,
      price: p.price ?? "0.00",
      ProductImages: p.primary_image ? [{
        id: p.primary_image.id,
        image_url: p.primary_image.url,
        alt_text: p.primary_image.alt_text ?? "",
        is_primary: p.primary_image.is_primary,
      }] : [],
    })),
    pagination: response.data.pagination,
    attributes: [],
    price_ranges: [],
    brand: [],
    category: []
  };
  
  return (
    <section className="space-y-4.5 md:space-y-7.5">
      <div className="flex items-center justify-between">
        <SectionHeading title={title} />
        {/* <ViewAllLink href={viewAllHref} /> */}
      </div>
      <div className="slider-container section-slider products-slider">
        <ProductsSlider data={productResponse} isListing={true}/>
      </div>
    </section>
  );
};

export default RelatedProducts;
