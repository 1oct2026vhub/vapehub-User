
import BreadCrumbs from '@/components/BreadCrumbs';
import React, { FunctionComponent, ReactElement, Suspense } from 'react';
import OrderCard from '@/components/OrderCard'
import ProductContent from '@/components/ProductContent'
import FAQSection from '@/components/FAQSection'
import ProductDetails from './_components/ProductDetails';
import ProductFeatures from './_components/ProductFeatures';
import RelatedProducts from './_components/RelatedProducts';
import { ROUTES } from '@/lib/routes';
import SuspenseLoader from '@/components/ui/SuspenseLoader';
import { AttributeProductTerms, AttributeTerms, ProductResponse } from '@/lib/config/product.config';
import { ReviewProvider } from '@/lib/context/ReviewContext';
import { ProductDataProvider } from '@/lib/context/ProductDataContext';

type ProductViewProps = {
    data: ProductResponse;
    isVariant?: boolean;
    selectedVariant?: AttributeProductTerms;
}

const ProductView: FunctionComponent<ProductViewProps> = ({ data, selectedVariant }): ReactElement => {

    const productFeatures = data?.product?.attribute_terms.filter((attrTerm: AttributeTerms) => (attrTerm.attribute.is_visible_page && !attrTerm.attribute.used_in_variation));
    const breadcrumbs = [
        { label: "Home", href: ROUTES.WELCOME },
        { label: data?.product?.category?.name || "", href: `/${data?.product?.category?.slug || ""}` },
        { label: data.product.name, href: data.product.slug, isActive: true },
    ];

    const categoryId = data?.product?.category?.id;
    const brandId = data?.product?.brand?.id;

    let viewAllHref = "/shop";
    if (categoryId && brandId) {
        viewAllHref = `/shop?categories=${categoryId}&brand=${brandId}`;
    } else if (categoryId) {
        viewAllHref = `/shop?categories=${categoryId}`;
    } else if (brandId) {
        viewAllHref = `/shop?brand=${brandId}`;
    }

    return (
        <ReviewProvider productId={data.product.id}>
            <ProductDataProvider initialData={data}>
                <main className='px-4 lg:px-9 xl:px-12.5 py-7 xl:py-10 flex flex-col gap-7 xl:gap-10'>
                    <BreadCrumbs items={breadcrumbs} />
                    <Suspense fallback={<SuspenseLoader />}>
                    <ProductDetails data={data} selectedVariant={selectedVariant} />
                    </Suspense>
                    <Suspense fallback={<SuspenseLoader />}>
                        <OrderCard />
                    </Suspense>
                    {
                        productFeatures.length > 0 && (
                            <Suspense fallback={<SuspenseLoader />}>
                                <ProductFeatures productFeatures={productFeatures} />
                            </Suspense>
                        )
                    }
                    <Suspense fallback={<SuspenseLoader />}>
                        <ProductContent data={data} />
                    </Suspense>
                    <Suspense fallback={<SuspenseLoader height='h-40' />}>
                        <FAQSection type="product" id={data.product.id} />
                    </Suspense>
                    <Suspense fallback={<SuspenseLoader height='h-64' />}>
                        <RelatedProducts viewAllHref={viewAllHref} currentProductId={data.product.id} />
                    </Suspense>

                </main>
            </ProductDataProvider>
        </ReviewProvider>
    )
}

export default ProductView
