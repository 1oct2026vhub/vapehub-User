
import { NextPage } from "next";
import { ReactElement } from "react";
import TrustPilotRatingCard from "./_components/TrustPilotRatingCard";
import FeatureCards from "./_components/FeatureCards";
import ShopByCategory from "./_components/ShopByCategory";
import HottestCollections from "./_components/HottestCollections";
import NewProducts from "./_components/NewProducts";
import ShopByDeals from "./_components/ShopByDeals";
import { MostPopularSalts, MostPopularVapes } from "./_components/MostPopular";
import PromotionalBanners from "./_components/PromotionalBanners";
import ReferFriend from "./_components/ReferFriend";
import Testimonials from "./_components/Testimonials";
import Subscription from "./_components/Subscription";
import BlogsSection from "./_components/BlogsSection";
import HomeCarousel from "./_components/HomeCarousel";
import { ROUTES } from "@/lib/routes";

const Dashboard: NextPage = (): ReactElement => {
  return ( 
      <div className="px-4 lg:px-12.5 py-4.5 lg:py-10 flex flex-col gap-4.5 sm:gap-7 md:gap-10">
        <HomeCarousel/>
        <section className="flex flex-col gap-4.5 md:gap-10 max-md:mt-4.5">
          <TrustPilotRatingCard
            title="Trustpilot has rated Vapehub as Excellent!"
            filledStars={4}
          />
          <FeatureCards />
        </section>
        <ShopByCategory />
        <HottestCollections />
        <NewProducts />
        <ShopByDeals />
        <MostPopularVapes viewAllHref="disposables"/>
        <MostPopularSalts viewAllHref="pod-kit"/>
        <PromotionalBanners />
        <ReferFriend />
        <Testimonials />
        <Subscription className="mt-5 md:mt-10" /> 
        <BlogsSection viewAllHref={ROUTES.BLOGS} />
      </div>  
  );
};

export default Dashboard;
