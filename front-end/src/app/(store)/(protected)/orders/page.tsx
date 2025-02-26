import { FilterIcon2, SearchIcon } from '@/components/Icons'
import InputForm from '@/components/InputForm'
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
        <h1 className='primary-gradient-600 text-h5 md:text-h3 font-bold w-fit'>My Orders</h1>
        <div className='flex items-center gap-5 max-sm:w-full'>
          <InputForm
            type='text'
            placeholder='Search your order here'
            className='w-full'
            classNames={{
              mainWrapper: 'w-full'
            }}
            startContent={<SearchIcon />}
          />
          <Button
            size='md'
            radius="sm"
            isIconOnly
            startContent={<FilterIcon2 />}
            className='bg-primary-gradient-100 max-sm:h-11 !w-11 max-sm:min-w-11'
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
