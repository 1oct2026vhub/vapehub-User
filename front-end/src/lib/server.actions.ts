import { ServerActionResponse, ServerActionStatus } from "./config/app.config";
import { SignInResponse, VerifyUserEmailResponse, ContactInfo, SocialMedia } from "./config/auth.config";
import { BlogByCategoryAndSlugResponse, BlogBySlugResponse, BlogPostListResponse, BlogResponse } from "./config/blog.config";
import {  BrandListPayload, BrandListResponse } from "./config/brand.config";
import { CarouselConfig } from "./config/carousel.config";
import { CART_GET_PAYLOAD, CartData, StockValidationResponse } from "./config/cart.config";
import { Category } from "./config/category.config";
import { APPLY_COUPON_PAYLOAD, CHECKOUT_PAYLOAD } from "./config/checkout.config";
import { AllDealsResponse, CategoriesWithDealsPayload, CategoriesWithDealsResponse, DealsByCategoryResponse, ProductInDeal } from "./config/deal.config";
import { BannerResponse, DynamicPageSlugResponse, FaqResponse, mailSubscriptionResponse, TestimonialResponse, FlashNewsResponse } from "./config/global.config";
import { FooterMenuResponse, HeaderMegaMenuResponse } from "./config/header.config";
import { LoyaltyPointsRedemptionResponse } from "./config/loyalty-points.config";
import { NotificationListResponse } from "./config/notification.config";
import { ORDER_DETAILS_RESPONSE, ORDER_LIST_RESPONSE, ORDER_RESPONSE_DATA, CouponResponse, PLACE_ORDER_PAYLOAD, SHIPPING_METHOD_DATA, Payment_Validate, REVIEW_ORDER_PAYLOAD, REVIEW_ORDER_RESPONSE, REVIEW_ORDER_DATA, REVIEW_ORDER_PAYLOAD_UPDATE, REVIEWS } from "./config/order.config";
import { TRANSACTION_DETAILS_RESPONSE } from "./config/payment.config";
import { 
  Product, 
  AttributeTerms, 
  PriceRange, 
  ProductResponseData, 
  CategoryResponseData, 
  BrandByProductResponse,
  MoreLikeThisResponse,
  ProductResponse
} from '@/lib/config/product.config';
import { ReferralStatsResponse } from "./config/referral.config";
import { SignUpFormSchema } from "./config/register.config";
import { ChangeUserPasswordPayload, USER_ADDRESS_PAYLOAD, USER_ADDRESS_RESPONSE, UpdateUserProfilePayload, UserProfileResponse } from "./config/user.config";
import { handleRequest } from "./request.config";
import { API_ROUTES, BLOG_PAYLOAD, PRODUCT_PAYLOAD, PRODUCT_VARIANT_PAYLOAD, WORLDPAY_PAYMENT_PAYLOAD, WORLDPAY_PAYMENT_SUCCESS_RESPONSE, WORLDPAY_PAYMENT_CANCEL_RESPONSE } from '@/lib/api-routes';

export const signInAction = async (
    email: string,
    password: string,
    resendVerificationEmail: boolean
  ): Promise<
    ServerActionResponse<SignInResponse>
  > => {
    return await handleRequest<SignInResponse, 
    {email: string;password: string; resendVerificationEmail: boolean}
    >({
      endpoint: API_ROUTES.AUTH.SIGN_IN,
      payload: {
        email,
        password,
        resendVerificationEmail
      },
      method: 'POST',
    });
  };
  
  export const signUpAction = async ({
    email,
    password,
    mail_subscription,
    referralCode
  }: SignUpFormSchema & { referralCode: string }): Promise<ServerActionResponse<{message: string}>> => {
    const payload = {
      email,
      password,
      mail_subscription
    };
    return await handleRequest<{message: string}, typeof payload>({
      endpoint: API_ROUTES.AUTH.REGISTER(referralCode),
      payload,
      method: 'POST',
    });
  };
 
  export const verifyUserEmailAction = async (
    token: string
  ): Promise<ServerActionResponse<VerifyUserEmailResponse>> => {
    
    return await handleRequest<VerifyUserEmailResponse, unknown>({
      endpoint: API_ROUTES.AUTH.GET_VERIFY_EMAIL(token),
      method: 'GET',
    });
  };

  
