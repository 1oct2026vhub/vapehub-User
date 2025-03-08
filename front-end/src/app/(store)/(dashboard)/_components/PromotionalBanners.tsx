import { BannerResponse } from '@/lib/config/global.config';
import Image from 'next/image'
import React from 'react'

interface PromotionalBannersProps {
  banners: BannerResponse[];
}

const PromotionalBanners: React.FC<PromotionalBannersProps> = ({ banners }) => {
   if (!banners?.length) {
    return <p>No Banners Available</p>
   }
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
                            loading="lazy"
                        />
                    </div>
                }

                <div className='grid grid-cols-1 gap-7'>
                    {
                        banners?.[1] &&
                        <div>
                            <Image
                                src={banners?.[1]?.image_url_mid}
                                alt={banners?.[1]?.title}
                                width={662}
                                height={274}
                                className='w-full'
                                loading="lazy"
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
                                loading="lazy"
                            />
                        </div>
                    }
                </div>
            </section>
            <section className='grid grid-cols-2 gap-4 mt-10 md:hidden'>
                {
                    banners?.[3] &&
                    <div>
                        <Image
                            src={banners?.[3]?.image_url_mid}
                            alt={banners?.[3]?.title}
                            width={361}
                            height={274}
                            className='w-full max-h-[274px]'
                            loading="lazy"
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
                            loading="lazy"
                        />
                    </div>
                }
            </section>
        </>
    )
}

export default PromotionalBanners
