"use client"
import { Key } from '@react-types/shared';
import type { BlogList, BlogResponse } from '@/lib/config/blog.config';
import React, { ReactElement, useEffect, useRef, useState } from 'react'
import { Card, CardBody, Tab, Tabs } from '@nextui-org/react';
import { getBlogList, getBlogPostList } from '@/lib/server.actions';
import { ServerActionStatus } from '@/lib/config/app.config';
import BlogCard from '@/components/BlogCard';
import { ROUTES } from '@/lib/routes';
import BreadCrumbs from '@/components/BreadCrumbs';
import Pagination from "@/components/Pagination";
import PreLoader from '@/components/common/PreLoader';
import EmptyPlaceholder from '@/components/ui/EmptyPlaceholder';
import Link from 'next/link';
import { getAuthorArticlesHeading, getAuthorDisplayName } from '@/lib/config/blog-author-bio.config';

const BLOGS_PER_PAGE = 9;

type BlogListViewProps = {
    selectedId: string;
    page?: number;
    categoryId?: string;
    authorId?: string;
    authorName?: string;
    pathnameBase?: string;
    lockCategory?: boolean;
    initialTabs?: BlogResponse[];
    initialBlogs?: BlogList[];
    initialPage?: number;
    initialTotalPages?: number;
}

