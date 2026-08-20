import { AsyncReactElement, ServerActionStatus } from '@/lib/config/app.config';
import { Metadata, NextPage } from 'next'
import BlogListView from './_components/BlogList';
import { getBlogList, getBlogPostList } from '@/lib/server.actions';
import type { Author, BlogResponse } from '@/lib/config/blog.config';
import { getAuthorArticlesHeading, getAuthorDisplayName } from '@/lib/config/blog-author-bio.config';

type BlogsListingPageProps = {
    searchParams: Promise<Record<string, string | string[] | undefined>>;
};

const parseSearchParam = (value: string | string[] | undefined, fallback?: string) =>
    typeof value === "string" ? value : Array.isArray(value) ? value[0] ?? fallback : fallback;

export async function generateMetadata({ searchParams }: BlogsListingPageProps): Promise<Metadata> {
    const params = await searchParams;
    const authorId = parseSearchParam(params.authorId);
    if (!authorId) {
        return { title: "Blogs | VapeHub", description: "" };
    }
    const blogsResponse = await getBlogPostList({ limit: 9, page: 1, authorId });
    const authorName = blogsResponse.status === ServerActionStatus.SUCCESS
        ? getAuthorDisplayName(blogsResponse.data.blogs[0]?.author)
        : "VapeHub";
    return {
        title: `${getAuthorArticlesHeading(authorName)} | VapeHub`,
        description: "",
    };
}

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
    const authorId = parseSearchParam(params.authorId);
    const blogListPayload = {
        limit: 9,
        page,
        ...(categoryId !== "0" ? { categoryId } : {}),
        ...(authorId ? { authorId } : {}),
    };
    const [categoriesResponse, blogsResponse] = await Promise.all([
        getBlogList(),
        getBlogPostList(blogListPayload),
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
    const author: Author | undefined = authorId ? initialBlogs[0]?.author : undefined;
    const authorName = authorId ? getAuthorDisplayName(author) : undefined;

    return (
        <BlogListView
            selectedId={categoryId}
            authorId={authorId}
            authorName={authorName}
            author={author}
            initialTabs={initialTabs}
            initialBlogs={initialBlogs}
            initialPage={page}
            initialTotalPages={initialTotalPages}
        />
    )
}

export default BlogsListingPage
