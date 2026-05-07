import React from "react";
import SectionHeading from "@/components/ui/SectionHeading";
import ViewAllLink from "@/components/ui/ViewAllLink";
import DealsSlider from "@/components/DealsSlider";
import EmptyPlaceholder from "@/components/ui/EmptyPlaceholder";
import { getAllDeals } from "@/lib/server.actions";
import { ServerActionStatus } from "@/lib/config/app.config";

interface ShopByDealsProps {
  title?: string;
  viewAllHref?: string;
}

const ShopByDeals: React.FC<ShopByDealsProps> = async ({
  title = "Shop a Deal",
  viewAllHref = "/product-deals",
}) => {
  const dealsResponse = await getAllDeals({ offset: 0, show_home_page: true });
  const deals =
    dealsResponse.status === ServerActionStatus.SUCCESS && dealsResponse.data?.deals
      ? dealsResponse.data.deals
      : [];

  return (
    <section className="space-y-4.5 md:space-y-7.5">
      <div className="flex items-center justify-between">
        <div className="space-y-2.5">
          <SectionHeading title={title} />
          <p className="text-title-2 font-semibold text-skin-neutral-300">Fantastic deals, all year round!</p>
        </div>
        <ViewAllLink href={viewAllHref} />
      </div>
      <div className="slider-container section-slider deals-slider">
        {deals.length > 0 ? (
          <DealsSlider deals={deals} />
        ) : (
          <EmptyPlaceholder title="Uh, oh!" description="Failed to load deals or no deals on the homepage." />
        )}
      </div>
    </section>
  );
};

export default ShopByDeals;
