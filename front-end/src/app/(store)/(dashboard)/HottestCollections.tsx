import BrandCard from '@/components/BrandCard'
import SectionHeading from '@/components/ui/SectionHeading'
import { Button } from '@nextui-org/button';
import React from 'react'

const HottestCollections: React.FC = () => {
    const brands = [
        { imageSrc: "/images/brand-1.png", altText: "Brand 1", href: "#" },
        { imageSrc: "/images/brand-2.png", altText: "Brand 2", href: "#" },
        { imageSrc: "/images/brand-3.png", altText: "Brand 3", href: "#" },
        { imageSrc: "/images/brand-4.png", altText: "Brand 4", href: "#" },
        { imageSrc: "/images/brand-5.png", altText: "Brand 5", href: "#" },
        { imageSrc: "/images/brand-6.png", altText: "Brand 6", href: "#" },
        { imageSrc: "/images/brand-7.png", altText: "Brand 7", href: "#" },
        { imageSrc: "/images/brand-8.png", altText: "Brand 8", href: "#" },
        { imageSrc: "/images/brand-9.png", altText: "Brand 9", href: "#" },
        { imageSrc: "/images/brand-10.png", altText: "Brand 10", href: "#" },
    ];


    return (
        <section className='bg-skin-white border border-skin-neutral-100 py-7.5 md:py-14 lg:mx-16 rounded-[32px] mt-5 md:mt-10 space-y-5 md:space-y-11 text-center'>
            <div className='space-y-2 text-center px-10'>
                <SectionHeading title='The Hottest COLLECTIONS' className='text-h4 md:text-h3' />
                <h2 className='text-content-2 md:text-lg text-skin-neutral-300 font-bold'>The leading brands delivering exceptional products</h2>
            </div>
            <div className='flex flex-wrap items-center justify-center gap-6 md:gap-8.5 px-8'>
                {brands.map((brand, index) => (
                    <BrandCard
                        key={index}
                        imageSrc={brand.imageSrc}
                        altText={brand.altText}
                        href={brand.href}
                    />
                ))}
            </div>
            <Button
                size="lg"
                radius="sm"
                color="primary"
                className="btn primary-btn shadow-input w-fit !min-w-fit rounded-10 !text-content-2 md:!text-title-2 max-md:h-fit !leading-none !px-4 md:!px-5 !py-2 md:!py-4"
            >
                View All
            </Button>
        </section>
    )
}

export default HottestCollections
