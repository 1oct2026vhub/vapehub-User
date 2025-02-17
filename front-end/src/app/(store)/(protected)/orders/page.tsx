import { SearchIcon } from '@/components/Icons'
import InputForm from '@/components/InputForm'
import SectionHeading from '@/components/ui/SectionHeading'
import { NextPage } from 'next'
import React, { ReactElement } from 'react'

const OrdersListingPage: NextPage = (): ReactElement => {
  return (
    <main className='px-4 lg:px-9 xl:px-12.5 pt-5 pb-10 flex flex-col gap-6 lg:gap-10'>
      <div className='flex items-center flex-wrap justify-between gap-6'>
        <SectionHeading title='My Orders' />
        <div className='flex items-center gap-5'>
          <InputForm
            type='text'
            placeholder='Search your order here'
            className='w-full'
            startContent={<SearchIcon />}
          />
        </div>
      </div>
    </main>
  )
}

export default OrdersListingPage
