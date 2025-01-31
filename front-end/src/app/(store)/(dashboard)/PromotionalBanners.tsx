import Image from 'next/image'
import React from 'react'

const PromotionalBanners: React.FC = () => {
    return (
        <>
            <section className='grid-cols-1 md:grid-cols-2 gap-7 mt-10 hidden md:grid'>
                <div>
                    <Image
                        src='/images/banner-4.png'
                        alt='banner 1'
                        width={662}
                        height={573}
                        className='w-full h-full'
                    />
                </div>
                <div className='space-y-7'>
                    <div>
                        <Image
                            src='/images/banner-2.png'
                            alt='banner 2'
                            width={662}
                            height={274}
                            className='w-full'
                        />
                    </div>
                    <div>
                        <Image
                            src='/images/banner-3.png'
                            alt='banner 3'
                            width={662}
                            height={274}
                            className='w-full'
                        />
                    </div>
                </div>
            </section>
            <section className='md:hidden grid gap-7 mt-5'>
                <div>
                    <Image
                        src='/images/banner-4.png'
                        alt='banner 1'
                        width={361}
                        height={274}
                        className='w-full max-h-[274px]'
                    />
                </div>
                <div>
                    <Image
                        src='/images/banner-5.png'
                        alt='banner 1'
                        width={361}
                        height={274}
                        className='w-full max-h-[274px]'
                    />
                </div>
            </section>
        </>
    )
}

export default PromotionalBanners
