import BrandCard from '@/components/BrandCard'
import SectionHeading from '@/components/ui/SectionHeading'
import { AsyncReactElement, ServerActionStatus } from '@/lib/config/app.config';
import { BrandConfig } from '@/lib/config/brand.config';
import { ROUTES } from '@/lib/routes';
import { getBrandList } from '@/lib/server.actions';
import { Button } from '@nextui-org/button';
import Link from 'next/link';
import React from 'react'

const HottestCollections: React.FC = async ():Promise<AsyncReactElement> => {
     const response = await getBrandList();
    if (response.status == ServerActionStatus.ERROR) {
        return <div>No Collections</div>;
    }
    const brands: BrandConfig[] = (response.data ?? []).slice(0, 10);
    

    return (
        <section className='bg-skin-white border border-skin-neutral-100 py-7.5 md:py-14 lg:mx-16 rounded-[32px] mt-5 md:mt-10 space-y-5 md:space-y-11 text-center'>
            <div className='space-y-2 text-center px-10'>
                <SectionHeading title='The Hottest COLLECTIONS' className='text-h4 md:text-h3 w-fit mx-auto' />
                <p className='text-content-2 md:text-lg text-skin-neutral-300 font-bold'>The leading brands delivering exceptional products</p>
            </div>
            <div className='flex flex-wrap items-center justify-center gap-6 md:gap-8.5 px-8'>
                {brands.map((brand, index) => (
                    <BrandCard
                        key={index}
                        imageSrc={brand.logo_url}
                        altText={brand.name}
                        href={ROUTES.BRAND.replace(':slug', brand.slug)}
                    />
                ))}
            </div>
           
            <Button
                size="lg"
                radius="sm"
                color="primary"
                className="btn primary-btn shadow-input w-fit !min-w-fit rounded-10 !text-content-2 md:!text-title-2 max-md:h-fit !leading-none !px-4 md:!px-5 !py-2 md:!py-4"
            >
                <Link href={ROUTES.BRANDS} >View All</Link> 
            </Button>
           
        </section>
    )
}

export default HottestCollections
