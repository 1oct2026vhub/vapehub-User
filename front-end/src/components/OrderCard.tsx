import React from 'react'

const OrderCard: React.FC = () => {
  return (
    <div className='w-full bg-red-gradient-200 py-4.5 px-7.5 rounded-10 shadow-blog-card text-center'>
      <p className='max-w-2xl text-skin-white text-title-2 font-bold mx-auto'>***Orders placed after 10:30am on Tuesday 31st December will be despatched on Thursday 2nd January***</p>
    </div>
  )
}

export default OrderCard
