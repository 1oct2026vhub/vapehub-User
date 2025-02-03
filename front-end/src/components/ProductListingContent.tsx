import React from 'react'
import SectionHeading from './ui/SectionHeading'
import Image from 'next/image'

const banners = [
    { src: '/images/product-banner-1.jpg', alt: 'Elf Bar Disposable Vape' },
    { src: '/images/product-banner-2.jpg', alt: 'Elux Disposable Vape' },
    { src: '/images/product-banner-3.jpg', alt: 'Hayati Disposable Vape' },
];

const ProductListingContent: React.FC = () => {
    return (
        <div className="space-y-6">
            <div>
                <SectionHeading title="Disposable Vapes" className="w-fit" />
                <div className="text-content-2 md:text-content-1 font-semibold md:font-bold text-skin-neutral-400">
                    <p>
                        There’s nothing quite like the convenience of disposable vapes. Perfect for those on the go, Disposable vape kits offer a hassle-free vaping experience that can be enjoyed without having to worry about recharging batteries or refilling tanks with e-liquid. The Disposable Vape market is immense and we stock all the top brands such as Elf Bar, Elux, Hayati, IVG, SKE and more! So whether you’re looking for a quick and convenient way to vape on the go, or you’re simply trying out vaping for the first time, disposable vape devices are the perfect solution! Browse our range of disposables today and find your perfect match.
                    </p>
                    <p>
                        Get the most for your money with our amazing 3 for £10 deal and 3 for £30 offer on disposable vapes from leading brands! Mix & Match to find the perfect combination of devices, or just stock up on great deals. They’re not our only multibuy deals, we have plenty more!
                    </p>
                </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3.5">
            {banners.map((banner, index) => (
                    <a href="#" key={index} aria-label={`View details of ${banner.alt}`}>
                        <Image
                            src={banner.src}
                            alt={banner.alt}
                            width={437}
                            height={162}
                            className="rounded-xl w-full max-h-[118px] md:max-h-40"
                            loading="lazy"
                        />
                    </a>
                ))}
            </div>
        </div>
    )
}

export default ProductListingContent
