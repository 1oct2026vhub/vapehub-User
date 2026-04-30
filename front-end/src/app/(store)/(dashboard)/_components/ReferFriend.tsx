import { RightArrowIcon } from '@/components/Icons'
import { getServerSessionData } from '@/lib/config/auth.config'
import { ROUTES } from '@/lib/routes'
import Image from 'next/image'
import Link from 'next/link'
import React from 'react'

const ReferFriend: React.FC = async () => {
    
    const session = await getServerSessionData();
    const user = session?.user;
    const referralHref = user ? ROUTES.REFERRAL : ROUTES.MY_ACCOUNT;

    const cardContent = (
        <div className='bg-skin-white border border-skin-neutral-50 max-lg:pt-6 lg:pl-7 xl:pl-11 flex flex-col lg:flex-row items-center justify-between h-fit gap-2 shadow-card rounded-md md:rounded-lg xl:max-h-[309px]'>
            <div className='text-center lg:text-left flex flex-col flex-1 flex-fill lg-w-[50%]'>
                <div className='text-h5 md:text-h3 font-semibold'>
                    <div className='!font-oswald primary-gradient-100'>Refer a Friend &</div>
                    <div className='!font-oswald primary-gradient-100'>We will reward you both!</div>
                </div>
                <Link
                    href={referralHref}
                    className="btn primary-btn shadow-input inline-flex items-center gap-2 w-fit !min-w-fit max-lg:mx-auto text-[16px] leading-none !px-3.5 !py-2 !rounded-md font-oswald font-semibold mt-4 xl:mt-8 uppercase !h-10"
                    aria-label='Go to refer a friend page'
                >
                    Refer Now
                    <RightArrowIcon stroke='#fff' className='w-5 h-5 shrink-0' />
                </Link>
            </div>
            <Image
                src='/images/refer-friend.svg'
                alt='Refer Friend'
                width={533}
                height={280}
                loading="lazy"
                className='mt-4 md:mr-4'
            />
        </div>
    );

    return (
        <section>
            {cardContent}
        </section>
    )
}

export default ReferFriend
