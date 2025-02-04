import InputField from '@/components/InputField'
import { Button } from '@nextui-org/button'
import React from 'react'

const Subscription: React.FC = () => {
    return (
        <section className='bg-subscription-banner-mob lg:bg-subscription-banner bg-no-repeat bg-center bg-cover shadow-subscription rounded-3xl py-12 px-9 mt-5 md:mt-10'>
            <div className='lg:max-w-[50%] space-y-10'>
                <h1 className='text-skin-white text-title-2 md:text-h4 font-semibold'>
                    <span className='text-[3.875rem] md:text-[7rem] leading-none'>10%</span><span> off, especially for you</span>
                </h1>
                <p className='text-content-2 md:text-title-1 text-skin-white font-bold'>Sign up to receive your exclusive Vapehub discount, and keep up to date on our latest products & offers!</p>
                <div className='space-y-7.5'>
                    <InputField
                        type="email"
                        label="Email Address"
                        size='lg'
                        className="w-full"
                    />
                    <Button
                        size="lg"
                        radius="sm"
                        color="primary"
                        variant='bordered'
                        className="btn rounded-10 bg-skin-neutral-500 !text-skin-white border-skin-white shadow-input text-content-1 md:text-title-2 !px-3.5 !py-2 md:!px-6 md:!py-6"
                    >
                        Save 10%
                    </Button>
                </div>
            </div>
        </section>
    )
}

export default Subscription
