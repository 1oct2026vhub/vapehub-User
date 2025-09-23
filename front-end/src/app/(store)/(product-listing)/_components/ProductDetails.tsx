"use client"
import React, { useEffect, useState } from 'react'
import { BenefitIcon, DealsIcon, DispatchIcon, MinusIcon, PlusIcon, RatingStarEmpty, RatingStarFilled } from '@/components/Icons'
import { Button } from '@nextui-org/button'
import { Chip, Divider } from '@nextui-org/react'
// import Image from 'next/image'
import BundleProductCard from '@/components/BundleProductCard'
import { AttributeProductTerms, AttributeTerms, productAllImages, ProductResponse, ProductVariant } from '@/lib/config/product.config'
import { ROUTES } from '@/lib/routes'
import { DEFAULT_CURRENCY_SYMBOL, isLessThanOneMonth } from '@/lib/config/app.config'
import Slider, { Settings } from 'react-slick'
import { useCart } from '@/lib/context/CartContext'
import Link from 'next/link'
import ProductVariantFilter from './ProductVariantFilter'
import NoImage from '@/components/NoImage'
import CustomImageMagnifier from '@/components/CustomImageMagnifier'

// import { REVIEWS } from '@/lib/config/order.config'
import { ServerActionStatus } from '@/lib/config/app.config'
import { getDealProducts } from '@/lib/server.actions'
import { ProductInDeal } from '@/lib/config/deal.config'
import { Product } from '@/lib/config/product.config'
import { useReviews } from '@/lib/context/ReviewContext'

