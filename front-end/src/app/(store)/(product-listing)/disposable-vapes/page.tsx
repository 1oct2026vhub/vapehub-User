"use client"

import BreadCrumbs from "@/components/BreadCrumbs";
import FAQSection from "@/components/FAQSection";
import FilterCheckboxGroup from "@/components/FilterCheckboxGroup";
import FilterSidebar from "@/components/FilterSidebar";
import Footer from "@/components/Footer";
import Header from "@/components/Header";
import Pagination from "@/components/Pagination";
import ProductCard from "@/components/ProductCard";
import { ProductListingActionsMob, ProductListingActionsWeb } from "@/components/ProductListingActions";
import ProductListingContent from "@/components/ProductListingContent";
import { NextPage } from "next";
import { ReactElement } from "react";

const ProductListing: NextPage = (): ReactElement => {
  const breadcrumbs = [
    { label: "Home", href: "/" },
    { label: "Disposables", href: "/disposable-vapes", isActive: true },
  ];

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
    { title: "Product Type", content: <p>Product Type</p> },
    { title: "Brands", content: <p>Brands</p> },
    { title: "Flavors", content: <p>Flavors</p> },
    { title: "Bottle Size", content: <p>Bottle Size</p> },
    { title: "Nicotine Strength", content: <p>Nicotine Strength</p> },
    { title: "Nicotine Type", content: <p>Nicotine Type</p> },
    { title: "VG Ratio", content: <p>VG Ratio</p> },
    { title: "Vaping Style", content: <p>Vaping Style</p> },
    { title: "Price", content: <p>Price</p> },
    { title: "Battery Capacity", content: <p>Battery Capacity</p> },
    { title: "Device Style", content: <p>Device Style</p> },
    { title: "E-Liquid Capacity", content: <p>E-Liquid Capacity</p> },
    { title: "Function", content: <p>Function</p> },
    { title: "Pod Coil Style", content: <p>Pod Coil Style</p> },
    { title: "Pod Fill Style", content: <p>Pod Fill Style</p> },
    { title: "Power Supply", content: <p>Coil Style</p> },
    { title: "Puff Count", content: <p>Coil Style</p> },
  ];

  const products = [
    {
      title: "VG Pro 6000 Prefilled Pods",
      imageSrc: "/images/product-1.png",
      price: "£12.99",
      buttonText: "3 for £30",
      reviews: 10,
      flavors: "20",
    },
    {
      title: "VG Pro 6000 Prefilled Pods",
      imageSrc: "/images/product-1.png",
      price: "£12.99",
      buttonText: "3 for £30",
      reviews: 10,
      flavors: "20",
    },
    {
      title: "VG Pro 6000 Prefilled Pods",
      imageSrc: "/images/product-1.png",
      price: "£12.99",
      buttonText: "3 for £30",
      reviews: 10,
      flavors: "20",
    },
    {
      title: "VG Pro 6000 Prefilled Pods",
      imageSrc: "/images/product-1.png",
      price: "£12.99",
      buttonText: "3 for £30",
      reviews: 10,
      flavors: "20",
    },
    {
      title: "VG Pro 6000 Prefilled Pods",
      imageSrc: "/images/product-1.png",
      price: "£12.99",
      buttonText: "3 for £30",
      reviews: 10,
      flavors: "20",
    },
    {
      title: "VG Pro 6000 Prefilled Pods",
      imageSrc: "/images/product-1.png",
      price: "£12.99",
      buttonText: "3 for £30",
      reviews: 10,
      flavors: "20",
    },
    {
      title: "VG Pro 6000 Prefilled Pods",
      imageSrc: "/images/product-1.png",
      price: "£12.99",
      buttonText: "3 for £30",
      reviews: 10,
      flavors: "20",
    },
    {
      title: "VG Pro 6000 Prefilled Pods",
      imageSrc: "/images/product-1.png",
      price: "£12.99",
      buttonText: "3 for £30",
      reviews: 10,
      flavors: "20",
    },
    {
      title: "VG Pro 6000 Prefilled Pods",
      imageSrc: "/images/product-1.png",
      price: "£12.99",
      buttonText: "3 for £30",
      reviews: 10,
      flavors: "20",
    },

  ];

  return (
    <>
      <Header />
      <main>
        <section className="product-listing-container flex-col">
          <BreadCrumbs items={breadcrumbs} />
          <ProductListingContent />
        </section>
        <section className="product-listing-container border-t border-skin-neutral-200 flex flex-row items-start !gap-5 xl:!gap-12">
          <FilterSidebar appliedFilters={appliedFilters} onRemoveFilter={handleRemoveFilter} filterOptions={filterOptions} />
          <div className="flex flex-col gap-7.5 md:gap-9 w-full">
            <ProductListingActionsWeb/>
            <ProductListingActionsMob />
            <div className="grid grid-cols-2 xl:grid-cols-3 gap-3 md:gap-5 xl:gap-10 products-slider">
              {products.map((product, index) => (
                <ProductCard
                  key={index}
                  title={product.title}
                  imageSrc={product.imageSrc}
                  price={product.price}
                  buttonText={product.buttonText}
                  reviews={product.reviews}
                  flavors={product.flavors}
                />
              ))}
            </div>
            <div className="flex items-center justify-between pl-5 max-md:hidden">
              <p className="text-content-2 text-skin-neutral-300 font-bold">Showing 1-10 of 100 results</p>
              {/* <Pagination showControls initialPage={1} total={100} /> */}
              <Pagination />
            </div>
          </div>
        </section>
        <section className="product-listing-container">
          <FAQSection />
        </section>
      </main>
      <Footer />
    </>
  );
};

export default ProductListing;
