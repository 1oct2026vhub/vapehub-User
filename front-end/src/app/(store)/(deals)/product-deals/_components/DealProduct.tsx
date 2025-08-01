import ProductList from '@/app/(store)/(product-listing)/_components/ProductList';
import React, { ReactElement } from 'react';
import ProductListingContent from "@/components/ProductListingContent";
import BreadCrumbs from "@/components/BreadCrumbs";
import { ProductResponseData } from '@/lib/config/product.config';
// import FAQSection from '@/components/FAQSection';
import { Deal } from '@/lib/config/deal.config';
import { ServerActionResponse } from '@/lib/config/app.config';
import { REVIEW_ORDER_RESPONSE } from '@/lib/config/order.config';
import { DynamicPageSlugResponse } from '@/lib/config/global.config';

type DealProps = {
  data: {
    products: ProductResponseData['products'];
    category: ProductResponseData['category'];
    brand: ProductResponseData['brand'];
    attributes: ProductResponseData['attributes'];
    price_ranges: ProductResponseData['price_ranges'];
    pagination?: ProductResponseData['pagination'];
  };
  deal: Deal;
  reviews: ServerActionResponse<REVIEW_ORDER_RESPONSE>[];
  dynamicPageSlug?: DynamicPageSlugResponse;
}

const DealProduct: React.FC<DealProps> = ({ data, deal, reviews, dynamicPageSlug }): ReactElement => {
  const breadcrumbs = [
    { label: "Home", href: "/" },
    { label: "Deals", href: "/vapehub-deals" },
    { label: deal.name, href: `/${deal.slug}`, isActive: true },
  ];

  const productListingData = {
    name: deal.name,
    description: deal.name,
    id: deal.id,
    slug: deal.slug,
    logo_url: '',
    is_active: true,
    updated_by: null,
    parent_id: null,
    createdAt: '',
    updatedAt: '',
    deletedAt: null,
    children: [],
    subCategories: [],
  };

  return (
    <div>
      <section className="product-listing-container flex-col">
        <BreadCrumbs items={breadcrumbs} />
        <ProductListingContent data={productListingData} dynamicPageSlug={dynamicPageSlug} />
      </section>
      <ProductList data={{
        ...data,
        category: data.category || [],
        brand: data.brand || [],
      }} reviews={reviews} />
      {/* <section className="product-listing-container">
        <FAQSection type="common" id={deal.id} />
      </section> */}
    </div>
  );
};

export default DealProduct; 