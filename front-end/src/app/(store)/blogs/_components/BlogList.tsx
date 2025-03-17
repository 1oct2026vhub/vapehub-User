"use client"
import BlogCard from '@/components/BlogCard';

import { BlogResponse } from '@/lib/config/blog.config';
import React, { ReactElement } from 'react'
import { Card, CardBody } from '@nextui-org/react';
const BlogList: React.FC<{ blogs: BlogResponse[] }> = ({ blogs }): ReactElement => {
    return  <Card classNames={{
        base: "!bg-transparent border-none shadow-none p-0 mt-12"
    }}>
        <CardBody className='px-1 py-3 sm:py-7 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5.5 overflow-hidden'>
            {
               blogs.map((blog: BlogResponse, idx: number) => (
                    <BlogCard key={idx} blog={blog} />
                ))
            }


        </CardBody>
    </Card>;
}

export default BlogList