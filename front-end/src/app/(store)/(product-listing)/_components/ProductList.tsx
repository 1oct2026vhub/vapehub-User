"use client"

import FAQSection from "@/components/FAQSection";
import FilterCheckboxGroup from "@/components/FilterCheckboxGroup";
import FilterSidebar from "@/components/FilterSidebar";
import Pagination from "@/components/Pagination";
import ProductCard from "@/components/ProductCard";
import { ProductListingActionsMob, ProductListingActionsWeb } from "@/components/ProductListingActions";
import { isLessThanOneMonth } from "@/lib/config/app.config";
import { BrandByProductResponse, CategoryResponseData, ProductResponseData } from "@/lib/config/product.config";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { FunctionComponent, ReactElement, useState } from "react";
// import { motion } from "framer-motion";

type ProductListProps = {
  data: CategoryResponseData | BrandByProductResponse | ProductResponseData
}

const ProductList: FunctionComponent<ProductListProps> = ({ data }): ReactElement => {
  const [isFilterVisible, setIsFilterVisible] = useState(true);
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const priceOptions = [
    { label: "£0 - £10", count: 376, value: "0-10" },
    { label: "£10 - £25", count: 29, value: "10-25" },
    { label: "£25 - £50", count: 29, value: "25-50" },
    { label: "£75 - £100", count: 29, value: "75-100" },
  ];

  const appliedFilters = ["ELUX", "Almond (7 items)"];

  const handleRemoveFilter = (filter: string) => {
    console.log("Remove filter:", filter);
  };

  const filterOptions = [
    { title: "Price Range", content: <FilterCheckboxGroup options={priceOptions} defaultValues={["0-10"]} /> },
    { title: "Product Type", content: <FilterCheckboxGroup options={priceOptions} defaultValues={["0-10"]} /> },
    { title: "Brands", content: <FilterCheckboxGroup options={priceOptions} defaultValues={["0-10"]} /> },
    { title: "Flavours", content: <FilterCheckboxGroup options={priceOptions} defaultValues={["0-10"]} /> },
    { title: "Bottle Size", content: <FilterCheckboxGroup options={priceOptions} defaultValues={["0-10"]} /> },
    { title: "Nicotine Strength", content: <FilterCheckboxGroup options={priceOptions} defaultValues={["0-10"]} /> },
    { title: "Nicotine Type", content: <FilterCheckboxGroup options={priceOptions} defaultValues={["0-10"]} /> },
    { title: "VG Ratio", content: <FilterCheckboxGroup options={priceOptions} defaultValues={["0-10"]} /> },
    { title: "Vaping Style", content: <FilterCheckboxGroup options={priceOptions} defaultValues={["0-10"]} /> },
    { title: "Price", content: <FilterCheckboxGroup options={priceOptions} defaultValues={["0-10"]} /> },
    { title: "Battery Capacity", content: <FilterCheckboxGroup options={priceOptions} defaultValues={["0-10"]} /> },
    { title: "Coil Style", content: <FilterCheckboxGroup options={priceOptions} defaultValues={["0-10"]} /> },
    { title: "Device Style", content: <FilterCheckboxGroup options={priceOptions} defaultValues={["0-10"]} /> },
    { title: "E-Liquid Capacity", content: <FilterCheckboxGroup options={priceOptions} defaultValues={["0-10"]} /> },
    { title: "Function", content: <FilterCheckboxGroup options={priceOptions} defaultValues={["0-10"]} /> },
    { title: "Pod Coil Style", content: <FilterCheckboxGroup options={priceOptions} defaultValues={["0-10"]} /> },
    { title: "Pod Fill Style", content: <FilterCheckboxGroup options={priceOptions} defaultValues={["0-10"]} /> },
    { title: "Power Supply", content: <FilterCheckboxGroup options={priceOptions} defaultValues={["0-10"]} /> },
    { title: "Puff Count", content: <FilterCheckboxGroup options={priceOptions} defaultValues={["0-10"]} /> },
  ];

  const products = data?.products ?? [];
  const totalPage = data?.pagination?.total_pages ?? 0;
  const totalCount = data?.pagination?.total_count ?? 0;
  const activePage = data?.pagination?.current_page ?? 0;
  const pageLimit = data?.pagination?.limit ?? 0;
  // on pagination change
  const handlePagination = (page: number) => {
     
    const params = new URLSearchParams(searchParams);
    params.set("offset", (page - 1).toString());
    router.replace(`${pathname}?${params.toString()}`, { scroll: false });
  };

  const handleSortChange = (sort: string) => {
    const params = new URLSearchParams(searchParams);
    if (!sort) {
      params.delete("order");
    } else {
      params.set("order", sort);
    } 
    router.replace(`${pathname}?${params.toString()}`, { scroll: false });
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
          <div className={`grid max-[390px]:!grid-cols-1 grid-cols-2  ${isFilterVisible ? 'xl:grid-cols-3' : 'xl:grid-cols-4'} transition-all duration-600 ease-in-out gap-3 md:gap-5 xl:gap-10 products-slider`}>
            {products.length === 0 ? (
              <p className="mt-10 text-skin-neutral-500 text-title-1 md:text-h4 font-semibold text-center">No products found.</p>
            ) : products.map((product, index) => (
              <ProductCard
                key={index}
                title={product.name}
                imageSrc={product.ProductImages?.[0]?.image_url}
                price={product.price}
                buttonText={"3 for £30"}
                flavors={product?.Flavors?.length}
                reviews={10}
                link={`/${product.slug}`}
                totalPuffs={product?.puff_count ? `${product?.puff_count} Puffs`: ""}
                isNew={isLessThanOneMonth(product?.createdAt) ? "New" : ""} 
              />
            ))}
          </div>
          <div className="flex items-center gap-3 justify-between pl-5 max-md:hidden">
            <p className="text-content-1 text-skin-neutral-300 font-bold">Showing {activePage}-{pageLimit} of {totalCount} results</p>
            {/* <Pagination showControls initialPage={1} total={100} /> */}
            <Pagination total={totalPage} onPageChange={handlePagination}/>
          </div>
        </div>
      </section>
      <section className="product-listing-container">
        <FAQSection />
      </section>
    </>
  );
};

export default ProductList;
