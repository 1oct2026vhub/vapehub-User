import { AsyncReactElement } from '@/lib/config/app.config';
import { Metadata, NextPage } from 'next'
import BlogListView from './_components/BlogList';

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

    return (
        <BlogListView selectedId={"0"} categoryId={categoryId} page={page} />
    )
}

export default BlogsListingPage
