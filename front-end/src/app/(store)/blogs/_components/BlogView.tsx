"use client"
import BreadCrumbs from "@/components/BreadCrumbs";
import { BlogBySlugResponse } from "@/lib/config/blog.config";
import { ROUTES } from "@/lib/routes";
import Subscription from "../../(dashboard)/_components/Subscription";
import BlogCard from "@/components/BlogCard";
import { Card, CardBody } from "@nextui-org/react";
import EmptyPlaceholder from "@/components/ui/EmptyPlaceholder";

interface BlogViewProps {
    data: BlogBySlugResponse;
}

const BlogView = ({ data }: BlogViewProps) => {
    const breadcrumbs = [
        { label: "Home", href: ROUTES.WELCOME },
        { label: "Blogs", href: ROUTES.BLOGS },
        { label: data.name, href: data.slug, isActive: true },
    ];


    return (
        <main className='px-4 lg:px-9 xl:px-12.5 py-7 xl:py-10 flex flex-col gap-7 xl:gap-10 w-full '>
            <BreadCrumbs items={breadcrumbs} />
            <h1 className='primary-gradient-600 text-h5 md:text-h3 font-bold w-fit'>Blogs</h1>
            <Card classNames={{
                            base: "!bg-transparent border-none shadow-none p-0"
                        }}>
                            <CardBody className='px-1 py-3 sm:py-7 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5.5 overflow-hidden'>
                {
                    data.blogs.length === 0 ? (
                         <EmptyPlaceholder title='Uh, oh!' description='No blogs found' />
                    ) : (
                        data.blogs.map((blog, idx) => (
                            <BlogCard key={idx} blog={blog}/> 

                        ))
                    )}
                </CardBody>
            </Card>
            <Subscription />
        </main>
    );
};

export default BlogView;