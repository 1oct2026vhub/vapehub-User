"use client";

import React, { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { Pagination } from "@nextui-org/react";
import DealCard from "@/components/DealCard";
import { setScrollToTopOnNextNavigation } from "@/components/HistoryProvider";
import { ServerActionStatus } from "@/lib/config/app.config";
import { Deal } from "@/lib/config/deal.config";
import { getAllDeals } from "@/lib/server.actions";

type AllDealsContentClientProps = {
  initialDeals: Deal[];
  initialPage: number;
  initialTotalPages: number;
};

const LIMIT = 10;

const AllDealsContentClient: React.FC<AllDealsContentClientProps> = ({
  initialDeals,
  initialPage,
  initialTotalPages,
}) => {
  const [deals, setDeals] = useState<Deal[]>(initialDeals);
  const [totalPages, setTotalPages] = useState(initialTotalPages);
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const skippedInitialFetch = useRef(initialDeals.length > 0);

  const currentPage = Number.parseInt(searchParams.get("page") || "1", 10) || 1;

  const buildDealsHref = (page: number) => {
    if (page <= 1) return pathname;
    return `${pathname}?page=${page}`;
  };

  useEffect(() => {
    const fetchDeals = async () => {
      if (skippedInitialFetch.current && currentPage === initialPage) {
        skippedInitialFetch.current = false;
        return;
      }

      setLoading(true);
      const offset = (currentPage - 1) * LIMIT;
      const response = await getAllDeals({ limit: LIMIT, offset, deal_type: "BUY_N_FOR_FIXED" });
      if (response.status === ServerActionStatus.SUCCESS && response.data) {
        setDeals(response.data.deals);
        setTotalPages(response.data.pagination.total_pages);
      } else {
        setDeals([]);
        setTotalPages(1);
      }
      setLoading(false);
    };

    fetchDeals();
  }, [currentPage, initialPage]);

  const handlePageChange = (page: number) => {
    setScrollToTopOnNextNavigation();
    const params = new URLSearchParams(searchParams.toString());
    if (page === 1) {
      params.delete("page");
    } else {
      params.set("page", page.toString());
    }
    const query = params.toString();
    router.replace(query ? `${pathname}?${query}` : pathname, { scroll: false });
  };

  return (
    <>
      <section className="border-t border-skin-neutral-200 product-listing-container py-8">
        {loading ? (
          <div className="flex justify-center items-center min-h-[400px]">
            <p className="text-skin-neutral-300 text-lg">Loading deals...</p>
          </div>
        ) : deals.length > 0 ? (
          <div className="grid sm:grid-cols-2 w-full gap-6">
            {deals.map((deal) => (
              <DealCard
                key={deal.id}
                title={deal.name}
                imageSrc={deal.image_url || ""}
                altText={deal.alt_text ?? deal.name}
                href={`/product-deals/${deal.slug.replace(/ /g, "-")}`}
              />
            ))}
          </div>
        ) : (
          <div className="flex justify-center items-center min-h-[400px]">
            <p className="text-skin-neutral-300 text-lg">No deals available</p>
          </div>
        )}
      </section>

      {totalPages > 1 && (
        <>
          <div className="deals-pagination-ui-host mt-8 flex justify-center">
            <Pagination
              total={totalPages}
              initialPage={1}
              page={currentPage}
              onChange={handlePageChange}
              showControls
              classNames={{
                cursor: "bg-skin-primary-500 text-white",
              }}
            />
          </div>
          <nav aria-label="Deals pagination" className="deals-pagination-nav-fallback mt-8">
            {Array.from({ length: totalPages }, (_, idx) => idx + 1).map((pageNum) => (
              <Link
                key={`deals-page-${pageNum}`}
                prefetch={false}
                href={buildDealsHref(pageNum)}
                aria-current={pageNum === currentPage ? "page" : undefined}
                className={`inline-flex h-9 min-w-9 items-center justify-center rounded-10 px-2 font-semibold ${
                  pageNum === currentPage
                    ? "bg-skin-primary-500 text-white"
                    : "bg-skin-neutral-50 text-skin-neutral-500"
                }`}
              >
                {pageNum}
              </Link>
            ))}
          </nav>
        </>
      )}
    </>
  );
};

export default AllDealsContentClient;
