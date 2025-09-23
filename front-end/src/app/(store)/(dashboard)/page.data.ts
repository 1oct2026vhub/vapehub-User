import { CategoryResponseData, ProductResponseData } from "@/lib/config/product.config";
// import { CategoryResponseData } from "@/lib/config/product.config";
import { BrandListResponse } from "@/lib/config/brand.config";
import { Category } from "@/lib/config/category.config";
import { CarouselConfig } from "@/lib/config/carousel.config";
import { BannerResponse } from "@/lib/config/global.config";
// import { ServerActionResponse } from "@/lib/config/app.config";
import { ServerActionResponse, ServerActionStatus } from "@/lib/config/app.config";
import { BlogResponse } from "@/lib/config/blog.config";
import { REVIEW_ORDER_RESPONSE } from "@/lib/config/order.config";
import { FeatureContent } from "@/lib/config/content.config";
// Entity slugs types
interface EntitySlug {
  entity_id: number;
  entity_name: string;
  entity_slug: string;
  slug_relation: string;
}

interface EntitySlugsResponse {
  entities: EntitySlug[];
  total_found: number;
}

type DashboardData = {
  popularVapes: ServerActionResponse<CategoryResponseData>;
  popularSalts: ServerActionResponse<CategoryResponseData>;
  newProducts: ServerActionResponse<ProductResponseData>;
  brands: ServerActionResponse<BrandListResponse>;
  categories: ServerActionResponse<Category[]>;
  carousel: ServerActionResponse<CarouselConfig[]>;
  promotions: ServerActionResponse<BannerResponse[]>;
  blogs: ServerActionResponse<BlogResponse[]>;
  features: ServerActionResponse<{ featureContent: FeatureContent[] }>;
  trustpilot: ServerActionResponse<{
    reviews: Array<{
      id: string;
      stars: number;
      title: string;
      text: string;
      createdAt: string;
      consumer: {
        displayName: string;
      };
      ratingCategory: string;
    }>;
    pagination: {
      page: number;
      per_page: number;
    };
    overallStats: {
      averageRating: number;
      trustScore: number;
      totalReviews: number;
      ratingDistribution: {
        oneStar: { count: number; percentage: string };
        twoStars: { count: number; percentage: string };
        threeStars: { count: number; percentage: string };
        fourStars: { count: number; percentage: string };
        fiveStars: { count: number; percentage: string };
      };
      scoreBreakdown: {
        stars: number;
        trustScore: number;
        ratingCategory: string;
        showRatingBanner: boolean;
      };
    };
    showRatingBanner: boolean;
  }>;
  subscriptionSettings: ServerActionResponse<{
    id: number;
    email_frequency: string;
    product_updates: boolean;
    discount_notifications: boolean;
    discount_amount: string;
    discount_type: string;
    status: boolean;
    createdAt: string;
    updatedAt: string;
  }>;
  newProductsReviews: ServerActionResponse<REVIEW_ORDER_RESPONSE>[];
  popularVapesReviews: ServerActionResponse<REVIEW_ORDER_RESPONSE>[];
  popularSaltsReviews: ServerActionResponse<REVIEW_ORDER_RESPONSE>[];
  entitySlugs: ServerActionResponse<EntitySlugsResponse>;
}
export const getDashboardData = async (): Promise<DashboardData> => {
  // Deprecated: dashboard now fetches per-component with caching. Left for backward compatibility.
  const empty: DashboardData = {
    popularVapes: { status: ServerActionStatus.ERROR, message: 'Deprecated' },
    popularSalts: { status: ServerActionStatus.ERROR, message: 'Deprecated' },
    newProducts: { status: ServerActionStatus.ERROR, message: 'Deprecated' },
    brands: { status: ServerActionStatus.ERROR, message: 'Deprecated' },
    categories: { status: ServerActionStatus.ERROR, message: 'Deprecated' },
    carousel: { status: ServerActionStatus.ERROR, message: 'Deprecated' },
    promotions: { status: ServerActionStatus.ERROR, message: 'Deprecated' },
    blogs: { status: ServerActionStatus.ERROR, message: 'Deprecated' },
    newProductsReviews: [],
    popularVapesReviews: [],
    popularSaltsReviews: []
  } as unknown as DashboardData;
  return empty;
} 