import { NextPage } from "next";
import {  Suspense } from "react";
import dynamic from "next/dynamic";
import ScrollToTop from "@/components/ScrollToTop";
import SuspenseLoader from "@/components/ui/SuspenseLoader";
import { type ProductResponseData, type CategoryResponseData } from "@/lib/config/product.config";
import { ROUTES } from "@/lib/routes";
import { getDashboardData } from "./page.data";
import { ServerActionStatus } from "@/lib/config/app.config";

// Dynamically import all heavy components
const DynamicHomeCarousel = dynamic(() => import('./_components/HomeCarousel'), {
  loading: () => <SuspenseLoader />
});

const DynamicWelcomeSection = dynamic(() => import('./_components/WelcomeSection'), {
  loading: () => <SuspenseLoader />
});

const DynamicTrustPilotRatingCard = dynamic(() => import('./_components/TrustPilotRatingCard'), {
  loading: () => <SuspenseLoader />
});

const DynamicFeatureCards = dynamic(() => import('./_components/FeatureCards'), {
  loading: () => <SuspenseLoader />
});

const DynamicShopByCategory = dynamic(() => import('./_components/ShopByCategory'), {
  loading: () => <SuspenseLoader />
});

const DynamicHottestCollections = dynamic(() => import('./_components/HottestCollections'), {
  loading: () => <SuspenseLoader />
});

const DynamicNewProducts = dynamic(() => import('./_components/NewProducts'), {
  loading: () => <SuspenseLoader />
});

const DynamicShopByDeals = dynamic(() => import('./_components/ShopByDeals'), {
  loading: () => <SuspenseLoader />
});

const DynamicMostPopularVapes = dynamic(() => import('./_components/MostPopular').then(mod => ({ default: mod.MostPopularVapes })), {
  loading: () => <SuspenseLoader />
});

const DynamicMostPopularSalts = dynamic(() => import('./_components/MostPopular').then(mod => ({ default: mod.MostPopularSalts })), {
  loading: () => <SuspenseLoader />
});

const DynamicPromotionalBanners = dynamic(() => import('./_components/PromotionalBanners'), {
  loading: () => <SuspenseLoader />
});

const DynamicReferFriend = dynamic(() => import('./_components/ReferFriend'), {
  loading: () => <SuspenseLoader />
});

const DynamicTestimonials = dynamic(() => import('./_components/Testimonials'), {
  loading: () => <SuspenseLoader />
});

const DynamicSubscription = dynamic(() => import('./_components/Subscription'), {
  loading: () => <SuspenseLoader height='h-32'/>
});

const DynamicBlogsSection = dynamic(() => import('./_components/BlogsSection'), {
  loading: () => <SuspenseLoader />
});

export const revalidate = 60;

const Dashboard: NextPage = async () => {
  // const Dashboard: NextPage<{searchParams: Promise<{referral_code: string}>}> = async ({searchParams}) => {
  // const referralCode = (await searchParams).referral_code;
   
  const data = await getDashboardData();

  const emptyProductResponse: ProductResponseData = {
    products: [],
    pagination: {
      current_page: 1,
      total_pages: 0,
      limit: 8,
      offset: 0,
      total_count: 0
    },
    attributes: [],
    price_ranges: [],
    brand: [],
    category: []
  };

  if (data.carousel.status === ServerActionStatus.ERROR || 
      data.categories.status === ServerActionStatus.ERROR) {
    return <div>Failed to load dashboard data</div>;
  }

  const transformCategoryToProductResponse = (response: CategoryResponseData): ProductResponseData => ({
    products: response.products,
    pagination: response.pagination,
    attributes: response.attributes,
    price_ranges: response.price_ranges,
    brand: response.brand,
    category: response.category || []
  });

  return (
    <div className="px-4 lg:px-12.5 py-4.5 lg:py-10 flex flex-col gap-4.5 sm:gap-7 md:gap-10">
      <Suspense fallback={<SuspenseLoader />}>
        <DynamicHomeCarousel banners={data.carousel.status === ServerActionStatus.SUCCESS ? data.carousel.data : []} />
      </Suspense>

      <Suspense fallback={<SuspenseLoader />}>
        <DynamicWelcomeSection />
      </Suspense>

      <section className="flex flex-col gap-4.5 md:gap-10 max-md:mt-4.5">
        <Suspense fallback={<SuspenseLoader />}>
          <DynamicTrustPilotRatingCard
            title="Trustpilot has rated Vapehub as Excellent!"
            filledStars={4}
          />
          <DynamicFeatureCards />
        </Suspense>
      </section>

      <Suspense fallback={<SuspenseLoader />}>
        <DynamicShopByCategory categories={data.categories.status === ServerActionStatus.SUCCESS ? data.categories.data : []} />
      </Suspense>

      <Suspense fallback={<SuspenseLoader />}>
        <DynamicHottestCollections brands={data.brands.status === ServerActionStatus.SUCCESS ? data.brands.data.brands : []} />
      </Suspense>

      <Suspense fallback={<SuspenseLoader />}>
        <DynamicNewProducts 
          products={data.newProducts.status === ServerActionStatus.SUCCESS ? data.newProducts.data : emptyProductResponse} 
          viewAllHref={ROUTES.SHOP} 
        />
      </Suspense>

      <Suspense fallback={<SuspenseLoader />}>
        <DynamicShopByDeals />
      </Suspense>

      <Suspense fallback={<SuspenseLoader />}>
        <DynamicMostPopularVapes 
          products={data.popularVapes.status === ServerActionStatus.SUCCESS ? transformCategoryToProductResponse(data.popularVapes.data) : emptyProductResponse} 
          viewAllHref="disposables" 
        />
      </Suspense>

      <Suspense fallback={<SuspenseLoader />}>
        <DynamicMostPopularSalts 
          products={data.popularSalts.status === ServerActionStatus.SUCCESS ? transformCategoryToProductResponse(data.popularSalts.data) : emptyProductResponse} 
          viewAllHref="nic-salts" 
        />
      </Suspense>

      <Suspense fallback={<SuspenseLoader />}>
        <DynamicPromotionalBanners banners={data.promotions.status === ServerActionStatus.SUCCESS ? data.promotions.data : []} />
      </Suspense>

      <Suspense fallback={<SuspenseLoader />}>
        <DynamicReferFriend />
      </Suspense>

      <Suspense fallback={<SuspenseLoader />}>
        <DynamicTestimonials />
      </Suspense>

      <Suspense fallback={<SuspenseLoader />}>
        <DynamicSubscription className="mt-5 md:mt-10" />
      </Suspense>

      <Suspense fallback={<SuspenseLoader />}>
        <DynamicBlogsSection blogs={data.blogs.status === ServerActionStatus.SUCCESS ? data.blogs.data : []} viewAllHref={ROUTES.BLOGS} />
      </Suspense>

      <ScrollToTop />
    </div>
  );
};

export default Dashboard;
