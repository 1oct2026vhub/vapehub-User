import { AsyncReactElement, ServerActionStatus } from '@/lib/config/app.config';
import { BannerResponse } from '@/lib/config/global.config';
import { getPromotionBanner } from '@/lib/server.actions';
import Image from 'next/image'
import React from 'react'

const PromotionalBanners: React.FC = async (): Promise<AsyncReactElement> => {
    const response = await getPromotionBanner();
    if (response.status == ServerActionStatus.ERROR) {
        return (<p> No Manners Available</p>);
    }
    const banners: BannerResponse[] = response?.data.splice(0, 3) ?? []

    return (
        <>
            <section className='grid-cols-1 md:grid-cols-2 gap-7 mt-10 hidden md:grid'>
                {
                    banners?.[0] &&

                    <div>
                        <Image
                            src={banners?.[0]?.image_url_mid}
                            alt={banners?.[0]?.title}
                            width={662}
                            height={573}
                            className='w-full h-full'
                        />
                    </div>
                }

                <div className='space-y-7'>
                    {
                        banners?.[1] &&
                        <div>
                            <Image
                                src={banners?.[1]?.image_url_mid}
                                alt={banners?.[1]?.title}
                                width={662}
                                height={274}
                                className='w-full'
                            />
                        </div>
                    }
                    {
                        banners?.[2] &&
                        <div>
                            <Image
                                src={banners?.[2]?.image_url_mid}
                                alt={banners?.[2]?.title}
                                width={662}
                                height={274}
                                className='w-full'
                            />
                        </div>
                    }
                </div>
            </section>
            <section className='md:hidden grid gap-7 mt-5'>
                {
                    banners?.[3] &&
                    <div>
                        <Image
                            src={banners?.[3]?.image_url_mid}
                            alt={banners?.[3]?.title}
                            width={361}
                            height={274}
                            className='w-full max-h-[274px]'
                        />
                    </div>
                }
                {
                    banners?.[4] &&
                    <div>
                        <Image
                            src={banners?.[4]?.image_url_mid}
                            alt={banners?.[4]?.title}
                            width={361}
                            height={274}
                            className='w-full max-h-[274px]'
                        />
                    </div>
                }
            </section>
        </>
    )
}

export default PromotionalBanners
