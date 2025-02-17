'use client'

import ShoppingCartCard from '@/components/ShoppingCartCard'
import SectionHeading from '@/components/ui/SectionHeading'
import { NextPage } from 'next'
import React, { ReactElement } from 'react'
import CartDetails from './_components/CartDetails'
import FeatureCards from '../(dashboard)/_components/FeatureCards'
import Subscription from '../(dashboard)/_components/Subscription'

const ShoppingCartPage: NextPage = (): ReactElement => {
    return (
        <main className='px-4 lg:px-9 xl:px-12.5 pt-5 pb-10 flex flex-col gap-7 lg:gap-10'>
            <SectionHeading title="Shopping Cart" className='w-fit max-md:!text-h5' />
            <section className='flex items-start flex-col-reverse lg:flex-row gap-6 xl:gap-10'>
                <div className='flex flex-col gap-3.5 md:gap-7.5'>
                    <ShoppingCartCard showAddMoreItem />
                    <ShoppingCartCard showAddMoreItem />
                    <ShoppingCartCard />
                    <ShoppingCartCard />
                    <ShoppingCartCard />
                    <ShoppingCartCard showAddMoreItem />
                    <ShoppingCartCard showAddMoreItem />
                </div>

                {/* Cart Details */}
                <CartDetails />
            </section>
            <FeatureCards />
            <Subscription />
        </main>
    )
}

export default ShoppingCartPage
