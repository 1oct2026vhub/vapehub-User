import { 
  getProductByCategory, 
  getProductList, 
  getBrandList, 
  getCategoryList,
  getCarouselList,
  getPromotionBanner,
  getBlogList
} from "@/lib/server.actions";
import { CategoryResponseData, ProductResponseData } from "@/lib/config/product.config";
import { BrandConfig } from "@/lib/config/brand.config";
import { Category } from "@/lib/config/category.config";
import { CarouselConfig } from "@/lib/config/carousel.config";
import { BannerResponse } from "@/lib/config/global.config";
import { ServerActionResponse } from "@/lib/config/app.config";
import { BlogResponse } from "@/lib/config/blog.config";

type DashboardData = {
  popularVapes: ServerActionResponse<CategoryResponseData>;
  popularSalts: ServerActionResponse<CategoryResponseData>;
  newProducts: ServerActionResponse<ProductResponseData>;
  brands: ServerActionResponse<BrandConfig[]>;
  categories: ServerActionResponse<Category[]>;
  carousel: ServerActionResponse<CarouselConfig[]>;
  promotions: ServerActionResponse<BannerResponse[]>;
  blogs: ServerActionResponse<BlogResponse[]>;
}

export const getDashboardData = async (): Promise<DashboardData> => {
  const [
    popularVapesResponse,
    popularSaltsResponse,
    newProductsResponse,
    brandsResponse,
    categoriesResponse,
    carouselResponse,
    promotionResponse,
    blogsResponse
  ] = await Promise.all([
    getProductByCategory("disposables", {sort_by:"id",order:"ASC",limit:8,offset:0}),
    getProductByCategory("nic-salts", {sort_by:"id",order:"ASC",limit:8,offset:0}),
    getProductList({sort_by:"id",order:"DESC",limit:8,offset:0}),
    getBrandList(),
    getCategoryList(),
    getCarouselList(),
    getPromotionBanner(),
    getBlogList("")
  ]);

  return {
    popularVapes: popularVapesResponse,
    popularSalts: popularSaltsResponse,
    newProducts: newProductsResponse,
    brands: brandsResponse,
    categories: categoriesResponse,
    carousel: carouselResponse,
    promotions: promotionResponse,
    blogs: blogsResponse
  };
} 