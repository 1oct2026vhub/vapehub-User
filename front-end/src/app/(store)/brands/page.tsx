"use client"

import BrandCard from '@/components/BrandCard'
import BreadCrumbs from '@/components/BreadCrumbs'
import Footer from '@/components/Footer'
import Header from '@/components/Header'
import { NextPage } from 'next'
import React, { ReactElement } from 'react'


const BrandsListing: NextPage = (): ReactElement => {

    const breadcrumbs = [
        { label: "Home", href: "/" },
        { label: "Brands", href: "/brands", isActive: true },
    ];

    const brands = [
        { imageSrc: "/images/brand-1.png", altText: "Brand 1", href: "/disposable-vapes" },
        { imageSrc: "/images/brand-2.png", altText: "Brand 2", href: "/disposable-vapes" },
        { imageSrc: "/images/brand-3.png", altText: "Brand 3", href: "/disposable-vapes" },
        { imageSrc: "/images/brand-4.png", altText: "Brand 4", href: "/disposable-vapes" },
        { imageSrc: "/images/brand-5.png", altText: "Brand 5", href: "/disposable-vapes" },
        { imageSrc: "/images/brand-6.png", altText: "Brand 6", href: "/disposable-vapes" },
        { imageSrc: "/images/brand-7.png", altText: "Brand 7", href: "/disposable-vapes" },
        { imageSrc: "/images/brand-8.png", altText: "Brand 8", href: "/disposable-vapes" },
        { imageSrc: "/images/brand-9.png", altText: "Brand 9", href: "/disposable-vapes" },
        { imageSrc: "/images/brand-10.png", altText: "Brand 10", href: "/disposable-vapes" },
    ];

    return (
            <main>
                <section className="product-listing-container flex-col">
                    <BreadCrumbs items={breadcrumbs} />
                    <div>
                        <h1 className='primary-gradient-600 text-h5 md:text-h3 font-bold w-fit'>Brands</h1>
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
                                imageSrc={brand.imageSrc}
                                altText={brand.altText}
                                href={brand.href}
                            />
                        ))}
                    </div>
                </section>
            </main>
    )
}

export default BrandsListing
