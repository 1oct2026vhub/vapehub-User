import ProductList from '@/app/(store)/(product-listing)/_components/ProductList';
import BreadCrumbs from '@/components/BreadCrumbs';
import FAQSection from '@/components/FAQSection';
import ProductListingContent from '@/components/ProductListingContent';
import { BrandByProductResponse } from '@/lib/config/product.config';
import { ROUTES } from '@/lib/routes';
import React from 'react';
import { AsyncReactElement, ServerActionResponse } from '@/lib/config/app.config';
import { REVIEW_ORDER_RESPONSE } from '@/lib/config/order.config';
import { DynamicPageSlugResponse, FaqResponse } from '@/lib/config/global.config';
import CategoryBuyingGuide from '@/app/(store)/(product-listing)/_components/CategoryBuyingGuide';
import CategoryBuyingGuideAccordion from '@/app/(store)/(product-listing)/_components/CategoryBuyingGuideAccordion';
import RelatedGuides from '@/app/(store)/(product-listing)/_components/RelatedGuides';
import { fetchBrandBuyingGuideSection } from '@/app/(store)/(product-listing)/_components/buying-guide.utils';

type BrandProps = {
    data: BrandByProductResponse;
    reviews: ServerActionResponse<REVIEW_ORDER_RESPONSE>[];
    dynamicPageSlug?: DynamicPageSlugResponse;
    brandFaqs?: FaqResponse[];
}

const BrandProducts = async ({
    data,
    reviews,
    dynamicPageSlug,
    brandFaqs = [],
}: BrandProps): AsyncReactElement => {
    const brandName = data.name || dynamicPageSlug?.name || "";
    const brandSlug =
        data.slug?.split("/").filter(Boolean).pop() ||
        dynamicPageSlug?.slug?.split("/").filter(Boolean).pop() ||
        "";

    const { guide: buyingGuide, relatedGuides } = await fetchBrandBuyingGuideSection(
        brandSlug,
        brandName,
    );
    const showBuyingGuideSection = Boolean(buyingGuide);

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
                    showBuyingGuideFaqsLink={showBuyingGuideSection}
                />
            </section>
            <section aria-label={`Shop ${brandName} products`}>
                <h2 className="sr-only">{`Shop ${brandName} Products`}</h2>
                <ProductList data={data} reviews={reviews}>
                    {showBuyingGuideSection && buyingGuide ? (
                        <div className="w-full pt-7.5 md:pt-9">
                            <CategoryBuyingGuideAccordion
                                title={buyingGuide.title ?? brandName}
                                imageUrl={buyingGuide.imageUrl ?? data.logo_url}
                                imageAlt={buyingGuide.imageAlt ?? brandName}
                            >
                                <CategoryBuyingGuide
                                    key={`buying-guide-brand-${brandSlug || data.id}`}
                                    embedded
                                    hideHeader
                                    {...buyingGuide}
                                />
                                {relatedGuides.length > 0 ? (
                                    <RelatedGuides
                                        key={`related-guides-brand-${brandSlug || data.id}`}
                                        title="Related Blogs"
                                        embedded
                                        guides={relatedGuides}
                                    />
                                ) : null}
                            </CategoryBuyingGuideAccordion>
                        </div>
                    ) : null}
                </ProductList>
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
