import ProductList from '@/app/(store)/(product-listing)/_components/ProductList';
import BreadCrumbs from '@/components/BreadCrumbs';
import FAQSection from '@/components/FAQSection';
import ProductListingContent from '@/components/ProductListingContent';
import { BrandByProductResponse } from '@/lib/config/product.config';
import { ROUTES } from '@/lib/routes';
import React from 'react';
import { unstable_noStore as noStore } from 'next/cache';
import { AsyncReactElement, ServerActionResponse } from '@/lib/config/app.config';
import { REVIEW_ORDER_RESPONSE } from '@/lib/config/order.config';
import { DynamicPageSlugResponse, FaqResponse } from '@/lib/config/global.config';
import CategoryBuyingGuide from '@/app/(store)/(product-listing)/_components/CategoryBuyingGuide';
import CategoryBuyingGuideAccordion from '@/app/(store)/(product-listing)/_components/CategoryBuyingGuideAccordion';
import CategoryTypeCards from '@/app/(store)/(product-listing)/_components/CategoryTypeCards';
import CategoryAdditionalTextBox from '@/app/(store)/(product-listing)/_components/CategoryAdditionalTextBox';
import RelatedGuides from '@/app/(store)/(product-listing)/_components/RelatedGuides';
import {
    fetchBrandBuyingGuideSection,
    resolveBuyingGuideCta,
} from '@/app/(store)/(product-listing)/_components/buying-guide.utils';

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
    // Opt brand CMS sections out of Full Route Cache so admin updates show promptly.
    noStore();

    // Prefer slug-relation / URL identity. Products-by-slug can return a different
    // brand (e.g. zyn → oxva); buying guide + breadcrumbs must stay on the page brand.
    const pageSlug =
        dynamicPageSlug?.slug?.split("/").filter(Boolean).pop() || "";
    const productsSlug = data.slug?.split("/").filter(Boolean).pop() || "";
    const buyingGuideSlug = pageSlug || productsSlug;
    const brandSlug = pageSlug || productsSlug || data.slug || dynamicPageSlug?.slug || "";
    const brandName = dynamicPageSlug?.name || data.name || "";

    const buyingGuideSection = await fetchBrandBuyingGuideSection(
        buyingGuideSlug,
        brandName,
    );
    const { guide: buyingGuide, relatedGuides, isEnabled } = buyingGuideSection;
    const buyingGuideCta = resolveBuyingGuideCta({
        slugRelationCta: dynamicPageSlug?.buyingGuide,
        section: buyingGuideSection,
    });
    const showBuyingGuideSection = Boolean(buyingGuide);
    const typeCardsHtml = dynamicPageSlug?.type_cards_html || data?.type_cards_html || null;
    const additionalTextBoxHtml =
      dynamicPageSlug?.additional_text_box || data?.additional_text_box || null;
    const showRelatedCollections = isEnabled && Boolean(typeCardsHtml?.trim());
    const showAdditionalTextBox = isEnabled && Boolean(additionalTextBoxHtml?.trim());

    const faqBrandId = dynamicPageSlug?.entity_id ?? data.id;

    const listingData = {
        ...data,
        name: brandName,
        slug: brandSlug,
    };

    const breadcrumbs = [
        { label: "Home", href: "/" },
        { label: "Brands", href: ROUTES.BRANDS },
        { label: brandName, href: `/brand/${brandSlug}/`, isActive: true },
    ];
    return (
        <div>
            <section className="product-listing-container flex-col">
                <BreadCrumbs items={breadcrumbs} />
                <ProductListingContent
                    data={listingData}
                    dynamicPageSlug={dynamicPageSlug}
                    aboutHeading={`About ${brandName} Vapes`}
                    showBuyingGuideCta={buyingGuideCta.show}
                    buyingGuideCtaPrompt={buyingGuideCta.prompt}
                    buyingGuideCtaLabel={buyingGuideCta.label}
                    showCategoryQuickLinks
                    categoryQuickLinksSlug={buyingGuideSlug}
                    relatedQuickLinksEntity="brand"
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
                                    key={`buying-guide-brand-${buyingGuideSlug || data.id}`}
                                    embedded
                                    hideHeader
                                    {...buyingGuide}
                                />
                                {showRelatedCollections ? (
                                    <CategoryTypeCards html={typeCardsHtml} embedded />
                                ) : null}
                                {showAdditionalTextBox ? (
                                    <CategoryAdditionalTextBox
                                      html={additionalTextBoxHtml}
                                      embedded
                                    />
                                ) : null}
                                {relatedGuides.length > 0 ? (
                                    <RelatedGuides
                                        key={`related-guides-brand-${buyingGuideSlug || data.id}`}
                                        title="Related Blogs"
                                        embedded
                                        guides={relatedGuides}
                                    />
                                ) : null}
                                {brandFaqs.length > 0 ? (
                                    <FAQSection type="brand" id={faqBrandId} title="FAQs" initialFaqs={brandFaqs} embedded />
                                ) : null}
                            </CategoryBuyingGuideAccordion>
                        </div>
                    ) : (
                        <>
                            {showRelatedCollections ? (
                                <CategoryTypeCards html={typeCardsHtml} />
                            ) : null}
                            {showAdditionalTextBox ? (
                                <CategoryAdditionalTextBox html={additionalTextBoxHtml} />
                            ) : null}
                            {brandFaqs.length > 0 ? (
                                <section className="product-listing-container pt-7.5 md:pt-9">
                                    <FAQSection type="brand" id={faqBrandId} title="FAQs" initialFaqs={brandFaqs} />
                                </section>
                            ) : null}
                        </>
                    )}
                </ProductList>
            </section>
        </div>

    );
};

export default BrandProducts;
