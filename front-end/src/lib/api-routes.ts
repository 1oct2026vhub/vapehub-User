import { BrandListPayload } from "./config/brand.config";
import { CategoriesWithDealsPayload } from "./config/deal.config";

const BASE_URL = process.env.NEXT_PUBLIC_VAPE_HUB_API_BASE_URL ?? 'https://api.vapehub.devateam.com/';

const toQueryString = <T extends object>(params?: T): string => {
    if (!params) return '';
    const searchParams = new URLSearchParams();
    Object.entries(params as Record<string, unknown>).forEach(([key, value]) => {
        if (value === undefined || value === null || value === '') return;
        searchParams.append(key, String(value));
    });
    return searchParams.toString();
};


export const WEB_ROUTES = {
    AUTH: {
        SIGN_IN: '/login',
        REGISTER: '/register',
        VERIFY_EMAIL: '/verify-email',
        FORGOT_PASSWORD: "/forgot-password",
        RESET_PASSWORD: '/reset-password',
    },
    ORDERS: {
        MY_ORDERS: '/orders/my-orders',
        ORDER_DETAILS: '/orders/order-details',
        DOWNLOAD_INVOICE: '/orders/download-invoice'
    },
    CONTACT: {
        CONTACT_US: '/contact',
        SOCIAL_MEDIA: '/social-media',
    }
}

