import Link from 'next/link'
import Image from 'next/image'
import { Button } from '@nextui-org/button'

import { ROUTES } from '@/lib/routes'

interface UnsubscribeSuccessContentProps {
  isSuccess: boolean
  email?: string
  message?: string
}

const UnsubscribeSuccessContent = ({ isSuccess, email, message }: UnsubscribeSuccessContentProps) => {
  return (
    <div className="auth-form-container md:!py-[84px]">
      <div className="auth-form-wrapper !space-y-0 !rounded-2xl !max-w-[600px] !p-5 !gap-5">
        <div className="space-y-3.5 text-center w-full">
          <Image
            src={isSuccess ? '/images/payment-success.svg' : '/images/payment-failed.svg'}
            alt={isSuccess ? 'unsubscribe success' : 'unsubscribe failed'}
            width={200}
            height={200}
            className="mx-auto aspect-square max-sm:max-w-32"
          />
          <h1 className="mx-auto text-title-2 md:text-xl text-skin-neutral-300 font-bold">
            {isSuccess ? 'You are unsubscribed' : 'Unsubscribe failed'}
          </h1>
          <p className="text-content-2 md:text-content-1 text-center font-bold text-skin-neutral-300 mx-auto max-w-[460px]">
            {isSuccess
              ? `You will no longer receive promotional emails${email ? ` at ${email}` : ''}.`
              : message || 'We could not process your unsubscribe request. Please try again later.'}
          </p>
        </div>

        <Button
          as={Link}
          href={ROUTES.WELCOME}
          size="lg"
          radius="md"
          color="primary"
          className="btn primary-btn shadow-input text-content-1 !font-semibold !font-oswald h-11 mx-auto"
        >
          Back to Home
        </Button>
      </div>
    </div>
  )
}

export default UnsubscribeSuccessContent
