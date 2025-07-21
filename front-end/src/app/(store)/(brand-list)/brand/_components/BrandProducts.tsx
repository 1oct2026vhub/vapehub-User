import ProductList from '@/app/(store)/(product-listing)/_components/ProductList';
import BreadCrumbs from '@/components/BreadCrumbs';
import FAQSection from '@/components/FAQSection';
import ProductListingContent from '@/components/ProductListingContent';
import { BrandByProductResponse } from '@/lib/config/product.config';
import { ROUTES } from '@/lib/routes';
import React, { ReactElement } from 'react';
import { ServerActionResponse } from '@/lib/config/app.config';
import { REVIEW_ORDER_RESPONSE } from '@/lib/config/order.config';

type BrandProps = {
    data: BrandByProductResponse;
    reviews: ServerActionResponse<REVIEW_ORDER_RESPONSE>[];
}

const BrandProducts: React.FC<BrandProps> = ({ data, reviews }): ReactElement => {
    const breadcrumbs = [
        { label: "Home", href: "/" },
        { label: "Brands", href: ROUTES.BRANDS },
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
                <FAQSection type="brand" id={data.id} />
            </section>
        </div>

    );
};

export default BrandProducts;