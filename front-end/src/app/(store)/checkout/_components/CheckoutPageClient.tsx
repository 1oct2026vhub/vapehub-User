'use client'

import { NextPage } from 'next'
import React, { ReactElement } from 'react'
import ProductList from '../_components/ProductList'
import CartTotal from '../_components/CartTotal'
import FeatureCards from '../../(dashboard)/_components/FeatureCards'
import CheckoutDetails from '../_components/CheckoutDetails'
import { CheckoutProvider } from '@/lib/context/CheckoutContext'
import { AddressProvider } from '@/lib/context/AddressContext'
import { useCart } from '@/lib/context/CartContext'
import EmptyPlaceholder from '@/components/ui/EmptyPlaceholder'
import { getReviewOrderByProductId, getShippingMethods } from '@/lib/server.actions'
import { ServerActionResponse, ServerActionStatus } from '@/lib/config/app.config'
import { REVIEW_ORDER_RESPONSE, SHIPPING_METHOD_DATA } from '@/lib/config/order.config'
import { useFeatureData } from '@/lib/hooks/useFeatureData'
import GoogleMapsScript from '@/components/GoogleMapsScript'

type CheckoutPageClientProps = {
  initialShippingMethods: SHIPPING_METHOD_DATA[]
}

const CheckoutPageClient: NextPage<CheckoutPageClientProps> = ({
  initialShippingMethods,
}): ReactElement => {
  const { itemCount, cartItems } = useCart()
  const { features } = useFeatureData()
  const [reviews, setReviews] = React.useState<ServerActionResponse<REVIEW_ORDER_RESPONSE>[]>([])
  const [shippingMethods, setShippingMethods] = React.useState<SHIPPING_METHOD_DATA[]>(
    initialShippingMethods ?? []
  )

  const productIds = React.useMemo(
    () => Array.from(new Set(cartItems.map((item) => item.product_id))),
    [cartItems]
  )

  React.useEffect(() => {
    const fetchReviews = async () => {
      const reviewPromises = productIds.map((id) => getReviewOrderByProductId(id, 1, 1))
      const reviewResponses = await Promise.all(reviewPromises)
      setReviews(reviewResponses.filter((r) => r.status === ServerActionStatus.SUCCESS))
    }

    if (productIds.length > 0) {
      fetchReviews()
    } else {
      setReviews([])
    }
  }, [productIds])

  React.useEffect(() => {
    if (initialShippingMethods && initialShippingMethods.length > 0) return

    const fetchShipping = async () => {
      const response = await getShippingMethods()
      if (response.status === ServerActionStatus.SUCCESS) {
        setShippingMethods(response.data || [])
      }
    }

    fetchShipping()
  }, [initialShippingMethods])

  if (itemCount === 0) {
    return (
      <main className='px-4 lg:px-9 xl:px-12.5 pt-5 pb-10 flex flex-col gap-7 lg:gap-10'>
        <h1 className='primary-gradient-600 text-h5 md:text-h2 font-semibold w-fit'>Checkout</h1>
        <div className='text-center py-10'>
          <EmptyPlaceholder
            title='No items in cart'
            description='Add items to your cart to proceed with checkout.'
          />
        </div>
        <FeatureCards features={features || undefined} />
      </main>
    )
  }

  return (
    <CheckoutProvider>
      <AddressProvider>
        <GoogleMapsScript />
        <main className='px-4 lg:px-9 xl:px-12.5 pt-5 pb-10 flex flex-col gap-7 lg:gap-10'>
          <h1 className='primary-gradient-600 text-h5 md:text-h2 font-semibold w-fit'>
            Checkout
          </h1>
          <section className='flex items-start flex-col-reverse lg:flex-row gap-5 xl:gap-7.5'>
            <CheckoutDetails shippingMethodsData={shippingMethods} />
            <div className='flex flex-col gap-6 md:gap-7 w-full xl:max-w-[584px]'>
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

export default CheckoutPageClient

