import { AsyncReactElement, ServerActionStatus } from '@/lib/config/app.config';
import { Metadata, NextPage } from 'next'
import BlogListView from './_components/BlogList';
import { getBlogList, getBlogPostList } from '@/lib/server.actions';
import type { BlogResponse } from '@/lib/config/blog.config';

export const metadata: Metadata = {
    title: "Blogs | VapeHub",
    description: "",
};
type BlogsListingPageProps = {
    searchParams: Promise<Record<string, string | string[] | undefined>>;
};

const BlogsListingPage: NextPage<BlogsListingPageProps> = async ({ searchParams }): AsyncReactElement => {
    const params = await searchParams;
    const rawCategory = params.category;
    const categoryId = typeof rawCategory === "string"
        ? rawCategory
        : Array.isArray(rawCategory) ? rawCategory[0] ?? "0" : "0";
    const rawPage = params.page;
    const pageParam = typeof rawPage === "string"
        ? rawPage
        : Array.isArray(rawPage) ? rawPage[0] : "1";
    const pageFromQuery = Number.parseInt(pageParam ?? "1", 10);
    const page = Number.isNaN(pageFromQuery) || pageFromQuery < 1 ? 1 : pageFromQuery;
    const [categoriesResponse, blogsResponse] = await Promise.all([
        getBlogList(),
        categoryId === "0"
            ? getBlogPostList({ limit: 9, page })
            : getBlogPostList({ categoryId, limit: 9, page }),
    ]);

    const allTab: BlogResponse = {
        id: 0,
        name: "All",
        slug: "all",
        description: "",
        image_url: "",
        blogs: [],
        blog_count: 0
    };
    const initialTabs: BlogResponse[] = categoriesResponse.status === ServerActionStatus.SUCCESS
        ? [allTab, ...categoriesResponse.data]
        : [allTab];
    const initialBlogs = blogsResponse.status === ServerActionStatus.SUCCESS ? blogsResponse.data.blogs : [];
    const initialTotalPages = blogsResponse.status === ServerActionStatus.SUCCESS ? blogsResponse.data.pagination.totalPages : 1;

    return (
        <BlogListView
            selectedId={categoryId}
            initialTabs={initialTabs}
            initialBlogs={initialBlogs}
            initialPage={page}
            initialTotalPages={initialTotalPages}
        />
    )
}

export default BlogsListingPage
