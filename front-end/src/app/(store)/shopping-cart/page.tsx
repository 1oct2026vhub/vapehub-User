'use client'

import ShoppingCartCard from '@/components/ShoppingCartCard'
import { NextPage } from 'next'
import React, { ReactElement } from 'react'
import CartDetails from './_components/CartDetails'
import FeatureCards from '../(dashboard)/_components/FeatureCards'
import Subscription from '../(dashboard)/_components/Subscription'

const ShoppingCartPage: NextPage = (): ReactElement => {
    return (
        <main className='px-4 lg:px-9 xl:px-12.5 pt-5 pb-10 flex flex-col gap-7 lg:gap-10'>
            <h1 className='primary-gradient-600 text-h5 md:text-h3 font-bold w-fit'>Shopping Cart</h1>
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
