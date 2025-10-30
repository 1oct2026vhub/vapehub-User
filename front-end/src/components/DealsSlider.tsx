"use client"
import React, { useEffect, useState } from "react";
import DealCard from "./DealCard";
import { Deal } from "@/lib/config/deal.config";
import { getAllDeals } from "@/lib/server.actions";
import { ServerActionStatus } from "@/lib/config/app.config";

const DealsSlider: React.FC = () => {
    const [deals, setDeals] = useState<Deal[]>([]);

    useEffect(() => {
        const fetchDeals = async () => {
            const response = await getAllDeals({ limit: 4, offset: 0 });
            if (response.status === ServerActionStatus.SUCCESS && response.data) {
                setDeals(response.data.deals);
            }
        };
        fetchDeals();
    }, []);
    return (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            {deals.map((deal) => (
                <DealCard
                    key={deal.id}
                    title={deal.name}
                    imageSrc={deal?.image_url ?? "/images/deal-placeholder.jpg"} // Placeholder image
                    altText={deal.name}
                    href={`/product-deals/${deal.slug.replace(/ /g, '-')}`}
                />
            ))}
        </div>
    );
};

export default DealsSlider;
