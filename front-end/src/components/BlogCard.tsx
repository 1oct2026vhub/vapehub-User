import React from 'react'
import Link from 'next/link'
import { BlogList, BlogContent } from '@/lib/config/blog.config'
import { RightArrowIcon } from '@/components/Icons'
import NoImage from '@/components/NoImage'

type Props = {
    blog: BlogList | BlogContent
}

const BlogCard: React.FC<Props> = ({ blog }) => {
    return (
        // <div dangerouslySetInnerHTML={{ __html: blog.content }} />
        <Link href={blog?.slug?.startsWith('/') ? blog.slug : `/${blog?.slug ?? ''}`} className='bg-skin-white p-4 items-start shadow-card hover:shadow-blog-card rounded-lg w-full'>
            <div className='min-h-60 flex justify-center items-center w-full max-h-60 rounded-lg mb-4.5 bg-white'>
                <NoImage
                    src={blog.image_url}
                    alt={blog.alt_text || blog.title}
                    width={399}
                    height={240}
                    className='rounded-lg w-full max-h-60 object-contain'
                />
            </div>
            <div className='flex gap-4 items-start justify-between mb-4 w-full'>
                <h2 className='text-skin-neutral-500 text-title-2 md:text-title-1 font-semibold line-clamp-2 sm:h-14'>{blog?.title}</h2>
                <RightArrowIcon stroke='#091410' className='-rotate-45 w-6 h-6 min-w-5 md:min-w-6' />
            </div>
            <div>
                <div className="line-clamp-3 sm:h-[72px] text-skin-neutral-300 rich-text" dangerouslySetInnerHTML={{ __html: blog.content }} />
                <button className="text-skin-primary-300 text-content-3 md:text-content-1 font-semibold mt-2">Read more...</button>
            </div>
            <div className='mt-3.5'>
                <p className='primary-gradient-100 text-content-3 md:text-content-1 font-semibold'>{('categories' in blog) ? blog.categories?.[0]?.name : 'Blog'}</p>
                <p className='text-content-3 md:text-content-1 font-semibold text-skin-primary-300'>{new Date(blog.published_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</p>
            </div>
        </Link>
    )
}

export default BlogCard
