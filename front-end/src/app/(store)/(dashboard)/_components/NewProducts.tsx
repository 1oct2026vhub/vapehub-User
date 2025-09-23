import React from "react";
import SectionHeading from "@/components/ui/SectionHeading";
import ProductsSlider from "@/components/ProductsSlider";
import ViewAllLink from "@/components/ui/ViewAllLink";
import EmptyPlaceholder from "@/components/ui/EmptyPlaceholder";
import { getHomeProductList } from "@/lib/server.actions";
import { ServerActionStatus } from "@/lib/config/app.config";
import { Product, ProductResponseData } from "@/lib/config/product.config";

interface NewProductsProps {
  title?: string;
  viewAllHref?: string;
}

const NewProducts: React.FC<NewProductsProps> = async ({
  title = "New Products",
  viewAllHref = "/",
}) => {
  const productsResponse = await getHomeProductList({ sort_by: "id", order: "DESC", limit: 8, offset: 0 });
  if (productsResponse.status !== ServerActionStatus.SUCCESS) {
    return <EmptyPlaceholder title='Uh, oh!' description='Failed to load products' />;
  }

  const products: ProductResponseData = productsResponse.data;
  const newProducts: Product[] = products?.products?.filter((product: Product) => product.Category !== null) ?? [];
 
  return (
    <section className="space-y-4.5 md:space-y-7.5">
      <div className="flex items-center justify-between">
        <SectionHeading title={title} />
        <ViewAllLink href={viewAllHref} />
      </div>
      <div className="slider-container section-slider products-slider">
        {newProducts.length > 0 ? (
          <ProductsSlider data={products}  />
        ) : (
          <EmptyPlaceholder title='Uh, oh!' description='No products available' />
        )}
      </div>
    </section>
  );
};

export default NewProducts;
