 
import BrandCard from '@/components/BrandCard'
import BreadCrumbs from '@/components/BreadCrumbs'
import SectionHeading from '@/components/ui/SectionHeading'
import { AsyncReactElement, ServerActionStatus } from '@/lib/config/app.config'
import { BrandConfig } from '@/lib/config/brand.config'
import { ROUTES } from '@/lib/routes'
import { getBrandList } from '@/lib/server.actions'
import { Metadata, NextPage } from 'next'
import React from 'react'

export const metadata: Metadata = {
    title: "BRANDS | VapeHub",
    description: "",
};

const BrandsListing: NextPage = async ():
 AsyncReactElement => {
    const response = await getBrandList();
    if (response.status == ServerActionStatus.ERROR) {
        return <div>Something went wrong</div>;
    }
    const brands:BrandConfig[] = response.data ?? [];
    
    const breadcrumbs = [
        { label: "Home", href: ROUTES.WELCOME },
        { label: "Brands", href: ROUTES.BRANDS, isActive: true },
    ];
 

    return (
        
            <div>
                <section className="product-listing-container flex-col">
                    <BreadCrumbs items={breadcrumbs} />
                    <div>
                        <SectionHeading title="Brands" className="w-fit" />
                        <div className="text-content-2 md:text-content-1 font-semibold md:font-bold text-skin-neutral-400">
                            <p>
                                At Vapehub we offer products from all the major brands in the world! Whether it’s the leading disposable vape brands or the leading E-Liquid brands, we have them all! If you’re looking to buy a product from a particular brand, you may browse the list below and click on the brand of your choice.
                            </p>
                        </div>
                    </div>
                </section>
                <section className='product-listing-container'>
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
                </section>
            </div>
            
    )
}

export default BrandsListing
