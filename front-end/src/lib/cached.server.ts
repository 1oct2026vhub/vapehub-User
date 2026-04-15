import { unstable_cache } from 'next/cache';
import {
  getCarouselList,
  getCategoryList,
  getBrandList,
  getProductList,
  getProductByCategory,
  getPromotionBanner,
  getBlogList,
  // getReviewOrderByProductId,
} from '@/lib/server.actions';
import type { PRODUCT_PAYLOAD } from '@/lib/api-routes';

// Revalidate all dashboard widgets every 60 seconds by default
const DEFAULT_REVALIDATE_SECONDS = 60;
const DASHBOARD_CACHE_TAGS = {
  carousel: 'dashboard-carousel',
  categories: 'dashboard-categories',
  brands: 'dashboard-brands',
  newProducts: 'dashboard-new-products',
  categoryProducts: 'dashboard-category-products',
  promotionBanners: 'dashboard-promotion-banners',
  blogs: 'dashboard-blogs',
} as const;

const stableStringify = (value: unknown): string => {
  const normalize = (input: unknown): unknown => {
    if (Array.isArray(input)) {
      return input.map(normalize);
    }
    if (input && typeof input === 'object') {
      const sortedKeys = Object.keys(input as Record<string, unknown>).sort();
      const normalizedObject: Record<string, unknown> = {};
      for (const key of sortedKeys) {
        normalizedObject[key] = normalize((input as Record<string, unknown>)[key]);
      }
      return normalizedObject;
    }
    return input;
  };

  return JSON.stringify(normalize(value));
};

export const cachedGetCarouselList = unstable_cache(
  async () => getCarouselList(),
  [DASHBOARD_CACHE_TAGS.carousel],
  { revalidate: DEFAULT_REVALIDATE_SECONDS, tags: [DASHBOARD_CACHE_TAGS.carousel] }
);

export const cachedGetCategoryList = unstable_cache(
  async () => getCategoryList(),
  [DASHBOARD_CACHE_TAGS.categories],
  { revalidate: DEFAULT_REVALIDATE_SECONDS, tags: [DASHBOARD_CACHE_TAGS.categories] }
);

export const cachedGetBrandList = async (params: { page: number; limit: number }) =>
  unstable_cache(
    async () => getBrandList(params),
    [DASHBOARD_CACHE_TAGS.brands, stableStringify(params)],
    { revalidate: DEFAULT_REVALIDATE_SECONDS, tags: [DASHBOARD_CACHE_TAGS.brands] }
  )();

export const cachedGetNewProducts = async (params: PRODUCT_PAYLOAD) =>
  unstable_cache(
    async () => getProductList(params),
    [DASHBOARD_CACHE_TAGS.newProducts, stableStringify(params)],
    { revalidate: DEFAULT_REVALIDATE_SECONDS, tags: [DASHBOARD_CACHE_TAGS.newProducts] }
  )();

export const cachedGetCategoryProducts = async (
  slug: string,
  params: PRODUCT_PAYLOAD
) =>
  unstable_cache(
    async () => getProductByCategory(slug, params),
    [DASHBOARD_CACHE_TAGS.categoryProducts, slug, stableStringify(params)],
    { revalidate: DEFAULT_REVALIDATE_SECONDS, tags: [DASHBOARD_CACHE_TAGS.categoryProducts] }
  )();

export const cachedGetPromotionBanners = unstable_cache(
  async () => getPromotionBanner(),
  [DASHBOARD_CACHE_TAGS.promotionBanners],
  { revalidate: DEFAULT_REVALIDATE_SECONDS, tags: [DASHBOARD_CACHE_TAGS.promotionBanners] }
);

export const cachedGetBlogs = async (
  group?: string | number,
  filters?: { show_home_page?: boolean }
) =>
  unstable_cache(
    async () => getBlogList(group ?? '', filters),
    [DASHBOARD_CACHE_TAGS.blogs, String(group ?? ''), stableStringify(filters ?? {})],
    { revalidate: DEFAULT_REVALIDATE_SECONDS, tags: [DASHBOARD_CACHE_TAGS.blogs] }
  )();

// export const cachedGetReviewOrderByProductId = async (
//   productId: number,
//   page: number,
//   limit: number
// ) =>
//   unstable_cache(
//     async () => getReviewOrderByProductId(productId, page, limit),
//     ['dashboard-product-review', String(productId), String(page), String(limit)],
//     { revalidate: DEFAULT_REVALIDATE_SECONDS }
//   )();


