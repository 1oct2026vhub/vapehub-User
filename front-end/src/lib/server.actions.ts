import { ServerActionResponse } from "./config/app.config";
import { SignInResponse, VerifyUserEmailResponse } from "./config/auth.config";
import { BlogByCategoryAndSlugResponse, BlogBySlugResponse, BlogPostListResponse, BlogResponse } from "./config/blog.config";
import {  BrandListPayload, BrandListResponse } from "./config/brand.config";
import { CarouselConfig } from "./config/carousel.config";
import { CART_GET_PAYLOAD, CART_RESPONSE_DATA, StockValidationResponse } from "./config/cart.config";
import { Category } from "./config/category.config";
import { APPLY_COUPON_PAYLOAD, CHECKOUT_PAYLOAD } from "./config/checkout.config";
import { BannerResponse, DynamicPageSlugResponse, FaqResponse, mailSubscriptionResponse, TestimonialResponse } from "./config/global.config";
import { ORDER_DETAILS_RESPONSE, ORDER_LIST_RESPONSE, ORDER_RESPONSE_DATA, CouponResponse, PLACE_ORDER_PAYLOAD, SHIPPING_METHOD_DATA, Payment_Validate } from "./config/order.config";
import { TRANSACTION_DETAILS_RESPONSE } from "./config/payment.config";
import { BrandByProductResponse, CategoryResponseData, Product, ProductResponseData, ProductResponse } from "./config/product.config";
import { SignUpFormSchema } from "./config/register.config";
import { ChangeUserPasswordPayload, USER_ADDRESS_PAYLOAD, USER_ADDRESS_RESPONSE, UpdateUserProfilePayload, UserProfileResponse } from "./config/user.config";
import { handleRequest } from "./request.config";
import { API_ROUTES, BLOG_PAYLOAD, PRODUCT_PAYLOAD, PRODUCT_VARIANT_PAYLOAD } from '@/lib/api-routes';

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
      endpoint: API_ROUTES.SIGN_IN,
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
  }: SignUpFormSchema): Promise<ServerActionResponse<{message: string}>> => {
    const payload = {
      email,
      password
    };
    return await handleRequest<{message: string}, typeof payload>({
      endpoint: API_ROUTES.REGISTER,
      payload,
      method: 'POST',
    });
  };
 
  export const verifyUserEmailAction = async (
    token: string
  ): Promise<ServerActionResponse<VerifyUserEmailResponse>> => {
    
    return await handleRequest<VerifyUserEmailResponse, unknown>({
      endpoint: API_ROUTES.GET_VERIFY_EMAIL(token),
      method: 'GET',
    });
  };

  
export const forgotPasswordAction = async (
  email: string
): Promise<ServerActionResponse<{ message: string }>> => {
  return await handleRequest<{ message: string }, { email: string }>({
    endpoint: API_ROUTES.FORGOT_PASSWORD,
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
    endpoint: API_ROUTES.RESET_PASSWORD,
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

// Get cart items
export const getCartItems = async (): Promise<ServerActionResponse<CART_RESPONSE_DATA[]>> => {
  return await handleRequest<CART_RESPONSE_DATA[], unknown>({
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
