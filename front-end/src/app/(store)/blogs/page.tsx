'use client'

import BlogCard from '@/components/BlogCard';
import BreadCrumbs from '@/components/BreadCrumbs';
import { ServerActionStatus } from '@/lib/config/app.config'; 
import { getBlogList } from '@/lib/server.actions';
import { Card, CardBody } from '@nextui-org/react';
import { NextPage } from 'next'
import React, { ReactElement, useEffect, useState } from 'react'
// import { Key } from '@react-types/shared';
import { ROUTES } from '@/lib/routes';
import { BlogResponse } from '@/lib/config/blog.config';

const BlogsListingPage: NextPage = (): ReactElement => {

    const breadcrumbs = [
        { label: "Home", href: ROUTES.WELCOME },
        { label: "Blogs", href: ROUTES.BLOGS, isActive: true },
    ];
    // const tabs: TabItemProps[] = [
    //     {
    //         key: "",
    //         title: "All",
            
    //     },
    //     {
    //         key: "Geek Zone",
    //         title: "Geek Zone",
    //     },
    //     {
    //         key: "Product Reviews",
    //         title: "Product Reviews",
    //     },
    // ]
    const [blogs, setBlogs] = useState<BlogResponse[]>([]);
    // const [selectedTab, setSelectedTab] = useState<Key>("");
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchBlogs = async () => {
            setLoading(true);
            const response = await getBlogList();
            if (response.status === ServerActionStatus.ERROR) {
                setBlogs([]);
            } else {
                setBlogs(response.data);
            }
            setLoading(false);
        };


        fetchBlogs();
    }, []);

    // const handleTabChange = (tabKey: Key) => {
    //     setSelectedTab(tabKey);
    // };

    

    return (
        <main className='px-4 lg:px-9 xl:px-12.5 py-7 xl:py-10 flex flex-col gap-7 xl:gap-10'>
            <BreadCrumbs items={breadcrumbs} />
            <section className="w-full">
                <h1 className='primary-gradient-600 text-h5 md:text-h3 font-bold w-fit'>Blogs</h1>
                <div className='w-full mt-2.5 lg:-mt-16 '>
                    {/* <Tabs aria-label="Options" onSelectionChange={(e) => handleTabChange(e)}
                        variant='bordered'
                        color='primary'
                        classNames={{
                            base: "w-full",
                            tabList: "gap-3 px-3.5 md:px-5 py-2.5 md:py-4 lg:ml-auto border border-skin-neutral-100 rounded-xl !bg-skin-base",
                            cursor: "bg-primary-gradient-100 border-none text-skin-white rounded-lg shadow-md",
                            tab: "rounded-lg min-w-[124px] h-10 border border-skin-primary2-500 text-skin-primary2-500 group-data-[selected=true]:!border-none",
                            tabContent: "group-data-[selected=true]:!text-skin-white text-content-2 md:text-title-2 font-semibold leading-none",
                            panel: "!px-0"
                        }}
                    >
                        
                        {tabs.map((tab) => (
                            <Tab key={tab.key} title={tab.title} > */}
                                <Card classNames={{
                                    base: "!bg-transparent border-none shadow-none p-0 mt-12"
                                }}>
                                    <CardBody className='px-1 py-3 sm:py-7 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5.5 overflow-hidden'>
                                        {
                                           loading? <p>Loading..</p>: !blogs.length ?<p className="mt-10 text-skin-neutral-500 text-title-1 md:text-h4 font-semibold">No Blogs Available</p>: blogs.map((blog: BlogResponse, idx: number) => (
                                                <BlogCard key={idx} blog={blog} />
                                            ))
                                        }

                                    </CardBody>
                                </Card>
                            {/* </Tab>
                        ))}
                    </Tabs> */}
                </div>

            </section>
        </main>
    )
}

export default BlogsListingPage
