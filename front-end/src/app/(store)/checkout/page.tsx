'use client'

import { NextPage } from 'next'
import React, { ReactElement, useEffect } from 'react'
import ProductList from './_components/ProductList'
import CartTotal from './_components/CartTotal'
import FeatureCards from '../(dashboard)/_components/FeatureCards'
import Subscription from '../(dashboard)/_components/Subscription'
import CheckoutDetails from './_components/CheckoutDetails'
import { CheckoutProvider } from '@/lib/context/CheckoutContext'
import { AddressProvider } from '@/lib/context/AddressContext'
import { useCart } from '@/lib/context/CartContext'
import EmptyPlaceholder from '@/components/ui/EmptyPlaceholder'
import { useRouter } from 'next/navigation'
import { useSession } from 'next-auth/react'
import { ROUTES } from '@/lib/routes'
import { getReviewOrderByProductId } from '@/lib/server.actions'
import { ServerActionResponse, ServerActionStatus } from '@/lib/config/app.config'
import { REVIEW_ORDER_RESPONSE } from '@/lib/config/order.config'
import { useFeatureData } from '@/lib/hooks/useFeatureData'

const CheckoutPage: NextPage = (): ReactElement => {

    const { itemCount, cartItems } = useCart();
    const { status } = useSession();
    const router = useRouter();
    const { features } = useFeatureData();
    const [reviews, setReviews] = React.useState<ServerActionResponse<REVIEW_ORDER_RESPONSE>[]>([]);

    useEffect(() => {
        if (status === 'unauthenticated') {
            router.replace(ROUTES.MY_ACCOUNT);
        }
    }, [status, router]);

    useEffect(() => {
        const fetchReviews = async () => {
            const reviewPromises = cartItems.map(item => getReviewOrderByProductId(item.product_id, 1, 1));
            const reviewResponses = await Promise.all(reviewPromises);
            setReviews(reviewResponses.filter(r => r.status === ServerActionStatus.SUCCESS));
        }
        if(cartItems.length > 0) fetchReviews();
    }, [cartItems]);

    if (status === 'loading') {
        return <div className='text-center font-bold h-scree'>Loading...</div>;
    }

    if (status === 'unauthenticated') {
        return <div className='text-center font-bold h-screen'>Redirecting to login...</div>;
    }

    if (itemCount === 0) {
        return (
            <main className='px-4 lg:px-9 xl:px-12.5 pt-5 pb-10 flex flex-col gap-7 lg:gap-10'>
                <h1 className='primary-gradient-600 text-h5 md:text-h3 font-bold w-fit'>Checkout</h1>
                <div className='text-center py-10'>
                    <EmptyPlaceholder
                        title="No items in cart"
                        description="Add items to your cart to proceed with checkout."
                    />
                </div>
                <FeatureCards features={features || undefined} />
                <Subscription />
            </main>
        )
    }

    return (
        <CheckoutProvider>
            <AddressProvider>
                <main className='px-4 lg:px-9 xl:px-12.5 pt-5 pb-10 flex flex-col gap-7 lg:gap-10'>
                    <h1 className='primary-gradient-600 text-h5 md:text-h3 font-bold w-fit'>Checkout</h1>
                    <section className='flex items-start flex-col-reverse lg:flex-row gap-5 xl:gap-7.5'>
                        <CheckoutDetails />
                        <div className='flex flex-col gap-6 md:gap-7 w-full xl:max-w-[584px]'>
                            {/* product list */}
                            <ProductList reviews={reviews} />
                            <CartTotal />
                        </div>
                    </section>
                    <FeatureCards features={features || undefined} />
                    <Subscription />
                </main>
            </AddressProvider>
        </CheckoutProvider>
    )
}

export default CheckoutPage
