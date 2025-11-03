'use client'

import React, { useEffect, useState } from 'react';
import { NextPage } from 'next';
import { Pagination } from '@nextui-org/react';
import BreadCrumbs from '@/components/BreadCrumbs';
import DealCard from '@/components/DealCard';
import { Deal } from '@/lib/config/deal.config';
import { getAllDeals } from '@/lib/server.actions';
import { ServerActionStatus } from '@/lib/config/app.config';

const AllDealsPage: NextPage = () => {
    const [deals, setDeals] = useState<Deal[]>([]);
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [loading, setLoading] = useState(false);
    const limit = 10;

    useEffect(() => {
        const fetchDeals = async () => {
            setLoading(true);
            const offset = (currentPage - 1) * limit;
            const response = await getAllDeals({ limit, offset, deal_type:'BUY_N_FOR_FIXED' });
            if (response.status === ServerActionStatus.SUCCESS && response.data) {
                setDeals(response.data.deals);
                setTotalPages(response.data.pagination.total_pages);
            }
            setLoading(false);
        };
        fetchDeals();
    }, [currentPage]);
    const breadcrumbs = [
        { label: "Home", href: "/" },
        { label: "Deals", href: "/deals", isActive: true },
    ];
    return (
        <main className='flex flex-col'>
            <section className="product-listing-container flex-col py-8">
                <BreadCrumbs items={breadcrumbs} />
                <div className='space-y-4 mt-4'>
                    <h1 className='primary-gradient-600 text-h5 md:text-h2 font-semibold w-fit'>Shop a Deal</h1>
                    <h2 className="text-content-2 md:text-title-1 text-skin-neutral-300 font-semibold">Fantastic deals, all year round!</h2>
                </div>
            </section>
            <section className='border-t border-skin-neutral-200 product-listing-container py-8'>
                {loading ? (
                    <div className="flex justify-center items-center min-h-[400px]">
                        <p className="text-skin-neutral-300 text-lg">Loading deals...</p>
                    </div>
                ) : deals.length > 0 ? (
                    <>
                        <div className="grid grid-cols-2 sm:grid-cols-2 w-full gap-6">
                            {deals.map((deal) => (
                                <DealCard
                                    key={deal.id}
                                    title={deal.name}
                                    imageSrc={deal.image_url || ""}
                                    altText={deal.name}
                                    href={`/product-deals/${deal.slug.replace(/ /g, '-')}`}
                                />
                            ))}
                        </div>
                        
                    </>
                ) : (
                    <div className="flex justify-center items-center min-h-[400px]">
                        <p className="text-skin-neutral-300 text-lg">No deals available</p>
                    </div>
                )}
            </section>
            {totalPages > 1 && (
                            <div className="flex justify-center mt-8">
                                <Pagination
                                    total={totalPages}
                                    initialPage={1}
                                    page={currentPage}
                                    onChange={setCurrentPage}
                                    showControls
                                    classNames={{
                                        cursor: "bg-skin-primary-500 text-white",
                                    }}
                                />
                            </div>
                        )}
        </main>
    );
};

export default AllDealsPage; 