export const forgotPasswordAction = async (
  email: string
): Promise<ServerActionResponse<{ message: string }>> => {
  return await handleRequest<{ message: string }, { email: string }>({
    endpoint: API_ROUTES.AUTH.FORGOT_PASSWORD,
    payload: { email },
    method: 'POST',
  });
};
 

export const resetPasswordAction = async (
  token: string ,
  password: string
): Promise<ServerActionResponse<{ message: string }>> => {
  return await handleRequest<
  { message: string },
    { token: string; password: string }
  >({
    endpoint: API_ROUTES.AUTH.RESET_PASSWORD,
    payload: { token, password},
    method: 'POST',
  });
};
 
// category list api 
export const getCategoryList = async (): Promise<ServerActionResponse<Category[]>> => {
  return await handleRequest<Category[], unknown>({
    endpoint: API_ROUTES.GET_CATEGORY_LIST,
    method: 'GET',
  });
};
// brand list api 
export const getBrandList = async (params?: BrandListPayload): Promise<ServerActionResponse<BrandListResponse>> => {
  return await handleRequest<BrandListResponse, unknown>({
    endpoint: API_ROUTES.GET_BRAND_LIST(params),
    method: 'GET',
  });
};

// product list api
export const getProductList = async (
  params: PRODUCT_PAYLOAD
): Promise<ServerActionResponse<ProductResponseData>> => {
  return await handleRequest<ProductResponseData, unknown>({
    endpoint: API_ROUTES.GET_PRODUCTS(params),
    method: 'GET',
  });
};
// most popular vapes product list api
export const getProductByCategory = async (
  slug: string,
  params: PRODUCT_PAYLOAD
): Promise<ServerActionResponse<CategoryResponseData>> => {
  
  return await handleRequest<CategoryResponseData, unknown>({
    endpoint: API_ROUTES.GET_CATEGORY_PRODUCTS_BY_SLUG(slug, params),
    method: 'GET',
  });
};

// get product by slug api
export const getProductBySlug = async (
  slug: string,
  params: PRODUCT_PAYLOAD): Promise<ServerActionResponse<Product>> => {
  return await handleRequest<Product, unknown>({
    endpoint: API_ROUTES.GET_PRODUCTS_BY_SLUG(slug, params),
    method: 'GET',
  });
};

export const getProductById = async (
  id: number,
  params: PRODUCT_PAYLOAD
): Promise<ServerActionResponse<Product>> => {
  return await handleRequest<Product, unknown>({
    endpoint: API_ROUTES.GET_PRODUCTS_BY_ID(id, params),
    method: 'GET',
  });
};
 
export const getProductVariantByID = async (payload: PRODUCT_VARIANT_PAYLOAD): Promise<ServerActionResponse<ProductResponse>> => {
  return await handleRequest<ProductResponse, unknown>({
    endpoint: API_ROUTES.GET_PRODUCT_VARIANT_BY_ID,
    payload,
    method: 'POST',
  });
};

// carousel list api
export const getCarouselList = async (): Promise<ServerActionResponse<CarouselConfig[]>> => {
  return await handleRequest<CarouselConfig[], unknown>({
    endpoint: API_ROUTES.GET_CAROUSEL,
    method: 'GET',
  });
}; 

// get testimonials list api
export const getTestimonialsList = async (): Promise<ServerActionResponse<TestimonialResponse[]>> => {
  return await handleRequest<TestimonialResponse[], unknown>({
    endpoint: API_ROUTES.GET_TESTIMONIALS,
    method: 'GET',
  });
};

// mail subscription api
export const subscribeMail = async (email: string): Promise<ServerActionResponse<mailSubscriptionResponse>> => {
  return await handleRequest<mailSubscriptionResponse, { email: string }>({
    endpoint: API_ROUTES.SUBSCRIBE_MAIL,
    payload: { email },
    method: 'POST',
  });
};

// blog list api
export const getBlogList = async (group?: string | number): Promise<ServerActionResponse<BlogResponse[]>> => {
  return await handleRequest<BlogResponse[], unknown>({
    endpoint: API_ROUTES.GET_BLOGS(group),
    method: 'GET',
  });
}

