'use client'

import { NextPage } from 'next'
import React, { ReactElement } from 'react'
import ProductList from './_components/ProductList'
import CartTotal from './_components/CartTotal'
import FeatureCards from '../(dashboard)/_components/FeatureCards'
import Subscription from '../(dashboard)/_components/Subscription'
import CheckoutDetails from './_components/CheckoutDetails'

const CheckoutPage: NextPage = (): ReactElement => {

    return (
        <main className='px-4 lg:px-9 xl:px-12.5 pt-5 pb-10 flex flex-col gap-7 lg:gap-10'>
            <h1 className='primary-gradient-600 text-h5 md:text-h3 font-bold w-fit'>Checkout</h1>
            <section className='flex items-start flex-col-reverse lg:flex-row gap-5 xl:gap-7.5'>
                <CheckoutDetails />
                <div className='flex flex-col gap-6 md:gap-7 w-full xl:max-w-[584px]'>
                    {/* product list */}
                    <ProductList />
                    <CartTotal />
                </div>
            </section>
            <FeatureCards />
            <Subscription />
        </main>
    )
}

export default CheckoutPage
