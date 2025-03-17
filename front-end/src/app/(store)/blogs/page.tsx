import BreadCrumbs from '@/components/BreadCrumbs';
import { AsyncReactElement, ServerActionStatus } from '@/lib/config/app.config';
import { getBlogList } from '@/lib/server.actions';

import { Metadata, NextPage } from 'next'
import { ROUTES } from '@/lib/routes';
import { BlogResponse } from '@/lib/config/blog.config';
import BlogList from './_components/BlogList';

export const metadata: Metadata = {
    title: "Blogs | VapeHub",
    description: "",
};
const BlogsListingPage: NextPage = async (): AsyncReactElement => {

    const breadcrumbs = [
        { label: "Home", href: ROUTES.WELCOME },
        { label: "Blogs", href: ROUTES.BLOGS, isActive: true },
    ];


    const response = await getBlogList();
    if (response.status === ServerActionStatus.ERROR) {
        return <p>{response.message}</p>;
    }
    const blogs: BlogResponse[] = response.data;

    return (
        <main className='px-4 lg:px-9 xl:px-12.5 py-7 xl:py-10 flex flex-col gap-7 xl:gap-10'>
            <BreadCrumbs items={breadcrumbs} />
            <section className="w-full">
                <h1 className='primary-gradient-600 text-h5 md:text-h3 font-bold w-fit'>Blogs</h1>
                <div className='w-full mt-2.5 lg:-mt-16 '>
                    <BlogList blogs={blogs} />
                </div>

            </section>
        </main>
    )
}

export default BlogsListingPage
