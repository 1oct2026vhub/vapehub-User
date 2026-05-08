"use client";

import React from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import Pagination from "@/components/Pagination";

type BrandPaginationClientProps = {
  totalPages: number;
  currentPage: number;
};

const BrandPaginationClient: React.FC<BrandPaginationClientProps> = ({
  totalPages,
  currentPage,
}) => {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const handlePagination = (page: number) => {
    const params = new URLSearchParams(searchParams.toString());
    if (page <= 1) {
      params.delete("page");
    } else {
      params.set("page", String(page));
    }
    const qs = params.toString();
    const href = qs ? `${pathname}?${qs}` : pathname;
    router.replace(href, { scroll: true });
  };

  return (
    <Pagination
      total={totalPages}
      onPageChange={handlePagination}
      currentPage={currentPage}
    />
  );
};

export default BrandPaginationClient;
