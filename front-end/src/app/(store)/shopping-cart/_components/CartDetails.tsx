'use client'
import ShippingProgress from '@/components/ShippingProgress'
import { DEFAULT_CURRENCY_SYMBOL, ServerActionStatus } from '@/lib/config/app.config'
import { useCart } from '@/lib/context/CartContext'
import { ROUTES } from '@/lib/routes'
import { checkout } from '@/lib/server.actions'
import { Button, Divider } from '@nextui-org/react'
import { useRouter } from 'next/navigation'
import React, { useEffect, useMemo, useState } from 'react'
import { toast } from 'sonner'
import { useSession } from 'next-auth/react'
import CouponForm from '@/components/CouponForm'
import { SHIPPING_METHOD_DATA } from '@/lib/config/order.config'
import { FREE_DELIVERY_THRESHOLD } from '@/lib/utils'
import { calculateOrderGrandTotal, deriveShippingMethodsForCheckout } from '@/lib/utils/checkout-order.utils'

interface CartDetailsProps {
  shippingMethodsData: SHIPPING_METHOD_DATA[]
}

const CartDetails: React.FC<CartDetailsProps> = ({ shippingMethodsData }) => {
  const { status } = useSession()
  const {
    cartTotal,
    itemCount,
    couponDiscount,
    setCouponDiscount,
    checkoutStockValidation,
    stockValidationLoading,
    setIsRemoveCoupon,
    loyaltyRedemption,
    setShippingMethodIdForCoupon,
  } = useCart()
  const router = useRouter()
  const [selectedShippingMethod, setSelectedShippingMethod] = useState<SHIPPING_METHOD_DATA | null>(null)

  const couponForTotals = useMemo(
    () => ({
      isApplied: couponDiscount.isApplied,
      value: couponDiscount.value,
      mailSubscriptionDiscount: couponDiscount.mailSubscriptionDiscount,
    }),
    [couponDiscount.isApplied, couponDiscount.value, couponDiscount.mailSubscriptionDiscount]
  )

  const loyaltyForTotals = useMemo(
    () => ({
      isRedeemed: loyaltyRedemption.isRedeemed,
      discountValue: loyaltyRedemption.discountValue,
    }),
    [loyaltyRedemption.isRedeemed, loyaltyRedemption.discountValue]
  )

  const filteredSortedMethods = useMemo(
    () =>
      deriveShippingMethodsForCheckout(
        shippingMethodsData,
        cartTotal,
        couponForTotals,
        loyaltyForTotals
      ).filteredSortedMethods,
    [shippingMethodsData, cartTotal, couponForTotals, loyaltyForTotals]
  )

  useEffect(() => {
    if (!filteredSortedMethods.length) {
      setSelectedShippingMethod(null)
      return
    }
    setSelectedShippingMethod((prev) => {
      if (prev && filteredSortedMethods.some((m) => m.id === prev.id)) {
        return prev
      }
      return filteredSortedMethods[0]
    })
  }, [filteredSortedMethods])

  useEffect(() => {
    const shippingMethodId = selectedShippingMethod?.id ? Number(selectedShippingMethod.id) : 0
    setShippingMethodIdForCoupon(shippingMethodId)
  }, [selectedShippingMethod, setShippingMethodIdForCoupon])

  const freeShippingThreshold = useMemo(() => {
    if (!shippingMethodsData || shippingMethodsData.length === 0) {
      return FREE_DELIVERY_THRESHOLD
    }

    const freeShippingMethod = shippingMethodsData.find(
      (method) => (method.is_free_shipping ?? false) && method.free_shipping_threshold
    )

    if (freeShippingMethod?.free_shipping_threshold) {
      const thresholdValue = parseFloat(freeShippingMethod.free_shipping_threshold)
      return Number.isFinite(thresholdValue) && thresholdValue > 0
        ? thresholdValue
        : FREE_DELIVERY_THRESHOLD
    }

    return FREE_DELIVERY_THRESHOLD
  }, [shippingMethodsData])

  const hasEnabledFreeShipping = useMemo(() => {
    if (!shippingMethodsData || shippingMethodsData.length === 0) {
      return false
    }
    return shippingMethodsData.some(
      (method) => method.is_enabled === true && method.is_free_shipping === true
    )
  }, [shippingMethodsData])

  const handleCheckout = async () => {
    const isValid = await checkoutStockValidation()
    if (!isValid) {
      return
    }

    if (status !== 'authenticated') {
      router.push(ROUTES.CHECKOUT)
      return
    }

    const response = await checkout({ couponCode: couponDiscount.code || '' })
    if (response.status === ServerActionStatus.SUCCESS) {
      router.push(ROUTES.CHECKOUT)
    } else {
      console.error('[CartDetails] Checkout API error:', response.message)
      toast.error(response.message)
    }
  }

  const isAuthenticated = status === 'authenticated'

  const shippingCost = selectedShippingMethod
    ? parseFloat(selectedShippingMethod.shipping_cost || '0')
    : 0
  const safeShippingCost = Number.isFinite(shippingCost) ? shippingCost : 0

  const safeTotal = useMemo(
    () => calculateOrderGrandTotal(cartTotal, couponForTotals, loyaltyForTotals, safeShippingCost),
    [cartTotal, couponForTotals, loyaltyForTotals, safeShippingCost]
  )

  const shippingMethodIdForCouponForm = selectedShippingMethod?.id
    ? Number(selectedShippingMethod.id)
    : 0

  return (
    <div className="flex flex-col p-3 md:p-5 gap-3 bg-white border border-skin-neutral-100 rounded-14 w-full lg:w-4/6 xl:w-full xl:max-w-[584px]">
      <CouponForm
        onCouponApplied={(discount) => {
          setCouponDiscount(discount)
        }}
        initialCouponCode={couponDiscount.code || ''}
        cartTotal={cartTotal}
        isGuest={!isAuthenticated}
        shippingMethodId={shippingMethodIdForCouponForm}
      />
      {couponDiscount.isApplied && couponDiscount.code && (
        <div className="flex items-center justify-between text-skin-primary-400 text-content-3 md:text-content-1 font-bold">
          <div className="flex flex-col">
            <p>{couponDiscount.message}</p>
            <p>Coupon: {couponDiscount.code}</p>
          </div>
          <div className="flex items-center">
            <p>
              -{DEFAULT_CURRENCY_SYMBOL} {couponDiscount.discountValue}
            </p>
            <button
              className="text-red-500 hover:underline text-content-3 md:text-content-1 font-bold"
              onClick={() => setIsRemoveCoupon(true)}
            >
              [Remove]
            </button>
          </div>
        </div>
      )}
      {couponDiscount.mailSubscriptionData &&
        couponDiscount.mailSubscriptionData.isDiscountUsed === false &&
        couponDiscount.mailSubscriptionDiscount &&
        couponDiscount.mailSubscriptionDiscount > 0 && (
          <div className="flex items-center justify-between text-green-600 text-content-3 md:text-content-1 font-bold">
            <p>Mail Subscription Discount</p>
            <p>-{DEFAULT_CURRENCY_SYMBOL} {couponDiscount.mailSubscriptionDiscount.toFixed(2)}</p>
          </div>
        )}
      <Divider />
      <div className="space-y-1.5">
        <div className="flex items-center justify-between text-content-2 md:text-title-2 font-semibold">
          <p className="text-skin-neutral-500 !font-oswald">Number of Items</p>
          <p className="text-skin-neutral-300">{itemCount}</p>
        </div>
        <div className="flex items-center justify-between text-content-2 md:text-title-2 font-semibold">
          <p className="text-skin-neutral-500 !font-oswald">Subtotal</p>
          <p className="text-skin-neutral-300">
            {DEFAULT_CURRENCY_SYMBOL} {cartTotal.toFixed(2)}
          </p>
        </div>
      </div>
      <Divider />
      {hasEnabledFreeShipping && (
        <>
          <ShippingProgress
            totalAmount={safeTotal}
            freeShippingThreshold={freeShippingThreshold}
            shippingCost={safeShippingCost}
          />
          <Divider />
        </>
      )}
      <div className="flex items-center justify-between text-black font-semibold">
        <p className="text-content-2 md:text-2xl !font-oswald">Total</p>
        <p className="text-title-2 md:text-2xl !font-oswald">
          {DEFAULT_CURRENCY_SYMBOL}
          {safeTotal.toFixed(2)}
        </p>
      </div>
      <Button
        size="lg"
        radius="md"
        color="primary"
        className="w-full btn primary-btn shadow-button !text-skin-white !rounded-md uppercase text-content-1 md:text-2xl !py-1.5 !px-3"
        onPress={handleCheckout}
        isLoading={stockValidationLoading}
      >
        Checkout Now
      </Button>
    </div>
  )
}

export default CartDetails
