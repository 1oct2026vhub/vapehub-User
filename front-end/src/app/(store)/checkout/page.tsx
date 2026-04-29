'use client'
import { NextPage } from 'next'
import React, { ReactElement, useEffect } from 'react'
import ProductList from './_components/ProductList'
import CartTotal from './_components/CartTotal'
import FeatureCards from '../(dashboard)/_components/FeatureCards'
import CheckoutDetails from './_components/CheckoutDetails'
import { CheckoutProvider } from '@/lib/context/CheckoutContext'
import { AddressProvider } from '@/lib/context/AddressContext'
import { useCart } from '@/lib/context/CartContext'
import EmptyPlaceholder from '@/components/ui/EmptyPlaceholder'
import { getReviewOrderByProductId, getShippingMethods } from '@/lib/server.actions'
import { ServerActionResponse, ServerActionStatus } from '@/lib/config/app.config'
import { REVIEW_ORDER_RESPONSE, SHIPPING_METHOD_DATA } from '@/lib/config/order.config'
import { useFeatureData } from '@/lib/hooks/useFeatureData'
import GoogleMapsScript from '@/components/GoogleMapsScript'

const CheckoutHeading = () => (
    <h1 className='primary-gradient-600 text-h5 md:text-h2 font-semibold w-fit'>Checkout</h1>
)

const CheckoutPage: NextPage = (): ReactElement => {

    const { itemCount, cartItems } = useCart();
    const { features } = useFeatureData();
    const [reviews, setReviews] = React.useState<ServerActionResponse<REVIEW_ORDER_RESPONSE>[]>([]);
    const [shippingMethods, setShippingMethods] = React.useState<SHIPPING_METHOD_DATA[]>([]);

    useEffect(() => {
        const fetchReviews = async () => {
            const reviewPromises = cartItems.map(item => getReviewOrderByProductId(item.product_id, 1, 1));
            const reviewResponses = await Promise.all(reviewPromises);
            setReviews(reviewResponses.filter(r => r.status === ServerActionStatus.SUCCESS));
        }
        if(cartItems.length > 0) fetchReviews();
    }, [cartItems]);

    useEffect(() => {
        const fetchShipping = async () => {
            const response = await getShippingMethods();
            if (response.status === ServerActionStatus.SUCCESS) {
                setShippingMethods(response.data || []);
            }
        };
        fetchShipping();
    }, []);

    if (itemCount === 0) {
        return (
            <main className='px-4 lg:px-9 xl:px-12.5 pt-5 pb-10 flex flex-col gap-7 lg:gap-10'>
                <CheckoutHeading />
                <div className='text-center py-10'>
                    <EmptyPlaceholder
                        title="No items in cart"
                        description="Add items to your cart to proceed with checkout."
                    />
                </div>
                <FeatureCards features={features || undefined} />
            </main>
        )
    }

    return (
        <CheckoutProvider>
            <AddressProvider>
                {/* Google Maps API Script - Loaded only on this page */}
                <GoogleMapsScript />
                <main className='px-4 lg:px-9 xl:px-12.5 pt-5 pb-10 flex flex-col gap-7 lg:gap-10'>
                    <CheckoutHeading />
                    <section className='flex items-start flex-col-reverse lg:flex-row gap-5 xl:gap-7.5'>
                        <CheckoutDetails shippingMethodsData={shippingMethods} />
                        <div className='flex flex-col gap-6 md:gap-7 w-full xl:max-w-[584px]'>
                            {/* product list */}
                            <ProductList reviews={reviews} />
                            <CartTotal shippingMethodsData={shippingMethods} />
                        </div>
                    </section>
                    <FeatureCards features={features || undefined} />
                </main>
            </AddressProvider>
        </CheckoutProvider>
    )
}

export default CheckoutPage