// get promotion banner
export const getPromotionBanner = async (): Promise<ServerActionResponse<BannerResponse[]>> => {
  return await handleRequest<BannerResponse[], unknown>({
    endpoint: API_ROUTES.GET_PROMOTION_BANNER,
    method: 'GET',
  });
};
// Get product by brand slug
export const getProductByBrand = async (
  slug: string,
  params: PRODUCT_PAYLOAD
): Promise<ServerActionResponse<BrandByProductResponse>> => {
  return await handleRequest<BrandByProductResponse, unknown>({
    endpoint: API_ROUTES.GET_BRAND_PRODUCTS_BY_SLUG(slug, params),
    method: 'GET',
  });
};

// get blog by slug
export const getBlogBySlug = async (slug: string): Promise<ServerActionResponse<BlogBySlugResponse>> => {
  return await handleRequest<BlogBySlugResponse, unknown>({
    endpoint: API_ROUTES.GET_BLOGS_BY_SLUG(slug),
    method: 'GET',
  });
};
// get blog by category and blog slug
export const getBlogByCategoryAndSlug = async (categorySlug: string): Promise<ServerActionResponse<BlogByCategoryAndSlugResponse>> => {
  return await handleRequest<BlogByCategoryAndSlugResponse, unknown>({
    endpoint: API_ROUTES.GET_BLOGS_BY_CATEGORY_AND_SLUG(categorySlug),
    method: 'GET',
  });
};
// get blog list
export const getBlogPostList = async (payload?: BLOG_PAYLOAD): Promise<ServerActionResponse<BlogPostListResponse>> => {
  return await handleRequest<BlogPostListResponse, unknown>({
    endpoint: API_ROUTES.GET_BLOGS_POST_LIST(payload),
    method: 'GET',
  });
};

// Add item to cart
export const addToCart = async (
  product_id: number,
  variant_id: number,
  quantity: number
): Promise<ServerActionResponse<{message: string}>> => {
  return await handleRequest<{message: string}, CART_GET_PAYLOAD>({
    endpoint: API_ROUTES.CART,
    payload: {
      product_id,
      variant_id,
      quantity
    },
    method: 'POST',
  });
};
// Bulk add items to cart
export const bulkAddToCart = async (
  cartItems: CART_GET_PAYLOAD[]
): Promise<ServerActionResponse<{message: string}>> => {
  return await handleRequest<{message: string}, {cartItems: CART_GET_PAYLOAD[]}>({
    endpoint: API_ROUTES.BULK_ADD_TO_CART,
    payload: {
      cartItems
    },
    method: 'POST',
  });
};

// Get Cart Items
export const getCartItems = async (): Promise<ServerActionResponse<CartData>> => {
  return await handleRequest<CartData, unknown>({
    endpoint: API_ROUTES.CART,
    method: 'GET',
  });
};

// Update cart item quantity
export const updateCartItem = async (
  cartId: number,
  quantity: number
): Promise<ServerActionResponse<{message: string}>> => {
  return await handleRequest<{message: string}, { 
    quantity: number;
  }>({
    endpoint: API_ROUTES.UPDATE_CART_ITEM(cartId),
    payload: {
      quantity
    },
    method: 'PUT',
  });
};

// Remove item from cart
export const removeFromCart = async (
  productId: number
): Promise<ServerActionResponse<{message: string}>> => {
  return await handleRequest<{message: string}, {
    productId: number;
  }>({
    endpoint: API_ROUTES.REMOVE_FROM_CART(productId),     
    method: 'DELETE',
  });
};
// check stock validation
export const checkStockValidation = async (): Promise<ServerActionResponse<StockValidationResponse[]>> => {
  return await handleRequest<StockValidationResponse[], unknown>({
    endpoint: API_ROUTES.CHECK_STOCK_VALIDATION,
    method: 'GET',
  });
};

// get all faqs
export const getFaqs = async (type: string, id: number): Promise<ServerActionResponse<FaqResponse[]>> => {
  return await handleRequest<FaqResponse[], unknown>({
    endpoint: API_ROUTES.GET_FAQS(type, id),
    method: 'GET',
  });
};

// get dynamic page slug
export const getDynamicPageSlug = async (slug: string): Promise<ServerActionResponse<DynamicPageSlugResponse>> => {
  return await handleRequest<DynamicPageSlugResponse, unknown>({
    endpoint: API_ROUTES.GET_DYNAMIC_PAGE_SLUG(slug),
    method: 'GET',
  });
};

// checkout
export const checkout = async (payload: CHECKOUT_PAYLOAD): Promise<ServerActionResponse<{message: string}>> => {
  return await handleRequest<{message: string}, unknown>({
    endpoint: API_ROUTES.CHECKOUT,
    payload,
    method: 'POST',
  });
};