export const API_ROUTES = {
    AUTH: {
        SIGN_IN: buildRequestUrl('/api/auth/login'),
        REGISTER: (referralCode: string) => buildRequestUrl(referralCode ? `/api/auth/register?referral_code=${referralCode}` : '/api/auth/register'),
        GET_VERIFY_EMAIL: (token: string | string[]) => buildRequestUrl(`/api/auth/verify-email?token=${token}`),
        FORGOT_PASSWORD: buildRequestUrl("/api/auth/forgot-password"),
        RESET_PASSWORD: buildRequestUrl('/api/auth/reset-password'),
        VALIDATE_USER: '/users/validate',
        LOYALTY_POINTS: '/users/loyalty-points',
        USER_NOTIFICATION: 'users/notifications',
        USER_NOTIFICATION_COUNT: 'users/notifications-count'
    },
    CONTACT: {
        CONTACT_US: buildRequestUrl('/api/users/contact-us'),
        SOCIAL_MEDIA: buildRequestUrl('/api/users/contact-social-info'),
    },
    GET_CATEGORY_LIST: buildRequestUrl('/api/category'),
    GET_BRAND_LIST: (payload?: BrandListPayload) => buildRequestUrl(`/api/brands/list/paginated${payload ? `?${toQueryString(payload)}` : ''}`),
    GET_PRODUCTS: (payload: PRODUCT_PAYLOAD) => buildRequestUrl(`/api/product${payload ? `?${toQueryString(payload)}` : ''}`),
    GET_HOME_PRODUCTS: (payload: PRODUCT_PAYLOAD) => buildRequestUrl(`/api/product/new${payload ? `?${toQueryString(payload)}` : ''}`),
    GET_CATEGORY_PRODUCTS_BY_SLUG: (slug: string, payload: PRODUCT_PAYLOAD) => buildRequestUrl(`/api/category/slug/${slug}?${toQueryString(payload)}`),
    GET_PRODUCTS_BY_SLUG: (slug: string, payload: PRODUCT_PAYLOAD) => buildRequestUrl(`/api/product/slug/${slug}?${toQueryString(payload)}`),
    GET_PRODUCTS_BY_ID: (id: number, payload: PRODUCT_PAYLOAD) => buildRequestUrl(`/api/product/fetch/${id}?${toQueryString(payload)}`),
    GET_PRODUCT_VARIANT_BY_ID: buildRequestUrl('/api/product/filter-variants'),
    GET_CAROUSEL: buildRequestUrl('/api/home/carousel'),
    GET_TESTIMONIALS: buildRequestUrl('/api/testimonials'),
    SUBSCRIBE_MAIL: buildRequestUrl('/api/mailSubscription'),
    GET_BLOGS: (group?: string | number, filters?: { show_home_page?: boolean }) => {
        const params = new URLSearchParams();
        if (group !== undefined && group !== '') {
            params.append('blog_group', String(group));
        }
        if (filters?.show_home_page !== undefined) {
            params.append('show_home_page', String(filters.show_home_page));
        }
        const queryString = params.toString();
        return buildRequestUrl(`/api/blogs${queryString ? `?${queryString}` : ''}`);
    },
    GET_PROMOTION_BANNER: buildRequestUrl('/api/home/banner-images'),
    GET_BRAND_PRODUCTS_BY_SLUG: (slug: string, payload: PRODUCT_PAYLOAD) => buildRequestUrl(`/api/brands/slug/${slug}?${toQueryString(payload)}`),
    GET_BLOGS_BY_SLUG: (slug: string) => buildRequestUrl(`/api/blogs/category/${slug}?page=1&limit=10`),
    GET_BLOGS_BY_CATEGORY_AND_SLUG: (categorySlug: string) => buildRequestUrl(`/api/blogs/post/${categorySlug}`),
    GET_BLOGS_POST_LIST: (payload?: BLOG_PAYLOAD) => buildRequestUrl(`/api/blogs/list${payload ? `?${toQueryString(payload)}` : ''}`),
    CART: buildRequestUrl('/api/cart'),
    BULK_ADD_TO_CART: buildRequestUrl('/api/cart/bulk-update'),
    UPDATE_CART_ITEM: (id: number) => buildRequestUrl(`/api/cart/${id}`),
    REMOVE_FROM_CART: (id: number) => buildRequestUrl(`/api/cart/${id}`),
    GET_FAQS: (entity_name: string, entityId: number) => buildRequestUrl(`/api/faqs?entity_type=${entity_name}&entity_id=${entityId}`),
    GET_DYNAMIC_PAGE_SLUG: (slug: string) => buildRequestUrl(`/api/home/slug-relation?slugs=${slug}`),
    CHECKOUT: buildRequestUrl('/api/checkout'),
    APPLY_COUPON: buildRequestUrl('/api/checkout/apply-coupon'),
    APPLY_GUEST_COUPON: buildRequestUrl('/api/checkout/guest/apply-coupon'),
    GET_USER_PROFILE: buildRequestUrl('/api/users/profile'),
    DELETE_USER_ACCOUNT: buildRequestUrl('/api/users/delete-account'),
    TOGGLE_MAIL_SUBSCRIPTION: buildRequestUrl('/api/mailSubscription/toggle'),
    GET_USER_ADDRESSES: buildRequestUrl('/api/users/user-address'),
    ADD_USER_ADDRESS: buildRequestUrl('/api/users/user-address'),
    UPDATE_USER_ADDRESS: (id: number) => buildRequestUrl(`/api/users/user-address/${id}`),
    DELETE_USER_ADDRESS: (id: number) => buildRequestUrl(`/api/users/user-address/${id}`),
    CHANGE_USER_PASSWORD: buildRequestUrl('/api/users/change-password'),
    GET_ORDER_BY_ID: (id: number) => buildRequestUrl(`/api/order/${id}`),
    GET_ORDER_LIST: (page: number, limit: number) => buildRequestUrl(`/api/order?page=${page}&limit=${limit}`),
    ORDERS: buildRequestUrl('/api/order'),
    CANCEL_ORDER: (orderId: number) => buildRequestUrl(`/api/order/cancel/${orderId}`),
    UPDATE_ORDER_STATUS: (orderReference: string) => buildRequestUrl(`/api/orders/${orderReference}/status`),
    REVIEWS: (payload: { page?: number, limit?: number, product_id?: number, user_id?: number, is_visible?: boolean, testimonial?: boolean }) => buildRequestUrl(`/api/review?${toQueryString(payload)}`),
    GET_ALL_DEALS: (payload?: { limit?: number; offset?: number; deal_type?: string, search?: string, show_home_page?: boolean }) => buildRequestUrl(`/api/product/deals${payload ? `?${toQueryString(payload)}` : ''}`),
    GET_MORE_LIKE_THIS: (payload: { product_id: number; limit?: number; offset?: number }) => buildRequestUrl(`/api/product/more-like-this?${toQueryString(payload)}`),
    GET_RELATED_GUIDES: (payload: { product_id: number; limit?: number }) => buildRequestUrl(`/api/product/related-guides?${toQueryString(payload)}`),
    GET_CATEGORY_RELATED_GUIDES: (payload: { category_id: number; limit?: number }) => buildRequestUrl(`/api/category/related-guides?${toQueryString(payload)}`),
    GET_CATEGORY_BUYING_GUIDE: (slug: string) =>
        buildRequestUrl(`/api/category/slug/${encodeURIComponent(slug)}/buying-guide`),
    GET_CATEGORY_RELATED_CATEGORIES: (slug: string) =>
        buildRequestUrl(`/api/category/slug/${encodeURIComponent(slug)}/related-categories`),
    GET_BRAND_RELATED_BRANDS: (slug: string) =>
        buildRequestUrl(`/api/brands/slug/${encodeURIComponent(slug)}/related-brand`),
    GET_BRAND_BUYING_GUIDE: (slug: string) =>
        buildRequestUrl(`/api/brands/slug/${encodeURIComponent(slug)}/buying-guide`),
    CONTINUE_TO_PAYMENT: (orderId: number) => buildRequestUrl(`/api/order/check-stock/${orderId}`),
    GET_TRANSACTION_DETAILS: (transactionId: string) => buildRequestUrl(`/api/order/viva-wallet/payment-details/${transactionId}`),
    GET_SHIPPING_METHODS: buildRequestUrl('/api/shipping-method'),
    GET_SHIPPING_METHODS_DISPLAY: buildRequestUrl('/api/shipping-method/display'),
    CHECK_STOCK_VALIDATION: buildRequestUrl('/api/cart/check-stock'),
    CALCULATE_GUEST_DEALS: buildRequestUrl('/api/cart/calculate-guest-deals'),
    SEND_REFERRAL_CODE: buildRequestUrl('/api/users/refer-a-friend'),
    GET_REFERRAL_STATS: (page: number, limit: number) => buildRequestUrl(`/api/users/referral-stats?page=${page}&limit=${limit}`),
    GET_NOTIFICATION_LIST: buildRequestUrl('/api/notifications'),
    GET_UNREAD_NOTIFICATION_COUNT: buildRequestUrl('/api/notifications/unread/count'),
    READ_NOTIFICATION: (id: number) => buildRequestUrl(`/api/notifications/${id}/read`),
    READ_ALL_NOTIFICATIONS: buildRequestUrl('/api/notifications/read-all'),
    DELETE_NOTIFICATION: (id: number) => buildRequestUrl(`/api/notifications/${id}`),
    GET_FOOTER_MENU: buildRequestUrl('/api/footer'),
    GET_HOME_FOOTER_MENU: buildRequestUrl('/api/home/footer'),
    GET_HEADER_MEGA_MENU: buildRequestUrl('/api/menu'),
    REVIEW_ORDER: buildRequestUrl('/api/review'),
    GET_REVIEW_ORDER: (productId: number, userId: number) => buildRequestUrl(`/api/review?product_id=${productId}&user_id=${userId}&is_visible=true`),
    GET_REVIEW_BY_ORDER_ID: (orderId: number) => buildRequestUrl(`/api/review/order/${orderId}`),
    GET_REVIEW_ORDER_BY_PRODUCT_ID: (productId: number, page: number, limit: number) => buildRequestUrl(`/api/review/product/${productId}?page=${page}&limit=${limit}&is_visible=true`),
    UPDATE_REVIEW_ORDER: (orderId: number) => buildRequestUrl(`/api/review/${orderId}`),
    DELETE_REVIEW_ORDER: (orderId: number) => buildRequestUrl(`/api/review/${orderId}`),
    GET_FLASH_NEWS: (status?: boolean) => buildRequestUrl(`/api/home/flash-news${status !== undefined ? `?status=${status}` : ''}`),
    WORLDPAY_PAYMENT_SUCCESS: buildRequestUrl('/api/payment/worldpay/payment-success'),
    WORLDPAY_PAYMENT_CANCEL: buildRequestUrl('/api/payment/worldpay/payment-cancel'),
    GET_LOYALTY_POINTS_REDEMPTION: buildRequestUrl('/api/loyalty-points/redemption'),
    GET_CATEGORIES_WITH_DEALS: (payload?: CategoriesWithDealsPayload) => buildRequestUrl(`/api/product/categories-with-deals${payload ? `?${toQueryString(payload)}` : ''}`),
    GET_DEALS_BY_CATEGORY: (categoryId: number, payload?: { limit?: number; offset?: number; deal_id?: number }) => buildRequestUrl(`/api/product/category/${categoryId}/deals${payload ? `?${toQueryString(payload)}` : ''}`),
    GET_DEAL_PRODUCTS: (dealId: number, params?: { limit?: number; offset?: number; product_id?: number }) => buildRequestUrl(`/api/product/deal/${dealId}/products${params ? `?${toQueryString(params)}` : ''}`),
    GET_PRODUCTS_BY_DEAL_SLUG: (slug: string, params?: Record<string, unknown>) => buildRequestUrl(`/api/deals/slug/${slug}${params ? `?${toQueryString(params)}` : ''}`),
    GET_LINKED_PRODUCTS: (productId: number, params?: { limit?: number; offset?: number; page?: number }) => buildRequestUrl(`/api/product/${productId}/linked-products${params ? `?${toQueryString(params)}` : ''}`),
    GET_PRODUCT_DESCRIPTION: (productId: number, params?: PRODUCT_DESCRIPTION_QUERY) => {
        const searchParams = new URLSearchParams();
        if (params?.variant_id != null) {
            searchParams.set('variant_id', String(params.variant_id));
        }
        if (params?.attribute_terms?.length) {
            searchParams.set('attribute_terms', JSON.stringify(params.attribute_terms));
        }
        const queryString = searchParams.toString();
        return buildRequestUrl(`/api/product/${productId}/description${queryString ? `?${queryString}` : ''}`);
    },
    GET_PRODUCT_RELATED_BLOGS: (productId: number) =>
        buildRequestUrl(`/api/product/${productId}/related-blogs`),
    GET_MAIL_SUBSCRIPTION_SETTINGS: buildRequestUrl('/api/mailSubscription/settings'),
    GET_TRUSTPILOT_REVIEWS: (payload?: { page?: number; per_page?: number; stars?: number }) => buildRequestUrl(`/api/home/trustpilot-reviews${payload ? `?${toQueryString(payload)}` : ''}`),
    GET_WELCOME_CONTENT: buildRequestUrl('/api/home/welcome-content'),
    GET_FEATURE_CONTENT: (payload?: { page?: number, limit?: number }) => buildRequestUrl(`/api/home/feature-content${payload ? `?${toQueryString(payload)}` : ''}`),
    GET_SHIPSTATION_CARRIERS: buildRequestUrl('/api/admin/shipStation/carriers'),
    GET_ENTITY_SLUGS: buildRequestUrl('/api/home/entity-slugs'),
    GET_SEO_META: (slug: string) => buildRequestUrl(`/api/home/seo-meta?slug=${encodeURIComponent(slug)}`),
    GET_LEGAL_CONTENT: (contentKey: 'delivery_information' | 'privacy_policy' | 'returns_policy' | 'terms_conditions' | 'loyalty_points') => buildRequestUrl(`/api/settings/legal-content/${contentKey}`),
    GET_HOME_BLOCKS: buildRequestUrl('/api/home/blocks'),
    GET_DISPATCH_NOTICE: buildRequestUrl('/api/settings/dispatch-notice'),
    GUEST_CHECKOUT_AND_ORDER: buildRequestUrl('/api/checkout/guest/checkout-and-order'),
    UNSUBSCRIBE_MAIL: (email: string, source: string = 'app') =>
        buildRequestUrl(`/api/mailSubscription/unsubscribe?email=${encodeURIComponent(email)}&source=${encodeURIComponent(source)}`)
};

