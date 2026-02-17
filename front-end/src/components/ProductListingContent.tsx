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
    // Only use banners from API - no fallback to deals
    const banners = dynamicPageSlug?.banners || [];
    
    // Filter and sort banners with valid images
    const validBanners = banners
        .filter(banner => banner.image && banner.image.trim() !== '')
        .sort((a, b) => a.order - b.order)
        .slice(0, 3);
    
    return (
        <div className="space-y-6">
            <div className='space-y-4'>
                <h1 className='primary-gradient-600 text-h5 md:text-h2 font-semibold w-fit'>{data.name || dynamicPageSlug?.name}</h1>
                {(dynamicPageSlug?.description || data?.description) && (
                    <div 
                        className="product-content rich-text text-content-1 md:text-content-1 font-normal text-skin-neutral-500 leading-relaxed"
                        dangerouslySetInnerHTML={{ __html: dynamicPageSlug?.description || data?.description || "" }}
                    />
                )}
            </div>
            {validBanners.length > 0 && (
                <div className={`grid gap-3.5 ${
                    validBanners.length === 1 
                        ? 'grid-cols-1 justify-items-center' 
                        : 'grid-cols-1 md:grid-cols-3'
                }`}>
                    {validBanners.map((banner, index) => {
                        const redirectUrl = banner.url && banner.url.trim() !== '' && banner.url !== '#' ? banner.url : null;
                        // Figma: Mobile 143.92×102.41px radius 7.59px | Web 437.33×162px radius 12px
                        const singleBannerClass = validBanners.length === 1
                            ? 'flex justify-center w-[143.92px] h-[102.41px] rounded-[7.59px] overflow-hidden md:w-[437.33px] md:h-[162px] md:rounded-[12px]'
                            : '';
                        const imageClass = validBanners.length === 1
                            ? 'w-full h-full rounded-[7.59px] md:rounded-[12px]'
                            : 'rounded-[7.59px] md:rounded-[12px] w-full object-cover object-center aspect-[437/162] min-h-[102.41px] md:min-h-[162px]';

                        return redirectUrl ? (
                            <Link 
                                href={redirectUrl} 
                                key={index} 
                                aria-label={banner.alt || 'Banner'}
                                className={singleBannerClass}
                            >
                                <NoImage
                                    src={banner.image}
                                    alt={banner.alt || ''}
                                    width={437}
                                    height={162}
                                    className={imageClass}
                                />
                            </Link>
                        ) : (
                            <div
                                key={index}
                                className={singleBannerClass}
                            >
                                <NoImage
                                    src={banner.image}
                                    alt={banner.alt || ''}
                                    width={437}
                                    height={162}
                                    className={imageClass}
                                />
                            </div>
                        );
                    })}
                </div>
            )}
        </div>
    )
}

export default ProductListingContent
