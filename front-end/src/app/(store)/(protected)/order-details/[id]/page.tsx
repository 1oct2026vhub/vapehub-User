import { NextPage } from 'next'
import React from 'react'
import OrderDetails from '../_components/OrderDetails'
import OrderActions from '../_components/OrderActions'
import OrderDetailCard from '../_components/OrderDetailCard'
import { getOrderById } from '@/lib/server.actions';
import { notFound } from 'next/navigation';
import { redirectIfUnauthenticated } from '@/lib/config/auth.config'
import { AsyncReactElement, ServerActionStatus } from '@/lib/config/app.config';
import EmptyPlaceholder from '@/components/ui/EmptyPlaceholder'
import { ORDER_STATUS } from '@/lib/config/order.config'
import OrderPaymentAction from '../_components/OrderPaymentAction'
import Link from 'next/link';
import { ROUTES } from '@/lib/routes';

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

    return (
        <main className='px-4 lg:px-9 xl:px-12.5 pt-7.5 pb-10 flex flex-col gap-6 lg:gap-10'>


            <div className='flex justify-between items-center'>
                <h1 className='primary-gradient-600 text-h5 md:text-h2 font-semibold w-fit'>My Order</h1>
                {
                    result.order.status === ORDER_STATUS.PENDING && (
                       <OrderPaymentAction
                           orderId={Number(id)}
                           order={result.order}
                           referral={result.referral}
                           userAddresses={result.user?.UserAddresses}
                       />
                    )
                }
            </div>
            <section className='flex flex-col gap-4'>
                <div className='bg-skin-white p-4 shadow-card rounded-md md:rounded-lg flex flex-col md:flex-row  items-start'>
                    <OrderDetails data={result.order} referral={result.referral} />              
                    <OrderActions orderId={Number(id)} orderItems={result.order.orderItems} status={result.order.status} />
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
                        <OrderDetailCard key={item.id} status={result.order.status} isCouponApplied={result.order.coupon} data={item} />
                    ))
                }
            </section>
        </main>
    )
}

export default OrdersListingPage