// * Helper functions
function buildRequestUrl(url: string) {
    return `${BASE_URL}${url}`;
}
export interface PRODUCT_PAYLOAD {
    keyword?: string;
    price_range?: string;
    is_new?: boolean;
    categories?: string;
    brand?: string;
    deal_id?: number;
    variant?: string;
    sort_by?: 'id' | 'name' | 'price' | 'created_at' | 'stock' | 'popularity';
    order?: 'ASC' | 'DESC';
    limit?: number | string;
    offset?: number | string;
    categoryId?: string;
    homepage?: number;
}
export interface BLOG_PAYLOAD {
    categoryId?: string;
    userId?: string | number;
    limit: number;
    page: number;
}

export interface PRODUCT_VARIANT_PAYLOAD {
    product_id: number;
    attribute_terms?: PRODUCT_VARIANT_ATTRIBUTE[];
    slugs?: string;
}
export interface PRODUCT_VARIANT_ATTRIBUTE {
    attribute_id: number;
    term_id: number;
}

export interface PRODUCT_DESCRIPTION_QUERY {
    attribute_terms?: PRODUCT_VARIANT_ATTRIBUTE[];
    variant_id?: number;
}

// Worldpay payment types
export interface WORLDPAY_PAYMENT_PAYLOAD {
    orderCode: string;
    currency: string;
    amount: number;
}

export interface WORLDPAY_PAYMENT_SUCCESS_RESPONSE {
    message: string;
    orderId: number;
    orderCode: string;
    status: string;
}

export interface WORLDPAY_PAYMENT_CANCEL_RESPONSE {
    message: string;
    data: {
        order_code: string;
        payment_method: string;
        order_details: {
            order_id: number;
            order_unique_id: string;
            order_code: string;
            status: string;
            amount: number;
        };
    };
}

