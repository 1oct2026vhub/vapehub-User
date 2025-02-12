'use client'

import BlogCard from '@/components/BlogCard';
import BreadCrumbs from '@/components/BreadCrumbs';
import SectionHeading from '@/components/ui/SectionHeading';
import { Card, CardBody, Tab, Tabs } from '@nextui-org/react';
import { NextPage } from 'next'
import React, { ReactElement } from 'react'

const BlogsListingPage: NextPage = (): ReactElement => {

    const breadcrumbs = [
        { label: "Home", href: "/" },
        { label: "Blogs", href: "/blogs", isActive: true },
    ];

    return (
        <main className='px-4 lg:px-9 xl:px-12.5 py-7 xl:py-10 flex flex-col gap-7 xl:gap-10'>
            <BreadCrumbs items={breadcrumbs} />
            <section className="w-full">
                <SectionHeading title="Blogs" className='w-fit max-md:!text-h5' />
                <div className='w-full mt-2.5 lg:-mt-16'>
                    <Tabs aria-label="Options"
                        variant='bordered'
                        color='primary'
                        classNames={{
                            base: "w-full",
                            tabList: "gap-3 px-3.5 md:px-5 py-2.5 md:py-4 lg:ml-auto border border-skin-neutral-100 rounded-xl !bg-skin-base",
                            cursor: "bg-primary-gradient-100 border-none text-skin-white rounded-lg shadow-md",
                            tab: "rounded-lg min-w-[124px] h-10 border border-skin-primary2-500 text-skin-primary2-500 group-data-[selected=true]:!border-none",
                            tabContent: "group-data-[selected=true]:!text-skin-white text-title-2 font-semibold leading-none",
                            panel: "!px-0"
                        }}
                    >
                        <Tab key="All" title="All">
                            <Card classNames={{
                                base: "!bg-transparent border-none shadow-none p-0"
                            }}>
                                <CardBody className='px-1 py-3 sm:py-7 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5.5'>
                                    <BlogCard />
                                    <BlogCard />
                                    <BlogCard />
                                    <BlogCard />
                                    <BlogCard />
                                    <BlogCard />
                                </CardBody>
                            </Card>
                        </Tab>
                        <Tab key="Category 01" title="Category 01">
                            <Card classNames={{
                                base: "!bg-transparent border-none shadow-none p-0"
                            }}>
                                <CardBody className='px-1 py-3 sm:py-7 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5.5'>
                                    <BlogCard />
                                    <BlogCard />
                                    <BlogCard />
                                    <BlogCard />
                                    <BlogCard />
                                    <BlogCard />
                                </CardBody>
                            </Card>
                        </Tab>
                        <Tab key="Category 02" title="Category 02">
                            <Card classNames={{
                                base: "!bg-transparent border-none shadow-none p-0"
                            }}>
                                <CardBody className='px-1 py-3 sm:py-7 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5.5'>
                                    <BlogCard />
                                    <BlogCard />
                                    <BlogCard />
                                    <BlogCard />
                                    <BlogCard />
                                    <BlogCard />
                                </CardBody>
                            </Card>
                        </Tab>
                    </Tabs>
                </div>

            </section>
        </main>
    )
}

export default BlogsListingPage
