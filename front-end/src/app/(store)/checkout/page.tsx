import { ReactElement } from 'react'
import { ServerActionStatus } from '@/lib/config/app.config'
import { getShippingMethods } from '@/lib/server.actions'
import { SHIPPING_METHOD_DATA } from '@/lib/config/order.config'
import CheckoutPageClient from './_components/CheckoutPageClient'

const CheckoutPage = async (): Promise<ReactElement> => {
  const response = await getShippingMethods()

  const shippingMethods: SHIPPING_METHOD_DATA[] =
    response.status === ServerActionStatus.SUCCESS ? response.data || [] : []

  return <CheckoutPageClient initialShippingMethods={shippingMethods} />
}

export default CheckoutPage
