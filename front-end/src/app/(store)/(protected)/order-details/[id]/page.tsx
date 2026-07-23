import { NextPage } from 'next'
import React from 'react'
import OrderDetails from '../_components/OrderDetails'
import OrderActions from '../_components/OrderActions'
import OrderDetailCard from '../_components/OrderDetailCard'
import { getOrderById, getProductVariantByID } from '@/lib/server.actions';
import { notFound } from 'next/navigation'
import { redirectIfUnauthenticated } from '@/lib/config/auth.config'
import { AsyncReactElement, ServerActionStatus } from '@/lib/config/app.config'
import EmptyPlaceholder from '@/components/ui/EmptyPlaceholder'
import { ORDER_STATUS } from '@/lib/config/order.config'
import OrderPaymentAction from '../_components/OrderPaymentAction'
import Link from 'next/link'
import { ROUTES } from '@/lib/routes'
import { shouldHideVariantSelector } from '@/lib/utils/cart-product-url'

/** Resolve hide_variant_selector per product (order payload does not include this flag). */
async function resolveHideVariantFlags(
    orderItems: { product: { id: number } }[],
): Promise<Record<number, boolean>> {
    const uniqueProductIds = [...new Set(orderItems.map((item) => item.product.id))];
    const flags: Record<number, boolean> = {};

    await Promise.all(
        uniqueProductIds.map(async (productId) => {
            try {
                const response = await getProductVariantByID({
                    product_id: productId,
                    attribute_terms: [],
                });
                if (response.status === ServerActionStatus.SUCCESS && response.data?.product) {
                    // Prefer the API flag directly for order display; attribute_terms may still
                    // list the dummy variation even when the selector is hidden on the PDP.
                    flags[productId] =
                        response.data.product.hide_variant_selector === true ||
                        shouldHideVariantSelector(response.data.product);
                    return;
                }
            } catch {
                // Fall through — leave flag unset (show attributes as before).
            }
            flags[productId] = false;
        }),
    );

    return flags;
}

const OrdersListingPage: NextPage<{ params: Promise<{ id: string }> }> = async ({ params }): AsyncReactElement => {
    const { id } = await params;
   
    // UN AUTHORIZED USER REDIRECT TO LOGIN PAGE
    await redirectIfUnauthenticated();

    if (!id) {
        return notFound();
    }
    const response = await getOrderById(Number(id));

    if (response.status === ServerActionStatus.ERROR) {
        return <EmptyPlaceholder title="Order not found" description="The order you are looking for does not exist." />;
    }
    const result = response.data;
    const hideVariantFlags = await resolveHideVariantFlags(result.order.orderItems);

    return (
        <main className='px-4 lg:px-9 xl:px-12.5 pt-7.5 pb-10 flex flex-col gap-6 lg:gap-10'>


            <div className='flex justify-between items-center'>
                <h1 className='primary-gradient-600 text-h5 md:text-h2 font-semibold w-fit'>My Order</h1>
                {
                    result.order.status === ORDER_STATUS.PENDING && (
                       <OrderPaymentAction orderId={Number(id)} />
                    )
                }
            </div>
            <section className='flex flex-col gap-4'>
                <div className='bg-skin-white p-4 shadow-card rounded-md md:rounded-lg flex flex-col md:flex-row  items-start'>
                    <OrderDetails data={result.order} referral={result.referral} />              
                    <OrderActions
                        orderId={Number(id)}
                        orderItems={result.order.orderItems}
                        status={result.order.status}
                        hideVariantFlags={hideVariantFlags}
                    />
                <div className='mt-6 md:mt-0 md:ml-8 flex-shrink-0'>
                <Link
                    href={ROUTES.REFERRAL}
                    className="inline-block bg-primary px-3 py-1.5 text-h5 text-white font-semibold rounded-md uppercase font-oswald shadow hover:bg-skin-accent-500 transition-colors duration-200"
                >
                    Refer a Friend
                </Link>
               </div>
                </div>
                {
                    result.order.orderItems.map((item) => (
                        <OrderDetailCard
                            key={item.id}
                            status={result.order.status}
                            isCouponApplied={result.order.coupon}
                            data={item}
                            hideVariantDetails={hideVariantFlags[item.product.id] === true}
                        />
                    ))
                }
            </section>
        </main>
    )
}

export default OrdersListingPage
