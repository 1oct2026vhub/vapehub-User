import { RightArrowIcon } from '@/components/Icons'
import { getServerSessionData } from '@/lib/config/auth.config'
import { ROUTES } from '@/lib/routes'
import { Button } from '@nextui-org/button'
import Image from 'next/image'
import Link from 'next/link'
import React from 'react'

const ReferFriend: React.FC = async () => {
    
    const session = await getServerSessionData();
    const user = session?.user;
    // The common card content that will be wrapped differently based on auth state
    const cardContent = (
        <div className='bg-skin-white border border-skin-neutral-50 max-lg:pt-6 lg:pl-7 xl:pl-11 flex flex-col lg:flex-row items-center justify-between h-fit gap-2 shadow-card rounded-md md:rounded-lg xl:max-h-[309px]'>
            <div className='text-center lg:text-left flex flex-col flex-1 flex-fill lg-w-[50%]'>
                <div className='text-h5 md:text-h3 font-semibold'>
                    <h2 className='primary-gradient-100'>Refer a Friend &</h2>
                    <h2 className='primary-gradient-100'>We will reward you both!</h2>
                </div>
                <Button
                    as={user ? Link : "div"}
                    href={user ? ROUTES.REFERRAL : undefined}
                    size="lg"
                    radius="sm"
                    color="primary"
                    className="btn primary-btn shadow-input w-fit !min-w-fit text-content-2 md:text-h5 !px-1.5 !py-1 md:!px-3 md:!py-1.5 !rounded font-oswald mt-4 xl:mt-8 uppercase !h-fit"
                    endContent={<RightArrowIcon stroke='#fff' className='w-5.5 h-5.5' />}
                >
                    Refer Now
                </Button>
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
            {user ? (
                cardContent
            ) : (
                <Link href={ROUTES.MY_ACCOUNT} className='block'>
                    {cardContent}
                </Link>
            )}
        </section>
    )
}

export default ReferFriend
