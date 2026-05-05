import React from "react";
import Link from "next/link";
import type { BlogList, BlogResponse } from "@/lib/config/blog.config";
import { ServerActionStatus } from "@/lib/config/app.config";
import { getBlogList, getBlogPostList } from "@/lib/server.actions";
import BlogCard from "@/components/BlogCard";
import EmptyPlaceholder from "@/components/ui/EmptyPlaceholder";
import BreadCrumbs from "@/components/BreadCrumbs";
import { ROUTES } from "@/lib/routes";
import { LeftArrowIcon, MoreHorizontalIcon, RightArrowIcon } from "@/components/Icons";
import { cn } from "@/lib/utils";

type BlogListViewProps = {
  selectedId: string;
  page?: number;
  categoryId?: string;
  pathnameBase?: string;
  lockCategory?: boolean;
};

const BLOGS_PER_PAGE = 9;

const allTab: BlogResponse = {
  id: 0,
  name: "All",
  slug: "all",
  description: "",
  image_url: "",
  blogs: [],
  blog_count: 0,
};

function paginationPageNumbers(totalPages: number, currentPage: number): number[] {
  if (totalPages <= 0) return [];
  if (totalPages <= 30) {
    return Array.from({ length: totalPages }, (_, i) => i + 1);
  }
  const set = new Set<number>([1, totalPages, currentPage]);
  for (let d = -3; d <= 3; d++) {
    const p = currentPage + d;
    if (p >= 1 && p <= totalPages) set.add(p);
  }
  return Array.from(set).sort((a, b) => a - b);
}

function buildBlogsHref(basePath: string, categoryId: string, page: number, includeCategory: boolean) {
  const params = new URLSearchParams();
  if (includeCategory && categoryId !== "0") {
    params.set("category", categoryId);
  }
  if (page > 1) {
    params.set("page", String(page));
  }
  const qs = params.toString();
  return qs ? `${basePath}?${qs}` : basePath;
}

