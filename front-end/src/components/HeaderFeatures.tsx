"use client";
import React from 'react';
import Image from 'next/image';
import Slider from 'react-slick';

const features = [
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

const ArrowPrev: React.FC<any> = ({ onClick }) => (
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

const ArrowNext: React.FC<any> = ({ onClick }) => (
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
                            <Image src={f.image} alt={`${f.title} icon`} width={38} height={38} className="object-contain" />
                        ) : null}
                        <div className="flex flex-col">
                            {f.id === 'trustpilot' ? (
                                <div className="flex items-center">
                                    <Image src="/images/trustpilot-rating.png" alt="Trustpilot rating" width={140} height={20} className="object-contain" />
                                </div>
                            ) : (
                                <span className="font-bold font-oswald text-sm md:text-title-1 text-skin-white">{f.title}</span>
                            )}
                            <span className="text-title-2 font-oswald font-semibold text-skin-neutral-50">{f.desc}</span>
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
                                    <Image src={f.image} alt={`${f.title} icon`} width={20} height={20} className="object-contain" />
                                ) : null}
                                <div className="text-content-1 font-oswald font-semibold text-skin-neutral-50">{f.desc}</div>
                            </div>
                        </div>
                    ))}
                </Slider>
            </div>
        </div>
    );
};

export default HeaderFeatures;
