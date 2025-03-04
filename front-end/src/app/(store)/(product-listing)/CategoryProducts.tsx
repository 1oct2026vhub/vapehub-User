import ProductList from '@/app/(store)/(product-listing)/_components/ProductList';
import React, { ReactElement } from 'react';
import ProductListingContent from "@/components/ProductListingContent";
import BreadCrumbs from "@/components/BreadCrumbs";
import { CategoryResponseData } from '@/lib/config/product.config';

type CategoryProps = {
    data: CategoryResponseData;
}
 

const CategoryProducts: React.FC<CategoryProps> = ({data}):ReactElement => {
    const breadcrumbs = [
        { label: "Home", href: "/" },
        { label: data.name, href: `/${data.slug}`, isActive: true },
      ];
    return (
        <div>
        <section className="product-listing-container flex-col">
          <BreadCrumbs items={breadcrumbs} />
          <ProductListingContent data={data}/>
        </section>
        <ProductList data={data}/>
        </div>

    );
};

export default CategoryProducts;