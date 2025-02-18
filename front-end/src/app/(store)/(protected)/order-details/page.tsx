import SectionHeading from '@/components/ui/SectionHeading'
import { NextPage } from 'next'
import React, { ReactElement } from 'react'
import OrderDetails from './_components/OrderDetails'
import OrderActions from './_components/OrderActions'
import OrderDetailCard from './_components/OrderDetailCard'


const OrdersListingPage: NextPage = (): ReactElement => {
    return (
        <main className='px-4 lg:px-9 xl:px-12.5 pt-5 pb-10 flex flex-col gap-6 lg:gap-10'>
            <SectionHeading title='My Order' className='w-fit max-md:!text-h5' />
            <section className='flex flex-col gap-4'>
                <div className='bg-skin-white p-4 shadow-card rounded-14 flex flex-col md:flex-row gap-7 items-start'>
                    <OrderDetails />
                    <OrderActions />
                </div>
                <OrderDetailCard />
            </section>
        </main>
    )
}

export default OrdersListingPage
