import { BrandListPayload } from "./config/brand.config";

const BASE_URL =  process.env.NEXT_PUBLIC_VAPE_HUB_API_BASE_URL ?? 'https://api.vapehub.devateam.com/'; 


export const API_ROUTES = {
    SIGN_IN: buildRequestUrl('/api/auth/login'),
    REGISTER: buildRequestUrl('/api/auth/register'), 
    GET_VERIFY_EMAIL: (token: string | string[]) => buildRequestUrl(`/api/auth/verify-email?token=${token}`),
    FORGOT_PASSWORD: buildRequestUrl("/api/auth/forgot-password"),
    RESET_PASSWORD: buildRequestUrl('api/auth/reset-password'),
    GET_CATEGORY_LIST: buildRequestUrl('/api/category'),
    GET_BRAND_LIST: (payload?: BrandListPayload) => buildRequestUrl(`/api/brands/list/paginated${payload ? `?${new URLSearchParams(payload as never).toString()}` : ''}`),
    GET_PRODUCTS: (payload: PRODUCT_PAYLOAD) => buildRequestUrl(`/api/product${payload ? `?${new URLSearchParams(payload as never).toString()}` : ''}`),
    GET_CATEGORY_PRODUCTS_BY_SLUG: (slug:string, payload: PRODUCT_PAYLOAD) => buildRequestUrl(`/api/category/slug/${slug}?${new URLSearchParams(payload as never).toString()}`),
    GET_PRODUCTS_BY_SLUG: (slug:string, payload: PRODUCT_PAYLOAD) => buildRequestUrl(`/api/product/slug/${slug}?${new URLSearchParams(payload as never).toString()}`),
    GET_CAROUSEL: buildRequestUrl('/api/home/carousel'),
    GET_TESTIMONIALS: buildRequestUrl('/api/testimonials'),
    SUBSCRIBE_MAIL: buildRequestUrl('/api/mailSubscription'),
    GET_BLOGS: (group?: string | number) => buildRequestUrl(`/api/blogs?blog_group=${group}`),
    GET_PROMOTION_BANNER: buildRequestUrl('/api/home/banner-images'),
    GET_BRAND_PRODUCTS_BY_SLUG: (slug:string, payload: PRODUCT_PAYLOAD) => buildRequestUrl(`/api/brands/slug/${slug}?${new URLSearchParams(payload as never).toString()}`),
    GET_BLOGS_BY_SLUG: (slug:string) => buildRequestUrl(`/api/blogs/category/${slug}?page=1&limit=10`),
    GET_BLOGS_BY_CATEGORY_AND_SLUG: (categorySlug: string) => buildRequestUrl(`/api/blogs/post/${categorySlug}`),
    GET_BLOGS_POST_LIST: (payload?: BLOG_PAYLOAD) => buildRequestUrl(`/api/blogs/list${payload ? `?${new URLSearchParams(payload as never).toString()}` : ''}`),
    ADD_TO_CART: buildRequestUrl('/api/cart'),
    GET_CART_ITEMS: buildRequestUrl('/api/cart'),
    UPDATE_CART_ITEM: (id:number) => buildRequestUrl(`/api/cart/${id}`),
    REMOVE_FROM_CART: (id:number) => buildRequestUrl(`/api/cart/${id}`),
    GET_FAQS: (entity_name: string, entityId: number) => buildRequestUrl(`/api/faqs?entity_type=${entity_name}&entity_id=${entityId}`), 
    GET_DYNAMIC_PAGE_SLUG: (slug:string) => buildRequestUrl(`/api/home/slug-relation?slugs=${slug}`),
}

// * Helper functions
function buildRequestUrl(url: string) {
    return `${BASE_URL}${url}`;
  }
export interface PRODUCT_PAYLOAD {
    sort_by: string;
    order: 'ASC' | 'DESC';
    limit: number;
    offset: number;
    categoryId?: string;
}
export interface BLOG_PAYLOAD {
    categoryId?: string;
    limit: number;
    offset: number;
}
