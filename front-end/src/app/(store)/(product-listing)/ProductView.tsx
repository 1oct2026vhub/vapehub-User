
import BreadCrumbs from '@/components/BreadCrumbs'; 
import React, { FunctionComponent, ReactElement, Suspense } from 'react'; 
import OrderCard from '@/components/OrderCard' 
import ProductContent from '@/components/ProductContent'
import FAQSection from '@/components/FAQSection' 
import ProductDetails from './_components/ProductDetails';
import ProductFeatures from './_components/ProductFeatures';
import RelatedProducts from './_components/RelatedProducts';
import Subscription from '../(dashboard)/_components/Subscription';
import { Product } from '@/lib/config/product.config';
import { ROUTES } from '@/lib/routes';
import SuspenseLoader from '@/components/ui/SuspenseLoader';

type ProductViewProps = {
    data: Product;
}

const ProductView: FunctionComponent<ProductViewProps> = ({data}): ReactElement => {
    
     
    const breadcrumbs = [
        { label: "Home", href: ROUTES.WELCOME },
        { label: data.Category.name, href: `/${data.Category.slug}` },
        { label: data.name, href: data.slug, isActive: true },
    ];

    return (
        <main className='px-4 lg:px-9 xl:px-12.5 py-7 xl:py-10 flex flex-col gap-7 xl:gap-10'>
            <BreadCrumbs items={breadcrumbs} />
            <ProductDetails product={data}/>
            <Suspense fallback={<SuspenseLoader/>}>
            <OrderCard />
            </Suspense>
            <Suspense fallback={<SuspenseLoader/>}>
            <ProductFeatures />
            </Suspense>
            <Suspense fallback={<SuspenseLoader/>}>
            <ProductContent /> 
            </Suspense>
            <Suspense fallback={<SuspenseLoader height='h-40'/>}>
            <FAQSection />
            </Suspense>
            <Suspense fallback={<SuspenseLoader height='h-64'/>}>
            <RelatedProducts viewAllHref={data.Category.slug} currentProductId={data.id}/>
            </Suspense>
            <Suspense fallback={<SuspenseLoader height='h-24'/>}>
            <Subscription className="mt-5 md:mt-10"/>
            </Suspense>
        </main>
    )
}

export default ProductView
