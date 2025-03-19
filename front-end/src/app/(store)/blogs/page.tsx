import { AsyncReactElement } from '@/lib/config/app.config';
import { Metadata, NextPage } from 'next'
import BlogListView from './_components/BlogList';

export const metadata: Metadata = {
    title: "Blogs | VapeHub",
    description: "",
};
const BlogsListingPage: NextPage = async (): AsyncReactElement => {

    return (
        <BlogListView selectedId={"0"} />
    )
}

export default BlogsListingPage
