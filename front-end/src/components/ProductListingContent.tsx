import React from 'react'
// import Image from 'next/image'
import { Category } from '@/lib/config/category.config';
import { BrandConfig } from '@/lib/config/brand.config';
import { DynamicPageSlugResponse } from '@/lib/config/global.config';
import Link from 'next/link';
import NoImage from './NoImage';
import DesignTypeButtons, {
    RelatedQuickLinksEntity,
} from '@/app/(store)/(product-listing)/_components/DesignTypeButtons';
import { ArrowRightIcon, BuyingGuideBookIcon } from './Icons';

type CategoryProps = {
    data: Category | BrandConfig;
    dynamicPageSlug?: DynamicPageSlugResponse & { latest_deals?: DynamicPageSlugResponse['deals'] };
    aboutHeading?: string;
    /** Green CTA card — show when buyingGuide.is_enabled === true. */
    showBuyingGuideCta?: boolean;
    buyingGuideCtaPrompt?: string;
    buyingGuideCtaLabel?: string;
    buyingGuideCtaHref?: string;
    showCategoryQuickLinks?: boolean;
    /** Leaf slug for related-categories / related-brands API (required when showCategoryQuickLinks). */
    categoryQuickLinksSlug?: string;
    /** Defaults to category. */
    relatedQuickLinksEntity?: RelatedQuickLinksEntity;
}

const ProductListingContent: React.FC<CategoryProps> = ({
    data,
    dynamicPageSlug,
    aboutHeading,
    showBuyingGuideCta = false,
    buyingGuideCtaPrompt = '',
    buyingGuideCtaLabel = '',
    buyingGuideCtaHref = '#buying-guide-faqs',
    showCategoryQuickLinks = false,
    categoryQuickLinksSlug = '',
    relatedQuickLinksEntity = 'category',
}) => {
    // Only use banners from API - no fallback to deals
    const banners = dynamicPageSlug?.banners || [];
    
    // Filter and sort banners with valid images
    const validBanners = banners
        .filter(banner => banner.image && banner.image.trim() !== '')
        .sort((a, b) => a.order - b.order)
        .slice(0, 3);

    const listingName = (data.name || dynamicPageSlug?.name || '').trim();
    const descriptionHtml = dynamicPageSlug?.description || data?.description || '';
    const hasDescription = Boolean(descriptionHtml.trim());
    const ctaPrompt = buyingGuideCtaPrompt.trim();
    const ctaLabel = buyingGuideCtaLabel.trim();
    const showCta = showBuyingGuideCta && Boolean(ctaPrompt || ctaLabel);
    
    return (
        <div className="space-y-6">
            <div className='space-y-4'>
                <h1 className='primary-gradient-600 text-h5 md:text-h2 font-semibold w-fit'>{listingName || data.name || dynamicPageSlug?.name}</h1>
                {aboutHeading && <h2 className='sr-only'>{aboutHeading}</h2>}
                {(hasDescription || showCta) && (
                    <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:gap-6 xl:gap-8">
                        {hasDescription ? (
                            <div
                                className="product-content rich-text min-w-0 flex-1 text-content-1 md:text-content-1 font-normal text-skin-neutral-500 leading-relaxed"
                                dangerouslySetInnerHTML={{ __html: descriptionHtml }}
                            />
                        ) : null}
                        {showCta ? (
                            <Link
                                href={buyingGuideCtaHref}
                                className="group flex w-full shrink-0 items-center gap-2.5 rounded-md border border-[#035335] bg-[#f0f9f9] px-3 py-3 transition-opacity hover:opacity-90 lg:w-[min(100%,22rem)]"
                            >
                                <BuyingGuideBookIcon className="h-[22px] w-[22px] shrink-0 text-[#035335]" />
                                <span className="min-w-0 flex-1">
                                    {ctaPrompt ? (
                                        <span className="block text-[12px] font-normal leading-[1.2] text-skin-neutral-300">
                                            {ctaPrompt}
                                        </span>
                                    ) : null}
                                    {ctaLabel ? (
                                        <span className="primary-gradient-600 mt-0.5 block text-[13px] font-semibold leading-[1.25]">
                                            {ctaLabel}
                                        </span>
                                    ) : null}
                                </span>
                                <ArrowRightIcon className="h-3.5 w-3.5 shrink-0 text-[#035335] [&_path]:stroke-current" />
                            </Link>
                        ) : null}
                    </div>
                )}
                {showCategoryQuickLinks && categoryQuickLinksSlug ? (
                    <DesignTypeButtons
                        slug={categoryQuickLinksSlug}
                        entity={relatedQuickLinksEntity}
                    />
                ) : null}
            </div>
            {validBanners.length > 0 && (
                <div className={`grid gap-3.5 ${
                    validBanners.length === 1 
                        ? 'grid-cols-1 md:grid-cols-1 md:justify-items-center' 
                        : 'grid-cols-1 md:grid-cols-3'
                }`}>
                    {validBanners.map((banner, index) => {
                        const redirectUrl = banner.url && banner.url.trim() !== '' && banner.url !== '#' ? banner.url : null;
                        // Mobile: same full-width layout as multi-banner so UI is consistent (no overflow). Desktop: Figma 437.33×162px, radius 12px
                        const singleBannerClass = validBanners.length === 1
                            ? 'w-full min-w-0 rounded-[7.59px] overflow-hidden md:w-[437.33px] md:h-[162px] md:rounded-[12px]'
                            : '';
                        const imageClass = validBanners.length === 1
                            ? 'w-full h-full rounded-[7.59px] md:rounded-[12px] object-cover object-center aspect-[437/162] min-h-[102.41px] md:min-h-0 md:aspect-auto md:h-full'
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