// apply coupon
export const applyCoupon = async (payload: APPLY_COUPON_PAYLOAD): Promise<ServerActionResponse<CouponResponse>> => {
  return await handleRequest<CouponResponse, unknown>({
    endpoint: API_ROUTES.APPLY_COUPON,
    payload,
    method: 'POST',
  });
};

// get user profile
export const getUserProfile = async (): Promise<ServerActionResponse<UserProfileResponse>> => {
  return await handleRequest<UserProfileResponse, unknown>({
    endpoint: API_ROUTES.GET_USER_PROFILE,
    method: 'GET',
  });
};

// update user profile
export const updateUserProfile = async (payload: UpdateUserProfilePayload): Promise<ServerActionResponse<{message: string}>> => {
  return await handleRequest<{message: string}, unknown>({
    endpoint: API_ROUTES.GET_USER_PROFILE,
    payload,
    method: 'PUT',
  });
};
// user account delete
export const deleteUserAccount = async (): Promise<ServerActionResponse<{message: string}>> => {
  return await handleRequest<{message: string}, unknown>({
    endpoint: API_ROUTES.DELETE_USER_ACCOUNT,
    method: 'DELETE',
  });
};

// toggle mail subscription
export const toggleMailSubscription = async (): Promise<ServerActionResponse<{
  message: string;
  user_id: number;
  email: string;
  subscribed: boolean;
}>> => {
  return await handleRequest<{
    message: string;
    user_id: number;
    email: string;
    subscribed: boolean;
  }, unknown>({
    endpoint: API_ROUTES.TOGGLE_MAIL_SUBSCRIPTION,
    payload: {},
    method: 'POST',
  });
};
// get user addresses
export const getUserAddresses = async (): Promise<ServerActionResponse<USER_ADDRESS_RESPONSE>> => {
  return await handleRequest<USER_ADDRESS_RESPONSE, unknown>({
    endpoint: API_ROUTES.GET_USER_ADDRESSES,
    method: 'GET',
  });
};
// add user address
export const addUserAddress = async (payload: USER_ADDRESS_PAYLOAD): Promise<ServerActionResponse<{message: string}>> => {
  return await handleRequest<{message: string}, unknown>({
    endpoint: API_ROUTES.ADD_USER_ADDRESS,
    payload,
    method: 'POST',
  });
};
// update user address
export const updateUserAddress = async (id: number, payload: USER_ADDRESS_PAYLOAD): Promise<ServerActionResponse<{message: string}>> => {
  return await handleRequest<{message: string}, unknown>({
    endpoint: API_ROUTES.UPDATE_USER_ADDRESS(id),
    payload,
    method: 'PUT',
  });
};
// delete user address
export const deleteUserAddress = async (id: number): Promise<ServerActionResponse<{message: string}>> => {
  return await handleRequest<{message: string}, unknown>({
    endpoint: API_ROUTES.DELETE_USER_ADDRESS(id),
    method: 'DELETE',
  });
};
// change user password
export const changeUserPassword = async (payload: ChangeUserPasswordPayload): Promise<ServerActionResponse<{message: string}>> => {
  return await handleRequest<{message: string}, unknown>({
    endpoint: API_ROUTES.CHANGE_USER_PASSWORD,
    payload,
    method: 'PUT',
  });
};

// get orders list
export const getOrdersList = async (page: number, limit: number): Promise<ServerActionResponse<ORDER_LIST_RESPONSE>> => {
  return await handleRequest<ORDER_LIST_RESPONSE, unknown>({
    endpoint: API_ROUTES.GET_ORDER_LIST(page, limit),
    method: 'GET',
  });
};

// get order by id
export const getOrderById = async (id: number): Promise<ServerActionResponse<ORDER_DETAILS_RESPONSE>> => {
  return await handleRequest<ORDER_DETAILS_RESPONSE, unknown>({
    endpoint: API_ROUTES.GET_ORDER_BY_ID(id),
    method: 'GET',
  });
};
//  place order
export const placeOrder = async (payload: PLACE_ORDER_PAYLOAD): Promise<ServerActionResponse<ORDER_RESPONSE_DATA>> => {
  return await handleRequest<ORDER_RESPONSE_DATA, unknown>({
    endpoint: API_ROUTES.ORDERS,
    payload,
    method: 'POST',
  });
};

