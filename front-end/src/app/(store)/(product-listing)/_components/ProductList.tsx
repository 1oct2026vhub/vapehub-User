"use client"

import FilterCheckboxGroup from "@/components/FilterCheckboxGroup";
import FilterRadioGroup from "@/components/FilterRadioGroup";
import FilterSidebar from "@/components/FilterSidebar";
import Pagination from "@/components/Pagination";
import ProductCard from "@/components/ProductCard";
import { ProductListingActionsMob, ProductListingActionsWeb } from "@/components/ProductListingActions";
import EmptyPlaceholder from "@/components/ui/EmptyPlaceholder";
import { isLessThanOneMonth } from "@/lib/config/app.config";
import { 
  ProductResponseData, 
  CategoryResponseData, 
  BrandByProductResponse, 
  Product, 
  PriceRange, 
  AttributeTerms, 
  NON_VARIANT_FILTERS 
} from '@/lib/config/product.config';
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { FunctionComponent, ReactElement, useState, useEffect } from "react";
import { useProductFilters } from "@/lib/hooks/useProductFilters";
import { ServerActionResponse, ServerActionStatus } from "@/lib/config/app.config";
import { REVIEW_ORDER_RESPONSE } from "@/lib/config/order.config";
import { scrollToTop } from "@/lib/utils/scrollToTop";
// import { getAllDeals } from "@/lib/server.actions";
// import { li } from "framer-motion/client";
// import { motion } from "framer-motion";

type ProductListData = Partial<ProductResponseData & Omit<CategoryResponseData, 'updated_by'> & Omit<BrandByProductResponse, 'updated_by'>> & {
  products?: Product[];
  category?: {id: number, name: string, product_count: number}[];
  brand?: {id: number, name: string, product_count: number}[];
  deal?: {id: number, name: string, slug: string, product_count: number}[];
  attributes?: AttributeTerms[];
  price_ranges?: PriceRange[];
  pagination?: {
    total_count: number;
    total_pages: number;
    current_page: number;
    limit: number;
    offset: number;
  };
  updated_by?: number | string | null;
};

type DealOption = {
  id: number;
  name: string;
  slug: string;
  product_count: number;
};

