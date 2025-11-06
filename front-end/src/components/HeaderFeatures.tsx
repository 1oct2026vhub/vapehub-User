"use client";
import React, { useEffect, useState } from 'react';
import Image from 'next/image';
import Slider from 'react-slick';
import { getFeatureContent, getTrustpilotReviews } from '@/lib/server.actions';
import { ServerActionStatus } from '@/lib/config/app.config';

interface Feature {
    id: string | number;
    title: string;
    desc: string;
    image: string | null;
    isTrustpilot?: boolean;
}

// Static fallback features
const fallbackFeatures: Feature[] = [
    {
        id: 'delivery',
        title: 'Free Delivery',
        desc: 'Free delivery on UK orders £30 and over',
        image: '/images/free-delivery.svg',
    },
    {
        id: 'trustpilot',
        title: 'Trustpilot',
        desc: 'Trustpilot has rated Vapehub as Excellent!',
        image: '/images/trustpilot.svg',
        isTrustpilot: true,
    },
    {
        id: 'offers',
        title: 'Exclusive Offers',
        desc: 'Subscribe to our newsletter for great deals',
        image: '/images/exclusive-offers.svg',
    },
    {
        id: 'loyalty',
        title: 'Loyalty Scheme',
        desc: 'Earn loyalty points and get cashback',
        image: '/images/loyalty-scheme.svg',
    },
];

interface ArrowProps {
    onClick?: () => void;
}

const ArrowPrev: React.FC<ArrowProps> = ({ onClick }) => (
    <button
        aria-label="Previous"
        className={`absolute left-4 top-[48%] -translate-y-1/2 z-20 w-5 h-5 min-w-5 rounded-full border border-skin-primary-300 flex items-center justify-center`}
        onClick={onClick}
    >
        <svg xmlns="http://www.w3.org/2000/svg" width="4" height="7" viewBox="0 0 4 7" fill="none">
            <path d="M3.47148 6.4224L0.538147 3.48073L3.47148 0.539062" stroke="#649580" strokeWidth="1.0763" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
    </button>
);

const ArrowNext: React.FC<ArrowProps> = ({ onClick }) => (
    <button
        aria-label="Next"
        className={`absolute right-4 top-[48%] -translate-y-1/2 z-20 w-5 h-5 min-w-5 rounded-full border border-skin-primary-300 flex items-center justify-center text-skin-primary-300`}
        onClick={onClick}
    >
        <svg xmlns="http://www.w3.org/2000/svg" width="4" height="7" viewBox="0 0 4 7" fill="none">
            <path d="M0.524994 6.40677L3.45833 3.4651L0.524994 0.523438" stroke="#649580" strokeWidth="1.05" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
    </button>
);

const HeaderFeatures: React.FC = () => {
    const [features, setFeatures] = useState<Feature[]>(fallbackFeatures);
    const [trustpilotData, setTrustpilotData] = useState<{
        stars: number;
        ratingCategory: string;
    }>({
        stars: 5,
        ratingCategory: 'Excellent',
    });

    useEffect(() => {
        const fetchData = async () => {
            try {
                // Fetch both feature content and trustpilot data in parallel
                const [featuresResponse, trustpilotResponse] = await Promise.all([
                    getFeatureContent(),
                    getTrustpilotReviews()
                ]);

                // Process feature content
                if (featuresResponse.status === ServerActionStatus.SUCCESS && featuresResponse.data?.featureContent) {
                    const apiFeatures: Feature[] = featuresResponse.data.featureContent.map((feature) => ({
                        id: feature.id,
                        title: feature.title,
                        desc: feature.subtitle,
                        image: feature.icon?.icon_url || null,
                        isTrustpilot: feature.title.toLowerCase().includes('trustpilot'),
                    }));
                    
                    // Ensure Trustpilot feature is always present at second position
                    const hasTrustpilot = apiFeatures.some(f => f.isTrustpilot);
                    if (!hasTrustpilot) {
                        // Find and add the trustpilot fallback feature at index 1 (second position)
                        const trustpilotFallback = fallbackFeatures.find(f => f.isTrustpilot);
                        if (trustpilotFallback) {
                            apiFeatures.splice(1, 0, trustpilotFallback);
                        }
                    }
                    
                    setFeatures(apiFeatures.length > 0 ? apiFeatures : fallbackFeatures);
                }

                // Process trustpilot data - if no data, static fallback is already set
                if (trustpilotResponse.status === ServerActionStatus.SUCCESS && 
                    trustpilotResponse.data?.overallStats?.scoreBreakdown) {
                    setTrustpilotData({
                        stars: trustpilotResponse.data.overallStats.scoreBreakdown.stars || 5,
                        ratingCategory: trustpilotResponse.data.overallStats.scoreBreakdown.ratingCategory || 'Excellent',
                    });
                }
                // If no valid data from API, static fallback remains (already set in initial state)
            } catch (error) {
                console.error('Error fetching header features data:', error);
                // Keep static fallback data on error
            }
        };

        fetchData();
    }, []);

    const settings = {
        dots: false,
        infinite: true,
        speed: 500,
        slidesToShow: 1,
        slidesToScroll: 1,
        arrows: true,
        adaptiveHeight: true,
        prevArrow: <ArrowPrev />,
        nextArrow: <ArrowNext />,
    };

    return (
        <div className="w-full bg-footer-gradient">
            {/* Desktop / tablet view */}
            <div className="hidden lg:flex items-center justify-between gap-6 px-4 lg:px-12 py-3 lg:py-5 text-white max-w-[1520px] mx-auto">
                {features.map((f) => (
                    <div key={f.id} className="flex items-center gap-4 max-w-[28%]">
                        {f.image ? (
                            <Image src={f.image} alt={`${f.title} icon`} width={38} height={38} className="object-contain rounded-full" loading="lazy" />
                        ) : null}
                        <div className="flex flex-col">
                            {f.isTrustpilot && trustpilotData ? (
                                <div className="flex items-center">
                                    <Image src="/images/trustpilot-rating.png" alt="Trustpilot rating" width={140} height={20} className="object-contain" loading="lazy" />
                                </div>
                            ) : (
                                <span className="font-bold font-oswald text-sm md:text-xl text-skin-white">{f.title}</span>
                            )}
                            <span className="text-title-2 font-oswald font-semibold text-skin-neutral-50">
                                {f.isTrustpilot && trustpilotData 
                                    ? `Trustpilot has rated Vapehub as ${trustpilotData.ratingCategory}!`
                                    : f.desc
                                }
                            </span>
                        </div>
                    </div>
                ))}
            </div>

            {/* Mobile carousel */}
            <div className="lg:hidden text-white">
                <Slider {...settings} className="py-2.5">
                    {features.map((f) => (
                        <div key={f.id} className="px-4">
                            <div className="flex items-center justify-center gap-1">
                                {f.image ? (
                                    <Image src={f.image} alt={`${f.title} icon`} width={20} height={20} className="object-contain rounded-full" loading="lazy" />
                                ) : null}
                                <div className="text-content-1 font-oswald font-semibold text-skin-neutral-50">
                                    {f.isTrustpilot && trustpilotData 
                                        ? `Trustpilot has rated Vapehub as ${trustpilotData.ratingCategory}!`
                                        : f.desc
                                    }
                                </div>
                            </div>
                        </div>
                    ))}
                </Slider>
            </div>
        </div>
    );
};

export default HeaderFeatures;