export const cancelOrderById = async (orderId: number): Promise<ServerActionResponse<{message: string}>> => {
  return await handleRequest<{message: string}, unknown>({
    endpoint: API_ROUTES.CANCEL_ORDER(orderId),
    payload: {},
    method: 'POST',
  });
}

export const checkStockToPayment = async (orderId: number): Promise<ServerActionResponse<Payment_Validate>> => {
  return await handleRequest<Payment_Validate, unknown>({
    endpoint: API_ROUTES.CONTINUE_TO_PAYMENT(orderId),
    method: 'GET',
  });
}
// get transaction details
export const getTransactionDetails = async (transactionId: string): Promise<ServerActionResponse<TRANSACTION_DETAILS_RESPONSE>> => {
  return await handleRequest<TRANSACTION_DETAILS_RESPONSE, unknown>({
    endpoint: API_ROUTES.GET_TRANSACTION_DETAILS(transactionId),
    method: 'GET',
  });
};

// Update order status
export const updateOrderStatus = async (
    orderReference: string,
    status: string
): Promise<ServerActionResponse<{message: string}>> => {
    return await handleRequest<{message: string}, { status: string }>({
        endpoint: API_ROUTES.UPDATE_ORDER_STATUS(orderReference),
        payload: { status },
        method: 'PUT',
    });
};

//  get shipping methods
export const getShippingMethods = async (): Promise<ServerActionResponse<SHIPPING_METHOD_DATA[]>> => {
  return await handleRequest<SHIPPING_METHOD_DATA[], unknown>({
    endpoint: API_ROUTES.GET_SHIPPING_METHODS,
    method: 'GET',
  });
};

// send referral code
export const sendReferralCode = async (payload: {
  email: string;
  referral_code: string;
}): Promise<ServerActionResponse<{message: string}>> => {
  return await handleRequest<{message: string}, unknown>({
    endpoint: API_ROUTES.SEND_REFERRAL_CODE,
    payload,
    method: 'POST',
  });
};

// referral stats
export const getReferralStats = async (page: number, limit: number): Promise<ServerActionResponse<ReferralStatsResponse>> => {
  return await handleRequest<ReferralStatsResponse, unknown>({
    endpoint: API_ROUTES.GET_REFERRAL_STATS(page, limit),
    method: 'GET',
  });
};

// get notification list
export const getNotificationList = async (): Promise<ServerActionResponse<NotificationListResponse>> => {
  return await handleRequest<NotificationListResponse, unknown>({
    endpoint: API_ROUTES.GET_NOTIFICATION_LIST,
    method: 'GET',
  });
};

// get unread notification count
export const getUnreadNotificationCount = async (): Promise<ServerActionResponse<{count: number}>> => {
  return await handleRequest<{count: number}, unknown>({
    endpoint: API_ROUTES.GET_UNREAD_NOTIFICATION_COUNT,
    method: 'GET',
  });
};

// read notification
export const readNotification = async (id: number): Promise<ServerActionResponse<{message: string}>> => {
  return await handleRequest<{message: string}, unknown>({
    endpoint: API_ROUTES.READ_NOTIFICATION(id),
    payload: {},
    method: 'PUT',
  });
};

// read all notifications
export const readAllNotifications = async (): Promise<ServerActionResponse<{message: string}>> => {
  return await handleRequest<{message: string}, unknown>({
    endpoint: API_ROUTES.READ_ALL_NOTIFICATIONS,
    payload: {},
    method: 'PUT',
  });
};

// delete notification
export const deleteNotification = async (id: number): Promise<ServerActionResponse<{message: string}>> => {
  return await handleRequest<{message: string}, unknown>({
    endpoint: API_ROUTES.DELETE_NOTIFICATION(id),
    method: 'DELETE',
  });
};
// get footer menu
export const getFooterMenu = async (): Promise<FooterMenuResponse> => {
  try {
  
    const response = await fetch(API_ROUTES.GET_FOOTER_MENU);
    const data = await response.json();    
    return data;
  } catch (error) {
    console.error("Error fetching footer menu:", error);
    return {
      data: [],
      socialLinks: {},
      status: ServerActionStatus.ERROR,
      message: error instanceof Error ? error.message : 'Unknown error'
    };
  }
};

