import React from "react";
import SectionHeading from "@/components/ui/SectionHeading";
import ViewAllLink from "@/components/ui/ViewAllLink";
import DealsSlider from "@/components/DealsSlider";

interface ShopByDealsProps {
    title?: string;
    viewAllHref?: string;
}

const ShopByDeals: React.FC<ShopByDealsProps> = ({
    title = "Shop a Deal",
    viewAllHref = "/product-deals",
}) => {
    return (
        <section className="space-y-4.5 md:space-y-7.5">
            <div className="flex items-center justify-between">
                <div className="space-y-2.5">
                    <SectionHeading title={title} />
                    <p className="text-title-2 text-skin-neutral-300 font-semibold">Fantastic deals, all year round!</p>
                </div>
                <ViewAllLink href={viewAllHref} />
            </div>
            <div className="slider-container section-slider deals-slider">
                <DealsSlider />
            </div>
        </section>
    );
};

export default ShopByDeals;
