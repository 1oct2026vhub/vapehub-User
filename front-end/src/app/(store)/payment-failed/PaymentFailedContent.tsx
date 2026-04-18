'use client'

import { useEffect, useState, useMemo } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { ROUTES } from '@/lib/routes'
import { toast } from 'sonner'
import { Button } from '@nextui-org/button'
import Image from 'next/image'
import { DEFAULT_CURRENCY_SYMBOL, ServerActionStatus } from '@/lib/config/app.config'
import { getTransactionDetails, worldpayPaymentCancel } from '@/lib/server.actions'

function currencyLabelFromParam(code: string | null): string {
  if (!code) return DEFAULT_CURRENCY_SYMBOL
  const upper = code.trim().toUpperCase()
  if (upper === 'GBP') return DEFAULT_CURRENCY_SYMBOL
  return `${upper} `
}

function applyWorldpayUrlFallback(
  orderCode: string,
  currency: string,
  amountParsed: number | null
): {
  id: string
  method: string
  amount: number
  currencyLabel: string
} {
  return {
    id: orderCode,
    method: 'Worldpay',
    amount: amountParsed != null && Number.isFinite(amountParsed) ? amountParsed : 0,
    currencyLabel: currencyLabelFromParam(currency),
  }
}

const PaymentFailedContent = () => {
  const router = useRouter()
  const searchParams = useSearchParams()
  const queryKey = useMemo(() => searchParams.toString(), [searchParams])

  const [isVerifying, setIsVerifying] = useState(true)
  const [transactionDetails, setTransactionDetails] = useState({
    id: '',
    amount: 0,
    method: 'Online',
    date: new Date().toLocaleDateString('en-GB'),
    time: new Date().toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' }),
    currencyLabel: DEFAULT_CURRENCY_SYMBOL,
  })

  useEffect(() => {
    let cancelled = false

    const verifyPayment = async () => {
      try {
        const transactionId = searchParams.get('t')?.trim() || null
        const sessionId = searchParams.get('s')?.trim() || null
        const orderCode = searchParams.get('orderCode')?.trim() || null
        const currency = searchParams.get('currency')?.trim() || null
        const amountRaw = searchParams.get('amount')?.trim() || null

        const hasVivaWalletParams = Boolean(transactionId && sessionId)
        const hasWorldpayParams = Boolean(orderCode && currency && amountRaw)

        if (!hasVivaWalletParams && !hasWorldpayParams) {
          if (!cancelled) {
            toast.error('Missing payment details. You can return to checkout to try again.')
            setIsVerifying(false)
          }
          return
        }

        if (hasWorldpayParams && orderCode && currency && amountRaw) {
          const amountParsed = parseFloat(amountRaw)
          if (!Number.isFinite(amountParsed) || amountParsed < 0) {
            if (!cancelled) {
              toast.error('Invalid payment amount in link.')
              setTransactionDetails((prev) => ({
                ...prev,
                ...applyWorldpayUrlFallback(orderCode, currency, null),
              }))
              setIsVerifying(false)
            }
            return
          }

          if (!cancelled) {
            setTransactionDetails((prev) => ({
              ...prev,
              ...applyWorldpayUrlFallback(orderCode, currency, amountParsed),
            }))
          }

          try {
            const worldpayResponse = await worldpayPaymentCancel({
              orderCode,
              currency,
              amount: amountParsed,
            })
            if (cancelled) return

            if (worldpayResponse.status === ServerActionStatus.SUCCESS) {
              const nested = worldpayResponse.data?.data
              const orderDetails = nested?.order_details
              const id = nested?.order_code ?? orderCode
              const method = nested?.payment_method ?? 'Worldpay'
              const amt =
                orderDetails?.amount != null && Number.isFinite(Number(orderDetails.amount))
                  ? Number(orderDetails.amount)
                  : amountParsed

              setTransactionDetails((prev) => ({
                ...prev,
                id,
                method,
                amount: amt,
                currencyLabel: currencyLabelFromParam(currency),
              }))
              toast.error('Payment was cancelled')
            } else {
              toast.error(
                worldpayResponse.message ||
                  'Could not confirm cancellation with the server. Details below are from your link.'
              )
            }
          } catch (apiError) {
            if (cancelled) return
            console.error('Worldpay cancel API failed:', apiError)
            toast.error('Could not reach the server. Details below are from your link.')
          }

          if (!cancelled) setIsVerifying(false)
          return
        }

        if (hasVivaWalletParams && transactionId && sessionId) {
          try {
            const response = await getTransactionDetails(transactionId)
            if (cancelled) return

            if (response.status === ServerActionStatus.SUCCESS) {
              const amt =
                response.data?.amount != null && Number.isFinite(Number(response.data.amount))
                  ? Number(response.data.amount)
                  : 0
              setTransactionDetails((prev) => ({
                ...prev,
                id: transactionId,
                amount: amt,
                method: response.data?.payment_method ?? 'Viva Wallet',
                currencyLabel: DEFAULT_CURRENCY_SYMBOL,
              }))
            } else {
              toast.error(response.message || 'Could not load transaction details.')
              setTransactionDetails((prev) => ({
                ...prev,
                id: transactionId,
                method: 'Viva Wallet',
                amount: 0,
                currencyLabel: DEFAULT_CURRENCY_SYMBOL,
              }))
            }
          } catch (apiError) {
            if (cancelled) return
            console.error('Viva Wallet transaction lookup failed:', apiError)
            toast.error('Could not load transaction details. Please try checkout again.')
            setTransactionDetails((prev) => ({
              ...prev,
              id: transactionId,
              method: 'Viva Wallet',
              amount: 0,
              currencyLabel: DEFAULT_CURRENCY_SYMBOL,
            }))
          }

          if (!cancelled) setIsVerifying(false)
        }
      } catch (error) {
        if (cancelled) return
        console.error('Payment verification error:', error)
        toast.error('Failed to verify payment. Please contact support.')
        setIsVerifying(false)
      }
    }

    void verifyPayment()

    return () => {
      cancelled = true
    }
  }, [queryKey])

  if (isVerifying) {
    return (
      <div className="auth-form-container md:!py-[84px]">
        <div className="auth-form-wrapper !space-y-0 !rounded-2xl !max-w-[600px] !p-5 !gap-5">
          <div className="text-center">
            <p className="text-content-1 font-semibold">Checking payment status...</p>
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
            src="/images/payment-failed.svg"
            alt="payment failed"
            width={200}
            height={200}
            className="mx-auto aspect-square max-sm:max-w-32"
          />
          <h1 className="mx-auto text-title-2 md:text-xl text-skin-neutral-300 font-bold">
            Oops! Your Payment Didn&apos;t Go Through
          </h1>
          <p className="text-content-2 md:text-content-1 text-center font-bold text-skin-neutral-300 mx-auto max-w-[406px]">
            Looks like your payment didn&apos;t make it through. Don&apos;t worry—take a moment, recharge, and try
            again to get your vape gear sorted.
          </p>
        </div>

        <div className="py-5 border-t border-b border-skin-neutral-100 w-full space-y-3.5">
          <div className="flex items-start justify-between gap-2 text-content-2 font-bold text-skin-neutral-300 leading-none capitalize">
            <p className="text-nowrap">Transaction ID</p>
            <p className="break-all text-right">{transactionDetails.id}</p>
          </div>
          <div className="flex items-center justify-between gap-2 text-content-2 font-bold text-skin-neutral-300 leading-none capitalize">
            <p>Amount</p>
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

        <Button
          size="lg"
          radius="md"
          color="primary"
          className="btn primary-btn shadow-input text-content-1 !font-semibold !font-oswald h-11 mx-auto"
          onPress={() => router.push(ROUTES.CHECKOUT)}
        >
          Go to Checkout
        </Button>
      </div>
    </div>
  )
}

export default PaymentFailedContent
