'use client'

import { zodResolver } from '@hookform/resolvers/zod'
import { Button } from '@nextui-org/button'
import Image from 'next/image'
import { useRouter } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { toast } from 'sonner'

import InputField from '@/components/InputField'
import { Form } from '@/components/ui/Form'
import { ServerActionStatus } from '@/lib/config/app.config'
import { SUBSCRIBE_FORM_CONFIG, SUBSCRIBE_IN_SCHEMA, SubscribeFormSchema } from '@/lib/config/subscribe.config'
import { ROUTES } from '@/lib/routes'
import { unsubscribeMail } from '@/lib/server.actions'

const UnsubscribeForm = () => {
  const router = useRouter()

  const unsubscribeForm = useForm<SubscribeFormSchema>({
    resolver: zodResolver(SUBSCRIBE_IN_SCHEMA),
    mode: 'onSubmit',
  })

  const handleFormSubmit = async ({ email }: SubscribeFormSchema) => {
    const normalizedEmail = email.trim()
    const response = await unsubscribeMail(normalizedEmail, 'app')

    if (response.status === ServerActionStatus.ERROR) {
      toast.error(response.message || 'Unable to unsubscribe this email.')
      return
    }

    toast.success('You have successfully unsubscribed.')
    router.push(`${ROUTES.UNSUBSCRIBE_SUCCESS}?success=true`)
  }

  return (
    <div className="auth-form-container md:!py-[84px]">
      <div className="auth-form-wrapper !space-y-6 !rounded-2xl !max-w-[600px] !p-5 md:!p-7.5">
        <div className="space-y-3.5 text-center w-full">
          <Image
            src="/images/payment-failed.svg"
            alt="unsubscribe newsletter"
            width={120}
            height={120}
            className="mx-auto aspect-square max-sm:max-w-24 opacity-90"
          />
          <h1 className="mx-auto text-title-2 md:text-xl text-skin-neutral-300 font-bold">Unsubscribe from Emails</h1>
          <p className="text-content-2 md:text-content-1 text-skin-neutral-300 font-bold mx-auto max-w-[460px]">
            Enter your email address to stop receiving promotional emails.
          </p>
        </div>

        <Form {...unsubscribeForm}>
          <form
            className="space-y-4 w-full max-w-[460px] mx-auto"
            onSubmit={unsubscribeForm.handleSubmit(handleFormSubmit)}
            noValidate
          >
            <InputField
              control={unsubscribeForm.control}
              name="email"
              type={SUBSCRIBE_FORM_CONFIG.EMAIL.TYPE}
              // placeholder={SUBSCRIBE_FORM_CONFIG.EMAIL.PH}
              label="Email address"
              className="w-full"
              isRequired
            />

            <Button
              size="lg"
              radius="md"
              color="primary"
              type="submit"
              disabled={unsubscribeForm.formState.isSubmitting}
              isLoading={unsubscribeForm.formState.isSubmitting}
              className="btn primary-btn shadow-input text-content-1 !font-semibold !font-oswald h-11 w-full uppercase"
            >
              Unsubscribe
            </Button>
          </form>
        </Form>
      </div>
    </div>
  )
}

export default UnsubscribeForm
