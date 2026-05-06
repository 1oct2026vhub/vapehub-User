import React from 'react';
import { NextPage } from 'next';
import BreadCrumbs from '@/components/BreadCrumbs';
import { getAllDeals } from '@/lib/server.actions';
import { ServerActionStatus } from '@/lib/config/app.config';
import AllDealsContentClient from './_components/AllDealsContentClient';

// Disable static generation for this page since it uses dynamic search params
export const dynamic = 'force-dynamic';

type AllDealsPageProps = {
    searchParams: Promise<Record<string, string | string[] | undefined>>;
};

const AllDealsPage: NextPage<AllDealsPageProps> = async ({ searchParams }) => {
    const params = await searchParams;
    const rawPage = params.page;
    const pageParam = typeof rawPage === "string" ? rawPage : Array.isArray(rawPage) ? rawPage[0] : "1";
    const parsedPage = Number.parseInt(pageParam ?? "1", 10);
    const currentPage = Number.isNaN(parsedPage) || parsedPage < 1 ? 1 : parsedPage;
    const limit = 10;
    const offset = (currentPage - 1) * limit;

    const dealsResponse = await getAllDeals({ limit, offset, deal_type: 'BUY_N_FOR_FIXED' });
    const initialDeals = dealsResponse.status === ServerActionStatus.SUCCESS && dealsResponse.data ? dealsResponse.data.deals : [];
    const initialTotalPages = dealsResponse.status === ServerActionStatus.SUCCESS && dealsResponse.data
        ? dealsResponse.data.pagination.total_pages
        : 1;

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
            <AllDealsContentClient
                initialDeals={initialDeals}
                initialPage={currentPage}
                initialTotalPages={initialTotalPages}
            />
        </main>
    );
};

export default AllDealsPage; 