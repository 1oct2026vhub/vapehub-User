"use client"
import React from "react";
import Slider, { Settings } from "react-slick";
import DealCard from "./DealCard";

const DealsSlider: React.FC = () => {

    const settings: Settings = {
        dots: true,
        infinite: true,
        speed: 500,
        slidesToShow: 4,
        slidesToScroll: 4,
        lazyLoad:"progressive",
        responsive: [
            {
                breakpoint: 1280,
                settings: {
                    slidesToShow: 3,
                    slidesToScroll: 2,
                    infinite: true,
                    dots: true
                }
            },
            {
                breakpoint: 640,
                settings: {
                    slidesToShow: 2,
                    slidesToScroll: 2,
                    infinite: true,
                    dots: true,
                }
            },
        ]
    };

    const deals = [
        { imageSrc: "/images/deal-1.png", altText: "deal 1", href: "#" },
        { imageSrc: "/images/deal-1.png", altText: "deal 2", href: "#" },
        { imageSrc: "/images/deal-1.png", altText: "deal 3", href: "#" },
        { imageSrc: "/images/deal-1.png", altText: "deal 4", href: "#" },
        { imageSrc: "/images/deal-1.png", altText: "deal 5", href: "#" },
        { imageSrc: "/images/deal-1.png", altText: "deal 6", href: "#" },
        { imageSrc: "/images/deal-1.png", altText: "deal 7", href: "#" },
        { imageSrc: "/images/deal-1.png", altText: "deal 8", href: "#" },
    ];

    return (
        <Slider {...settings}>
            {deals.map((deal, index) => (
                <div key={index} className="px-2 xl:px-5 py-3 first:pl-0" >
                    <DealCard
                        key={index}
                        imageSrc={deal.imageSrc}
                        altText={deal.altText}
                        href={deal.href}
                    />
                </div>
            ))}
        </Slider>
    );
};

export default DealsSlider;
