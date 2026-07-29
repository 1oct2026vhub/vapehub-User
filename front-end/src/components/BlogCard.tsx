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
    const categoryName =
        'categories' in blog ? blog.categories?.[0]?.name?.trim() : undefined;

    return (
        <Link
            href={blog?.slug?.startsWith('/') ? blog.slug : `/${blog?.slug ?? ''}`}
            className="flex min-w-0 h-full flex-col items-stretch bg-skin-white p-4 shadow-card hover:shadow-blog-card rounded-lg w-full no-underline"
        >
            <div className="relative flex justify-center items-center w-full rounded-lg mb-4.5 bg-skin-neutral-100 overflow-hidden">
                {blog.image_url ? (
                    <img
                        src={blog.image_url}
                        alt={blog.alt_text || blog.title}
                        width={399}
                        height={240}
                        loading="eager"
                        decoding="async"
                        className="rounded-lg w-full"
                    />
                ) : (
                    <div className="flex flex-col items-center justify-center w-full h-[103px] text-skin-neutral-300">
                        <svg xmlns="http://www.w3.org/2000/svg" className="w-12 h-12 mb-2 opacity-40" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="m2.25 15.75 5.159-5.159a2.25 2.25 0 0 1 3.182 0l5.159 5.159m-1.5-1.5 1.409-1.409a2.25 2.25 0 0 1 3.182 0l2.909 2.909M3.75 21h16.5A2.25 2.25 0 0 0 22.5 18.75V5.25A2.25 2.25 0 0 0 20.25 3H3.75A2.25 2.25 0 0 0 1.5 5.25v13.5A2.25 2.25 0 0 0 3.75 21Z" />
                        </svg>
                    </div>
                )}
                {categoryName ? (
                    <span className="absolute left-2 top-2 max-w-[calc(100%-1rem)] truncate rounded-full border border-skin-primary-500 bg-[#f0f9f9] px-2.5 py-0.5 text-[11px] font-bold uppercase tracking-wide text-skin-primary-500 shadow-sm">
                        {categoryName}
                    </span>
                ) : null}
            </div>
            <div className="flex gap-4 items-start justify-between w-full">
                <div className="!font-oswald text-skin-neutral-500 text-title-2 md:text-title-1 font-semibold line-clamp-2 min-h-[2.8em]">
                    {blog?.title}
                </div>
                <RightArrowIcon
                    stroke="#091410"
                    className="-rotate-45 w-6 h-6 min-w-5 md:min-w-6 shrink-0"
                />
            </div>
            <div className="min-w-0 flex-1 flex flex-col">
                {excerpt ? (
                    <p className="blog-card-excerpt line-clamp-3 sm:min-h-[72px] text-skin-neutral-300">
                        {excerpt}
                    </p>
                ) : null}
                <span className="text-skin-primary-300 text-content-3 md:text-content-1 font-semibold mt-2 inline-block">
                    Read more...
                </span>
            </div>
            <div className="pt-0.5 mt-auto">
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
