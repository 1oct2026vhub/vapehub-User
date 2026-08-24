export const ROUTES = {
    // * Auth Routes
MY_ACCOUNT: '/my-account',

UNAUTHORIZED: '/',

WELCOME: '/',
FORGOT: '/my-account/lost-password',
BRANDS: '/brands',
BRAND: '/brand/:slug',
BLOGS: '/blogs',
BLOGS_BY_AUTHOR: (authorId: number | string) => `/blogs/?authorId=${authorId}`,
// DEALS: '/deals',
DEALS: '/vapehub-deals',
SHOP: '/shop',
NEW_PRODUCTS: '/new-products',
SHOPPING_CART: '/shopping-cart',
CHECKOUT: '/checkout',
MY_ACCOUNT_ORDERS: '/my-account/orders',
MY_ACCOUNT_PERSONAL_INFO: '/my-account/personal-info',
MY_ACCOUNT_REFERRALS: '/my-account/referrals',
MY_ACCOUNT_ADDRESSES: '/my-account/addresses',
MY_ACCOUNT_SECURITY: '/my-account/security',
MY_ACCOUNT_LOYALTY_POINTS: '/my-account/loyalty-points',
FAQ: '/faq',
PAYMENT_SUCCESS: '/payment-success',
PAYMENT_FAILED: '/payment-failed',
ORDER_DETAILS: '/order-details',
REFERRAL: '/refer-a-friend',
UNSUBSCRIBE_SUCCESS: '/unsubscribe'
}

 