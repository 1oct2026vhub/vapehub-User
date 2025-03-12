import { NextPage } from "next";
import { ReactElement, Suspense } from "react";
import TrustPilotRatingCard from "./_components/TrustPilotRatingCard";
import FeatureCards from "./_components/FeatureCards";
import ShopByCategory from "./_components/ShopByCategory";
import HottestCollections from "./_components/HottestCollections";
import ShopByDeals from "./_components/ShopByDeals";
import { MostPopularSalts, MostPopularVapes } from "./_components/MostPopular";
import PromotionalBanners from "./_components/PromotionalBanners";
import ReferFriend from "./_components/ReferFriend";
import HomeCarousel from "./_components/HomeCarousel";
import { ROUTES } from "@/lib/routes";
import ScrollToTop from "@/components/ScrollToTop";
import dynamic from "next/dynamic";
import NewProducts from "./_components/NewProducts";
import { getDashboardData } from "./page.data";
import { ServerActionStatus } from "@/lib/config/app.config";
import SuspenseLoader from "@/components/ui/SuspenseLoader";

// Dynamically import components that are below the fold
const DynamicTestimonials = dynamic(() => import('./_components/Testimonials'), {
  loading: () => <SuspenseLoader />
})

const DynamicSubscription = dynamic(() => import('./_components/Subscription'), {
  loading: () => <SuspenseLoader height='h-32'/>
})

const DynamicBlogsSection = dynamic(() => import('./_components/BlogsSection'), {
  loading: () => <SuspenseLoader />
})

export const revalidate = 60; // Revalidate every minute

const Dashboard: NextPage = async (): Promise<ReactElement> => {
  const data = await getDashboardData();

  const emptyProductResponse = {
    products: [],
    pagination: {
      current_page: 1,
      total_pages: 0,
      limit: 8,
      offset: 0,
      total_count: 0
    }
  };

  // Early return if critical data is missing
  if (data.carousel.status === ServerActionStatus.ERROR || 
      data.categories.status === ServerActionStatus.ERROR) {
    return <div>Failed to load dashboard data</div>;
  }

  return (
    <div className="px-4 lg:px-12.5 py-4.5 lg:py-10 flex flex-col gap-4.5 sm:gap-7 md:gap-10">
      <HomeCarousel banners={data.carousel.status === ServerActionStatus.SUCCESS ? data.carousel.data : []} />
      <section className="flex flex-col gap-4.5 md:gap-10 max-md:mt-4.5">
        <TrustPilotRatingCard
          title="Trustpilot has rated Vapehub as Excellent!"
          filledStars={4}
        />
        <FeatureCards />
      </section>

      <Suspense fallback={<SuspenseLoader />}>
        <ShopByCategory categories={data.categories.status === ServerActionStatus.SUCCESS ? data.categories.data : []} />
        <HottestCollections brands={data.brands.status === ServerActionStatus.SUCCESS ? data.brands.data.slice(0, 10) : []} />
        <NewProducts products={data.newProducts.status === ServerActionStatus.SUCCESS ? data.newProducts.data : emptyProductResponse} viewAllHref={ROUTES.NEW_PRODUCTS} />
      </Suspense>

      <Suspense fallback={<SuspenseLoader />}>
        <ShopByDeals />
        <MostPopularVapes products={data.popularVapes.status === ServerActionStatus.SUCCESS ? data.popularVapes.data : emptyProductResponse} viewAllHref="disposables" />
        <MostPopularSalts products={data.popularSalts.status === ServerActionStatus.SUCCESS ? data.popularSalts.data : emptyProductResponse} viewAllHref="nic-salts" />
        <PromotionalBanners banners={data.promotions.status === ServerActionStatus.SUCCESS ? data.promotions.data : []} />
        <ReferFriend />
        <DynamicTestimonials />
        <DynamicSubscription className="mt-5 md:mt-10" />
        <DynamicBlogsSection blogs={data.blogs.status === ServerActionStatus.SUCCESS ? data.blogs.data : []} viewAllHref={ROUTES.BLOGS} />
      </Suspense>
      <ScrollToTop />
    </div>
  );
};

export default Dashboard;
