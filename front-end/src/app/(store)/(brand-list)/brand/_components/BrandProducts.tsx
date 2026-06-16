import ProductList from '@/app/(store)/(product-listing)/_components/ProductList';
import BreadCrumbs from '@/components/BreadCrumbs';
import FAQSection from '@/components/FAQSection';
import ProductListingContent from '@/components/ProductListingContent';
import { BrandByProductResponse } from '@/lib/config/product.config';
import { ROUTES } from '@/lib/routes';
import React, { ReactElement } from 'react';
import { ServerActionResponse } from '@/lib/config/app.config';
import { REVIEW_ORDER_RESPONSE } from '@/lib/config/order.config';
import { DynamicPageSlugResponse, FaqResponse } from '@/lib/config/global.config';

type BrandProps = {
    data: BrandByProductResponse;
    reviews: ServerActionResponse<REVIEW_ORDER_RESPONSE>[];
    dynamicPageSlug?: DynamicPageSlugResponse;
    brandFaqs?: FaqResponse[];
}

const BrandProducts: React.FC<BrandProps> = ({ data, reviews, dynamicPageSlug, brandFaqs = [] }): ReactElement => {
    const brandName = data.name || dynamicPageSlug?.name || "";
    const breadcrumbs = [
        { label: "Home", href: "/" },
        { label: "Brands", href: ROUTES.BRANDS },
        { label: brandName, href: `/${data.slug || dynamicPageSlug?.slug || ""}`, isActive: true },
    ];
    return (
        <div>
            <section className="product-listing-container flex-col">
                <BreadCrumbs items={breadcrumbs} />
                <ProductListingContent
                    data={data}
                    dynamicPageSlug={dynamicPageSlug}
                    aboutHeading={`About ${brandName} Vapes`}
                />
            </section>
            <section aria-label={`Shop ${brandName} products`}>
                <h2 className="sr-only">{`Shop ${brandName} Products`}</h2>
                <ProductList data={data} reviews={reviews} />
            </section>
            {brandFaqs.length > 0 && (
                <section className="product-listing-container">
                    <FAQSection type="brand" id={data.id} title="FAQs" initialFaqs={brandFaqs} />
                </section>
            )}
        </div>

    );
};

export default BrandProducts;