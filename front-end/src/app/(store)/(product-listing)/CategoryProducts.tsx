import ProductList from '@/app/(store)/(product-listing)/_components/ProductList';
import React, { ReactElement } from 'react';
import ProductListingContent from "@/components/ProductListingContent";
import BreadCrumbs from "@/components/BreadCrumbs";
import { CategoryResponseData } from '@/lib/config/product.config';
import FAQSection from '@/components/FAQSection';
import { ServerActionResponse } from '@/lib/config/app.config';
import { REVIEW_ORDER_RESPONSE } from '@/lib/config/order.config';
import { DynamicPageSlugResponse } from '@/lib/config/global.config';
import CategoryBuyingGuide from './_components/CategoryBuyingGuide';
import RelatedGuides from './_components/RelatedGuides';
import { resolveCategoryBuyingGuide } from './_components/category-buying-guide.utils';

// Extended type for category data that might have additional ID fields
type ExtendedCategoryData = CategoryResponseData & {
  category_id?: number;
  categoryId?: number;
};

type CategoryProps = {
  data: ExtendedCategoryData;
  reviews: ServerActionResponse<REVIEW_ORDER_RESPONSE>[];
  dynamicPageSlug?: DynamicPageSlugResponse;
  pageSlug?: string;
}


const CategoryProducts: React.FC<CategoryProps> = ({ data, reviews, dynamicPageSlug, pageSlug }): ReactElement => {  
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

  const buyingGuide = resolveCategoryBuyingGuide({
    categoryName: enhancedCategoryData.name,
    categorySlug: enhancedCategoryData.slug,
    pageSlug,
    dynamicPageSlug,
    categoryFeature: data.feature,
    categoryBuyingGuide: data.buying_guide,
    categoryDescription: enhancedCategoryData.description,
    categoryImageUrl: data.logo_url,
    dealsText: dynamicPageSlug?.deals_text,
  });

  const showContentPanel = Boolean(buyingGuide || categoryId);
    
  return (
    <div className='w-full max-w-[1520px] mx-auto'>
      <section className="product-listing-container flex-col">
        <BreadCrumbs items={breadcrumbs} />
        <ProductListingContent
          data={enhancedCategoryData}
          dynamicPageSlug={dynamicPageSlug}
          showBuyingGuideFaqsLink
        />
      </section>
      <ProductList data={data} reviews={reviews}>
        {showContentPanel ? (
          <div
            id="buying-guide-faqs"
            className="scroll-mt-24 w-full pt-7.5 md:pt-9"
          >
            <div className="category-bottom-panel w-full rounded-2xl bg-skin-white p-5 shadow-card md:p-7 xl:p-10 [&>*:not(:first-child)]:border-t [&>*:not(:first-child)]:border-skin-neutral-100 [&>*:not(:first-child)]:pt-8 md:[&>*:not(:first-child)]:pt-10">
              {buyingGuide ? (
                <CategoryBuyingGuide
                  key={`buying-guide-${pageSlug ?? enhancedCategoryData.slug ?? categoryId}`}
                  embedded
                  {...buyingGuide}
                />
              ) : null}
              {categoryId ? (
                <RelatedGuides
                  key={`related-guides-${categoryId}`}
                  embedded
                  currentCategoryId={categoryId}
                />
              ) : null}
            </div>
          </div>
        ) : null}
      </ProductList>
      {categoryId ? (
        <section className="product-listing-container flex-col scroll-mt-24">
          <FAQSection type="category" id={categoryId} />
        </section>
      ) : !showContentPanel ? (
        <section className="product-listing-container flex-col scroll-mt-24">
          <div className="text-center py-4">
            <p className="text-gray-500">FAQ section unavailable - Category ID not found</p>
            <p className="text-sm text-gray-400">Debug info:</p>
            <ul className="text-xs text-gray-400 text-left max-w-md mx-auto">
              <li>data.id = {String(data.id)}</li>
              <li>data.category_id = {String(data.category_id ?? 'undefined')}</li>
              <li>data.categoryId = {String(data.categoryId ?? 'undefined')}</li>
              <li>dynamicPageSlug.entity_id = {String(dynamicPageSlug?.entity_id ?? 'undefined')}</li>
            </ul>
          </div>
        </section>
      ) : null}
    </div>

  );
};

export default CategoryProducts;