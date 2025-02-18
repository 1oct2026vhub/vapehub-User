import { FilterIcon2, SearchIcon } from '@/components/Icons'
import InputForm from '@/components/InputForm'
import SectionHeading from '@/components/ui/SectionHeading'
import { Button } from '@nextui-org/button'
import { NextPage } from 'next'
import React, { ReactElement } from 'react'
import OrderListCard from './_components/OrderListCard'

const orders = [
  {
    status: "Order Confirmed",
    imageSrc: "/images/product-1.png",
    title: "RandM Tornado 9000 Puff Disposable Vape - Watermelon Skittles",
    orderId: "02456KS566JD444",
  },
  {
    status: "Delivered",
    imageSrc: "/images/product-1.png",
    title: "RandM Tornado 9000 Puff Disposable Vape - Watermelon Skittles",
    orderId: "02456KS566JD444",
  },
  {
    status: "Delivered",
    imageSrc: "/images/product-1.png",
    title: "RandM Tornado 9000 Puff Disposable Vape - Watermelon Skittles",
    orderId: "02456KS566JD444",
  },
  
];

const OrdersListingPage: NextPage = (): ReactElement => {
  return (
    <main className='px-4 lg:px-9 xl:px-12.5 pt-5 pb-10 flex flex-col gap-6 lg:gap-10'>
      <section className='flex items-center flex-wrap justify-between gap-6'>
        <SectionHeading title='My Orders' className='w-fit max-md:!text-h5' />
        <div className='flex items-center gap-5'>
          <InputForm
            type='text'
            placeholder='Search your order here'
            className='w-full'
            startContent={<SearchIcon />}
          />
          <Button
            size='md'
            radius="sm"
            isIconOnly
            startContent={<FilterIcon2 />}
            className='bg-primary-gradient-100'
          />
        </div>
      </section>
      <section className='flex flex-col gap-4'>
        {orders.map((order, index) => (
          <OrderListCard key={index} {...order} />
        ))}
      </section>
    </main>
  )
}

export default OrdersListingPage
