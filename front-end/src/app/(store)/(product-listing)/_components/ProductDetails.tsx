"use client"
import React, { useEffect, useState } from 'react'
import { BenefitIcon, DealsIcon, DispatchIcon, MinusIcon, PlusIcon, RatingStarEmpty, RatingStarFilled } from '@/components/Icons'
import { Button } from '@nextui-org/button'
import { Chip, Divider } from '@nextui-org/react'
// import Image from 'next/image'
import BundleProductCard from '@/components/BundleProductCard'
import { AttributeProductTerms, AttributeTerms, productAllImages, ProductResponse, ProductVariant, ProductViewDetails } from '@/lib/config/product.config'
import { ROUTES } from '@/lib/routes'
import { DEFAULT_CURRENCY_SYMBOL, isLessThanOneMonth } from '@/lib/config/app.config'
import Slider, { Settings } from 'react-slick'
import { useCart } from '@/lib/context/CartContext'
import Link from 'next/link'
import ProductVariantFilter from './ProductVariantFilter'
import NoImage from '@/components/NoImage'
import CustomImageMagnifier from '@/components/CustomImageMagnifier'

import { REVIEWS } from '@/lib/config/order.config'
import { ServerActionStatus } from '@/lib/config/app.config'
import { getReviewOrderByProductId } from '@/lib/server.actions'
import { getDealsByCategory } from '@/lib/server.actions'
import { ProductInDeal } from '@/lib/config/deal.config'

