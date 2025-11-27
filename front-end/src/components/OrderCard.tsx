import React from 'react'
import { getDispatchNotice } from '@/lib/server.actions'
import { ServerActionStatus } from '@/lib/config/app.config'

const OrderCard: React.FC = async () => {
  const dispatchNoticeResponse = await getDispatchNotice()
  
  // Only render if dispatch notice is active and available
  if (
    dispatchNoticeResponse.status !== ServerActionStatus.SUCCESS ||
    !dispatchNoticeResponse.data?.dispatch_notice ||
    !dispatchNoticeResponse.data.dispatch_notice.is_active
  ) {
    return null
  }

  const { content } = dispatchNoticeResponse.data.dispatch_notice

  return (
    <div className='w-full bg-red-gradient-200 py-4.5 px-7.5 rounded-10 shadow-blog-card text-center'>
      <div 
        className='text-skin-white text-content-1 md:text-title-1 font-semibold !font-oswald mx-auto rich-text'
        dangerouslySetInnerHTML={{ __html: content }}
      />
    </div>
  )
}

export default OrderCard
