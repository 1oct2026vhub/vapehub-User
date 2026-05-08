import React from 'react';
import Link from 'next/link';
import { BlogList, BlogContent } from '@/lib/config/blog.config';
import { RightArrowIcon } from '@/components/Icons';

type Props = {
    blog: BlogList | BlogContent;
};

function toPlainText(html: string): string {
    return (html || '')
        .replace(/<!--[\s\S]*?-->/g, ' ')
        .replace(/<[^>]+>/g, ' ')
        .replace(/\s+/g, ' ')
        .trim();
}

const BlogCard: React.FC<Props> = ({ blog }) => {
    const excerpt = toPlainText(blog.content);

    return (
        <Link
            href={blog?.slug?.startsWith('/') ? blog.slug : `/${blog?.slug ?? ''}`}
            className="flex min-w-0 h-full flex-col items-stretch bg-skin-white p-4 shadow-card hover:shadow-blog-card rounded-lg w-full no-underline"
        >
            <div className="min-h-60 flex justify-center items-center w-full max-h-60 rounded-lg mb-4.5 bg-white">
                <img
                    src={blog.image_url || '/images/no-image.png'}
                    alt={blog.alt_text || blog.title}
                    width={399}
                    height={240}
                    loading="eager"
                    decoding="async"
                    className="rounded-lg w-full max-h-60 object-contain"
                />
            </div>
            <div className="flex gap-4 items-start justify-between mb-4 w-full">
                <div className="!font-oswald text-skin-neutral-500 text-title-2 md:text-title-1 font-semibold line-clamp-2 sm:h-14">
                    {blog?.title}
                </div>
                <RightArrowIcon
                    stroke="#091410"
                    className="-rotate-45 w-6 h-6 min-w-5 md:min-w-6"
                />
            </div>
            <div className="min-w-0 flex-1">
                <p className="blog-card-excerpt line-clamp-3 sm:min-h-[72px] text-skin-neutral-300">
                    {excerpt}
                </p>
                <span className="text-skin-primary-300 text-content-3 md:text-content-1 font-semibold mt-2 inline-block">
                    Read more...
                </span>
            </div>
            <div className="mt-3.5 pt-0.5">
                <p className="primary-gradient-100 text-content-3 md:text-content-1 font-semibold">
                    {'categories' in blog ? blog.categories?.[0]?.name : 'Blog'}
                </p>
                <p className="text-content-3 md:text-content-1 font-semibold text-skin-primary-300">
                    {new Date(blog.published_at).toLocaleDateString('en-US', {
                        month: 'short',
                        day: 'numeric',
                        year: 'numeric',
                    })}
                </p>
            </div>
        </Link>
    );
};

export default BlogCard;
