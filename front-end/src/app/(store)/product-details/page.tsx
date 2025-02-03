"use client"

import BreadCrumbs from '@/components/BreadCrumbs'
import Footer from '@/components/Footer'
import Header from '@/components/Header'
import { NextPage } from 'next'
import React, { ReactElement } from 'react'
import ProductDetails from './ProductDetails'
import OrderCard from '@/components/OrderCard'
import ProductFeatures from './ProductFeatures'
import ProductContent from '@/components/ProductContent'
import FAQSection from '@/components/FAQSection'
import Subscription from '../(dashboard)/Subscription'
import RelatedProducts from './RelatedProducts'


const ProductDetailsPage: NextPage = (): ReactElement => {

    const breadcrumbs = [
        { label: "Home", href: "/" },
        { label: "Disposables", href: "/disposable-vapes" },
        { label: "HAWCOS x Lost Mary Pro Max 7000 Disposable Kit", href: "/", isActive: true },
    ];

    return (
        <>
            <Header />
            <main className='px-4 lg:px-9 xl:px-12.5 py-7 xl:py-10 flex flex-col gap-7 xl:gap-10'>
                <BreadCrumbs items={breadcrumbs} />
                <ProductDetails />
                <OrderCard />
                <ProductFeatures />
                <ProductContent />
                <FAQSection />
                <RelatedProducts />
                <Subscription />
            </main>
            <Footer />
        </>
    )
}

export default ProductDetailsPage
