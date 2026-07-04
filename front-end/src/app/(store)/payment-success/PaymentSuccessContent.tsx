'use client'

import { useEffect, useState, useMemo, useRef } from 'react'
import { useSearchParams } from 'next/navigation'
import { ROUTES } from '@/lib/routes'
import { DEFAULT_CURRENCY_SYMBOL, ServerActionStatus } from '@/lib/config/app.config'
import { getTransactionDetails, worldpayPaymentSuccess } from '@/lib/server.actions'
import { toast } from 'sonner'
import { Button } from '@nextui-org/button'
import Image from 'next/image'
import { useSession } from 'next-auth/react'
import Link from 'next/link'
import { useCart } from '@/lib/context/CartContext'

/** Map common ISO codes to storefront symbol; otherwise show code + space before amount. */
function currencyLabelFromParam(code: string | null): string {
  if (!code) return DEFAULT_CURRENCY_SYMBOL
  const upper = code.trim().toUpperCase()
  if (upper === 'GBP') return DEFAULT_CURRENCY_SYMBOL
  return `${upper} `
}

const WORLDPAY_LOCK_ATTR = 'data-worldpay-payment-lock'

const PaymentSuccessContent = () => {
  const searchParams = useSearchParams()
  const queryKey = useMemo(() => searchParams.toString(), [searchParams])
  const { status } = useSession()
  const { clearCart } = useCart()
  const [transactionDetails, setTransactionDetails] = useState({
    id: '',
    amount: 0,
    method: 'Online',
    date: new Date().toLocaleDateString('en-GB'),
    time: new Date().toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' }),
    currencyLabel: DEFAULT_CURRENCY_SYMBOL,
  })
  const [isVerifyingPayment, setIsVerifyingPayment] = useState(true)
  const clearCartRef = useRef(clearCart)
  clearCartRef.current = clearCart

  useEffect(() => {
    return () => {
      document.documentElement.removeAttribute(WORLDPAY_LOCK_ATTR)
    }
  }, [])

  useEffect(() => {
    let cancelled = false

    const verifyPayment = async () => {
      try {
        const transactionId = searchParams.get('t')
        const sessionId = searchParams.get('s')
        const orderCode = searchParams.get('orderCode')?.trim() || null
        const currency = searchParams.get('currency')?.trim() || null
        const amountRaw = searchParams.get('amount')?.trim() || null

        const isWorldpayPayment = Boolean(orderCode && currency && amountRaw)
        const isVivaWalletPayment = Boolean(transactionId && sessionId)

        if (!isWorldpayPayment && !isVivaWalletPayment) {
          console.error('Missing required payment parameters for both Worldpay and Viva Wallet')
          if (!cancelled) {
            toast.error('Missing payment details. If you completed a payment, check your email or contact support.')
            setIsVerifyingPayment(false)
          }
          return
        }

        if (isWorldpayPayment && orderCode && currency && amountRaw) {
          const amountParsed = parseFloat(amountRaw)
          if (!Number.isFinite(amountParsed) || amountParsed < 0) {
            if (!cancelled) {
              toast.error('Invalid payment amount in link. Please contact support.')
              setIsVerifyingPayment(false)
            }
            return
          }

          const currencyLabel = currencyLabelFromParam(currency)
          const newTransactionDetails = {
            id: orderCode,
            method: 'Worldpay',
            amount: amountParsed,
            currencyLabel,
          }
          if (!cancelled) {
            setTransactionDetails((prev) => ({
              ...prev,
              ...newTransactionDetails,
            }))
          }

          if (!cancelled) {
            document.documentElement.setAttribute(WORLDPAY_LOCK_ATTR, 'true')
          }

          try {
            const worldpayResponse = await worldpayPaymentSuccess({
              orderCode,
              currency,
              amount: amountParsed,
            })
            console.log('Worldpay payment success response:', worldpayResponse)
            if (cancelled) return

            if (worldpayResponse && typeof worldpayResponse === 'object') {
              if (worldpayResponse.status === ServerActionStatus.SUCCESS) {
                clearCartRef.current()
                toast.success('Payment processed successfully!')
              } else {
                const isStockValidationError =
                  worldpayResponse.message?.includes('stock') ||
                  worldpayResponse.message?.includes('Validation min on stock')

                if (isStockValidationError) {
                  clearCartRef.current()
                  toast.success('Payment completed successfully! (Stock validation completed)')
                } else {
                  toast.error(
                    worldpayResponse.message ||
                      'We could not confirm your order. Please check your orders or contact support.'
                  )
                }
              }
            } else {
              toast.error('Unexpected response while confirming payment. Please contact support.')
            }

            setIsVerifyingPayment(false)
            return
          } catch (apiError) {
            if (cancelled) return
            console.error('Worldpay API call failed:', apiError)
            toast.error('Could not reach the server to confirm payment. Your bank may still have charged you — please contact support.')
            setIsVerifyingPayment(false)
            return
          } finally {
            document.documentElement.removeAttribute(WORLDPAY_LOCK_ATTR)
          }
        }

        if (isVivaWalletPayment && transactionId && sessionId) {
          try {
            const response = await getTransactionDetails(transactionId)
            if (cancelled) return

            if (response && typeof response === 'object') {
              if (response.status === ServerActionStatus.SUCCESS) {
                clearCartRef.current()
                toast.success('Payment processed successfully!')
                const newTransactionDetails = {
                  id: transactionId,
                  method: response.data.payment_method,
                  amount: response.data.amount,
                  currencyLabel: DEFAULT_CURRENCY_SYMBOL,
                }
                setTransactionDetails((prev) => ({
                  ...prev,
                  ...newTransactionDetails,
                }))
              } else {
                const newTransactionDetails = {
                  id: transactionId,
                  method: 'Viva Wallet',
                  amount: 0,
                  currencyLabel: DEFAULT_CURRENCY_SYMBOL,
                }
                setTransactionDetails((prev) => ({
                  ...prev,
                  ...newTransactionDetails,
                }))
                toast.error(
                  response.message ||
                    'We could not load transaction details. If you were charged, please contact support.'
                )
              }
            } else {
              const newTransactionDetails = {
                id: transactionId,
                method: 'Viva Wallet',
                amount: 0,
                currencyLabel: DEFAULT_CURRENCY_SYMBOL,
              }
              setTransactionDetails((prev) => ({
                ...prev,
                ...newTransactionDetails,
              }))
              toast.error('Unexpected response while loading payment details.')
            }

            setIsVerifyingPayment(false)
            return
          } catch (apiError) {
            if (cancelled) return
            console.error('Viva Wallet API call failed:', apiError)
            const newTransactionDetails = {
              id: transactionId,
              method: 'Viva Wallet',
              amount: 0,
              currencyLabel: DEFAULT_CURRENCY_SYMBOL,
            }
            setTransactionDetails((prev) => ({
              ...prev,
              ...newTransactionDetails,
            }))
            toast.error('Could not load transaction details. If you were charged, please contact support.')
            setIsVerifyingPayment(false)
            return
          }
        }
      } catch (error) {
        if (cancelled) return
        console.error('Payment verification error:', error)
        toast.error('Failed to verify payment. Please contact support.')
        setIsVerifyingPayment(false)
      }
    }

    void verifyPayment()

    return () => {
      cancelled = true
    }
  }, [queryKey])

  if (isVerifyingPayment) {
    return (
      <div className="auth-form-container md:!py-[84px]">
        <div className="auth-form-wrapper !space-y-0 !rounded-2xl !max-w-[600px] !p-5 !gap-5">
          <div className="text-center space-y-2">
            <p className="text-content-1 font-semibold">Verifying payment.</p>
            <p className="text-content-2 text-skin-neutral-300 font-medium">
              Please do not close or refresh this window. This may take a few seconds while we confirm your order.
            </p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="auth-form-container md:!py-[84px]">
      <div className="auth-form-wrapper !space-y-0 !rounded-2xl !max-w-[600px] !p-5 !gap-5">
        <div className="space-y-3.5 text-center w-full">
          <Image
            src="/images/payment-success.svg"
            alt="payment success"
            width={200}
            height={200}
            className="mx-auto aspect-square max-sm:max-w-32"
          />
          <h1 className="mx-auto text-title-2 md:text-xl text-skin-neutral-300 font-bold">Puff, Paid, Perfect!</h1>
          <p className="text-content-2 md:text-content-1 text-center font-bold text-skin-neutral-300 mx-auto max-w-[406px]">
            Payment completed. Your next puff is on its way.
          </p>
        </div>

        <div className="py-5 border-t border-b border-skin-neutral-100 w-full space-y-3.5">
          <div className="flex items-start justify-between gap-2 text-content-2 font-bold text-skin-neutral-300 leading-none capitalize">
            <p className="text-nowrap">Transaction ID</p>
            <p className="break-all text-right">{transactionDetails.id}</p>
          </div>
          <div className="flex items-center justify-between gap-2 text-content-2 font-bold text-skin-neutral-300 leading-none capitalize">
            <p>Amount Paid</p>
            <p>
              {transactionDetails.currencyLabel}
              {Number.isFinite(transactionDetails.amount) ? transactionDetails.amount.toFixed(2) : '0.00'}
            </p>
          </div>
          <div className="flex items-center justify-between gap-2 text-content-2 font-bold text-skin-neutral-300 leading-none capitalize">
            <p>Payment Method</p>
            <p>{transactionDetails.method}</p>
          </div>
          <div className="flex items-center justify-between gap-2 text-content-2 font-bold text-skin-neutral-300 leading-none capitalize">
            <p>Date</p>
            <p>{transactionDetails.date}</p>
          </div>
          <div className="flex items-center justify-between gap-2 text-content-2 font-bold text-skin-neutral-300 leading-none capitalize">
            <p>Time</p>
            <p>{transactionDetails.time}</p>
          </div>
        </div>

        {status === 'authenticated' ? (
          <Button
            as={Link}
            href={ROUTES.MY_ACCOUNT_ORDERS}
            size="lg"
            radius="md"
            color="primary"
            className="btn primary-btn shadow-input text-content-1 !font-semibold !font-oswald h-11 mx-auto"
          >
            View Orders
          </Button>
        ) : (
          <Button
            as={Link}
            href={ROUTES.WELCOME}
            size="lg"
            radius="md"
            color="primary"
            className="btn primary-btn shadow-input text-content-1 !font-semibold !font-oswald h-11 mx-auto"
          >
            Continue Shopping
          </Button>
        )}
      </div>
    </div>
  )
}

export default PaymentSuccessContent
