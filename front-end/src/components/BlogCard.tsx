// import Image from 'next/image'
import React from 'react'
// import { RightArrowIcon } from './Icons'
import Image from 'next/image'
import Link from 'next/link'
import { BlogList, BlogContent } from '@/lib/config/blog.config'
import { RightArrowIcon } from '@/components/Icons'

type Props = {
    blog: BlogList | BlogContent
}

const BlogCard: React.FC<Props> = ({ blog }) => {
    return (
        // <div dangerouslySetInnerHTML={{ __html: blog.content }} />
        <Link href={blog?.slug ?? '#'} className='bg-skin-white p-4 items-start shadow-card rounded-14 w-full'>
            <div className='w-full max-h-60 rounded-10 mb-4.5'>
                <Image
                    src={blog.image_url ?? '/images/blog-list-card.jpg'}
                    alt='Blog Card'
                    width={399}
                    height={240}
                    className='rounded-10 w-full max-h-60 min-h-60'
                />
            </div>
            <div className='flex gap-4 items-start justify-between mb-4 w-full'>
                <h4 className='text-skin-neutral-500 text-title-2 md:text-title-1 font-semibold line-clamp-2 sm:h-14'>{blog?.title}</h4>
                <RightArrowIcon stroke='#091410' className='-rotate-45 w-6 h-6 min-w-5 md:min-w-6' />
            </div>
            <div>
                <div className="line-clamp-3 sm:h-[72px]" dangerouslySetInnerHTML={{ __html: blog.content }} />
                <button className="text-skin-primary-300 text-content-3 md:text-content-1 font-semibold mt-2">Read more...</button>
            </div>
            <div className='mt-3.5'>
                <p className='primary-gradient-100 text-content-3 md:text-content-1 font-semibold'>{('categories' in blog) ? blog.categories?.[0]?.name : ''}</p>
                <p className='text-content-3 md:text-content-1 font-semibold text-skin-primary-300'>{new Date(blog.published_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</p>
            </div>
        </Link>
    )
}

export default BlogCard
