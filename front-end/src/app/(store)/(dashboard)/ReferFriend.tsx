import { RightArrowIcon } from '@/components/Icons'
import { Button } from '@nextui-org/button'
import Image from 'next/image'
import React from 'react'

const ReferFriend: React.FC = () => {
    return (
        <section className='xl:pt-24 xl:pb-12.5 xl:px-5'>
            <div className='bg-skin-white border border-skin-neutral-50 xl:pl-11 pt-7 flex flex-col xl:flex-row h-fit gap-2 shadow-card rounded-[36px] md:rounded-[50px] xl:max-h-[309px]'>
                <div className='text-center xl:text-left'>
                    <div className='primary-gradient-100 text-h4 md:text-h3 xl:text-55 font-bold'>
                        <h1 className=''>Refer a Friend &</h1>
                        <h1 className=''>We will reward you both!</h1>
                    </div>
                    <Button
                        size="lg"
                        radius="sm"
                        color="primary"
                        className="btn primary-btn shadow-input w-fit !min-w-fit text-content-1 !px-4 !py-2 !rounded-10 mt-4 xl:mt-8"
                        endContent={<RightArrowIcon stroke='#fff' className='ml-1' />}
                    >
                        Refer Now
                    </Button>
                </div>
                <Image
                    src='/images/refer-friend.svg'
                    alt='Refer Friend'
                    width={533}
                    height={280}
                    className='mx-auto'
                />
            </div>
        </section>
    )
}

export default ReferFriend
