import { NextPage } from "next";
import {  Suspense } from "react";
import ScrollToTop from "@/components/ScrollToTop";
import SuspenseLoader from "@/components/ui/SuspenseLoader";
import { ROUTES } from "@/lib/routes";
import HomeCarousel from './_components/HomeCarousel';
import WelcomeSection from './_components/WelcomeSection';
// import TrustPilotRating from './_components/TrustPilotRating';
// import FeatureCards from './_components/FeatureCards';
import ShopByCategory from './_components/ShopByCategory';
import HottestCollections from './_components/HottestCollections';
import NewProducts from './_components/NewProducts';
import ShopByDeals from './_components/ShopByDeals';
import PopularCategories from './_components/PopularCategories';
import PromotionalBanners from './_components/PromotionalBanners';
import ReferFriend from './_components/ReferFriend';
import Testimonials from './_components/Testimonials';
// import Subscription from './_components/Subscription';
import BlogsSection from './_components/BlogsSection';

export const revalidate = 60;

const Dashboard: NextPage = async () => {
  // const Dashboard: NextPage<{searchParams: Promise<{referral_code: string}>}> = async ({searchParams}) => {
  // const referralCode = (await searchParams).referral_code;

  return (
    <main className="px-4 lg:px-12.5 py-4 md:py-[60px] flex flex-col gap-7 md:gap-[60px]">
      {/* <Suspense fallback={<SuspenseLoader />}> */}
        <HomeCarousel />
      {/* </Suspense> */}

      <Suspense fallback={<SuspenseLoader />}>
        <ShopByCategory />
      </Suspense>

      <Suspense fallback={<SuspenseLoader />}>
        <WelcomeSection />
      </Suspense>

      <Suspense fallback={<SuspenseLoader />}>
        <NewProducts 
          viewAllHref={ROUTES.NEW_PRODUCTS} 
        />
      </Suspense>

      <Suspense fallback={<SuspenseLoader />}>
        <ShopByDeals />
      </Suspense>

      <Suspense fallback={<SuspenseLoader />}>
        <PopularCategories />
      </Suspense>

      <Suspense fallback={<SuspenseLoader />}>
        <PromotionalBanners />
      </Suspense>

      <Suspense fallback={<SuspenseLoader />}>
        <HottestCollections />
      </Suspense>

      <Suspense fallback={<SuspenseLoader />}>
        <ReferFriend />
      </Suspense>

      <Suspense fallback={<SuspenseLoader />}>
        <Testimonials />
      </Suspense>

      <Suspense fallback={<SuspenseLoader />}>
        <BlogsSection viewAllHref={ROUTES.BLOGS} />
      </Suspense>

      <ScrollToTop />
    </main>
  );
};

export default Dashboard;
