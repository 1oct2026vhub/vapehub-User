
const BASE_URL =  process.env.NEXT_PUBLIC_VAPE_HUB_API_BASE_URL ?? 'http://localhost:3000/api/'; 


export const API_ROUTES = {
    SIGN_IN: buildRequestUrl('/api/auth/login'),
    REGISTER: buildRequestUrl('/api/auth/register'), 
    GET_VERIFY_EMAIL: (token: string | string[]) => buildRequestUrl(`/api/auth/verify-email?token=${token}`),
    FORGOT_PASSWORD: buildRequestUrl("/api/auth/forgot-password"),
    RESET_PASSWORD: buildRequestUrl('api/auth/reset-password'),
    GET_CATEGORY_LIST: buildRequestUrl('/api/category'),
    GET_BRAND_LIST: buildRequestUrl('/api/brands'), 
    GET_PRODUCTS: (payload: PRODUCT_PAYLOAD) => buildRequestUrl(`/api/product?${new URLSearchParams(payload as never).toString()}`) 

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