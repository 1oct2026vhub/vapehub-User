import ProductList from '@/app/(store)/(product-listing)/_components/ProductList';
import React, { ReactElement } from 'react';
import ProductListingContent from "@/components/ProductListingContent";
import BreadCrumbs from "@/components/BreadCrumbs";
import { CategoryResponseData } from '@/lib/config/product.config';
import FAQSection from '@/components/FAQSection';
import { ServerActionResponse } from '@/lib/config/app.config';
import { REVIEW_ORDER_RESPONSE } from '@/lib/config/order.config';

type CategoryProps = {
  data: CategoryResponseData;
  reviews: ServerActionResponse<REVIEW_ORDER_RESPONSE>[];
}


const CategoryProducts: React.FC<CategoryProps> = ({ data, reviews }): ReactElement => {
  
  const breadcrumbs = [
    { label: "Home", href: "/" },
    { label: data.name, href: `/${data.slug}`, isActive: true },
  ];
  return (
    <div>
      <section className="product-listing-container flex-col">
        <BreadCrumbs items={breadcrumbs} />
        <ProductListingContent data={data} />
      </section>
      <ProductList data={data} reviews={reviews} />
      <section className="product-listing-container">
        <FAQSection type="category" id={data.id} />
      </section>
    </div>

  );
};

export default CategoryProducts;