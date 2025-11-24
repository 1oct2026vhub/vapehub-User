import BreadCrumbs from '@/components/BreadCrumbs'
import { AsyncReactElement } from '@/lib/config/app.config'
import { ROUTES } from '@/lib/routes'
import { Metadata } from 'next'
// import React, { Suspense } from 'react'
import BrandList from './BrandList'
// import SuspenseLoader from '@/components/ui/SuspenseLoader'

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
    title: "BRANDS | VapeHub",
    description: "",
};

const BrandsListing = async (): AsyncReactElement => {
    
    const breadcrumbs = [
        { label: "Home", href: ROUTES.WELCOME },
        { label: "Brands", href: ROUTES.BRANDS, isActive: true },
    ];

    return (
        <div className='w-full max-w-[1520px] mx-auto'>
            <section className="product-listing-container flex-col">
                <BreadCrumbs items={breadcrumbs} />
                <div>
                    <h1 className="primary-gradient-600 text-h5 md:text-h2 font-semibold w-fit">Brands</h1>
                    <div className="product-content text-content-1 md:text-content-1 font-normal text-skin-neutral-500 leading-relaxed mt-2">
                        <p>
                            At Vapehub we offer products from all the major brands in the world! Whether it&apos;s the leading disposable vape brands or the leading E-Liquid brands, we have them all! If you&apos;re looking to buy a product from a particular brand, you may browse the list below and click on the brand of your choice.
                        </p>
                    </div>
                </div>
            </section>
            {/* <Suspense fallback={<SuspenseLoader />}> */}
                <BrandList />
            {/* </Suspense> */}
        </div>
    )
}

export default BrandsListing 