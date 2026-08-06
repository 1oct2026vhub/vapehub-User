import ProductList from '@/app/(store)/(product-listing)/_components/ProductList';
import React from 'react';
import { unstable_noStore as noStore } from 'next/cache';
import ProductListingContent from "@/components/ProductListingContent";
import BreadCrumbs from "@/components/BreadCrumbs";
import { CategoryResponseData } from '@/lib/config/product.config';
import FAQSection from '@/components/FAQSection';
import { AsyncReactElement, ServerActionResponse } from '@/lib/config/app.config';
import { REVIEW_ORDER_RESPONSE } from '@/lib/config/order.config';
import { DynamicPageSlugResponse } from '@/lib/config/global.config';
import CategoryBuyingGuide from './_components/CategoryBuyingGuide';
import CategoryBuyingGuideAccordion from './_components/CategoryBuyingGuideAccordion';
import CategoryTypeCards from './_components/CategoryTypeCards';
import RelatedGuides from './_components/RelatedGuides';
import { fetchCategoryBuyingGuideSection } from './_components/buying-guide.utils';

// Extended type for category data that might have additional ID fields
type ExtendedCategoryData = CategoryResponseData & {
  category_id?: number;
  categoryId?: number;
  card_type_html?: string | null;
  type_card_html?: string | null;
};

type CategoryProps = {
  data: ExtendedCategoryData;
  reviews: ServerActionResponse<REVIEW_ORDER_RESPONSE>[];
  dynamicPageSlug?: DynamicPageSlugResponse & {
    card_type_html?: string | null;
    type_card_html?: string | null;
  };
  pageSlug?: string;
}


const CategoryProducts = async ({
  data,
  reviews,
  dynamicPageSlug,
  pageSlug,
}: CategoryProps): AsyncReactElement => {
  // Opt category CMS sections (buying guide, type cards, FAQs) out of Full Route Cache
  // without changing product/deal handlers on the shared [...slug] route.
  noStore();

  const formatSlugToTitle = (slug?: string | null) => {
    if (!slug) return "";
    return slug
      .split("/")
      .pop()
      ?.replace(/[-_]+/g, " ")
      .replace(/\b\w/g, char => char.toUpperCase()) ?? "";
  };

  const derivedName =
    data?.name?.trim() ||
    data?.category?.[0]?.name ||
    dynamicPageSlug?.name?.trim() ||
    (dynamicPageSlug?.slug && formatSlugToTitle(dynamicPageSlug.slug)) ||
    "";

  const derivedSlug = data?.slug || data?.category?.[0]?.slug || dynamicPageSlug?.slug || "";
  const enhancedCategoryData: ExtendedCategoryData = {
    ...data,
    name: derivedName || data?.name || "",
    slug: derivedSlug || data?.slug || "",
    description: data?.description || dynamicPageSlug?.description || "",
  };

  const breadcrumbs = [
    { label: "Home", href: "/" },
    { label: enhancedCategoryData.name, href: `/${enhancedCategoryData.slug}`, isActive: true },
  ];  
    
  // Try to get category ID from different possible sources
  const categoryId = data.id ||
                    data.category_id ||
                    data.categoryId ||
                    data.category?.[0]?.id ||
                    (dynamicPageSlug?.entity_id);

  const buyingGuideSlug =
    pageSlug?.split("/").filter(Boolean).pop() ||
    enhancedCategoryData.slug?.split("/").filter(Boolean).pop() ||
    "";

  const { guide: buyingGuide, relatedGuides, isEnabled } = await fetchCategoryBuyingGuideSection(
    buyingGuideSlug,
    enhancedCategoryData.name,
  );

  // Related collections / type cards — accept alternate API field names.
  const typeCardsHtml =
    dynamicPageSlug?.type_cards_html ||
    dynamicPageSlug?.card_type_html ||
    dynamicPageSlug?.type_card_html ||
    data?.type_cards_html ||
    data?.card_type_html ||
    data?.type_card_html ||
    null;

  const showBuyingGuideSection = Boolean(buyingGuide);
  const showRelatedCollections = isEnabled && Boolean(typeCardsHtml?.trim());
    
  return (
    <div className='w-full max-w-[1520px] mx-auto'>
      <section className="product-listing-container flex-col">
        <BreadCrumbs items={breadcrumbs} />
        <ProductListingContent
          data={enhancedCategoryData}
          dynamicPageSlug={dynamicPageSlug}
          showBuyingGuideFaqsLink={showBuyingGuideSection}
          showCategoryQuickLinks
          categoryQuickLinksSlug={buyingGuideSlug}
        />
      </section>
      <ProductList data={data} reviews={reviews}>
        {showBuyingGuideSection && buyingGuide ? (
          <div className="w-full pt-7.5 md:pt-9">
            <CategoryBuyingGuideAccordion
              title={buyingGuide.title ?? enhancedCategoryData.name}
              imageUrl={buyingGuide.imageUrl ?? data.logo_url}
              imageAlt={buyingGuide.imageAlt ?? enhancedCategoryData.name}
            >
              <CategoryBuyingGuide
                key={`buying-guide-${buyingGuideSlug || categoryId}`}
                embedded
                hideHeader
                {...buyingGuide}
              />
              {showRelatedCollections ? (
                <CategoryTypeCards html={typeCardsHtml} embedded />
              ) : null}
              {relatedGuides.length > 0 ? (
                <RelatedGuides
                  key={`related-guides-${buyingGuideSlug || categoryId}`}
                  title="Related Blogs"
                  embedded
                  guides={relatedGuides}
                />
              ) : null}
              {categoryId ? (
                <FAQSection type="category" id={categoryId} embedded />
              ) : null}
            </CategoryBuyingGuideAccordion>
          </div>
        ) : (
          <>
            {showRelatedCollections ? (
              <CategoryTypeCards html={typeCardsHtml} />
            ) : null}
            {categoryId ? (
              <section className="product-listing-container flex-col scroll-mt-24 pt-7.5 md:pt-9">
                <FAQSection type="category" id={categoryId} />
              </section>
            ) : null}
          </>
        )}
      </ProductList>
    </div>

  );
};

export default CategoryProducts;
