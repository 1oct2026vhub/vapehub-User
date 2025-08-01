'use client'

import React, { useEffect, useState } from 'react';
import { NextPage } from 'next';
import BreadCrumbs from '@/components/BreadCrumbs';
import DealCard from '@/components/DealCard';
import { Deal } from '@/lib/config/deal.config';
import { getAllDeals } from '@/lib/server.actions';
import { ServerActionStatus } from '@/lib/config/app.config';

const AllDealsPage: NextPage = () => {
    const [deals, setDeals] = useState<Deal[]>([]);

    useEffect(() => {
        const fetchDeals = async () => {
            const response = await getAllDeals({ limit: 50, offset: 0,deal_type:'BUY_N_FOR_FIXED' });
            if (response.status === ServerActionStatus.SUCCESS && response.data) {
                setDeals(response.data.deals);
            }
        };
        fetchDeals();
    }, []);

    const breadcrumbs = [
        { label: "Home", href: "/" },
        { label: "Deals", href: "/deals", isActive: true },
    ];
    return (
        <main className='flex flex-col'>
            <section className="product-listing-container flex-col py-8">
                <BreadCrumbs items={breadcrumbs} />
                <div className='space-y-4 mt-4'>
                    <h1 className='primary-gradient-600 text-h5 md:text-h3 font-bold w-fit'>Shop a Deal</h1>
                    <h2 className="text-content-2 md:text-title-1 text-skin-neutral-300 font-semibold">Fantastic deals, all year round!</h2>
                </div>
            </section>
            <section className='border-t border-skin-neutral-200 product-listing-container py-8'>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
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
            </section>
        </main>
    );
};

export default AllDealsPage; 