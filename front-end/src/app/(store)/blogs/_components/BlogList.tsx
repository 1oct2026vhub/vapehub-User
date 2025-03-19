"use client"
import { Key } from '@react-types/shared';
import type { BlogList, BlogResponse } from '@/lib/config/blog.config';
import React, { ReactElement, useEffect, useState } from 'react'
import { Card, CardBody, Tab, Tabs } from '@nextui-org/react';
import { getBlogList, getBlogPostList } from '@/lib/server.actions';
import { ServerActionStatus } from '@/lib/config/app.config';
import BlogCard from '@/components/BlogCard';
import { ROUTES } from '@/lib/routes';
import BreadCrumbs from '@/components/BreadCrumbs';
const BlogListView: React.FC<{ selectedId: string }> = ({ selectedId }): ReactElement => {

    const handleTabChange = (tabKey: Key) => {
        setSelectedTab(tabKey.toString());
    };
    const [blogs, setBlogs] = useState<BlogList[]>([]);
    const [tabs, setTabs] = useState<BlogResponse[]>([]);
    const [selectedTab, setSelectedTab] = useState<string>(selectedId);
    const [loading, setLoading] = useState(true); 
    const breadcrumbs = [
        { label: "Home", href: ROUTES.WELCOME },
        { label: "Blogs", href: ROUTES.BLOGS, isActive: true },
    ];
    useEffect(() => {
        const fetchBlogsCategory = async () => {
            const response = await getBlogList();
            if (response.status === ServerActionStatus.ERROR) {
                return <p>{response.message}</p>;
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
    },[])


    useEffect(() => {
        const fetchBlogsPost = async () => {
            setLoading(true); 
            let response;
            if(selectedTab === "" || selectedTab === "0" || !selectedTab){
                response = await getBlogPostList();
            }else{
                response = await getBlogPostList({ categoryId: selectedTab, limit: 10, offset: 0 });
            }
            if (response.status === ServerActionStatus.ERROR) {
                setBlogs([]);
            } else { 
                setBlogs(response.data.blogs);

            }
            setLoading(false);
        };


        fetchBlogsPost();
    }, [selectedTab]);


    return (
         <main className='px-4 lg:px-9 xl:px-12.5 py-7 xl:py-10 flex flex-col gap-7 xl:gap-10'>
            <BreadCrumbs items={breadcrumbs} />
            <section className="w-full">
                <h1 className='primary-gradient-600 text-h5 md:text-h3 font-bold w-fit'>Blogs</h1>
                <div className='w-full mt-2.5 lg:-mt-16 '>
                   
        <div className='w-full mt-2.5 lg:-mt-16'>
            <Tabs aria-label="Options" selectedKey={selectedTab} onSelectionChange={(e) => handleTabChange(e)}
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
                    <Tab key={tab.id} title={tab.name} >
                        <Card classNames={{
                            base: "!bg-transparent border-none shadow-none p-0"
                        }}>
                            <CardBody className='px-1 py-3 sm:py-7 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5.5 overflow-hidden'>
                                {
                                    loading ? <p>Loading..</p> : !blogs.length ? <p>No Blogs Available</p> : blogs.map((blog: BlogList, idx: number) => (
                                        <BlogCard key={idx} blog={blog}/>                                        
                                    ))
                                }


                            </CardBody>
                        </Card>
                    </Tab>
                ))}
            </Tabs>
        </div>
        
                </div>

            </section>
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