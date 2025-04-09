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

const OrdersListingPage: NextPage<{params: Promise<{id: string}>}> = async ({params}):AsyncReactElement => {
    const {id} = await params;
    // UN AUTHORIZED USER REDIRECT TO LOGIN PAGE
    await redirectIfUnauthenticated();

    if(!id) {
        return notFound();
    }
    const order = await getOrderById(Number(id));
    if(order.status === ServerActionStatus.ERROR) {
        return <EmptyPlaceholder title="Order not found" description="The order you are looking for does not exist." />;
    }
    return (
        <main className='px-4 lg:px-9 xl:px-12.5 pt-5 pb-10 flex flex-col gap-6 lg:gap-10'>
            <h1 className='primary-gradient-600 text-h5 md:text-h3 font-bold w-fit'>My Order</h1>
            <section className='flex flex-col gap-4'>
                <div className='bg-skin-white p-4 shadow-card rounded-14 flex flex-col md:flex-row gap-7 items-start'>
                    <OrderDetails data={order.data} />
                    <OrderActions />
                </div>
                {
                    order.data.orderItems.map((item) => (
                        <OrderDetailCard key={item.id} status={order.data.status} isCouponApplied={order.data.coupon} data={item} />
                    ))
                }
            </section>
        </main>
    )
}

export default OrdersListingPage
