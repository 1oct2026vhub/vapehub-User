import BrandCard from '@/components/BrandCard'
import EmptyPlaceholder from '@/components/ui/EmptyPlaceholder';
import SectionHeading from '@/components/ui/SectionHeading'
import { BrandConfig } from '@/lib/config/brand.config';
import { ROUTES } from '@/lib/routes';
import { Button } from '@nextui-org/button';
import Link from 'next/link';
import React from 'react'
import { getBrandList } from '@/lib/server.actions'
import { ServerActionStatus } from '@/lib/config/app.config'

const HottestCollections: React.FC = async () => {
    const brandsResponse = await getBrandList({ page: 1, limit: 10 });
    if (brandsResponse.status !== ServerActionStatus.SUCCESS) {
        return <EmptyPlaceholder title='Uh, oh!' description='Failed to load brands' />;
    }
    const brands: BrandConfig[] = brandsResponse.data?.brands ?? [];
    if (!brands.length) {
        return <EmptyPlaceholder title='Uh, oh!' description='No brands available' />;
    }

    return (
        <section className='bg-skin-white border border-skin-neutral-100 py-7.5 md:p-12.5 rounded-lg space-y-5 md:space-y-10 text-center'>
            <div className='space-y-2 text-center px-10'>
                <SectionHeading title='The HOTTEST COLLECTIONS' className='!text-h5 md:!text-h3 w-fit mx-auto uppercase' />
                <p className='text-content-2 md:text-title-2 text-skin-neutral-300 font-bold'>The leading brands delivering exceptional products</p>
            </div>
            <div className='flex flex-wrap items-center justify-center gap-6 md:gap-8.5 px-8'>
                {brands.map((brand, index) => (
                    <BrandCard
                        key={index}
                        imageSrc={brand.logo_url}
                        altText={brand.alt_text ?? brand.name}
                        href={ROUTES.BRAND.replace(':slug', brand.slug)}
                    />
                ))}
            </div>
            <Button
                as={Link}
                href={ROUTES.BRANDS}
                size="lg"
                radius="sm"
                color="primary"
                className="btn primary-btn shadow-input w-fit !min-w-fit !rounded !text-content-2 md:!text-h5 !h-fit md:!h-11 !leading-none uppercase font-semibold font-oswald !px-1.5 md:!px-3 !py-1 md:!py-1.5"
            >
              View All
            </Button>
        </section>
    )
}

export default HottestCollections
