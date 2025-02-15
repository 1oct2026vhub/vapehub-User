"use client"

import BreadCrumbs from '@/components/BreadCrumbs'; 
import React, { ReactElement } from 'react'; 
import OrderCard from '@/components/OrderCard' 
import ProductContent from '@/components/ProductContent'
import FAQSection from '@/components/FAQSection' 
import ProductDetails from './_components/ProductDetails';
import ProductFeatures from './_components/ProductFeatures';
import RelatedProducts from './_components/RelatedProducts';
import Subscription from '../(dashboard)/_components/Subscription';


const ProductView: React.FC = (): ReactElement => {

    const breadcrumbs = [
        { label: "Home", href: "/" },
        { label: "Disposables", href: "/disposable-vapes" },
        { label: "HAWCOS x Lost Mary Pro Max 7000 Disposable Kit", href: "/", isActive: true },
    ];

    return (
        <> 
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
        </>
    )
}

export default ProductView