type ProductViewProps = {
    data: ProductResponse;
    isVariant?: boolean;
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
const ProductDetails: React.FC<ProductViewProps> = ({ data, isVariant = false, selectedVariant }) => { 
    const isUniqueVariantSelected = isVariant && data?.variants?.length === 1;
    const allImages: productAllImages[] = isUniqueVariantSelected ? data?.variants[0]?.all_images : data?.product?.all_images;
    const product: ProductViewDetails = data?.product;
    const productVariant: ProductVariant | null = isUniqueVariantSelected ? data?.variants[0] : null;
    const mixAndMatchDeal = product?.deals?.find(deal => deal.deal_type === 'BUY_N_FOR_FIXED');

    const stock = isUniqueVariantSelected && productVariant ? productVariant.stock_status === 'in_stock' ? productVariant.stock : 0 : 0;
    const attributesName = isUniqueVariantSelected ? productVariant?.attributes?.map(attr => attr.term_name).join(', ') : '';
    const productName =  `${product?.name} ${attributesName ? ` - ${attributesName}` : ''}` 
    const availableAttributes: AttributeTerms[] = data.available_terms;
    const minQuantity = 1; 
    const price = isUniqueVariantSelected ? data?.variants[0]?.price: (productVariant?.price ?? data?.variants[0]?.price);    
     
    const [mainImage, setMainImage] = useState<productAllImages | null>(null);
    const [quantity, setQuantity] = useState(1);
    const { addItemToCart } = useCart();
    const [isAddingToCart, setIsAddingToCart] = useState(false);
    const [inputValue, setInputValue] = useState(quantity.toString());
    const [error, setError] = useState<string | null>(null);
    const [reviewsData, setReviewsData] = useState<{
        reviews: REVIEWS[];
        averageRating: number;
        totalReviews: number;
    }>({
        reviews: [],
        averageRating: 0,
        totalReviews: 0,
    });
    const [bundleProducts, setBundleProducts] = useState<ProductInDeal[]>([]);

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
        if (!productVariant) return;
        if (newQuantity < minQuantity) {
            setError(`Minimum quantity is ${minQuantity}`);
            return;
          }
          setError(null);
          setQuantity(newQuantity);
          setInputValue(newQuantity.toString());

    };

    const handleAddToCart = async () => {
        if (!productVariant) return;
        if (quantity <= 0 || quantity > stock) {
            return;
        }
        setIsAddingToCart(true);
        try {
            await addItemToCart(product.id, productVariant?.id, quantity, productVariant, productName);
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
        setMainImage(isUniqueVariantSelected ? data?.variants[0]?.primary_image : product?.primary_image);
    }, [isUniqueVariantSelected, data, product]);    
    useEffect(() => {
        const fetchReviews = async () => {
            if (!product?.id) return;
            const response = await getReviewOrderByProductId(product.id,1,1);
            console.log("product Details", response);
            if (response.status === ServerActionStatus.SUCCESS && response.data) {
                setReviewsData({
                    reviews: response.data.reviews || [],
                    averageRating: parseFloat(response.data.average_rating) || 0,
                    totalReviews: response.data.total_reviews || 0,
                });
            }
        }
        fetchReviews()
    }, [product]);

    useEffect(() => {
        const fetchBundleProducts = async () => {
            if (!product?.category) return;
            const category = product.category;
            const response = await getDealsByCategory(category.id, { limit: 4, offset: 0 });

            if (response.status === ServerActionStatus.SUCCESS && response.data?.products) {
                // Exclude the current product from the list
                const filteredProducts = response.data.products.filter((p: ProductInDeal) => p.id !== product.id);
                setBundleProducts(filteredProducts.slice(0, 2));
            }
        };

        if (product?.id) {
            fetchBundleProducts();
        }
    }, [product]);
    console.log("product", product);
    return (
        <section className='bg-skin-white p-4 md:p-6 xl:p-7.5 rounded-2xl border border-skin-neutral-50 shadow-card flex flex-col gap-4'>
            <div className='flex flex-col lg:flex-row items-start gap-6 xl:gap-11'>
                {/* Title section mobile */}
                <div className='space-y-2 lg:hidden'>
                    <h1 className='text-title-1 md:text-h5 text-skin-neutral-500 font-bold'>{product?.name}</h1>
                    <div className='block text-content-2 text-skin-neutral-500 font-semibold w-fit'>
                        Brand: <Link href={ROUTES.BRAND.replace(':slug', product?.brand?.slug ?? "")} className='inline-block font-bold text-skin-primary2-500 underline'>{product?.brand?.name}</Link>
                    </div>
                    <div className="flex items-center gap-2" onClick={handleReviewsClick} style={{ cursor: 'pointer' }}>
                        <div className="flex gap-1">
                            {Array.from({ length: 5 }, (_, i) => {
                                if (i < Math.round(reviewsData.averageRating)) {
                                    return <RatingStarFilled key={i} className='w-4 h-4 md:w-5 md:h-5' />;
                                }
                                return <RatingStarEmpty key={i} className='w-4 h-4 md:w-5 md:h-5' />;
                            })}
                        </div>
                        <p className="text-title-2 xl:text-lg text-black font-bold mt-1">({reviewsData.totalReviews} Reviews)</p>
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
                            Brand: <Link href={ROUTES.BRAND.replace(':slug', product?.brand?.slug ?? "")} className='inline-block font-bold text-skin-primary2-500 underline'>{product?.brand?.name}</Link>
                        </div>
                        <div className="flex items-center gap-2" onClick={handleReviewsClick} style={{ cursor: 'pointer' }}>
                            <div className="flex gap-1">
                                {Array.from({ length: 5 }, (_, i) => {
                                    if (i < Math.round(reviewsData.averageRating)) {
                                        return <RatingStarFilled key={i} className='w-5 h-5 xl:w-[22px] xl:h-[22px]' />;
                                    }
                                    return <RatingStarEmpty key={i} className='w-5 h-5 xl:w-[22px] xl:h-[22px]' />;
                                })}
                            </div>
                            <p className="text-title-2 xl:text-lg text-black font-bold mt-0.5">({reviewsData.totalReviews} Reviews)</p>
                        </div>
                    </div>
                    <div className='flex items-center gap-2 font-bold text-skin-neutral-500'>
                        <p className='text-title-1 md:text-h5 xl:text-h4'>{DEFAULT_CURRENCY_SYMBOL}{price}</p>
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
                    <div className='space-y-4 max-md:order-4'>
                        <div className='bg-skin-white border border-skin-neutral-100 rounded-xl shadow-product-offer p-3.5 space-y-2.5'>
                            <div className='flex gap-1 items-center'>
                                <DispatchIcon />
                                <p className='text-content-2 md:text-content-1 font-bold red-gradient-100'>Same day dispatch for orders before 3pm!</p>
                            </div>
                            <div className='flex gap-1 items-center'>
                                <BenefitIcon />
                                <p className='text-content-2 md:text-content-1 font-bold text-skin-neutral-500'>Earn at least 12 loyalty points with this purchase!</p>
                            </div>
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
                           isUniqueVariantSelected && ( stock > 0 ?
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
                                isDisabled={isAddingToCart || quantity <= 1 || stock === 0}
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
                                disabled={stock === 0}
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
                                isDisabled={isAddingToCart || quantity >= stock || stock === 0}
                            >
                                <PlusIcon />
                            </Button>
                        </div>


                        <Button
                            size="lg"
                            radius="md"
                            color="primary"
                            isLoading={isAddingToCart}
                            className={`btn primary-btn w-full shadow-input !rounded-10 text-title-1 !leading-none !font-bold h-12 md:h-[60px] ${(isAddingToCart || !isUniqueVariantSelected || quantity <= 0 || quantity > stock) ? '!opacity-50 cursor-not-allowed' : ''}`}
                            onPress={handleAddToCart}
                            disabled={isAddingToCart || !isUniqueVariantSelected || quantity <= 0 || quantity > stock}
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
                    <h2 className='text-content-1 md:text-title-1 lg:text-h5 font-bold primary-gradient-600 w-fit'>Bundle together and save 5%</h2>
                    <div className='flex flex-row md:flex-col gap-3 md:gap-5.5'>
                        {bundleProducts?.map((bundleProduct) => (
                            <BundleProductCard key={bundleProduct.id} product={bundleProduct} />
                        ))}
                    </div>
                </div>
            )}
        </section>
    )
}

export default ProductDetails
