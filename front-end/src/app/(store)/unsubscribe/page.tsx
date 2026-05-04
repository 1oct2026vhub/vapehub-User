import { ServerActionStatus } from '@/lib/config/app.config'
import { unsubscribeMail } from '@/lib/server.actions'

import UnsubscribeSuccessContent from './UnsubscribeSuccessContent'
import UnsubscribeForm from './UnsubscribeForm'

export const dynamic = 'force-dynamic'

interface UnsubscribeSuccessPageProps {
  searchParams: Promise<{ email?: string }>
}

const UnsubscribeSuccessPage = async ({ searchParams }: UnsubscribeSuccessPageProps) => {
  const { email } = await searchParams
  const normalizedEmail = email?.trim()

  if (!normalizedEmail) {
    return <UnsubscribeForm />
  }

  const unsubscribeResponse = await unsubscribeMail(normalizedEmail)
  const errorMessage =
    unsubscribeResponse.status === ServerActionStatus.ERROR ? unsubscribeResponse.message : undefined

  return (
    <UnsubscribeSuccessContent
      isSuccess={unsubscribeResponse.status === ServerActionStatus.SUCCESS}
      email={normalizedEmail}
      message={errorMessage}
    />
  )
}

export default UnsubscribeSuccessPage
