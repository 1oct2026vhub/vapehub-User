"use client"
import React, { useEffect, useState } from 'react'
import { BenefitIcon, DealsIcon, DispatchIcon, MinusIcon, PlusIcon, ReviewStarFilled } from '@/components/Icons'
import { Button } from '@nextui-org/button'
import { Divider } from '@nextui-org/react'
import Image from 'next/image'
import BundleProductCard from '@/components/BundleProductCard'
import { AttributeProductTerms, AttributeTerms, productAllImages, ProductResponse, ProductVariant, ProductViewDetails } from '@/lib/config/product.config'
import { ROUTES } from '@/lib/routes'
import { DEFAULT_CURRENCY_SYMBOL, isLessThanOneMonth } from '@/lib/config/app.config'
import Slider, { Settings } from 'react-slick'
import { useCart } from '@/lib/context/CartContext'
import Link from 'next/link'
import ProductVariantFilter from './ProductVariantFilter'
import NoImage from '@/components/NoImage'

type ProductViewProps = {
    data: ProductResponse;
    isVariant?: boolean;
    selectedVariant?: AttributeProductTerms;
    availableAttributes?: AttributeTerms[];
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
const ProductDetails: React.FC<ProductViewProps> = ({ data, isVariant = false, selectedVariant, availableAttributes }) => {
    const allImages: productAllImages[] = isVariant ? data?.variants[0]?.all_images : data?.product?.all_images;
    const product: ProductViewDetails =  data?.product;
    const productVariant:ProductVariant | null = isVariant ? data?.variants[0] : null;
    const stock = isVariant && productVariant? productVariant.stock : 0;
    const productName = selectedVariant ? `${selectedVariant.terms.name} - ${product?.name}` : product?.name;
    const [mainImage, setMainImage] = useState<productAllImages | null>(null);
    const [quantity, setQuantity] = useState(1);
    const { addItemToCart, updateItemQuantity,cartItems, isLoading } = useCart();
    
    const handleQuantityChange = (newQuantity: number) => {
        if (!productVariant) return;
        
        if (newQuantity <= 0 || newQuantity > stock) {
            return;
        }

        setQuantity(newQuantity);
        const cartItem = cartItems.find(item => item.variant_id === productVariant.id);
        if (cartItem) {
            updateItemQuantity(cartItem.id, newQuantity);
        }
        
    };
    
    const handleAddToCart = async () => {
        if (!productVariant) return;
        if (quantity <= 0 || quantity > stock) { 
            return;
        }
        await addItemToCart(product.id, productVariant?.id, quantity, productVariant, productName);
    };

    useEffect(() => {
        setMainImage(isVariant ? data?.variants[0]?.primary_image : product?.primary_image);
    }, [isVariant, data, product]);

    return (
        <section className='bg-skin-white p-4 md:p-6 xl:p-7.5 rounded-2xl border border-skin-neutral-50 shadow-card flex flex-col gap-4'>
            <div className='flex flex-col lg:flex-row items-start gap-6 xl:gap-11'>
                {/* Title section mobile */}
                <div className='space-y-2 lg:hidden'>
                    <h1 className='text-title-1 md:text-h5 text-skin-neutral-500 font-bold'>{product?.name}</h1>
                    <div className='block text-content-2 text-skin-neutral-500 font-semibold w-fit'>
                        Brand: <Link href={ROUTES.BRAND.replace(':slug', product?.brand?.slug ?? "")} className='inline-block font-bold text-skin-primary2-500 underline'>{product?.brand?.name}</Link>
                    </div>
                    <div className="flex items-center gap-2">
                        <div className="flex gap-1">
                            {Array.from({ length: 5 }, (_, i) => (
                                <Image
                                    key={i}
                                    src='/images/review-star.svg'
                                    alt='Review star'
                                    width={16}
                                    height={16}
                                    className='md:w-5 md:h-5' />
                            ))}

                        </div>
                        <p className="text-title-2 xl:text-lg text-black font-bold mt-1">(10 Reviews)</p>
                    </div>
                </div>
                {/* Title section mobile ends */}

                <div className='space-y-4 w-full lg:w-fit '>
                    <div className='bg-skin-base border border-[#A6AAA9] rounded-10 relative flex flex-col items-center justify-center shrink w-full lg:w-[400px] xl:w-[550px] shadow-brand-card lg:shadow-image-box pt-5 px-1.5 pb-2 min-h-[250px] lg:min-h-[425px] max-h-[250px] lg:max-h-[425px]'>
                        <NoImage
                            src={mainImage?.url}
                            alt={product?.name}
                            width={320}
                            height={396}
                            className='aspect-square'
                        />
                         
                        {
                           product?.createdAt && isLessThanOneMonth(product?.createdAt) &&
                            <div className='new-product'>
                                <span>New</span>
                            </div>
                        }

                    </div>

                    <Slider {...settings} className='grid items-center gap-4'>
                        {
                            allImages.map((image, index) => (
                                <div key={index}>
                                    <div className='px-0.5 py-1.5 bg-skin-base flex items-center justify-center '>

                                        <Button 
                                            onPress={() => setMainImage(image)}  
                                            isIconOnly
                                            className={`p-0 w-[118px] h-[111px] flex items-center justify-center bg-transparent ${
                                                mainImage?.id === image.id ? 'ring-2 ring-skin-primary2-500' : ''
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
                        <div className="flex items-center gap-2">
                            <div className="flex gap-1">
                                {Array.from({ length: 5 }, (_, i) => (
                                    <ReviewStarFilled key={i} className='w-5 h-5 xl:w-[22px] xl:h-[22px]' />
                                ))}
                            </div>
                            <p className="text-title-2 xl:text-lg text-black font-bold mt-0.5">(10 Reviews)</p>
                        </div>
                    </div>
                    <div className='flex items-center gap-2 font-bold text-skin-neutral-500'>
                        <p className='text-title-1 md:text-h5 xl:text-h4'>{DEFAULT_CURRENCY_SYMBOL}{productVariant?.price ?? 0}</p>
                        <p className='text-content-2 md:text-title-2'>or Mix & Match</p>
                        <Button
                            size="sm"
                            radius="md"
                            color="primary"
                            className="btn primary-btn shadow-input w-fit !min-w-fit text-content-2 md:text-content-1 !leading-none !tap-highlight-transparent !h-5 md:!h-8 xl:!h-9 !px-1.5 !py-1 md:!px-4 md:!py-2"
                        >
                            3 for £30
                        </Button>
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
                            <div className='flex gap-1 items-center'>
                                <DealsIcon />
                                <p className='text-content-2 md:text-content-1 font-bold text-skin-neutral-500'>Choose 2 for £25 - Multibuy Deal!</p>
                            </div>
                        </div>
                    </div>
                    <Divider className='max-lg:hidden' />
                    <ProductVariantFilter attributeTerms={product?.attribute_terms} productSlug={product?.slug} selectedVariant={selectedVariant} availableAttributes={availableAttributes ?? []} />
                    <div className='space-y-2 lg:space-y-3.5'>
                        {
                            stock > 0 ?
                                <p className='text-content-2 md:text-title-2 font-bold primary-gradient-100'>In stock</p> :
                                <p className='text-content-2 md:text-title-2 font-bold text-red-500'>Out of stock</p>
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
                                disabled={isLoading || quantity <= 1}
                            >
                                <MinusIcon />
                            </Button>
                            <input
                                type="tel"
                                value={quantity}
                                onChange={(e) => {
                                    const val = parseInt(e.target.value);
                                    if (!isNaN(val)) handleQuantityChange(val);
                                }}
                                className='w-9 max-w-9 !border-none max-sm:h-3 !outline-none placeholder:text-skin-neutral-500 ml-4 text-center'
                            />
                            <Button
                                isIconOnly
                                size='lg'
                                variant='light'
                                color='primary'
                                className='text-title-1 leading-none font-medium !rounded-r-10 !rounded-l-none hover:!bg-transparent !px-0 !min-w-fit !w-8 !h-[56px]'
                                onPress={() => handleQuantityChange(quantity + 1)}
                                disabled={isLoading || quantity >= stock}
                            >
                                <PlusIcon />
                            </Button>
                        </div>

                        <Button
                            size="lg"
                            radius="md"
                            color="primary"
                            isLoading={isLoading}
                            className={`btn primary-btn w-full shadow-input !rounded-10 text-title-1 !leading-none !font-bold h-12 md:h-[60px] ${(isLoading || quantity <= 0 || quantity > stock) ? '!opacity-50 cursor-not-allowed' : ''}`}
                            onPress={handleAddToCart}
                            disabled={isLoading || quantity <= 0 || quantity > stock}
                        >
                            Add to Cart
                        </Button>
                    </div>
                </div>
            </div>
            <Divider />
            <div className='space-y-3.5 md:space-y-5 lg:space-y-7 md:mt-2'>
                <h2 className='text-content-1 md:text-title-1 lg:text-h5 font-bold primary-gradient-600 w-fit'>Bundle together and save 5%</h2>
                <div className='flex flex-row md:flex-col gap-3 md:gap-5.5'>
                    <BundleProductCard />
                    <BundleProductCard />
                </div>
            </div>
        </section>
    )
}

export default ProductDetails