// get header mega menu
export const getHeaderMegaMenu = async (): Promise<ServerActionResponse<HeaderMegaMenuResponse>> => {
  return await handleRequest<HeaderMegaMenuResponse, unknown>({
    endpoint: API_ROUTES.GET_HEADER_MEGA_MENU,
    method: 'GET',
  });
};

export const reviewOrder = async (payload: REVIEW_ORDER_PAYLOAD): Promise<ServerActionResponse<{message: string, id: number}>> => {
  return await handleRequest<{message: string, id: number}, unknown>({
    endpoint: API_ROUTES.REVIEW_ORDER,
    payload,
    method: 'POST',
  });
};

export const getReviewOrder = async (productId: number, userId: number): Promise<ServerActionResponse<REVIEW_ORDER_DATA>> => {
  return await handleRequest<REVIEW_ORDER_DATA, unknown>({
    endpoint: API_ROUTES.GET_REVIEW_ORDER(productId, userId),
    method: 'GET',
  });
};

export const getReviewByOrderId = async (orderId: number): Promise<ServerActionResponse<REVIEWS[]>> => {
  return await handleRequest<REVIEWS[], unknown>({
    endpoint: API_ROUTES.GET_REVIEW_BY_ORDER_ID(orderId),
    method: 'GET',
  });
};

export const updateReviewOrder = async (orderId: number, payload: REVIEW_ORDER_PAYLOAD_UPDATE): Promise<ServerActionResponse<{message: string}>> => {
  return await handleRequest<{message: string}, unknown>({
    endpoint: API_ROUTES.UPDATE_REVIEW_ORDER(orderId),
    payload,
    method: 'PUT',
  });
};

export const getReviewOrderByProductId = async (productId: number, page: number, limit: number): Promise<ServerActionResponse<REVIEW_ORDER_RESPONSE>> => {
  return await handleRequest<REVIEW_ORDER_RESPONSE, unknown>({
    endpoint: API_ROUTES.GET_REVIEW_ORDER_BY_PRODUCT_ID(productId, page, limit),
    method: 'GET',
  });
};

// delete review order
export const deleteReviewOrder = async (orderId: number): Promise<ServerActionResponse<{message: string}>> => {
  return await handleRequest<{message: string}, unknown>({
    endpoint: API_ROUTES.DELETE_REVIEW_ORDER(orderId),
    method: 'DELETE',
  });
};
//List flash news
export const getFlashNews = async (status?: boolean): Promise<ServerActionResponse<FlashNewsResponse>> => {
  return await handleRequest<FlashNewsResponse, unknown>({
    endpoint: API_ROUTES.GET_FLASH_NEWS(status),
    method: 'GET',
  });
};

// Worldpay payment success
export const worldpayPaymentSuccess = async (payload: WORLDPAY_PAYMENT_PAYLOAD): Promise<ServerActionResponse<WORLDPAY_PAYMENT_SUCCESS_RESPONSE>> => {
  return await handleRequest<WORLDPAY_PAYMENT_SUCCESS_RESPONSE, WORLDPAY_PAYMENT_PAYLOAD>({
    endpoint: API_ROUTES.WORLDPAY_PAYMENT_SUCCESS,
    payload,
    method: 'POST',
  });
};

// Worldpay payment cancel
export const worldpayPaymentCancel = async (payload: WORLDPAY_PAYMENT_PAYLOAD): Promise<ServerActionResponse<WORLDPAY_PAYMENT_CANCEL_RESPONSE>> => {
  return await handleRequest<WORLDPAY_PAYMENT_CANCEL_RESPONSE, WORLDPAY_PAYMENT_PAYLOAD>({
    endpoint: API_ROUTES.WORLDPAY_PAYMENT_CANCEL,
    payload,
    method: 'POST',
  });
};

export const getLoyaltyPointsRedemption = async (): Promise<ServerActionResponse<LoyaltyPointsRedemptionResponse>> => {
  return await handleRequest<LoyaltyPointsRedemptionResponse, unknown>({
    endpoint: API_ROUTES.GET_LOYALTY_POINTS_REDEMPTION,
    method: 'GET',
  });
};

export const getCategoriesWithDeals = async (payload?: CategoriesWithDealsPayload): Promise<ServerActionResponse<CategoriesWithDealsResponse>> => {
    return await handleRequest<CategoriesWithDealsResponse, unknown>({
        endpoint: API_ROUTES.GET_CATEGORIES_WITH_DEALS(payload),
        method: 'GET',
    });
};

