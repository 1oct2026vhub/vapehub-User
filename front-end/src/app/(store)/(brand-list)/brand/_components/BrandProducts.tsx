import ProductList from '@/app/(store)/(product-listing)/_components/ProductList';
import BreadCrumbs from '@/components/BreadCrumbs';
import ProductListingContent from '@/components/ProductListingContent';
import { BrandByProductResponse } from '@/lib/config/product.config';
import React, { ReactElement } from 'react';

type BrandProps = {
    data: BrandByProductResponse;
}

const BrandProducts: React.FC<BrandProps> = ({ data }): ReactElement => {
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
            <ProductList data={data} />
        </div>

    );
};

export default BrandProducts;