import { CategoryResponseData, ProductResponseData } from "@/lib/config/product.config";
import { BrandListResponse } from "@/lib/config/brand.config";
import { Category } from "@/lib/config/category.config";
import { CarouselConfig } from "@/lib/config/carousel.config";
import { BannerResponse } from "@/lib/config/global.config";
import { ServerActionResponse, ServerActionStatus } from "@/lib/config/app.config";
import { BlogResponse } from "@/lib/config/blog.config";
import { REVIEW_ORDER_RESPONSE } from "@/lib/config/order.config";

type DashboardData = {
  popularVapes: ServerActionResponse<CategoryResponseData>;
  popularSalts: ServerActionResponse<CategoryResponseData>;
  newProducts: ServerActionResponse<ProductResponseData>;
  brands: ServerActionResponse<BrandListResponse>;
  categories: ServerActionResponse<Category[]>;
  carousel: ServerActionResponse<CarouselConfig[]>;
  promotions: ServerActionResponse<BannerResponse[]>;
  blogs: ServerActionResponse<BlogResponse[]>;
  newProductsReviews: ServerActionResponse<REVIEW_ORDER_RESPONSE>[];
  popularVapesReviews: ServerActionResponse<REVIEW_ORDER_RESPONSE>[];
  popularSaltsReviews: ServerActionResponse<REVIEW_ORDER_RESPONSE>[];
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