export const getDealsByCategory = async (categoryId: number, payload?: { limit?: number; offset?: number; deal_id?: number }): Promise<ServerActionResponse<DealsByCategoryResponse>> => {
    return await handleRequest<DealsByCategoryResponse, unknown>({
        endpoint: API_ROUTES.GET_DEALS_BY_CATEGORY(categoryId, payload),
        method: 'GET',
    });
};

export const getDealProducts = async (
  dealId: number, 
  params?: { 
    limit?: number; 
    offset?: number; 
    product_id?: number 
  }
): Promise<ServerActionResponse<{
  deal: {
    id: number;
    name: string;
    slug: string;
    image_url: string;
    deal_type: string;
    required_qty: number;
    get_qty: number;
    fixed_price: number;
    discount_percent: number;
    tiered_qty_json: { min: number; discount: number }[] | null;
    valid_from: string;
    valid_to: string;
  };
  products: ProductInDeal[];
  pagination: {
    total_count: number;
    total_pages: number;
    current_page: number;
    limit: number;
    offset: number;
    has_next: boolean;
    has_prev: boolean;
  };
}>> => {
  try {
    console.log("Fetching Deal Products:", {
      dealId,
      params: JSON.stringify(params)
    });

    const response = await handleRequest<{
      deal: {
        id: number;
        name: string;
        slug: string;
        image_url: string;
        deal_type: string;
        required_qty: number;
        get_qty: number;
        fixed_price: number;
        discount_percent: number;
        tiered_qty_json: { min: number; discount: number }[] | null;
        valid_from: string;
        valid_to: string;
      };
      products: ProductInDeal[];
      pagination: {
        total_count: number;
        total_pages: number;
        current_page: number;
        limit: number;
        offset: number;
        has_next: boolean;
        has_prev: boolean;
      };
    }, unknown>({
      endpoint: API_ROUTES.GET_DEAL_PRODUCTS(dealId, params),
      method: 'GET',
    });

    console.log("Deal Products Response:", JSON.stringify(response, null, 2));
    return response;
  } catch (error) {
    console.error("Error fetching deal products:", error);
    return {
      status: ServerActionStatus.ERROR,
      message: error instanceof Error ? error.message : 'Unknown error fetching deal products'
    };
  }
};

export const getAllDeals = async (payload?: { limit?: number; offset?: number; deal_type?: string, search?: string }): Promise<ServerActionResponse<AllDealsResponse>> => {
    return await handleRequest<AllDealsResponse, unknown>({
        endpoint: API_ROUTES.GET_ALL_DEALS(payload),
        method: 'GET',
    });
};

export const getMoreLikeThis = async (payload: { product_id: number; limit?: number; offset?: number }): Promise<ServerActionResponse<MoreLikeThisResponse>> => {
    return await handleRequest<MoreLikeThisResponse, unknown>({
        endpoint: API_ROUTES.GET_MORE_LIKE_THIS(payload),
        method: 'GET',
    });
};

export const getContactUs = async (): Promise<ServerActionResponse<ContactInfo>> => {
    return await handleRequest<ContactInfo, unknown>({
      endpoint: API_ROUTES.CONTACT.CONTACT_US,
      method: 'GET',
    });
  };
  
  export const getSocialMedia = async (): Promise<ServerActionResponse<SocialMedia>> => {
    return await handleRequest<SocialMedia, unknown>({
      endpoint: API_ROUTES.CONTACT.SOCIAL_MEDIA,
      method: 'GET',
    });
  };

export const getMailSubscriptionSettings = async (): Promise<ServerActionResponse<{
  id: number;
  email_frequency: string;
  product_updates: boolean;
  discount_notifications: boolean;
  discount_amount: string;
  discount_type: string;
  status: boolean;
  createdAt: string;
  updatedAt: string;
}>> => {
  return await handleRequest<{
    id: number;
    email_frequency: string;
    product_updates: boolean;
    discount_notifications: boolean;
    discount_amount: string;
    discount_type: string;
    status: boolean;
    createdAt: string;
    updatedAt: string;
  }, unknown>({
    endpoint: API_ROUTES.GET_MAIL_SUBSCRIPTION_SETTINGS,
    method: 'GET',
  });
};

