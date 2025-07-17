"use client"
import React, { useEffect, useState } from "react";
import Slider, { Settings } from "react-slick";
import DealCard from "./DealCard";
import { Deal } from "@/lib/config/deal.config";
import { getAllDeals } from "@/lib/server.actions";
import { ServerActionStatus } from "@/lib/config/app.config";

const DealsSlider: React.FC = () => {
    const [deals, setDeals] = useState<Deal[]>([]);

    useEffect(() => {
        const fetchDeals = async () => {
            const response = await getAllDeals({ limit: 8, offset: 0 });
            if (response.status === ServerActionStatus.SUCCESS && response.data) {
                setDeals(response.data.deals);
            }
        };
        fetchDeals();
    }, []);

    const settings: Settings = {
        dots: true,
        infinite: deals.length > 4,
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
                    infinite: deals.length > 3,
                    dots: true
                }
            },
            {
                breakpoint: 640,
                settings: {
                    slidesToShow: 2,
                    slidesToScroll: 2,
                    infinite: deals.length > 2,
                    dots: true,
                }
            },
        ]
    };

    return (
        <Slider {...settings}>
            {deals.map((deal) => (
                <div key={deal.id} className="px-2 xl:px-5 py-3 first:pl-0" >
                    <DealCard
                        title={deal.name}
                        imageSrc="/images/deal-1.png" // Placeholder image
                        altText={deal.name}
                        href={`/product-deals/${deal.slug.replace(/ /g, '-')}`}
                    />
                </div>
            ))}
        </Slider>
    );
};

export default DealsSlider;