const BlogListView = async ({
  selectedId,
  page = 1,
  categoryId,
  pathnameBase = ROUTES.BLOGS,
  lockCategory,
}: BlogListViewProps) => {
  const currentPage = Number.isNaN(page) || page < 1 ? 1 : page;
  const selectedCategory = categoryId ?? selectedId ?? "0";
  const isLockedCategory = lockCategory ?? (selectedId !== "0" && categoryId == null);

  const [categoryResponse, blogsResponse] = await Promise.all([
    getBlogList(),
    getBlogPostList(
      selectedCategory === "0"
        ? { limit: BLOGS_PER_PAGE, page: currentPage }
        : { categoryId: selectedCategory, limit: BLOGS_PER_PAGE, page: currentPage }
    ),
  ]);

  const tabs = [
    allTab,
    ...(categoryResponse.status === ServerActionStatus.SUCCESS ? categoryResponse.data : []),
  ];

  if (blogsResponse.status !== ServerActionStatus.SUCCESS) {
    return <EmptyPlaceholder title="Uh, oh!" description="Failed to load blogs" />;
  }

  const blogs: BlogList[] = blogsResponse.data.blogs ?? [];
  const pagination = blogsResponse.data.pagination;
  const totalPages = pagination?.totalPages ?? 1;
  const pageNumbers = paginationPageNumbers(totalPages, pagination?.currentPage ?? currentPage);

  const breadcrumbs = [
    { label: "Home", href: ROUTES.WELCOME },
    { label: "Blogs", href: ROUTES.BLOGS, isActive: true },
  ];

  return (
    <main className="flex flex-col gap-7 px-4 py-7 lg:px-9 xl:gap-10 xl:px-12.5 xl:py-10">
      <BreadCrumbs items={breadcrumbs} />
      <section className="w-full">
        <h1 className="primary-gradient-600 w-fit text-h4 font-semibold md:text-h2">Blogs</h1>
        <div className="mt-2.5 w-full lg:-mt-16">
          <div className="ml-auto flex max-w-full gap-3 overflow-x-auto whitespace-nowrap rounded-md border border-skin-neutral-100 bg-skin-base px-3.5 py-2.5 md:px-5 md:py-4 lg:max-w-3xl xl:max-w-5xl">
            {tabs.map((tab) => {
              const tabKey = String(tab.id);
              const isActive = tabKey === selectedCategory;
              const href = isLockedCategory
                ? tabKey === selectedCategory
                  ? buildBlogsHref(pathnameBase, selectedCategory, 1, false)
                  : buildBlogsHref(ROUTES.BLOGS, tabKey, 1, true)
                : buildBlogsHref(pathnameBase, tabKey, 1, true);
              return (
                <Link
                  key={tab.id}
                  prefetch={false}
                  href={href}
                  className={cn(
                    "flex h-10 min-w-fit shrink-0 items-center justify-center rounded border border-[#035335] px-5",
                    "text-content-2 font-semibold leading-none text-[#035335] no-underline md:text-title-2",
                    "first:min-w-[60px] hover:opacity-90",
                    isActive && "border-none bg-primary-gradient-100 text-skin-white shadow-md"
                  )}
                >
                  {tab.name}
                </Link>
              );
            })}
          </div>

          <div className="px-1 py-3 sm:py-7">
            {!blogs.length ? (
              <EmptyPlaceholder title="Uh, oh!" description="No blogs available" />
            ) : (
              <div className="grid grid-cols-1 gap-5.5 overflow-hidden sm:grid-cols-2 lg:grid-cols-3 [&>*]:min-w-0">
                {blogs.map((blog, idx) => (
                  <BlogCard key={blog.id ?? idx} blog={blog} />
                ))}
              </div>
            )}
          </div>
        </div>
      </section>

      {totalPages > 1 ? (
        <nav aria-label="Blogs pagination" className="my-2 flex flex-wrap items-center justify-end gap-2">
          {currentPage > 1 ? (
            <Link
              prefetch={false}
              href={buildBlogsHref(pathnameBase, selectedCategory, currentPage - 1, !isLockedCategory)}
              aria-label="Previous page"
              className="inline-flex h-9 w-9 min-w-9 items-center justify-center rounded-10 bg-skin-neutral-50 p-2 text-skin-neutral-500 no-underline"
            >
              <LeftArrowIcon stroke="#6B7270" />
            </Link>
          ) : (
            <span
              aria-hidden
              className="inline-flex h-9 w-9 min-w-9 cursor-not-allowed items-center justify-center rounded-10 bg-skin-neutral-50 p-2 opacity-40"
            >
              <LeftArrowIcon stroke="#6B7270" />
            </span>
          )}

          {pageNumbers.map((pageNum, idx, arr) => {
            const prevNum = idx > 0 ? arr[idx - 1] : null;
            const showEllipsis = prevNum !== null && pageNum - prevNum > 1;
            return (
              <React.Fragment key={pageNum}>
                {showEllipsis ? (
                  <span
                    aria-hidden
                    className="inline-flex h-9 w-9 min-w-9 items-center justify-center rounded-10 bg-skin-neutral-50 font-semibold text-skin-neutral-500"
                  >
                    <MoreHorizontalIcon />
                  </span>
                ) : null}
                <Link
                  prefetch={false}
                  href={buildBlogsHref(pathnameBase, selectedCategory, pageNum, !isLockedCategory)}
                  aria-current={pageNum === currentPage ? "page" : undefined}
                  className={cn(
                    "inline-flex h-9 min-w-9 items-center justify-center rounded-10 bg-skin-neutral-50 p-2 font-semibold no-underline",
                    "text-title-2 text-skin-neutral-500 hover:opacity-90",
                    pageNum === currentPage && "bg-primary-gradient-100 !text-skin-white"
                  )}
                >
                  {pageNum}
                </Link>
              </React.Fragment>
            );
          })}

          {currentPage < totalPages ? (
            <Link
              prefetch={false}
              href={buildBlogsHref(pathnameBase, selectedCategory, currentPage + 1, !isLockedCategory)}
              aria-label="Next page"
              className="inline-flex h-9 w-9 min-w-9 items-center justify-center rounded-10 bg-skin-neutral-50 p-2 text-skin-neutral-500 no-underline"
            >
              <RightArrowIcon stroke="#3A4340" className="h-4.5 w-4.5" />
            </Link>
          ) : (
            <span
              aria-hidden
              className="inline-flex h-9 w-9 min-w-9 cursor-not-allowed items-center justify-center rounded-10 bg-skin-neutral-50 p-2 opacity-40"
            >
              <RightArrowIcon stroke="#3A4340" className="h-4.5 w-4.5" />
            </span>
          )}
        </nav>
      ) : null}
    </main>
  );
};

export default BlogListView;

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