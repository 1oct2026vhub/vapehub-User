import ProductList from '@/app/(store)/(product-listing)/_components/ProductList';
import React, { ReactElement } from 'react';
import ProductListingContent from "@/components/ProductListingContent";
import BreadCrumbs from "@/components/BreadCrumbs";
import { ProductResponseData } from '@/lib/config/product.config';
import FAQSection from '@/components/FAQSection';
import { Deal } from '@/lib/config/deal.config';

type DealProps = {
  data: ProductResponseData;
  deal: Deal;
}

const DealProduct: React.FC<DealProps> = ({ data, deal }): ReactElement => {
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
        <ProductListingContent data={productListingData} />
      </section>
      <ProductList data={data} />
      <section className="product-listing-container">
        <FAQSection type="common" id={deal.id} />
      </section>
    </div>
  );
};

export default DealProduct; 