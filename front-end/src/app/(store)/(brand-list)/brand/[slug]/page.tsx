import { AsyncReactElement, RouteParams} from '@/lib/config/app.config';
import { NextPage } from 'next';
import React from 'react';
import { Metadata } from 'next';
import BrandProducts from '../_components/BrandProducts';

export async function generateMetadata({ params }: Props): Promise<Metadata> {
    const { slug } = await params;
    return {
        title: `${slug} | VapeHub`,
        openGraph: {
            title: `${slug} | VapeHub`,
            images: ['/some-specific-page-image.jpg'],
        },
    };
}

interface Props {
    params: Promise<RouteParams>;
}

  
const BrandPage:  NextPage<Props> = async ({params}): AsyncReactElement => {
     const {slug} = await params;
    console.log(slug);
    
    return (
        <div>
             <BrandProducts />
        </div>
    );
};


export default BrandPage;