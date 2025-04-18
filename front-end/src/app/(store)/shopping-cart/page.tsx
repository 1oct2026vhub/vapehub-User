'use client'

import ShoppingCartCard from '@/components/ShoppingCartCard'
import { NextPage } from 'next'
import React, { ReactElement } from 'react'
import CartDetails from './_components/CartDetails'
import FeatureCards from '../(dashboard)/_components/FeatureCards'
import Subscription from '../(dashboard)/_components/Subscription'
import { useCart } from '@/lib/context/CartContext'
import Link from 'next/link'
import { ROUTES } from '@/lib/routes'

const ShoppingCartPage: NextPage = (): ReactElement => {
    const { cartItems } = useCart();
    if (cartItems.length === 0) {
        return (
            <main className="flex flex-col items-center justify-center gap-6 py-20">
                <h2 className="text-h4 md:text-h3 text-skin-neutral-700 font-bold text-center">
                    Your shopping cart is empty
                </h2>
                <p className="text-content-2 text-skin-neutral-600 text-center">
                    Add items to your cart to continue shopping
                </p>
                <Link 
                    href={ROUTES.SHOP}
                    className="bg-primary-gradient-100 hover:bg-skin-primary-600 text-white font-semibold py-3 px-6 rounded-lg transition-colors"
                >
                    Continue Shopping
                </Link>
            </main>
        );
    }
    return (
        <main className='px-4 lg:px-9 xl:px-12.5 pt-5 pb-10 flex flex-col gap-7 lg:gap-10'>
            <h1 className='primary-gradient-600 text-h5 md:text-h3 font-bold w-fit'>Shopping Cart</h1>
            <section className='flex items-start flex-col-reverse lg:flex-row gap-6 xl:gap-10'>
                <div className='flex flex-col gap-3.5 md:gap-7.5 w-full'>
                    {
                        cartItems.map((item, idx) => (
                            <ShoppingCartCard key={idx} showAddMoreItem item={item} />
                        ))
                    }
                    
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
