import Link from "next/link";
import React, { Suspense } from "react";
import { BrandListResponse } from "@/lib/config/brand.config";
import BrandCard from "@/components/BrandCard";
import EmptyPlaceholder from "@/components/ui/EmptyPlaceholder";
import { ROUTES } from "@/lib/routes";
import BrandPaginationClient from "./BrandPaginationClient";
import { LeftArrowIcon, MoreHorizontalIcon, RightArrowIcon } from "@/components/Icons";
import { cn } from "@/lib/utils";
type BrandListProps = {
  data: BrandListResponse | null;
  fetchError?: string;
};

function buildBrandListPageUrl(pageNum: number) {
  if (pageNum <= 1) {
    return ROUTES.BRANDS;
  }
  return `${ROUTES.BRANDS}?page=${pageNum}`;
}

function paginationPageNumbers(totalPages: number, currentPage: number): number[] {
  if (totalPages <= 0) return [];
  if (totalPages <= 30) {
    return Array.from({ length: totalPages }, (_, i) => i + 1);
  }
  const set = new Set<number>([1, totalPages, currentPage]);
  for (let d = -3; d <= 3; d++) {
    const p = currentPage + d;
    if (p >= 1 && p <= totalPages) set.add(p);
  }
  return Array.from(set).sort((a, b) => a - b);
}

const BrandList: React.FC<BrandListProps> = ({ data, fetchError }) => {
  if (fetchError) {
    return <EmptyPlaceholder title="Uh, oh!" description={fetchError} />;
  }

  if (!data || data.brands.length === 0) {
    return <EmptyPlaceholder title="Uh, oh!" description="No brands found" />;
  }

  const { brands, pagination } = data;
  const totalPages = pagination.totalPages;
  const currentPage = pagination.currentPage;
  const pageNums = paginationPageNumbers(totalPages, currentPage);

  return (
    <>
      <section className="product-listing-container">
        <div className="flex flex-wrap items-center justify-center gap-6 px-8 md:gap-8.5">
          {brands.map((brand) => (
            <BrandCard
              key={brand.id}
              imageSrc={brand.logo_url}
              altText={brand.alt_text ?? brand.name}
              href={ROUTES.BRAND.replace(":slug", brand.slug)}
            />
          ))}
        </div>
      </section>
      {totalPages > 1 && (
        <div className="my-8 flex flex-col items-center gap-3">
          <div className="brands-pagination-ui-host w-full">
            <Suspense fallback={null}>
              <BrandPaginationClient totalPages={totalPages} currentPage={currentPage} />
            </Suspense>
          </div>
          <nav
            aria-label="Pagination links"
            className="brands-pagination-nav-fallback"
          >
            {currentPage > 1 ? (
              <Link
                prefetch={false}
                href={buildBrandListPageUrl(currentPage - 1)}
                aria-label="Previous page"
                className="inline-flex h-9 w-9 min-w-9 shrink-0 items-center justify-center rounded-10 bg-skin-neutral-50 p-2 text-skin-neutral-500 no-underline transition-opacity hover:opacity-90"
              >
                <LeftArrowIcon stroke="#6B7270" className="" />
              </Link>
            ) : (
              <span
                aria-hidden
                className="inline-flex h-9 w-9 min-w-9 shrink-0 cursor-not-allowed items-center justify-center rounded-10 bg-skin-neutral-50 p-2 opacity-40"
              >
                <LeftArrowIcon stroke="#6B7270" className="" />
              </span>
            )}
            {pageNums.map((pageNum, idx, arr) => {
              const prevNum = idx > 0 ? arr[idx - 1] : null;
              const showEllipsis = prevNum !== null && pageNum - prevNum > 1;
              return (
                <React.Fragment key={pageNum}>
                  {showEllipsis ? (
                    <span
                      aria-hidden
                      className="inline-flex h-9 w-9 min-w-9 shrink-0 items-center justify-center rounded-10 bg-skin-neutral-50 font-semibold text-skin-neutral-500"
                    >
                      <MoreHorizontalIcon />
                    </span>
                  ) : null}
                  <Link
                    prefetch={false}
                    href={buildBrandListPageUrl(pageNum)}
                    aria-current={pageNum === currentPage ? "page" : undefined}
                    className={cn(
                      "inline-flex h-9 min-w-9 shrink-0 items-center justify-center rounded-10 bg-skin-neutral-50 p-2 font-semibold no-underline",
                      "text-title-2 text-skin-neutral-500 hover:opacity-90",
                      pageNum === currentPage && "bg-primary-gradient-100 !text-skin-white"
                    )}
                  >
                    {pageNum}
                  </Link>
                </React.Fragment>
              );
            })}
            {currentPage < totalPages ? (
              <Link
                prefetch={false}
                href={buildBrandListPageUrl(currentPage + 1)}
                aria-label="Next page"
                className="inline-flex h-9 w-9 min-w-9 shrink-0 items-center justify-center rounded-10 bg-skin-neutral-50 text-skin-neutral-500 no-underline transition-opacity hover:opacity-90"
              >
                <RightArrowIcon stroke="#3A4340" className="h-4.5 w-4.5" />
              </Link>
            ) : (
              <span
                aria-hidden
                className="inline-flex h-9 w-9 min-w-9 shrink-0 cursor-not-allowed items-center justify-center rounded-10 bg-skin-neutral-50 opacity-40"
              >
                <RightArrowIcon stroke="#3A4340" className="h-4.5 w-4.5" />
              </span>
            )}
          </nav>
        </div>
      )}
    </>
  );
};

export default BrandList;
