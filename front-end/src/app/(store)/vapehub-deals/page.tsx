'use client'

import BreadCrumbs from '@/components/BreadCrumbs';
import { NextPage } from 'next'
import React from 'react'
import Disposables from './_components/Disposables';
import NicSalts from './_components/NicSalts';
import ShortFills from './_components/ShortFills';
import Pods from './_components/Pods';

const VapehubDeals: NextPage = () => {

    const breadcrumbs = [
        { label: "Home", href: "/" },
        { label: "Deals", href: "/vapehub-deals", isActive: true },
    ];

    return (
        <main className='flex flex-col'>
            <section className="product-listing-container flex-col">
                <BreadCrumbs items={breadcrumbs} />
                <div className='space-y-4'>
                    <h1 className='primary-gradient-600 text-h5 md:text-h3 font-bold w-fit'>Vapehub Deals</h1>
                    <div className="text-content-2 md:text-content-1 font-semibold md:font-bold text-skin-neutral-400">
                        <p>
                            We understand that there is nothing better than a good deal, therefore at Vapehub we offer a variety of deals that offer great savings when purchasing your favourite products from your favourite brands! Some of our multibuy deals are literally the cheapest in the market!
                        </p>
                        <p>
                            If you see a multibuy deal advertised with a product on any page, in order for the saving or discount to be applied, the product(s) must be added to the basket and checkout must be initiated.
                        </p>
                    </div>
                </div>
            </section>
            <section className='border-t border-skin-neutral-200 product-listing-container flex flex-col !gap-7 lg:!gap-12.5'>
                <Disposables />
                <NicSalts/>
                <ShortFills />
                <Pods />
            </section>
        </main>
    )
}

export default VapehubDeals