const BlogListView: React.FC<BlogListViewProps> = ({
    selectedId,
    page,
    categoryId,
    authorId,
    authorName,
    pathnameBase = ROUTES.BLOGS,
    lockCategory,
    initialTabs = [],
    initialBlogs = [],
    initialPage = 1,
    initialTotalPages = 1,
}): ReactElement => {
    const resolvedSelectedId = categoryId ?? selectedId;
    const resolvedInitialPage = page ?? initialPage;
    const isLockedCategory = lockCategory ?? false;
    const [blogs, setBlogs] = useState<BlogList[]>(initialBlogs);
    const [tabs, setTabs] = useState<BlogResponse[]>(initialTabs);
    const [selectedTab, setSelectedTab] = useState<string>(resolvedSelectedId);
    const [loading, setLoading] = useState(initialBlogs.length === 0);
    const [currentPage, setCurrentPage] = useState(resolvedInitialPage);
    const [totalPages, setTotalPages] = useState(initialTotalPages);
    const [offset, setOffset] = useState(resolvedInitialPage);
    const skippedInitialFetch = useRef(initialBlogs.length > 0);

    const resolvedAuthorName = authorName || (authorId ? getAuthorDisplayName(blogs[0]?.author) : undefined);
    const pageHeading = authorId
        ? getAuthorArticlesHeading(resolvedAuthorName || "author")
        : "Blogs";
    const breadcrumbs = authorId
        ? [
            { label: "Home", href: ROUTES.WELCOME },
            { label: "Blogs", href: ROUTES.BLOGS },
            { label: pageHeading, href: ROUTES.BLOGS_BY_AUTHOR(authorId), isActive: true },
        ]
        : [
            { label: "Home", href: ROUTES.WELCOME },
            { label: "Blogs", href: ROUTES.BLOGS, isActive: true },
        ];

    const handlePagination = (page: number) => {
        setOffset(page);
        window.scrollTo({ top: 0, behavior: 'smooth' });
    }
    const handleTabChange = (tabKey: Key) => {
        setSelectedTab(tabKey.toString());
        setOffset(1);
    };

    const buildFallbackHref = (category: string, pageNumber: number) => {
        const hrefPath = isLockedCategory ? pathnameBase : ROUTES.BLOGS;
        const params = new URLSearchParams();
        if (authorId) params.set("authorId", authorId);
        if (!isLockedCategory && category !== "0") params.set("category", category);
        if (pageNumber > 1) params.set("page", String(pageNumber));
        const query = params.toString();
        return query ? `${hrefPath}?${query}` : hrefPath;
    };

    const buildBlogListPayload = (pageNumber: number, category: string) => ({
        limit: BLOGS_PER_PAGE,
        page: pageNumber,
        ...(authorId ? { authorId } : {}),
        ...(category && category !== "0" && category !== "" ? { categoryId: category } : {}),
    });

    useEffect(() => {
        const fetchBlogsCategory = async () => {
            if (initialTabs.length > 0) return;
            const response = await getBlogList();
            if (response.status === ServerActionStatus.ERROR) {
                return;
            }
            const categoryBlogs: BlogResponse[] = response.data;
            const allTab: BlogResponse = {
                id: 0,
                name: "All",
                slug: "all",
                description: "",
                image_url: "",
                blogs: [],
                blog_count: 0
            };
            categoryBlogs.unshift(allTab);
            setTabs(categoryBlogs)
        }
        fetchBlogsCategory()
    }, [initialTabs]);

    useEffect(() => {
        const fetchBlogsPost = async () => {
            if (skippedInitialFetch.current && selectedTab === resolvedSelectedId && offset === resolvedInitialPage) {
                skippedInitialFetch.current = false;
                return;
            }
            setLoading(true);
            const response = await getBlogPostList(buildBlogListPayload(offset, selectedTab));
            if (response.status === ServerActionStatus.ERROR) {
                setBlogs([]);
            } else {
                setBlogs(response.data.blogs);
                setCurrentPage(response.data.pagination.currentPage);
                setTotalPages(response.data.pagination.totalPages);
            }
            setLoading(false);
        };
        fetchBlogsPost();
    }, [selectedTab, offset, resolvedSelectedId, resolvedInitialPage, authorId]);

    return (
        <main className='px-4 lg:px-9 xl:px-12.5 py-7 xl:py-10 flex flex-col gap-7 xl:gap-10'>
            <BreadCrumbs items={breadcrumbs} />
            <section className="w-full">
                <h1 className={`primary-gradient-600 text-h4 md:text-h2 font-semibold ${authorId ? 'max-w-3xl' : 'w-fit'}`}>{pageHeading}</h1>
                <div className={`w-full mt-2.5 ${authorId ? 'lg:mt-6' : 'lg:-mt-16'}`}>
                    {/* No-JS fallback */}
                    <div className="blogs-list-static-fallback">
                        <div className="ml-auto flex max-w-full gap-3 overflow-x-auto whitespace-nowrap rounded-md border border-skin-neutral-100 bg-skin-base px-3.5 py-2.5 md:px-5 md:py-4 lg:max-w-3xl xl:max-w-5xl">
                            {tabs.map((tab) => {
                                const tabId = String(tab.id);
                                const isActive = tabId === resolvedSelectedId;
                                return (
                                    <Link
                                        key={`fallback-tab-${tab.id}`}
                                        prefetch={false}
                                        href={isLockedCategory && tabId !== resolvedSelectedId ? ROUTES.BLOGS : buildFallbackHref(tabId, 1)}
                                        className={`rounded max-sm:px-5 flex h-10 flex-shrink-0 min-w-fit first:min-w-[60px] !w-[124px] items-center justify-center border border-[#035335] text-content-2 md:text-title-2 font-semibold leading-none ${isActive ? 'bg-primary-gradient-100 text-skin-white border-none shadow-md' : 'text-[#035335]'}`}
                                    >
                                        {tab.name}
                                    </Link>
                                );
                            })}
                        </div>
                        <div className='px-1 py-3 sm:py-7 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5.5'>
                            {initialBlogs.map((blog, idx) => (
                                <BlogCard key={`fallback-blog-${blog.id ?? idx}`} blog={blog} />
                            ))}
                        </div>
                        {initialTotalPages > 1 && (
                            <div className="mt-3 flex w-full justify-end gap-2">
                                {Array.from({ length: initialTotalPages }, (_, i) => i + 1).map((pageNum) => (
                                    <Link
                                        key={`fallback-page-${pageNum}`}
                                        href={buildFallbackHref(resolvedSelectedId, pageNum)}
                                        className={`inline-flex h-9 min-w-9 items-center justify-center rounded-10 px-2 font-semibold ${pageNum === resolvedInitialPage ? 'bg-primary-gradient-100 text-skin-white' : 'bg-skin-neutral-50 text-skin-neutral-500'}`}
                                        aria-current={pageNum === resolvedInitialPage ? "page" : undefined}
                                    >
                                        {pageNum}
                                    </Link>
                                ))}
                            </div>
                        )}
                    </div>

                    <div className="blogs-list-ui-host">
                        <Tabs aria-label="Options" selectedKey={selectedTab} onSelectionChange={(e) => handleTabChange(e)}
                            variant='bordered'
                            color='primary'
                            classNames={{
                                base: "w-full",
                                tabList: "gap-3 px-3.5 md:px-5 py-2.5 md:py-4 lg:ml-auto lg:max-w-3xl xl:max-w-5xl ml-auto border border-skin-neutral-100 rounded-md !bg-skin-base flex whitespace-nowrap",
                                cursor: "bg-primary-gradient-100 border-none text-skin-white rounded shadow-md",
                                tab: "rounded max-sm:px-5 flex-shrink-0 min-w-fit first:min-w-[60px] !w-[124px] h-10 border border-[#035335] text-skin-[#035335] group-data-[selected=true]:!border-none",
                                tabContent: "group-data-[selected=true]:!text-skin-white text-content-2 md:text-title-2 font-semibold leading-none",
                                panel: "!px-0"
                            }}
                        >

                            {tabs.map((tab) => (
                                <Tab key={tab.id} title={tab.name} >
                                    {
                                        loading ? <PreLoader /> : !blogs.length ? <EmptyPlaceholder title='Uh, oh!' description='No blogs available' /> :
                                            <Card classNames={{
                                                base: "!bg-transparent border-none shadow-none p-0 w-full",
                                                body: "px-1 py-3 sm:py-7 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5.5 overflow-hidden"
                                            }}>

                                                <CardBody >
                                                    {
                                                        blogs.map((blog: BlogList, idx: number) => (
                                                            <BlogCard key={idx} blog={blog} />
                                                        ))
                                                    }
                                                </CardBody>
                                            </Card>
                                    }
                                </Tab>
                            ))}
                        </Tabs>
                    </div>
                </div>
            </section>

            <div className="blogs-list-ui-host">
                {totalPages > 1 && (
                    <div className='w-full  flex justify-end'>
                        <Pagination
                            total={totalPages}
                            onPageChange={handlePagination}
                            currentPage={currentPage}
                        />
                    </div>
                )}
            </div>
        </main>
    )

}

export default BlogListView

// return  <Card classNames={{
//     base: "!bg-transparent border-none shadow-none p-0 mt-12"
// }}>
//     <CardBody className='px-1 py-3 sm:py-7 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5.5 overflow-hidden'>
//         {
//            blogs.map((blog: BlogResponse, idx: number) => (
//                 <BlogCard key={idx} blog={blog} />
//             ))
//         }


//     </CardBody>
// </Card>;