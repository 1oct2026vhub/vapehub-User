"use client"

import BannerSlider from "@/app/(store)/(dashboard)/BannerSlider";
import Footer from "@/components/Footer";
import Header from "@/components/Header";
import MobileBannerSlider from "@/app/(store)/(dashboard)/MobileBannerSlider";
import { NextPage } from "next";
import { ReactElement } from "react";
import TrustPilotRatingCard from "@/app/(store)/(dashboard)/TrustPilotRatingCard";
import FeatureCards from "@/app/(store)/(dashboard)/FeatureCards";
import ShopByCategory from "@/app/(store)/(dashboard)/ShopByCategory";
import HottestCollections from "@/app/(store)/(dashboard)/HottestCollections";
import NewProducts from "@/app/(store)/(dashboard)/NewProducts";
import ShopByDeals from "@/app/(store)/(dashboard)/ShopByDeals";
import { MostPopularSalts, MostPopularVapes } from "@/app/(store)/(dashboard)/MostPopular";
import PromotionalBanners from "@/app/(store)/(dashboard)/PromotionalBanners";
import ReferFriend from "@/app/(store)/(dashboard)/ReferFriend";
import Testimonials from "@/app/(store)/(dashboard)/Testimonials";
import Subscription from "@/app/(store)/(dashboard)/Subscription";
import BlogsSection from "@/app/(store)/(dashboard)/BlogsSection";

const Dashboard: NextPage = (): ReactElement => {
  return (
    <>
      <Header />
      <main className="px-4 lg:px-12.5 py-4.5 lg:py-10 flex flex-col gap-4.5 md:gap-10">
        <section className="banner-carousel hidden lg:block">
          <BannerSlider />
        </section>
        <section className="mobile-banner-carousel lg:hidden">
          <MobileBannerSlider />
        </section>
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
        <MostPopularVapes />
        <MostPopularSalts />
        <PromotionalBanners />
        <ReferFriend />
        <Testimonials />
        <Subscription />
        <BlogsSection />
      </main>
      <Footer />
    </>
  );
};

export default Dashboard;
