import { NextPage } from "next";
import {  Suspense } from "react";
import ScrollToTop from "@/components/ScrollToTop";
import SuspenseLoader from "@/components/ui/SuspenseLoader";
import { ROUTES } from "@/lib/routes";
import HomeCarousel from './_components/HomeCarousel';
import WelcomeSection from './_components/WelcomeSection';
import TrustPilotRatingCard from './_components/TrustPilotRatingCard';
import FeatureCards from './_components/FeatureCards';
import ShopByCategory from './_components/ShopByCategory';
import HottestCollections from './_components/HottestCollections';
import NewProducts from './_components/NewProducts';
import ShopByDeals from './_components/ShopByDeals';
import { MostPopularVapes, MostPopularSalts } from './_components/MostPopular';
import PromotionalBanners from './_components/PromotionalBanners';
import ReferFriend from './_components/ReferFriend';
import Testimonials from './_components/Testimonials';
import Subscription from './_components/Subscription';
import BlogsSection from './_components/BlogsSection';

export const revalidate = 60;

const Dashboard: NextPage = async () => {
  // const Dashboard: NextPage<{searchParams: Promise<{referral_code: string}>}> = async ({searchParams}) => {
  // const referralCode = (await searchParams).referral_code;
   

  return (
    <div className="px-4 lg:px-12.5 py-4.5 lg:py-10 flex flex-col gap-4.5 sm:gap-7 md:gap-10">
      <Suspense fallback={<SuspenseLoader />}>
        <HomeCarousel />
      </Suspense>

      <Suspense fallback={<SuspenseLoader />}>
        <WelcomeSection />
      </Suspense>

      <section className="flex flex-col gap-4.5 md:gap-10 max-md:mt-4.5">
        <Suspense fallback={<SuspenseLoader />}>
          <TrustPilotRatingCard
            title="Trustpilot has rated Vapehub as Excellent!"
            filledStars={4}
          />
          <FeatureCards />
        </Suspense>
      </section>

      <Suspense fallback={<SuspenseLoader />}>
        <ShopByCategory />
      </Suspense>

      <Suspense fallback={<SuspenseLoader />}>
        <HottestCollections />
      </Suspense>

      <Suspense fallback={<SuspenseLoader />}>
        <NewProducts 
          viewAllHref={ROUTES.SHOP} 
        />
      </Suspense>

      <Suspense fallback={<SuspenseLoader />}>
        <ShopByDeals />
      </Suspense>

      <Suspense fallback={<SuspenseLoader />}>
        <MostPopularSalts viewAllHref="nic-salts" slug="nic-salts" />
      </Suspense>

      <Suspense fallback={<SuspenseLoader />}>
        <MostPopularVapes 
          title="Most Popular Big Puff"
          viewAllHref="big puff vape kits" 
          slug="big-puff-vape-kits" 
        />
      </Suspense>

      <Suspense fallback={<SuspenseLoader />}>
        <PromotionalBanners />
      </Suspense>

      <Suspense fallback={<SuspenseLoader />}>
        <ReferFriend />
      </Suspense>

      <Suspense fallback={<SuspenseLoader />}>
        <Testimonials />
      </Suspense>

      <Suspense fallback={<SuspenseLoader />}>
        <Subscription className="mt-5 md:mt-10" />
      </Suspense>

      <Suspense fallback={<SuspenseLoader />}>
        <BlogsSection viewAllHref={ROUTES.BLOGS} />
      </Suspense>

      <ScrollToTop />
    </div>
  );
};

export default Dashboard;
