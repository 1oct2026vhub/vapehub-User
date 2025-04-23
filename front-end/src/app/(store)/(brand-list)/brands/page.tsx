import BreadCrumbs from '@/components/BreadCrumbs'
import { AsyncReactElement } from '@/lib/config/app.config'
import { ROUTES } from '@/lib/routes'
import { Metadata } from 'next'
import React from 'react'
import BrandList from './BrandList'

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
        <div>
            <section className="product-listing-container flex-col">
                <BreadCrumbs items={breadcrumbs} />
                <div>
                    <h1 className="primary-gradient-600 text-title-1 md:text-h5 xl:text-h3 font-bold w-fit">Brands</h1>
                    <div className="text-content-2 md:text-content-1 font-semibold md:font-bold text-skin-neutral-400">
                        <p>
                            At Vapehub we offer products from all the major brands in the world! Whether it&apos;s the leading disposable vape brands or the leading E-Liquid brands, we have them all! If you&apos;re looking to buy a product from a particular brand, you may browse the list below and click on the brand of your choice.
                        </p>
                    </div>
                </div>
            </section>
            <BrandList />
        </div>
    )
}

export default BrandsListing 