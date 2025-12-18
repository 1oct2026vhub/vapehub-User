import ProductList from '@/app/(store)/(product-listing)/_components/ProductList';
import React, { ReactElement } from 'react';
import ProductListingContent from "@/components/ProductListingContent";
import BreadCrumbs from "@/components/BreadCrumbs";
import { CategoryResponseData } from '@/lib/config/product.config';
import FAQSection from '@/components/FAQSection';
import { ServerActionResponse } from '@/lib/config/app.config';
import { REVIEW_ORDER_RESPONSE } from '@/lib/config/order.config';
import { DynamicPageSlugResponse } from '@/lib/config/global.config';

// Extended type for category data that might have additional ID fields
type ExtendedCategoryData = CategoryResponseData & {
  category_id?: number;
  categoryId?: number;
};

type CategoryProps = {
  data: ExtendedCategoryData;
  reviews: ServerActionResponse<REVIEW_ORDER_RESPONSE>[];
  dynamicPageSlug?: DynamicPageSlugResponse;
}


const CategoryProducts: React.FC<CategoryProps> = ({ data, reviews, dynamicPageSlug }): ReactElement => {  
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
  console.log("category data", enhancedCategoryData);
  
  
  // Try to get category ID from different possible sources
  const categoryId = data.id || 
                    data.category_id || 
                    data.categoryId || 
                    (dynamicPageSlug?.entity_id);
    
  return (
    <div className='w-full max-w-[1520px] mx-auto'>
      <section className="product-listing-container flex-col">
        <BreadCrumbs items={breadcrumbs} />
        <ProductListingContent data={enhancedCategoryData} dynamicPageSlug={dynamicPageSlug} />
      </section>
      <ProductList data={data} reviews={reviews} />
      <section className="product-listing-container">
        {categoryId ? (
          <FAQSection type="category" id={categoryId} />
        ) : (
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
        )}
      </section>
    </div>

  );
};

export default CategoryProducts;