"use client"

import BreadCrumbs from "@/components/BreadCrumbs";
import Footer from "@/components/Footer";
import Header from "@/components/Header";
import ProductListingContent from "@/components/ProductListingContent";
import { NextPage } from "next";
import { ReactElement } from "react";

const ProductListing: NextPage = (): ReactElement => {
  const breadcrumbs = [
    { label: "Home", href: "/" },
    { label: "Disposables", href: "/disposable-vapes", isActive: true },
  ];

  return (
    <>
      <Header />
      <main>
        <section className="px-4 lg:px-12.5 py-4.5 lg:py-10 flex flex-col gap-4.5 md:gap-10">
          <BreadCrumbs items={breadcrumbs} />
          <ProductListingContent />
        </section>

      </main>
      <Footer />
    </>
  );
};

export default ProductListing;
