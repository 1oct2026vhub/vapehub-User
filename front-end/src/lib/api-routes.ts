import { BrandListPayload } from "./config/brand.config";

const BASE_URL = process.env.NEXT_PUBLIC_VAPE_HUB_API_BASE_URL ?? 'https://api.vapehub.devateam.com/';


export const API_ROUTES = {
    SIGN_IN: buildRequestUrl('/api/auth/login'),
    REGISTER: buildRequestUrl('/api/auth/register'),
    GET_VERIFY_EMAIL: (token: string | string[]) => buildRequestUrl(`/api/auth/verify-email?token=${token}`),
    FORGOT_PASSWORD: buildRequestUrl("/api/auth/forgot-password"),
    RESET_PASSWORD: buildRequestUrl('api/auth/reset-password'),
    GET_CATEGORY_LIST: buildRequestUrl('/api/category'),
    GET_BRAND_LIST: (payload?: BrandListPayload) => buildRequestUrl(`/api/brands/list/paginated${payload ? `?${new URLSearchParams(payload as never).toString()}` : ''}`),
    GET_PRODUCTS: (payload: PRODUCT_PAYLOAD) => buildRequestUrl(`/api/product${payload ? `?${new URLSearchParams(payload as never).toString()}` : ''}`),
    GET_CATEGORY_PRODUCTS_BY_SLUG: (slug: string, payload: PRODUCT_PAYLOAD) => buildRequestUrl(`/api/category/slug/${slug}?${new URLSearchParams(payload as never).toString()}`),
    GET_PRODUCTS_BY_SLUG: (slug: string, payload: PRODUCT_PAYLOAD) => buildRequestUrl(`/api/product/slug/${slug}?${new URLSearchParams(payload as never).toString()}`),
    GET_PRODUCTS_BY_ID: (id: number, payload: PRODUCT_PAYLOAD) => buildRequestUrl(`/api/product/fetch/${id}?${new URLSearchParams(payload as never).toString()}`),
    GET_PRODUCT_VARIANT_BY_ID: buildRequestUrl('/api/product/filter-variants'),
    GET_CAROUSEL: buildRequestUrl('/api/home/carousel'),
    GET_TESTIMONIALS: buildRequestUrl('/api/testimonials'),
    SUBSCRIBE_MAIL: buildRequestUrl('/api/mailSubscription'),
    GET_BLOGS: (group?: string | number) => buildRequestUrl(`/api/blogs?blog_group=${group}`),
    GET_PROMOTION_BANNER: buildRequestUrl('/api/home/banner-images'),
    GET_BRAND_PRODUCTS_BY_SLUG: (slug: string, payload: PRODUCT_PAYLOAD) => buildRequestUrl(`/api/brands/slug/${slug}?${new URLSearchParams(payload as never).toString()}`),
    GET_BLOGS_BY_SLUG: (slug: string) => buildRequestUrl(`/api/blogs/category/${slug}?page=1&limit=10`),
    GET_BLOGS_BY_CATEGORY_AND_SLUG: (categorySlug: string) => buildRequestUrl(`/api/blogs/post/${categorySlug}`),
    GET_BLOGS_POST_LIST: (payload?: BLOG_PAYLOAD) => buildRequestUrl(`/api/blogs/list${payload ? `?${new URLSearchParams(payload as never).toString()}` : ''}`),
    CART: buildRequestUrl('/api/cart'),
    BULK_ADD_TO_CART: buildRequestUrl('/api/cart/bulk-update'),
    UPDATE_CART_ITEM: (id: number) => buildRequestUrl(`/api/cart/${id}`),
    REMOVE_FROM_CART: (id: number) => buildRequestUrl(`/api/cart/${id}`),
    GET_FAQS: (entity_name: string, entityId: number) => buildRequestUrl(`/api/faqs?entity_type=${entity_name}&entity_id=${entityId}`),
    GET_DYNAMIC_PAGE_SLUG: (slug: string) => buildRequestUrl(`/api/home/slug-relation?slugs=${slug}`),
    CHECKOUT: buildRequestUrl('/api/checkout'),
    APPLY_COUPON: buildRequestUrl('/api/checkout/apply-coupon'),
    GET_USER_PROFILE: buildRequestUrl('/api/users/profile'),
    DELETE_USER_ACCOUNT: buildRequestUrl('/api/users/delete-account'),
    GET_USER_ADDRESSES: buildRequestUrl('/api/users/user-address'),
    ADD_USER_ADDRESS: buildRequestUrl('/api/users/user-address'),
    UPDATE_USER_ADDRESS: (id: number) => buildRequestUrl(`/api/users/user-address/${id}`),
    DELETE_USER_ADDRESS: (id: number) => buildRequestUrl(`/api/users/user-address/${id}`),
    CHANGE_USER_PASSWORD: buildRequestUrl('/api/users/change-password'),
    GET_ORDERS_LIST: buildRequestUrl('/api/order'),
}

// * Helper functions
function buildRequestUrl(url: string) {
    return `${BASE_URL}${url}`;
}
export interface PRODUCT_PAYLOAD  {
    sort_by: string;
    order: string;
    limit: number;
    offset: number;
    categoryId?: string;  
} 
export interface BLOG_PAYLOAD {
    categoryId?: string;
    limit: number;
    page: number;
}

export interface PRODUCT_VARIANT_PAYLOAD {
    product_id: number;
    attribute_terms: PRODUCT_VARIANT_ATTRIBUTE[];
}
export interface PRODUCT_VARIANT_ATTRIBUTE {
    attribute_id: number;
    term_id: number;

}
