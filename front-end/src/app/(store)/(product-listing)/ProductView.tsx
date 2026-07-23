
import BreadCrumbs from '@/components/BreadCrumbs';
import React, { FunctionComponent, ReactElement } from 'react';
import OrderCard from '@/components/OrderCard'
import ProductContent from '@/components/ProductContent'
import FAQSection from '@/components/FAQSection'
import ProductDetails from './_components/ProductDetails';
import ProductFeatures from './_components/ProductFeatures';
import RelatedProducts from './_components/RelatedProducts';
import { ROUTES } from '@/lib/routes';
import { AttributeProductTerms, ProductResponse } from '@/lib/config/product.config';
import { FaqResponse } from '@/lib/config/global.config';
import { ReviewProvider } from '@/lib/context/ReviewContext';
import { ProductDataProvider } from '@/lib/context/ProductDataContext';
import { ProductReviewInitialData } from '@/lib/product-review-summary';

type ProductViewProps = {
    data: ProductResponse;
    isVariant?: boolean;
    selectedVariant?: AttributeProductTerms;
    productFaqs?: FaqResponse[];
    parentSeoDescription?: string;
    parentSeoTitle?: string;
    /** Server-resolved review summary for SSR-visible counts */
    initialReviewData?: ProductReviewInitialData | null;
}

const ProductView: FunctionComponent<ProductViewProps> = ({
    data,
    selectedVariant,
    productFaqs = [],
    parentSeoDescription = '',
    parentSeoTitle = '',
    initialReviewData = null,
}): ReactElement => {

    const productFeatures = data?.product?.attribute_terms ?? [];
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
        <ReviewProvider productId={data.product.id} initialData={initialReviewData}>
            <ProductDataProvider initialData={data}>
                <main className='px-4 lg:px-9 xl:px-12.5 py-7 xl:py-10 flex flex-col gap-7 xl:gap-10'>
                    <BreadCrumbs items={breadcrumbs} />
                    <ProductDetails
                        data={data}
                        selectedVariant={selectedVariant}
                        parentSeoDescription={parentSeoDescription}
                        parentSeoTitle={parentSeoTitle}
                    />
                    <OrderCard />
                    {
                        productFeatures.length > 0 && (
                            <ProductFeatures productFeatures={productFeatures} />
                        )
                    }
                    <ProductContent data={data} />
                    <FAQSection type="product" id={data.product.id} initialFaqs={productFaqs} />
                    <RelatedProducts viewAllHref={viewAllHref} currentProductId={data.product.id} />

                </main>
            </ProductDataProvider>
        </ReviewProvider>
    )
}

export default ProductView