const ProductList: FunctionComponent<{data: ProductListData, reviews?: ServerActionResponse<REVIEW_ORDER_RESPONSE>[]}> = ({ data, reviews = [] }): ReactElement => { 
  const [isFilterVisible, setIsFilterVisible] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const { getFilterParams, getAppliedFilters, removeFilter, updateFilters, clearAllFilters } = useProductFilters();

  // Set default sort_by=popularity in URL if not present
  useEffect(() => {
    const sortBy = searchParams.get("sort_by");
    const order = searchParams.get("order");
    
    // If no sort_by and no order params, set default to popularity
    if (!sortBy && !order) {
      const params = new URLSearchParams(searchParams);
      params.set("sort_by", "popularity");
      router.replace(`${pathname}?${params.toString()}`, { scroll: false });
    }
  }, []); // Run only once on mount

  const productAttributeTerms: AttributeTerms[] = (data?.attributes || [])
    .filter(attr => attr.attribute?.is_visible === true);
  const appliedFilters = getAppliedFilters(productAttributeTerms);
  const handleRemoveFilter = (attributeId: number, type: string) => {
    setIsLoading(true);
    removeFilter(attributeId, productAttributeTerms, type);
    setTimeout(() => {
      setIsLoading(false);
    }, 1000);
  };

  const onFilterChange = (attributeId: string, value: string, isSelect: boolean) => {
    setIsLoading(true);
    const currentFilters = getFilterParams();
    if (!currentFilters.variants) {
      currentFilters.variants = {};
    } 
    // Handle non-variant parameters
    if (NON_VARIANT_FILTERS.includes(attributeId)) { 
      if (!currentFilters.nonVariants) {
        currentFilters.nonVariants = {};
      }
      if (value) {
        currentFilters.nonVariants[attributeId] = value;
      } else {
        delete currentFilters.nonVariants[attributeId];
      }
    } else {
      // Handle variant parameters (from attributes)
      if (isSelect) {
        // For checkbox groups (select type)
        if (!currentFilters.variants[attributeId]) {
          currentFilters.variants[attributeId] = [];
        }
        currentFilters.variants[attributeId] = value.split(',').filter(Boolean);
      } else {
        // For radio groups (non-select type)
        if (value) {
          currentFilters.variants[attributeId] = [value];
        } else {
          currentFilters.variants[attributeId] = [];
        }
      }
    }
    if(currentFilters.nonVariants) {
      currentFilters.nonVariants['offset'] = "0";
    }
    updateFilters(currentFilters);
    setTimeout(() => {
      setIsLoading(false);
    }, 1000);
  };
  const products = data?.products ? data?.products.filter(product => product.Category !== null) : [];
  const totalPage = data?.pagination?.total_pages ?? 0;
  const totalCount = data?.pagination?.total_count ?? 0;
  const activePage = data?.pagination?.current_page ?? 0;
  const priceOptions = data?.price_ranges ?? []; 
  const categoryOptions = data?.category ?? [];
  const brandOptions = data?.brand ?? [];
  const dealOptions = (data?.deal as DealOption[]) ?? [];
  
   const filterOptions = [
    { 
      title: "Price Range", 
      content: <FilterRadioGroup 
        options={priceOptions} 
        defaultValues={searchParams.get("price_range") || ""} 
        onChange={(value) => onFilterChange("price_range", value, false)} 
      /> 
    },
    
    ...(categoryOptions.length > 0 ? [{
      title: "Categories",
      content: <FilterCheckboxGroup
        options={categoryOptions.map(category => ({
          label: category.name,
          value: category.id.toString(),
          count: category.product_count
        }))}
        defaultValues={searchParams.get("categories")?.split(",") || []}
        onChange={(values) => onFilterChange("categories", values.join(","), true)}
        isDisabled={isLoading}
      />
    }] : []),
    
    ...(brandOptions.length > 0 ? [{
      title: "Brands",
      content: <FilterCheckboxGroup
        options={brandOptions.map(brand => ({
          label: brand.name,
          value: brand.id.toString(),
          count: brand.product_count
        }))}
        defaultValues={searchParams.get("brand")?.split(",") || []}
        onChange={(values) => onFilterChange("brand", values.join(","), true)}
        isDisabled={isLoading}
      />
    }] : []),
    
    ...(dealOptions.length > 0 ? [{
      title: "Deals",
      content: <FilterRadioGroup
        options={dealOptions.map((deal: DealOption) => ({
          label: deal.name,
          value: deal.id.toString(),
          count: deal.product_count
        }))}
        defaultValues={searchParams.get("deal_id") || ""}
        onChange={(value) => onFilterChange("deal_id", value, false)}
      />
    }] : []),
    
    ...productAttributeTerms.map(attr => ({
      title: attr.attribute.name,
      content: attr.attribute.type === "select" ? (
        <FilterCheckboxGroup
          options={attr.terms.map(term => ({
            label: term.name,
            value: term.id.toString(),
            count: term.product_count
          }))}
          defaultValues={searchParams.get(`attribute_${attr.attribute.id}`)?.split(",") || []}
          onChange={(values) => onFilterChange(attr.attribute.id.toString(), values.join(","), true)}
          isDisabled={isLoading}
        />
      ) : (
        <FilterRadioGroup
          options={attr.terms.map(term => ({
            label: term.name,
            value: term.id.toString(),
            count: term.product_count
          }))}
          defaultValues={searchParams.get(`attribute_${attr.attribute.id}`) || ""}
          onChange={(value) => onFilterChange(attr.attribute.id.toString(), value, false)}
        />
      )
    }))
  ];


  
  // const pageLimit = data?.pagination?.limit ?? 0;
  // on pagination change
  const handlePagination = (page: number) => {

    const params = new URLSearchParams(searchParams);    
    params.set("offset", ((page - 1) * 12).toString());
    router.replace(`${pathname}?${params.toString()}`, { scroll: false });    
    // Scroll to top after pagination change
    scrollToTop();
  };

  // Helper function to get sort value from URL params
  const getSortValueFromParams = (): string => {
    const sortBy = searchParams.get("sort_by");
    const order = searchParams.get("order");
    
    // If no params, return "popularity" as default
    if (!sortBy && !order) {
      return "popularity";
    }
    
    // Handle price sorting
    if (sortBy === "price") {
      if (order === "ASC") {
        return "price_asc";
      } else if (order === "DESC") {
        return "price_desc";
      }
    }
    
    // Handle popularity
    if (sortBy === "popularity") {
      return "popularity";
    }
    
    // Handle legacy order-only params (for backward compatibility)
    // Latest: order=DESC without sort_by
    // Oldest: order=ASC without sort_by
    if (!sortBy && order) {
      return order; // "ASC" or "DESC"
    }
    
    return "popularity"; // Default to popularity if no match
  };

  const handleSortChange = (sort: string) => {
    const params = new URLSearchParams(searchParams);
    
    if (!sort || sort === "") {
      // Default: set to popularity
      params.set("sort_by", "popularity");
      params.delete("order");
    } else if (sort === "popularity") {
      // Popularity: sort_by=popularity
      params.set("sort_by", "popularity");
      params.delete("order");
    } else if (sort === "price_asc") {
      // Price Low to High: sort_by=price, order=ASC
      params.set("sort_by", "price");
      params.set("order", "ASC");
    } else if (sort === "price_desc") {
      // Price High to Low: sort_by=price, order=DESC
      params.set("sort_by", "price");
      params.set("order", "DESC");
    } else if (sort === "ASC" || sort === "DESC") {
      // Legacy: Only order param (Latest/Oldest)
      params.delete("sort_by");
      params.set("order", sort);
    }
    
    router.replace(`${pathname}?${params.toString()}`, { scroll: false });
    // Scroll to top after sort change
    scrollToTop();
  };

  return (

    <>
      <section className="product-listing-container border-t border-skin-neutral-200 flex flex-row items-start !gap-5 xl:!gap-12">

        {/* <motion.div
        initial={{ width: 0 }}
        animate={{ width: isFilterVisible ? "auto" : 0, opacity: isFilterVisible ? 1 : 0 }}
        transition={{ duration: 0.3 }} 
        
      > */}
        {
          isFilterVisible &&
          <FilterSidebar appliedFilters={appliedFilters} 
          onRemoveFilter={handleRemoveFilter} 
          filterOptions={filterOptions} 
          onClearAllFilters={clearAllFilters}
          />

        }

        <div className="flex flex-col gap-7.5 md:gap-9 w-full">
          <ProductListingActionsWeb
            onSortChange={handleSortChange}
            initialValue={getSortValueFromParams()}
            isFilterVisible={isFilterVisible}
            onFilterToggle={() => setIsFilterVisible(!isFilterVisible)}
            
          />
          <ProductListingActionsMob
            onSortChange={handleSortChange}
            initialValue={getSortValueFromParams()}
            appliedFilters={appliedFilters}
            onRemoveFilter={handleRemoveFilter}
            filterOptions={filterOptions}
            onClearAllFilters={clearAllFilters}
          />
          {products.length === 0 ? (
            <EmptyPlaceholder title='Uh, oh!' description='No products found.' />
          ) :
            <>
              <div className={`grid grid-cols-2  ${isFilterVisible ? 'md:grid-cols-3 xl:grid-cols-4' : 'md:grid-cols-4 xl:grid-cols-5'} transition-all duration-600 ease-in-out gap-4.5 md:gap-5 xl:gap-10 products-slider`}>
                {products.map((product, index) => {
                  const review = reviews.find(r => r.status === ServerActionStatus.SUCCESS && r.data?.reviews.find(review => review.product_id === product.id));
                  const averageRating = review?.status === ServerActionStatus.SUCCESS ? parseFloat(review.data.average_rating) : 0;
                  const totalReviews = review?.status === ServerActionStatus.SUCCESS ? review.data.total_reviews : 0;

                  return (
                    <ProductCard
                      key={index}
                      title={product.name}
                      imageSrc={product.ProductImages?.find(img => img.is_primary)?.image_url || product.ProductImages?.[0]?.image_url || ''}
                      price={product.price}
                      buttonText={product.deals && product.deals.length > 0 ? product.deals[0].name : ""}
                      // flavors={product?.Flavors?.length}
                      flavors={product.flavor_count ? Number(product.flavor_count) : 0}
                      productId={product.id}
                      link={`/${product.slug}`}
                      totalPuffs={product?.puff_count ? `${product?.puff_count}` : ""}
                      isNew={product.createdAt && isLessThanOneMonth(product.createdAt) ? "New" : ""}
                      averageRating={averageRating}
                      totalReviews={totalReviews}
                      outOfStock={product.out_of_stock}
                    />
                  )
                })}
              </div>

              <div className="flex items-center gap-3 justify-between pl-5 flex-wrap">
                <p className="text-content-1 text-skin-neutral-300 font-bold">Showing {activePage}-{products.length} of {totalCount} results</p>
                {totalPage > 1 && (
                  <Pagination total={totalPage} onPageChange={handlePagination} currentPage={activePage} />
                )}
              </div>
            </>
          }
        </div>
      </section>

    </>
  );
};

export default ProductList;
