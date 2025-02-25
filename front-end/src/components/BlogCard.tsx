import Image from 'next/image'
import React from 'react'
import { RightArrowIcon } from './Icons'

const BlogCard: React.FC = () => {
    return (
        <a href='#' className='bg-skin-white p-4 flex flex-col items-start shadow-card rounded-14 w-fit xl:min-w-[431px]'>
            <div className='w-full max-h-60 rounded-10 mb-4.5'>
                <Image
                    src='/images/blog-list-card.jpg'
                    alt='Blog Card'
                    width={399}
                    height={240}
                    className='rounded-10 w-full max-h-60 min-h-60'
                />
            </div>
            <div className='flex gap-4 items-start mb-4'>
                <h4 className='text-skin-neutral-500 text-title-2 md:text-title-1 font-semibold line-clamp-2'>Mastering MTL: A Comprehensive Guide to Mouth to Lung Vaping</h4>
                <RightArrowIcon stroke='#091410' className='-rotate-45 w-6 h-6 min-w-5 md:min-w-6' />
            </div>
            <p className='text-skin-neutral-300 text-content-1 md:text-title-2 font-bold line-clamp-3'>Among the myriad vaping styles and techniques, Mouth to Lung (MTL) vaping stands out as a beloved classic in the vaping... </p>
            <div className='mt-3.5'>
                <p className='primary-gradient-100 text-content-3 md:text-content-1 font-semibold'>Geek Zone</p>
                <p className='text-content-3 md:text-content-1 font-semibold text-skin-primary-300'>Jan 10, 2022</p>
            </div>
        </a>
    )
}

export default BlogCard
