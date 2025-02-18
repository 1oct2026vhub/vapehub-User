import { Button, Divider, Select, SelectItem } from '@nextui-org/react'
import Image from 'next/image'
import React from 'react'

const flavours = [
    { key: "Orange", label: "Orange" },
    { key: "Water Melon", label: "Water Melon" },
    { key: "Blue berry", label: "Blue berry" },
];

const BundleProductCard: React.FC = () => {
    return (
        <>
            <div className='bg-skin-white p-4 rounded-14 shadow-card hidden md:flex items-center justify-between gap-8'>
                <div className='flex items-center gap-5 xl:gap-7'>
                    <div className='bg-skin-white p-2 rounded-10 shadow-deal-card'>
                        <div className='bg-skin-base border border-skin-neutral-100 rounded p-3 shadow'>
                            <Image
                                src='/images/product-1.png'
                                alt='Product'
                                width={104}
                                height={100}
                            />
                        </div>
                    </div>
                    <div className='space-y-8 max-w-lg'>
                        <h3 className='text-lg xl:text-title-1 font-semibold text-skin-neutral-400 mr-10'>RandM Tornado 9000 Puff Disposable Vape - Watermelon
                            Skittles</h3>
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
                </div>
                <div className='space-y-7 text-right'>
                    <div>
                        <p className='primary-gradient-100 text-title-1 xl:text-h5 font-bold'>£12.99</p>
                        <p className='text-skin-neutral-300 text-title-2 xl:text-title-1 line-through font-bold'>£12.99</p>
                    </div>
                    <Button
                        size="sm"
                        radius="sm"
                        color="primary"
                        className="btn primary-btn w-full shadow-input !rounded-10 text-content-1 !leading-none"
                    >
                        Add to Cart
                    </Button>
                </div>
            </div>

            {/* Mobile Card */}
            <div className='bg-skin-white p-2.5 w-full rounded-xl flex flex-col gap-2.5 md:hidden border border-skin-neutral-100'>
                <div className='space-y-2'>
                    <div className='bg-skin-neutral-50 border border-skin-primary-100 rounded-lg p-3 shadow-md'>
                        <Image
                            src='/images/product-1.png'
                            alt='Product'
                            width={104}
                            height={100}
                            className='w-full'
                        />
                    </div>
                    <h4 className='text-content-1 sm:text-content-2 font-semibold text-skin-neutral-400 line-clamp-2'>RandM Tornado 9000 Puff Disposable Vape - Watermelon
                        Skittles</h4>
                    <div className='flex items-end gap-2.5'>
                        <p className='text-black text-content-1 sm:text-title-2 font-semibold'>£12.99</p>
                        <p className='text-content-2 sm:text-content-1 text-skin-neutral-300 line-through font-normal'>£12.99</p>
                    </div>
                    <Select
                        size='sm'
                        className="w-full"
                        variant='bordered'
                        label="Choose flavour"
                        classNames={{
                            label: "!text-xs sm:!text-content-2 !text-skin-neutral-500 font-medium",
                            trigger: "shadow-base border-skin-neutral-100",
                            listboxWrapper: "max-h-[300px]",
                        }}
                    >
                        {flavours.map((flavour) => (
                            <SelectItem key={flavour.key}>{flavour.label}</SelectItem>
                        ))}
                    </Select>
                </div>
                <Divider />
                <Button
                    size="sm"
                    radius="sm"
                    color="primary"
                    className="btn primary-btn w-full shadow-input !rounded-10 text-content-1 !leading-none !h-9"
                >
                    Add to Cart
                </Button>
            </div>
        </>
    )
}

export default BundleProductCard
