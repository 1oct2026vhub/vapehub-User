import UnsubscribeSuccessContent from './UnsubscribeSuccessContent'
import UnsubscribeForm from './UnsubscribeForm'

export const dynamic = 'force-dynamic'

interface UnsubscribeSuccessPageProps {
  searchParams: Promise<{ success?: string }>
}

const UnsubscribeSuccessPage = async ({ searchParams }: UnsubscribeSuccessPageProps) => {
  const { success } = await searchParams
  const isSuccess = success === 'true'

  if (isSuccess) return <UnsubscribeSuccessContent isSuccess />
  return <UnsubscribeForm />
}

export default UnsubscribeSuccessPage
