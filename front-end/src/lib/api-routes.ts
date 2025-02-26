
const BASE_URL =  process.env.NEXT_PUBLIC_VAPE_HUB_API_BASE_URL ?? 'https://api.vapehub.devateam.com/'; 


export const API_ROUTES = {
    SIGN_IN: buildRequestUrl('/api/auth/login'),
    REGISTER: buildRequestUrl('/api/auth/register'), 
    GET_VERIFY_EMAIL: (token: string | string[]) => buildRequestUrl(`/api/auth/verify-email?token=${token}`),
    FORGOT_PASSWORD: buildRequestUrl("/api/auth/forgot-password"),
    RESET_PASSWORD: buildRequestUrl('api/auth/reset-password'),
    GET_CATEGORY_LIST: buildRequestUrl('/api/category'),
    GET_BRAND_LIST: buildRequestUrl('/api/brands'), 
    GET_PRODUCTS: (payload: PRODUCT_PAYLOAD) => buildRequestUrl(`/api/product?${new URLSearchParams(payload as never).toString()}`),
    GET_CATEGORY_PRODUCTS_BY_SLUG: (slug:string, payload: PRODUCT_PAYLOAD) => buildRequestUrl(`/api/category/slug/${slug}?${new URLSearchParams(payload as never).toString()}`),
    GET_CAROUSEL: buildRequestUrl('/api/home/carousel'),
    GET_TESTIMONIALS: buildRequestUrl('/api/testimonials'),
    SUBSCRIBE_MAIL: buildRequestUrl('/api/mailSubscription'),
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
}