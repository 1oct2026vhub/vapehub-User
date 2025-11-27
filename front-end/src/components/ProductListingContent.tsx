import React from 'react'
// import Image from 'next/image'
import { Category } from '@/lib/config/category.config';
import { BrandConfig } from '@/lib/config/brand.config';
import { DynamicPageSlugResponse } from '@/lib/config/global.config';
import Link from 'next/link';
import NoImage from './NoImage';

type CategoryProps = {
    data: Category | BrandConfig;
    dynamicPageSlug?: DynamicPageSlugResponse & { latest_deals?: DynamicPageSlugResponse['deals'] };
}

const ProductListingContent: React.FC<CategoryProps> = ({data, dynamicPageSlug}) => {
    // Determine deals to display (prefer latest_deals, fallback to deals)
    const dealsToDisplay = dynamicPageSlug?.latest_deals || dynamicPageSlug?.deals;

    // Only render content if there's deals text or deals images
    // if (!dynamicPageSlug?.deals_text && (!dealsToDisplay || dealsToDisplay.length === 0)) {
    //     return null;
    // }
    return (
        <div className="space-y-6">
            <div className='space-y-4'>
                <h1 className='primary-gradient-600 text-h5 md:text-h2 font-semibold w-fit'>{data.name}</h1>
                {(dynamicPageSlug?.description || data?.description) && (
                    <div 
                        className="product-content rich-text text-content-1 md:text-content-1 font-normal text-skin-neutral-500 leading-relaxed"
                        dangerouslySetInnerHTML={{ __html: dynamicPageSlug?.description || data?.description || "" }}
                    />
                )}
            </div>
            {dealsToDisplay && dealsToDisplay.length > 0 && (
                <div className={`grid gap-3.5 ${
                    dealsToDisplay.filter(banner => banner.image_url && banner.image_url.trim() !== '').length === 1 
                        ? 'grid-cols-1 justify-items-center' 
                        : 'grid-cols-1 md:grid-cols-3'
                }`}>
                    {dealsToDisplay
                        .filter(banner => banner.image_url && banner.image_url.trim() !== '')
                        .slice(0, 3)
                        .map((banner, index) => (
                        <Link 
                            href="#" 
                            key={index} 
                            aria-label={`View details of ${banner.name}`}
                            className={dealsToDisplay.filter(banner => banner.image_url && banner.image_url.trim() !== '').length === 1 ? 'flex justify-center w-[30%]' : ''}
                        >
                            <NoImage
                                src={banner.image_url || ''}
                                alt={banner.name || ''}
                                width={437}
                                height={162}
                                className="rounded-xl w-full max-h-[118px] md:max-h-40"
                            />
                        </Link>
                    ))}
                </div>
            )}
        </div>
    )
}

export default ProductListingContent