type ProductViewProps = {
    data: ProductResponse;
    selectedVariant?: AttributeProductTerms
}
const settings: Settings = {
    slidesToShow: 4, // Change to 4 if needed
    slidesToScroll: 1,
    infinite: false,
    arrows: true,
    initialSlide: 0,
    responsive: [
        {
            breakpoint: 1280,
            settings: {
                slidesToShow: 4,
                slidesToScroll: 1,
                infinite: false,
            },
        },
        {
            breakpoint: 640,
            settings: {
                slidesToShow: 3,
                slidesToScroll: 1,
                infinite: false,
            },
        },
        {
            breakpoint: 390,
            settings: {
                slidesToShow: 2,
                slidesToScroll: 1,
                infinite: false,
            },
        },
    ],

};
const ProductDetails: React.FC<ProductViewProps> = ({ data, selectedVariant }) => {
    const { product } = data;
    const hasFilteredTerms = (data.filtered_attribute_terms?.length ?? 0) > 0;
    const hasAvailableTerms = (data.available_terms?.length ?? 0) > 0;

    // A variant is ready to be added when all of its attributes have been selected.
    // This state is signified by `available_terms` being empty while `filtered_attribute_terms` is not.
    const isReadyVariant = hasFilteredTerms && !hasAvailableTerms && data.variants?.length === 1;

    // A product is simple if it has no attributes to filter by from the start.
    const isSimpleProduct = !hasFilteredTerms && !hasAvailableTerms;

    const canAddToCart = isSimpleProduct || isReadyVariant;

    // If a variant is ready, that's our selected variant.
    const productVariant: ProductVariant | null = isReadyVariant ? data.variants[0] : null;

    // For simple products, the API provides the necessary details in the first entry of the variants array.
    const simpleProductVariant = isSimpleProduct && data.variants.length > 0 ? data.variants[0] : null;

    // This is the definitive entity (either a selected variant or a simple product's variant) to be used for cart operations.
    const cartEntity = productVariant ?? simpleProductVariant;

    const allImages: productAllImages[] = cartEntity?.all_images ?? product?.all_images ?? [];
    const mixAndMatchDeal = product?.deals?.find(deal => deal.deal_type === 'BUY_N_FOR_FIXED');
    const stock = cartEntity?.stock && cartEntity?.stock_status === 'in_stock' ? cartEntity?.stock : 0;
    const rawPrice = cartEntity?.price ?? (product as { price?: number | string })?.price ?? 0;
    const rawRegularPrice = cartEntity?.regular_price ?? (product as { regular_price?: number | string })?.regular_price ?? 0;
    const price = Number(rawPrice) || 0;
    const regularPrice = Number(rawRegularPrice) || 0;
    // When sale price is zero, fall back to regular price for display only
    const effectivePrice = price > 0 ? price : (regularPrice > 0 ? regularPrice : 0);
    const productName = productVariant
        ? `${product?.name} - ${productVariant.attributes.map(attr => attr.term_name).join(', ')}`
        : product?.name;

    const availableAttributes: AttributeTerms[] = data.available_terms;
    const minQuantity = 1;

    const [mainImage, setMainImage] = useState<productAllImages | null>(null);
    const [quantity, setQuantity] = useState(1);
    const { addItemToCart } = useCart();
    const [isAddingToCart, setIsAddingToCart] = useState(false);
    const [inputValue, setInputValue] = useState(quantity.toString());
    const [error, setError] = useState<string | null>(null);
    const { reviewData } = useReviews();
    const [bundleProducts, setBundleProducts] = useState<ProductInDeal[]>([]);
    const [bundlePagination, setBundlePagination] = useState<{
        total_count: number;
        total_pages: number;
        current_page: number;
        limit: number;
        offset: number;
        has_next: boolean;
        has_prev: boolean;
    } | null>(null);
    const [isLoadingBundles, setIsLoadingBundles] = useState(false);
    const [currentBundlePage, setCurrentBundlePage] = useState(1);
    const handleReviewsClick = (e: React.MouseEvent) => {
        e.preventDefault();
        const reviewsSection = document.getElementById('reviews');
        if (reviewsSection) {
            reviewsSection.scrollIntoView({ behavior: 'smooth', block: 'start' });

            // The NextUI tab buttons have a data-key attribute.
            const reviewsTabButton = reviewsSection.querySelector('[data-key="Reviews"]') as HTMLElement;
            if (reviewsTabButton) {
                reviewsTabButton.click();
            }
        }
    };

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value.replace(/[^0-9]/g, ''); // Remove any non-numeric characters
        setInputValue(value);
        // Only update quantity if the input is a valid number
        const numValue = parseInt(value);
        if (!isNaN(numValue)) {
            if (numValue < minQuantity) {
                setError(`Minimum quantity is ${minQuantity}`);
            } else if (numValue > stock) {
                setError(`Only ${stock} items available in stock`);
            } else {
                setError(null);
                setQuantity(numValue);
            }
        }
    };


  const handleBlur = () => {
    // Reset to current quantity if input is invalid
    const numValue = parseInt(inputValue);
    if (isNaN(numValue) || numValue < minQuantity || numValue > stock) {
      setInputValue(quantity.toString());
      setError(null);
    }
  };

    const handleQuantityChange = (newQuantity: number) => {
        if (!cartEntity) return;
        if (newQuantity < minQuantity) {
            setError(`Minimum quantity is ${minQuantity}`);
            return;
          }
          setError(null);
          setQuantity(newQuantity);
          setInputValue(newQuantity.toString());

    };

    const handleAddToCart = async () => {
        if (!canAddToCart || !cartEntity) {
            // This is a safeguard; the button should be disabled if this is the case.
            return;
        }
        if (quantity <= 0 || quantity > stock) {
            return;
        }
        setIsAddingToCart(true);
        try {
            const variantTermSlug = cartEntity.attributes[0]?.term_slug ?? '';
            const variantAttributes = cartEntity.attributes.map(attr => ({ attribute_id: attr.attribute_id, term_slug: attr.term_slug }));
            const productForCart: Product = {
                ...product,
                price: product.primary_image?.url ?? '0',
                ProductImages: product.all_images.map(img => ({ id: img.id, image_url: img.url, is_primary: img.is_primary }))
            };
            await addItemToCart(productForCart, cartEntity.id, quantity, cartEntity, productName, variantTermSlug, variantAttributes);
        } catch (err) {
            console.error("Failed to add to cart:", err);
        } finally {
            setIsAddingToCart(false);
        }
    };
    const scrollToTop = () => {
        window.scrollTo({
            top: 0,
            behavior: 'smooth'
        });
    };

    useEffect(() => {
        scrollToTop();
    }, []);
    useEffect(() => {
        setMainImage(cartEntity?.primary_image ?? product?.primary_image);
    }, [cartEntity, product]);
    // Reviews data is now provided by ReviewContext

    useEffect(() => {
        const fetchBundleProducts = async (page = 1) => {
            if (!mixAndMatchDeal?.id) return;
            setIsLoadingBundles(true);
            const limit = 2;
            const offset = (page - 1) * limit;
            const response = await getDealProducts(mixAndMatchDeal.id, {
                limit,
                offset,
                product_id: product.id  // Exclude current product from bundle
            });
            if (response.status === ServerActionStatus.SUCCESS && response.data?.products) {
                const filteredProducts = response.data.products.filter((p: ProductInDeal) => p.id);
                setBundleProducts(filteredProducts);
                setBundlePagination(response.data.pagination);
            }
            setIsLoadingBundles(false);
        };
        if (mixAndMatchDeal?.id) {
            fetchBundleProducts(currentBundlePage);
        }
    }, [mixAndMatchDeal?.id, product.id, currentBundlePage]);

    const handleBundlePageChange = (page: number) => {
        if (page !== currentBundlePage) {
            setCurrentBundlePage(page);
        }
    };
    return (
        <section className='bg-skin-white p-4 md:p-6 xl:p-7.5 rounded-2xl border border-skin-neutral-50 shadow-card flex flex-col gap-4'>
            <div className='flex flex-col lg:flex-row items-start gap-6 xl:gap-11'>
                {/* Title section mobile */}
                <div className='space-y-2 lg:hidden'>
                    <h1 className='text-title-1 md:text-h5 text-skin-neutral-500 font-bold'>{product?.name}</h1>
                    <div className='block text-content-2 text-skin-neutral-500 font-semibold w-fit'>
                        Brand:
                        {product?.product_brands?.map((brand, index) => (
                            <React.Fragment key={brand.id}>
                                <Link href={ROUTES.BRAND.replace(':slug', brand.slug ?? "")} className='inline-block font-bold text-skin-primary2-500 underline'>
                                    {brand.name}
                                </Link>
                                {index < product.product_brands.length - 1 && <span className="ml-1">, </span>}
                            </React.Fragment>
                        ))}
                    </div>
                    <div className="flex items-center gap-2" onClick={handleReviewsClick} style={{ cursor: 'pointer' }}>
                        <div className="flex gap-1">
                            {Array.from({ length: 5 }, (_, i) => {
                                if (i < Math.round(reviewData?.averageRating || 0)) {
                                    return <RatingStarFilled key={i} className='w-4 h-4 md:w-5 md:h-5' />;
                                }
                                return <RatingStarEmpty key={i} className='w-4 h-4 md:w-5 md:h-5' />;
                            })}
                        </div>
                        <p className="text-title-2 xl:text-lg text-black font-bold mt-1">({reviewData?.totalReviews || 0} {(reviewData?.totalReviews || 0) <= 1 ? 'Review' : 'Reviews'})</p>
                    </div>
                </div>
                {/* Title section mobile ends */}

                <div className='space-y-4 w-full lg:w-fit'>
                    <div className='bg-skin-white border border-[#A6AAA9] rounded-10 relative flex flex-col items-center justify-center shrink shadow-brand-card lg:shadow-image-box py-5 px-1.5  w-full max-w-full min-[500px]:w-[400px] mx-auto aspect-square h-fit'>
                        <CustomImageMagnifier
                            src={mainImage?.url || ''}
                            alt={product?.name || ''}
                            width={320}
                            height={396}
                            className='aspect-square'
                            zoomLevel={2}
                        />

                        {
                            product?.createdAt && isLessThanOneMonth(product?.createdAt) &&
                            <div className='new-product'>
                                <span>New</span>
                            </div>
                        }

                    </div>

                    <Slider {...settings} className='grid items-center gap-4 product-details'>
                        {
                            allImages?.map((image, index) => (
                                <div key={index}>
                                    <div className='px-0.5 py-1.5 bg-skin-base flex items-center justify-center'>

                                        <Button
                                            onPress={() => setMainImage(image)}
                                            isIconOnly
                                            className={`p-0 w-[118px] h-[111px] flex items-center justify-center bg-transparent ${mainImage?.id === image.id ? 'ring-2 ring-skin-primary2-500' : ''
                                                }`}
                                        >
                                            <NoImage
                                                src={image?.url}
                                                alt={`product ${index}`}
                                                width={118}
                                                height={111}
                                                className={`lg:max-w-max cursor-pointer rounded-lg shadow-brand-card shrink border `}
                                            />
                                        </Button>

                                    </div>
                                </div>
                            ))
                        }

                    </Slider>

                </div>
                <div className='flex flex-col gap-4.5 lg:gap-5 w-full'>
                    <div className='space-y-3.5 hidden lg:block'>

                        <h1 className='text-h5 xl:text-h4 text-skin-neutral-500 font-bold mr-8'>{productName}</h1>
                        <div className='block text-content-2 text-skin-neutral-500 font-semibold w-fit'>
                            Brand:
                            {product?.product_brands?.map((brand, index) => (
                                <React.Fragment key={brand.id}>
                                    <Link href={ROUTES.BRAND.replace(':slug', brand.slug ?? "")} className='inline-block font-bold text-skin-primary2-500 underline'>
                                        {brand.name}
                                    </Link>
                                    {index < product.product_brands.length - 1 && <span className="ml-1">, </span>}
                                </React.Fragment>
                            ))}
                        </div>
                        <div className="flex items-center gap-2" onClick={handleReviewsClick} style={{ cursor: 'pointer' }}>
                            <div className="flex gap-1">
                                {Array.from({ length: 5 }, (_, i) => {
                                    if (i < Math.round(reviewData?.averageRating || 0)) {
                                        return <RatingStarFilled key={i} className='w-5 h-5 xl:w-[22px] xl:h-[22px]' />;
                                    }
                                    return <RatingStarEmpty key={i} className='w-5 h-5 xl:w-[22px] xl:h-[22px]' />;
                                })}
                            </div>
                            <p className="text-title-2 xl:text-lg text-black font-bold mt-0.5">({reviewData?.totalReviews || 0} {(reviewData?.totalReviews || 0) <= 1 ? 'Review' : 'Reviews'})</p>
                        </div>
                    </div>
                    <div className='flex items-center gap-2 font-bold text-skin-neutral-500'>
                        <p className='text-title-1 md:text-h5 xl:text-h4'>{DEFAULT_CURRENCY_SYMBOL}{effectivePrice}</p>
                        {mixAndMatchDeal && (
                            <>
                                <p className='text-content-2 md:text-title-2 cursor-default'>or Mix & Match</p>
                                <Chip
                                    size="sm"
                                    radius="md"
                                    classNames={{
                                        base: "btn primary-btn w-fit cursor-default !min-w-fit text-content-2 md:text-content-1 !leading-none !tap-highlight-transparent !h-5 md:!h-8 xl:!h-9 !px-1.5 !py-1 md:!px-4 md:!py-2",
                                        content: "text-white"
                                    }}
                                >
                                  {mixAndMatchDeal?.name}
                                    {/* {`${mixAndMatchDeal.required_qty} for ${DEFAULT_CURRENCY_SYMBOL}${Number(mixAndMatchDeal.fixed_price).toFixed(0)}`} */}
                                </Chip>
                            </>
                        )}
                    </div>
                    {regularPrice > 0 && price > 0 && regularPrice > price && (
                        <p className='text-content-2 md:text-title-2 text-skin-neutral-500 line-through opacity-60 font-bold'>{DEFAULT_CURRENCY_SYMBOL}{regularPrice}</p>
                    )}
                    <div className='space-y-4 max-md:order-4'>
                        <div className='bg-skin-white border border-skin-neutral-100 rounded-xl shadow-product-offer p-3.5 space-y-2.5'>
                            <div className='flex gap-1 items-center'>
                                <DispatchIcon />
                                <p className='text-content-2 md:text-content-1 font-bold red-gradient-100'>Same day dispatch for orders before 3pm!</p>
                            </div>
                            {product?.loyaltySettings && product.loyaltySettings.status && product.loyaltySettings.points_value > 0 && (
                                <div className='flex gap-1 items-center'>
                                    <BenefitIcon />
                                    <p className='text-content-2 md:text-content-1 font-bold text-skin-neutral-500'>
                                        Earn at least {product.loyaltySettings.points_value} loyalty points with this purchase!
                                    </p>
                                </div>
                            )}
                            {mixAndMatchDeal && (
                                <div className='flex gap-1 items-center'>
                                    <DealsIcon />
                                    <p className='text-content-2 md:text-content-1 font-bold text-skin-neutral-500'>{`Choose ${mixAndMatchDeal.required_qty} for ${DEFAULT_CURRENCY_SYMBOL}${Number(mixAndMatchDeal.fixed_price).toFixed(0)} - Multibuy Deal!`}</p>
                                </div>
                            )}
                        </div>
                    </div>
                    <Divider className='max-lg:hidden' />
                    <ProductVariantFilter
                        attributeTerms={product?.attribute_terms}
                        productSlug={product?.slug}
                        selectedVariant={selectedVariant}
                        availableAttributes={availableAttributes ?? []}
                        allVariants={data.variants ?? []}
                    />
                    <div className='space-y-2 lg:space-y-3.5'>
                        {
                           cartEntity && ( stock > 0 ?
                                <p className='text-content-2 md:text-title-2 font-bold primary-gradient-100'>In stock</p> :
                                <p className='text-content-2 md:text-title-2 font-bold text-red-500'>Out of stock</p>)
                        }
                    </div>
                    <div className='flex gap-4 md:gap-6 xl:gap-11 items-center'>
                        <div
                            className="flex items-center border-2 bg-skin-white w-fit shadow-base text-title-1 border-skin-neutral-200 !leading-none px-1 rounded-10 !font-bold h-12 md:h-[60px]"
                        >
                            <Button
                                isIconOnly
                                size='lg'
                                variant='light'
                                color='primary'
                                className='text-title-1 leading-none font-medium !rounded-l-10 !rounded-r-none hover:!bg-transparent !px-0 !min-w-fit !w-8 !h-[56px]'
                                onPress={() => handleQuantityChange(quantity - 1)}
                                isDisabled={isAddingToCart || quantity <= 1 || !cartEntity}
                            >
                                <MinusIcon />
                            </Button>
                            <input
                                type="tel"
                                value={inputValue}
                                onChange={handleInputChange}
                                onBlur={handleBlur}
                                pattern="[0-9]*"
                                inputMode="numeric"
                                disabled={!cartEntity}
                                className='w-9 max-w-9 !border-none text-title-1 !outline-none placeholder:text-skin-neutral-500 bg-transparent text-center'
                            />
                            {/* <input
                                type="tel"
                                value={quantity}
                                onChange={(e) => {
                                    const val = parseInt(e.target.value);
                                    if (!isNaN(val)) handleQuantityChange(val);
                                }}
                                className='w-9 max-w-9 !border-none max-sm:h-3 !outline-none placeholder:text-skin-neutral-500 ml-4 text-center'
                            /> */}
                            <Button
                                isIconOnly
                                size='lg'
                                variant='light'
                                color='primary'
                                className='text-title-1 leading-none font-medium !rounded-r-10 !rounded-l-none hover:!bg-transparent !px-0 !min-w-fit !w-8 !h-[56px]'
                                onPress={() => handleQuantityChange(quantity + 1)}
                                isDisabled={isAddingToCart || quantity >= stock || !cartEntity}
                            >
                                <PlusIcon />
                            </Button>
                        </div>


                        <Button
                            size="lg"
                            radius="md"
                            color="primary"
                            isLoading={isAddingToCart}
                            className={`btn primary-btn w-full shadow-input !rounded-10 text-title-1 !leading-none !font-bold h-12 md:h-[60px] ${(isAddingToCart || !canAddToCart || quantity <= 0 || quantity > stock) ? '!opacity-50 cursor-not-allowed' : ''}`}
                            onPress={handleAddToCart}
                            disabled={isAddingToCart || !canAddToCart || quantity <= 0 || quantity > stock}
                        >
                            Add to Cart
                        </Button>
                    </div>
                    {error && <p className='text-skin-red-400 text-sm'>{error}</p>}
                </div>
            </div>
            <Divider />
            {bundleProducts.length > 0 && (
                <div className='space-y-3.5 md:space-y-5 lg:space-y-7 md:mt-2'>
                    <h2 className='text-content-1 md:text-title-1 lg:text-h5 font-bold primary-gradient-600 w-fit'>Add more products from this deal and unlock extra savings</h2>
                    <div className='flex flex-row md:flex-col gap-3 md:gap-5.5'>
                        {bundleProducts?.map((bundleProduct) => (
                            <BundleProductCard key={bundleProduct.id} product={bundleProduct} />
                        ))}
                    </div>
                    {isLoadingBundles && (
                        <div className='flex justify-center'><span>Loading...</span></div>
                    )}
                            {bundlePagination && bundlePagination.total_pages > 1 && bundleProducts.length > 0 && (
            <div className="flex justify-center items-center gap-1 mt-4">
                {/* Previous button */}
                {bundlePagination.has_prev && (
                    <Button
                        size="sm"
                        radius="full"
                        variant="light"
                        className="w-7 h-7 min-w-0 px-0 text-xs"
                        onPress={() => handleBundlePageChange(currentBundlePage - 1)}
                        disabled={isLoadingBundles}
                    >
                        ‹
                    </Button>
                )}

                {/* Page numbers with dots */}
                {(() => {
                    const totalPages = bundlePagination.total_pages;
                    const current = currentBundlePage;
                    const pages = [];

                    if (totalPages <= 5) {
                        for (let i = 1; i <= totalPages; i++) pages.push(i);
                    } else {
                        pages.push(1);
                        if (current > 3) pages.push('...');
                        for (let i = Math.max(2, current - 1); i <= Math.min(totalPages - 1, current + 1); i++) {
                            if (i > 1 && i < totalPages) pages.push(i);
                        }
                        if (current < totalPages - 2) pages.push('...');
                        pages.push(totalPages);
                    }

                    return pages.map((page, idx) =>
                        page === '...' ? (
                            <span key={idx} className="text-skin-neutral-400 text-xs px-1">…</span>
                        ) : (
                            <Button
                                key={page}
                                size="sm"
                                radius="full"
                                variant={page === current ? "solid" : "light"}
                                color={page === current ? "primary" : "default"}
                                className={`w-7 h-7 min-w-0 px-0 text-xs font-semibold ${page === current ? '!bg-skin-primary2-500 text-white' : ''}`}
                                onPress={() => handleBundlePageChange(page as number)}
                                disabled={isLoadingBundles}
                            >
                                {page}
                            </Button>
                        )
                    );
                })()}

                {/* Next button */}
                {bundlePagination.has_next && (
                    <Button
                        size="sm"
                        radius="full"
                        variant="light"
                        className="w-7 h-7 min-w-0 px-0 text-xs"
                        onPress={() => handleBundlePageChange(currentBundlePage + 1)}
                        disabled={isLoadingBundles}
                    >
                        ›
                    </Button>
                )}
            </div>
        )}
                </div>
            )}
        </section>
    )
}

export default ProductDetails
