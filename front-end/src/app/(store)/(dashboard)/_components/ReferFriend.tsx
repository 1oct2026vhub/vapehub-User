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
    if (!user) {
        return (
					<Link
						href={ROUTES.MY_ACCOUNT}
						className='block'
					>
						<div className='bg-skin-white border border-skin-neutral-50 max-lg:pt-6 xl:pl-11 flex flex-col md:flex-row items-center justify-between h-fit gap-2 shadow-card rounded-md md:rounded-lg xl:max-h-[309px]'>
							<div className='text-center xl:text-left'>
								<div className='text-h5 md:text-h3 font-bold'>
									<h2 className='primary-gradient-100'>Refer a Friend &</h2>
									<h2 className='primary-gradient-100'>
										We will reward you both!
									</h2>
								</div>
								<Button
									as={"div"}
									size='lg'
									radius='sm'
									color='primary'
									className='btn primary-btn shadow-input w-fit !min-w-fit text-content-2 md:text-h5 !px-1.5 !py-1 md:!px-3 md:!py-1.5 !rounded font-oswald mt-4 xl:mt-8 uppercase !h-fit'
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
								loading='lazy'
								className='mt-4 md:mr-4'
							/>
						</div>
					</Link>
				);
    }
    return (
        <section className='xl:pt-24 xl:pb-12.5 xl:px-5'>
            <div className='bg-skin-white border border-skin-neutral-50 xl:pl-11 pt-7 flex flex-col xl:flex-row h-fit gap-2 shadow-card rounded-[36px] md:rounded-[50px] xl:max-h-[309px]'>
                <div className='text-center xl:text-left'>
                    <div className='text-h4 md:text-h3 xl:text-55 font-bold'>
                        <h1 className='primary-gradient-100'>Refer a Friend &</h1>
                        <h1 className='primary-gradient-100'>We will reward you both!</h1>
                    </div>
                    <Button
                        as={Link}
                        href={ROUTES.REFERRAL}
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
                    loading="lazy"
                    className='mx-auto'
                />
            </div>
        </section>
    )
}

export default ReferFriend
