import { Button, Select, SelectItem } from '@nextui-org/react'
import Image from 'next/image'
import React from 'react'

const flavours = [
    { key: "Orange", label: "Orange" },
    { key: "Water Melon", label: "Water Melon" },
    { key: "Blue berry", label: "Blue berry" },
];

const BundleProductCard: React.FC = () => {
    return (
        <div className='bg-skin-white p-4 rounded-14 shadow-card flex items-center justify-between'>
            <div className='flex items-center gap-7'>
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
                <div className='space-y-8'>
                    <h4 className='text-title-1 font-semibold text-skin-neutral-400 mr-10'>RandM Tornado 9000 Puff Disposable Vape - Watermelon
                        Skittles</h4>
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
                    <p className='primary-gradient-100 text-h5 font-bold'>£12.99</p>
                    <p className='text-skin-neutral-300 text-title-1 line-through font-bold'>£12.99</p>
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
    )
}

export default BundleProductCard
