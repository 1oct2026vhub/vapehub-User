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

export const cachedGetCarouselList = unstable_cache(
  async () => getCarouselList(),
  ['dashboard-carousel'],
  { revalidate: DEFAULT_REVALIDATE_SECONDS }
);

export const cachedGetCategoryList = unstable_cache(
  async () => getCategoryList(),
  ['dashboard-categories'],
  { revalidate: DEFAULT_REVALIDATE_SECONDS }
);

export const cachedGetBrandList = async (params: { page: number; limit: number }) =>
  unstable_cache(
    async () => getBrandList(params),
    ['dashboard-brands', JSON.stringify(params)],
    { revalidate: DEFAULT_REVALIDATE_SECONDS }
  )();

export const cachedGetNewProducts = async (params: PRODUCT_PAYLOAD) =>
  unstable_cache(
    async () => getProductList(params),
    ['dashboard-new-products', JSON.stringify(params)],
    { revalidate: DEFAULT_REVALIDATE_SECONDS }
  )();

export const cachedGetCategoryProducts = async (
  slug: string,
  params: PRODUCT_PAYLOAD
) =>
  unstable_cache(
    async () => getProductByCategory(slug, params),
    ['dashboard-category-products', slug, JSON.stringify(params)],
    { revalidate: DEFAULT_REVALIDATE_SECONDS }
  )();

export const cachedGetPromotionBanners = unstable_cache(
  async () => getPromotionBanner(),
  ['dashboard-promotion-banners'],
  { revalidate: DEFAULT_REVALIDATE_SECONDS }
);

export const cachedGetBlogs = async (
  group?: string | number,
  filters?: { show_home_page?: boolean }
) =>
  unstable_cache(
    async () => getBlogList(group ?? '', filters),
    ['dashboard-blogs', String(group ?? ''), JSON.stringify(filters ?? {})],
    { revalidate: DEFAULT_REVALIDATE_SECONDS }
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


