"use client"
import React from "react";
import DealCard from "./DealCard";
import { Deal } from "@/lib/config/deal.config";
import EmptyPlaceholder from "./ui/EmptyPlaceholder";

type DealsSliderProps = {
  deals: Deal[];
};

/**
 * Presentational carousel/grid for deals. Data must be loaded on the server and passed in
 * so the homepage HTML includes real links and images for crawlers and no-JS users.
 */
const DealsSlider: React.FC<DealsSliderProps> = ({ deals }) => {
  if (!deals.length) {
    return (
      <EmptyPlaceholder title="Uh, oh!" description="No deals available right now." />
    );
  }

  return (
    <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
      {deals.map((deal) => (
        <DealCard
          key={deal.id}
          title={deal.name}
          imageSrc={deal?.image_url ?? "/images/deal-placeholder.jpg"}
          altText={deal.alt_text ?? deal.name}
          href={`/product-deals/${deal.slug.replace(/ /g, "-")}`}
        />
      ))}
    </div>
  );
};

export default DealsSlider;
