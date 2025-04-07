"use client"

import FilterCheckboxGroup from "@/components/FilterCheckboxGroup";
import FilterRadioGroup from "@/components/FilterRadioGroup";
import FilterSidebar from "@/components/FilterSidebar";
import Pagination from "@/components/Pagination";
import ProductCard from "@/components/ProductCard";
import { ProductListingActionsMob, ProductListingActionsWeb } from "@/components/ProductListingActions";
import EmptyPlaceholder from "@/components/ui/EmptyPlaceholder";
import { isLessThanOneMonth } from "@/lib/config/app.config";
import { BrandByProductResponse, CategoryResponseData, ProductResponseData, AttributeTerms, NON_VARIANT_FILTERS } from "@/lib/config/product.config";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { FunctionComponent, ReactElement, useState } from "react";
import { useProductFilters } from "@/lib/hooks/useProductFilters";
// import { motion } from "framer-motion";

type ProductListProps = {
  data: CategoryResponseData | BrandByProductResponse | ProductResponseData
}

const ProductList: FunctionComponent<ProductListProps> = ({ data }): ReactElement => {
  
  const [isFilterVisible, setIsFilterVisible] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const { getFilterParams, getAppliedFilters, removeFilter, updateFilters } = useProductFilters();


  const productAttributeTerms: AttributeTerms[] = data?.attributes.filter(attr => attr.attribute.is_visible_page === true);
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
    params.set("offset", (page - 1).toString());
    router.replace(`${pathname}?${params.toString()}`, { scroll: true });
  };

  const handleSortChange = (sort: string) => {
    const params = new URLSearchParams(searchParams);
    if (!sort) {
      params.delete("order");
    } else {
      params.set("order", sort);
    }
    router.replace(`${pathname}?${params.toString()}`, { scroll: true });
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
          <FilterSidebar appliedFilters={appliedFilters} onRemoveFilter={handleRemoveFilter} filterOptions={filterOptions} />

        }

        <div className="flex flex-col gap-7.5 md:gap-9 w-full">
          <ProductListingActionsWeb
            onSortChange={handleSortChange}
            initialValue={searchParams.get("order") ?? "Sort By"}
            isFilterVisible={isFilterVisible}
            onFilterToggle={() => setIsFilterVisible(!isFilterVisible)}
          />
          <ProductListingActionsMob
            onSortChange={handleSortChange}
            initialValue={searchParams.get("order") ?? "Sort By"}
          />
          {products.length === 0 ? (
            <EmptyPlaceholder title='Uh, oh!' description='No products found.' />
          ) :
            <>
              <div className={`grid max-[390px]:!grid-cols-1 grid-cols-2  ${isFilterVisible ? 'xl:grid-cols-3' : 'xl:grid-cols-4'} transition-all duration-600 ease-in-out gap-3 md:gap-5 xl:gap-10 products-slider`}>
                {products.map((product, index) => (
                  <ProductCard
                    key={index}
                    title={product.name}
                    imageSrc={product.ProductImages?.find(img => img.is_primary)?.image_url || product.ProductImages?.[0]?.image_url}
                    price={product.price}
                    buttonText={"3 for £30"}
                    flavors={product?.Flavors?.length}
                    reviews={10}
                    link={`/${product.slug}`}
                    totalPuffs={product?.puff_count ? `${product?.puff_count} Puffs` : ""}
                    isNew={isLessThanOneMonth(product?.createdAt) ? "New" : ""}
                  />
                ))}
              </div>

              <div className="flex items-center gap-3 justify-between pl-5 max-md:hidden">
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
