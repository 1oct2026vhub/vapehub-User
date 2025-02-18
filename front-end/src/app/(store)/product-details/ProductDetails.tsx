import React from 'react'
import { BenefitIcon, DealsIcon, DispatchIcon, MinusIcon, PlusIcon, ReviewStarFilled } from '@/components/Icons'
import { Button } from '@nextui-org/button'
import { Divider, Select, SelectItem } from '@nextui-org/react'
import Image from 'next/image'
import BundleProductCard from '@/components/BundleProductCard'

const flavours = [
    { key: "Orange", label: "Orange" },
    { key: "Water Melon", label: "Water Melon" },
    { key: "Blue berry", label: "Blue berry" },
];

const ProductDetails: React.FC = () => {
    return (
        <section className='bg-skin-white p-4 md:p-6 xl:p-7.5 rounded-2xl border border-skin-neutral-50 shadow-card flex flex-col gap-4'>
            <div className='flex flex-col lg:flex-row items-start gap-6 xl:gap-11'>
                {/* Title section mobile */}
                <div className='space-y-2 lg:hidden'>
                    <h1 className='text-title-1 md:text-h5 text-skin-neutral-500 font-bold mr-8'>HAWCOS x Lost Mary Pro Max 7000 Disposable Kit</h1>
                    <div className='block text-content-2 text-skin-neutral-500 font-semibold w-fit'>
                        Brand: <a href="#" className='inline-block font-bold text-skin-primary2-500 underline'>Hayati</a>
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

                <div className='space-y-4 w-full lg:w-fit'>
                    <div className='bg-skin-base border border-[#A6AAA9] rounded-10 relative flex flex-col items-center justify-center shrink w-full xl:w-[550px] shadow-brand-card lg:shadow-image-box pt-5 px-1.5 pb-2'>
                        <Image
                            src='/images/product.png'
                            alt='Product'
                            width={280}
                            height={396}
                            className='max-lg:max-w-40 max-sm:max-h-[207px] max-lg:max-h-64 cursor-pointer'
                        />
                        <div className='new-product'>
                            <span>New</span>
                        </div>
                    </div>
                    <div className='flex items-center gap-4'>
                        <div className='px-0.5 py-1.5 bg-skin-base rounded-lg shadow-brand-card flex items-center justify-center shrink border border-neutral-100'>
                            <Image
                                src='/images/small-product.png'
                                alt='Product'
                                width={118}
                                height={111}
                                className='max-w-[80px] lg:max-w-max cursor-pointer'
                            />
                        </div>
                        <div className='px-0.5 py-1.5 bg-skin-base rounded-lg shadow-brand-card flex items-center justify-center shrink border border-neutral-100'>
                            <Image
                                src='/images/small-product.png'
                                alt='Product'
                                width={118}
                                height={111}
                                className='max-w-[80px] lg:max-w-max cursor-pointer'
                            />
                        </div>
                        <div className='px-0.5 py-1.5 bg-skin-base rounded-lg border border-neutral-100 shadow-brand-card flex items-center justify-center shrink'>
                            <Image
                                src='/images/small-product.png'
                                alt='Product'
                                width={118}
                                height={111}
                                className='max-w-[80px] lg:max-w-max cursor-pointer'
                            />
                        </div>
                    </div>
                </div>
                <div className='flex flex-col gap-4.5 lg:gap-5 w-full'>   
                    <div className='space-y-3.5 hidden lg:block'>
                        <h1 className='text-h5 xl:text-h4 text-skin-neutral-500 font-bold mr-8'>HAWCOS x Lost Mary Pro Max 7000 Disposable Kit</h1>
                        <div className='block text-content-2 text-skin-neutral-500 font-semibold w-fit'>
                            Brand: <a href="#" className='inline-block font-bold text-skin-primary2-500 underline'>Hayati</a>
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
                        <p className='text-title-1 md:text-h5 xl:text-h4'>£12.99</p>
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
                    <Divider className='max-lg:hidden'/>
                    <div className='space-y-2 lg:space-y-3.5'>
                        <div>
                            <p className='text-content-1 sm:text-title-2 lg:text-title-1 font-semibold text-black'>Flavours</p>
                            <p className='primary-gradient-100 font-bold text-content-3 md:text-content-1'>20 available</p>
                        </div>
                        <Select
                            size='sm'
                            className="w-full"
                            variant='bordered'
                            label="Choose your flavour"
                            classNames={{
                                label: "!text-content-1 !text-skin-neutral-500 font-bold",
                                trigger: "shadow-base border-skin-neutral-100",
                                listboxWrapper: "max-h-[400px]",
                            }}
                        >
                            {flavours.map((flavour) => (
                                <SelectItem key={flavour.key}>{flavour.label}</SelectItem>
                            ))}
                        </Select>
                    </div>
                    <div className='space-y-2 lg:space-y-3.5'>
                        <p className='text-content-1 md:text-title-1 font-semibold text-skin-neutral-500'>Nicotine Strength</p>
                        <div className='flex gap-3.5 items-center'>
                            <Button
                                size="sm"
                                radius="md"
                                color="primary"
                                className="btn primary-btn w-full shadow-base !text-content-1 !leading-none !h-9 !max-h-9 !px-4 !py-2 !font-bold"
                            >
                                10 mg
                            </Button>
                            <Button
                                size="sm"
                                radius="md"
                                color="default"
                                variant='bordered'
                                className="btn bg-skin-white w-full shadow-base !text-content-1 border-skin-neutral-200 !leading-none !h-9 !max-h-9 !px-4 !py-2 !font-bold"
                            >
                                20 mg
                            </Button>
                            <Button
                                size="sm"
                                radius="md"
                                color="default"
                                variant='bordered'
                                className="btn bg-skin-white w-full shadow-base !text-content-1 border-skin-neutral-200 !leading-none !h-9 !max-h-9 !px-4 !py-2 !font-bold"
                            >
                                30 mg
                            </Button>
                        </div>
                        <p className='text-title-2 font-bold primary-gradient-100'>In stock</p>
                    </div>
                    <div className='flex gap-4 md:gap-6 xl:gap-11 items-center'>
                        <div
                            className="flex items-center border-2 bg-skin-white w-fit shadow-base text-title-1 border-skin-neutral-200 !leading-none px-1 rounded-10 !font-bold h-12 md:h-[60px]"
                        >
                            <Button isIconOnly size='lg' variant='light' color='primary' className='text-title-1 leading-none font-medium !rounded-l-10 !rounded-r-none hover:!bg-transparent !px-0 !min-w-fit !w-8 !h-[56px]'>
                                <MinusIcon />
                            </Button>
                            <input type="tel" name="" id="" placeholder='1' className='w-fit max-w-7 !border-none !outline-none placeholder:text-skin-neutral-500 ml-4' />
                            <Button isIconOnly size='lg' variant='light' color='primary' className='text-title-1 leading-none font-medium !rounded-r-10 !rounded-l-none hover:!bg-transparent !px-0 !min-w-fit !w-8 !h-[56px]'>
                                <PlusIcon />
                            </Button>
                        </div>
                        <Button
                            size="lg"
                            radius="md"
                            color="primary"
                            className="btn primary-btn w-full shadow-input !rounded-10 text-title-1 !leading-none !font-bold h-12 md:h-[60px]"
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
