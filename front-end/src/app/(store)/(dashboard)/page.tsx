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
import { MostPopularVapes, MostPopularSalts } from './_components/MostPopular';
import PromotionalBanners from './_components/PromotionalBanners';
import ReferFriend from './_components/ReferFriend';
import Testimonials from './_components/Testimonials';
import Subscription from './_components/Subscription';
import BlogsSection from './_components/BlogsSection';
import { getEntitySlugs } from '@/lib/server.actions';
import { ServerActionStatus } from '@/lib/config/app.config';

export const revalidate = 60;

const Dashboard: NextPage = async () => {
  // const Dashboard: NextPage<{searchParams: Promise<{referral_code: string}>}> = async ({searchParams}) => {
  // const referralCode = (await searchParams).referral_code;
   

  // Resolve entity slugs for Big Puff (id: 8) and Nic Salts (id: 13)
  const entitySlugsResponse = await getEntitySlugs('order_count');
  const entities = (entitySlugsResponse.status === ServerActionStatus.SUCCESS ? entitySlugsResponse.data?.entities : undefined) ?? [];
  const bigPuffResolvedSlug = entities.find((e: { entity_id: number; slug_relation?: string }) => e.entity_id === 8)?.slug_relation || 'big-puff-vape-kits';
  const nicSaltsResolvedSlug = entities.find((e: { entity_id: number; slug_relation?: string }) => e.entity_id === 13)?.slug_relation || 'nic-salts';

  return (
    <main className="px-4 lg:px-12.5 py-4.5 lg:py-10 flex flex-col gap-4.5 sm:gap-7 md:gap-10 w-full max-w-[1520px] mx-auto">
      {/* <Suspense fallback={<SuspenseLoader />}> */}
        <HomeCarousel />
      {/* </Suspense> */}

      <Suspense fallback={<SuspenseLoader />}>
        <WelcomeSection />
      </Suspense>

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
        <MostPopularSalts viewAllHref={nicSaltsResolvedSlug} slug={nicSaltsResolvedSlug} />
      </Suspense>

      <Suspense fallback={<SuspenseLoader />}>
        <MostPopularVapes 
          title="Most Popular Big-Puff Vapes"
          viewAllHref={bigPuffResolvedSlug}
          slug={bigPuffResolvedSlug}
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
    </main>
  );
};

export default Dashboard;
