import React from 'react'
import Image from 'next/image'
import { Category } from '@/lib/config/category.config';
import { BrandConfig } from '@/lib/config/brand.config';
import Link from 'next/link';

const banners = [
    { src: '/images/product-banner-1.jpg', alt: 'Elf Bar Disposable Vape' },
    { src: '/images/product-banner-2.jpg', alt: 'Elux Disposable Vape' },
    { src: '/images/product-banner-3.jpg', alt: 'Hayati Disposable Vape' },
];

type CategoryProps = {
    data: Category | BrandConfig;
}

const ProductListingContent: React.FC<CategoryProps> = ({data}) => {
    return (
        <div className="space-y-6">
            <div className='space-y-4'>
                <h1 className='primary-gradient-600 text-h5 md:text-h3 font-bold w-fit'>{data.name}</h1>
                <div className="text-content-2 md:text-content-1 font-semibold md:font-bold text-skin-neutral-400">
                    <p>
                        {'description' in data ? data.description : ''}
                    </p>
                    <p>
                        Get the most for your money with our amazing 3 for £10 deal and 3 for £30 offer on disposable vapes from leading brands! Mix & Match to find the perfect combination of devices, or just stock up on great deals. They’re not our only multibuy deals, we have plenty more!
                    </p>
                </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3.5">
            {banners.map((banner, index) => (
                    <Link href="#" key={index} aria-label={`View details of ${banner.alt}`}>
                        <Image
                            src={banner.src}
                            alt={banner.alt}
                            width={437}
                            height={162}
                            className="rounded-xl w-full max-h-[118px] md:max-h-40"
                            loading="lazy"
                        />
                    </Link>
                ))}
            </div>
        </div>
    )
}

export default ProductListingContent
