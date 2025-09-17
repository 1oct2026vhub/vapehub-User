import { 
  getProductByCategory, 
  getProductList, 
  getBrandList, 
  getCategoryList,
  getCarouselList,
  getPromotionBanner,
  getBlogList,
  getReviewOrderByProductId,
  getEntitySlugs
} from "@/lib/server.actions";
import { CategoryResponseData, ProductResponseData } from "@/lib/config/product.config";
import { BrandListResponse } from "@/lib/config/brand.config";
import { Category } from "@/lib/config/category.config";
import { CarouselConfig } from "@/lib/config/carousel.config";
import { BannerResponse } from "@/lib/config/global.config";
import { ServerActionResponse, ServerActionStatus } from "@/lib/config/app.config";
import { BlogResponse } from "@/lib/config/blog.config";
import { REVIEW_ORDER_RESPONSE } from "@/lib/config/order.config";
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
  newProductsReviews: ServerActionResponse<REVIEW_ORDER_RESPONSE>[];
  popularVapesReviews: ServerActionResponse<REVIEW_ORDER_RESPONSE>[];
  popularSaltsReviews: ServerActionResponse<REVIEW_ORDER_RESPONSE>[];
  entitySlugs: ServerActionResponse<EntitySlugsResponse>;
}

export const getDashboardData = async (): Promise<DashboardData> => {
  // First, get entity slugs to determine the correct slugs for disposables and nic-salts
  const entitySlugsResponse = await getEntitySlugs();
  
  // Extract slugs from entity response, with fallbacks to hardcoded values
  let disposableSlug = "disposable-vapes"; // fallback
  let nicSaltsSlug = "nic-salts"; // fallback
  
  if (entitySlugsResponse.status === ServerActionStatus.SUCCESS && entitySlugsResponse.data) {
    const entities = entitySlugsResponse.data.entities;
    
    // Find disposables slug by entity name
    const disposableEntity = entities.find(entity => 
      entity.entity_name === "DISPOSABLES"
    );
    if (disposableEntity) {
      disposableSlug = disposableEntity.slug_relation;
    }
    
    // Find nic-salts slug by entity name
    const nicSaltsEntity = entities.find(entity => 
      entity.entity_name === "NIC SALTS"
    );
    if (nicSaltsEntity) {
      nicSaltsSlug = nicSaltsEntity.slug_relation;
    }
  }

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
    getProductByCategory(disposableSlug, {sort_by:"id",order:"ASC",limit:8,offset:0}),
    getProductByCategory(nicSaltsSlug, {sort_by:"id",order:"ASC",limit:8,offset:0}),
    getProductList({sort_by:"id",order:"DESC",limit:8,offset:0}),
    getBrandList({page:1,limit:10}),
    getCategoryList(),
    getCarouselList(),
    getPromotionBanner(),
    getBlogList("")
  ]);

  const newProductsReviews = newProductsResponse.status === ServerActionStatus.SUCCESS ? await Promise.all(
    newProductsResponse.data.products.map(p => getReviewOrderByProductId(p.id, 1, 1))
  ) : [];

  const popularVapesReviews = popularVapesResponse.status === ServerActionStatus.SUCCESS ? await Promise.all(
    popularVapesResponse.data.products.map(p => getReviewOrderByProductId(p.id, 1, 1))
  ) : [];

  const popularSaltsReviews = popularSaltsResponse.status === ServerActionStatus.SUCCESS ? await Promise.all(
    popularSaltsResponse.data.products.map(p => getReviewOrderByProductId(p.id, 1, 1))
  ) : [];

  return {
    popularVapes: popularVapesResponse,
    popularSalts: popularSaltsResponse,
    newProducts: newProductsResponse,
    brands: brandsResponse,
    categories: categoriesResponse,
    carousel: carouselResponse,
    promotions: promotionResponse,
    blogs: blogsResponse,
    newProductsReviews,
    popularVapesReviews,
    popularSaltsReviews,
    entitySlugs: entitySlugsResponse
  };
} 