export const getProductsByDealSlug = async (
  slug: string, 
  params?: {
    keyword?: string;
    price_range?: string;
    is_new?: boolean;
    categories?: string;
    brand?: string;
    flavours?: string;
    variants?: Record<string, number[]>;
    sort_by?: string;
    order?: 'ASC' | 'DESC';
    limit?: number;
    offset?: number;
    productId?: number;
  }
): Promise<ServerActionResponse<{
  products: Product[];
  category_items: {id: number, name: string, slug: string, product_count: number}[];
  brand_items: {id: number, name: string, slug: string, product_count: number}[];
  attributes: AttributeTerms[];
  price_ranges: PriceRange[];
  pagination: {
    total_count: number;
    total_pages: number;
    current_page: number;
    limit: number;
    offset: number;
  };
}>> => {
  // Log the API call with parameters
  const apiUrl = API_ROUTES.GET_PRODUCTS_BY_DEAL_SLUG(slug, params);
  console.log('🔗 Backend API Call:', {
    url: apiUrl,
    slug: slug,
    params: params,
    queryString: apiUrl.split('?')[1] || 'No query params',
    fullUrl: apiUrl,
    timestamp: new Date().toISOString()
  });

  return await handleRequest<{
    products: Product[];
    category_items: {id: number, name: string, slug: string, product_count: number}[];
    brand_items: {id: number, name: string, slug: string, product_count: number}[];
    attributes: AttributeTerms[];
    price_ranges: PriceRange[];
    pagination: {
      total_count: number;
      total_pages: number;
      current_page: number;
      limit: number;
      offset: number;
    };
  }, unknown>({
    endpoint: API_ROUTES.GET_PRODUCTS_BY_DEAL_SLUG(slug, params),
    method: 'GET',
  });
};

import { WelcomeContentResponse } from "./config/welcome.config";

export const getWelcomeContent = async (): Promise<ServerActionResponse<WelcomeContentResponse>> => {
    return await handleRequest<WelcomeContentResponse, unknown>({
        endpoint: API_ROUTES.GET_WELCOME_CONTENT,
        method: 'GET',
    });
};

export const getFeatureContent = async (payload?: { page?: number, limit?: number }): Promise<ServerActionResponse<{
    featureContent: {
        id: number;
        title: string;
        subtitle: string;
        icon: {
            icon_url: string;
        }
    }[];
}>> => {
    return await handleRequest<{
        featureContent: {
            id: number;
            title: string;
            subtitle: string;
            icon: {
                icon_url: string;
            }
        }[];
    }, unknown>({
        endpoint: API_ROUTES.GET_FEATURE_CONTENT(payload),
        method: 'GET',
    });
};

export const getTrustpilotReviews = async (payload?: { page?: number; per_page?: number; stars?: number }): Promise<ServerActionResponse<{
  reviews: Array<{
    id: string;
    stars: number;
    title: string;
    text: string;
    createdAt: string;
    consumer: {
      displayName: string;
    };
    ratingCategory: string;
  }>;
  pagination: {
    page: number;
    per_page: number;
  };
  overallStats: {
    averageRating: number;
    trustScore: number;
    totalReviews: number;
    ratingDistribution: {
      oneStar: { count: number; percentage: string };
      twoStars: { count: number; percentage: string };
      threeStars: { count: number; percentage: string };
      fourStars: { count: number; percentage: string };
      fiveStars: { count: number; percentage: string };
    };
    scoreBreakdown: {
      stars: number;
      trustScore: number;
      ratingCategory: string;
      showRatingBanner: boolean;
    };
  };
  showRatingBanner: boolean;
}>> => {
  return await handleRequest<{
    reviews: Array<{
      id: string;
      stars: number;
      title: string;
      text: string;
      createdAt: string;
      consumer: {
        displayName: string;
      };
      ratingCategory: string;
    }>;
    pagination: {
      page: number;
      per_page: number;
    };
    overallStats: {
      averageRating: number;
      trustScore: number;
      totalReviews: number;
      ratingDistribution: {
        oneStar: { count: number; percentage: string };
        twoStars: { count: number; percentage: string };
        threeStars: { count: number; percentage: string };
        fourStars: { count: number; percentage: string };
        fiveStars: { count: number; percentage: string };
      };
      scoreBreakdown: {
        stars: number;
        trustScore: number;
        ratingCategory: string;
        showRatingBanner: boolean;
      };
    };
    showRatingBanner: boolean;
  }, unknown>({
    endpoint: API_ROUTES.GET_TRUSTPILOT_REVIEWS(payload),
    method: 'GET',
  });
};