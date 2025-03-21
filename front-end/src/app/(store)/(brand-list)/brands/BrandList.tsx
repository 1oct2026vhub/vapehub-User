"use client";

import { useSearchParams, useRouter, usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { getBrandList } from "@/lib/server.actions";
import { BrandListResponse } from "@/lib/config/brand.config";
import { ServerActionStatus } from "@/lib/config/app.config";
import BrandCard from "@/components/BrandCard";
import Pagination from "@/components/Pagination";
import SuspenseLoader from "@/components/ui/SuspenseLoader";
import { ROUTES } from "@/lib/routes";
import EmptyPlaceholder from "@/components/ui/EmptyPlaceholder";

const BrandList = () => {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<BrandListResponse | null>(null);

  const page = Number(searchParams.get("page")) || 1;
  const limit = 20;

  useEffect(() => {
    const fetchBrands = async () => {
      setLoading(true);
      const response = await getBrandList({ page, limit });       
      if (response.status === ServerActionStatus.SUCCESS) {
        setData(response.data);       
      }
      setLoading(false);
    };

    fetchBrands();
  }, [page]);

  const handlePagination = (page: number) => {
    const params = new URLSearchParams(searchParams);
    params.set("page", page.toString());
    router.replace(`${pathname}?${params.toString()}`, { scroll: true });
  };

  if (loading) {
    return <SuspenseLoader />;
  }
  if(!data || data.brands.length === 0) {
    return <EmptyPlaceholder title='Uh, oh!' description='No brands found' />;
  }

  return (
    <>
    <section className='product-listing-container'>
                <div className='flex flex-wrap items-center justify-center gap-6 md:gap-8.5 px-8'>
                    {data?.brands.map((brand, index) => (
                        <BrandCard
                            key={index}
                            imageSrc={brand.logo_url}
                            altText={brand.name}
                            href={ROUTES.BRAND.replace(':slug', brand.slug)}
                        />
                    ))}
                </div>
                
            </section>
            {data?.pagination.totalPages > 1 && (
                    <div className="flex justify-center my-8">
                        <Pagination 
                            total={data?.pagination?.totalPages}
                            onPageChange={handlePagination}
                            currentPage={data?.pagination?.currentPage}
                        />
                    </div>
                )}
    </>
  );
};

export default BrandList;
