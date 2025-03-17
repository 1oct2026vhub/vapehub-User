import { ServerActionResponse } from "./config/app.config";
import { SignInResponse, VerifyUserEmailResponse } from "./config/auth.config";
import { BlogByCategoryAndSlugResponse, BlogBySlugResponse, BlogResponse } from "./config/blog.config";
import { BrandConfig } from "./config/brand.config";
import { CarouselConfig } from "./config/carousel.config";
import { CART_GET_PAYLOAD, CART_RESPONSE_DATA } from "./config/cart.config";
import { Category } from "./config/category.config";
import { BannerResponse, FaqResponse, mailSubscriptionResponse, TestimonialResponse } from "./config/global.config";
import { BrandByProductResponse, CategoryResponseData, Product, ProductResponseData } from "./config/product.config";
import { SignUpFormSchema } from "./config/register.config";
import { handleRequest } from "./request.config";
import { API_ROUTES, PRODUCT_PAYLOAD } from '@/lib/api-routes';

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
export const getBrandList = async (): Promise<ServerActionResponse<BrandConfig[]>> => {
  return await handleRequest<BrandConfig[], unknown>({
    endpoint: API_ROUTES.GET_BRAND_LIST,
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
export const getBlogByCategoryAndSlug = async (categorySlug: string, blogSlug: string): Promise<ServerActionResponse<BlogByCategoryAndSlugResponse>> => {
  return await handleRequest<BlogByCategoryAndSlugResponse, unknown>({
    endpoint: API_ROUTES.GET_BLOGS_BY_CATEGORY_AND_SLUG(categorySlug, blogSlug),
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
    endpoint: API_ROUTES.ADD_TO_CART,
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
  items: CART_GET_PAYLOAD[]
): Promise<ServerActionResponse<{message: string}>> => {
  return await handleRequest<{message: string}, {items: CART_GET_PAYLOAD[]}>({
    endpoint: API_ROUTES.ADD_TO_CART,
    payload: {
      items
    },
    method: 'POST',
  });
};

// Get cart items
export const getCartItems = async (): Promise<ServerActionResponse<CART_RESPONSE_DATA[]>> => {
  return await handleRequest<CART_RESPONSE_DATA[], unknown>({
    endpoint: API_ROUTES.GET_CART_ITEMS,
    method: 'GET',
  });
};

// Update cart item quantity
export const updateCartItem = async (
  productId: number,
  quantity: number
): Promise<ServerActionResponse<{message: string}>> => {
  return await handleRequest<{message: string}, { 
    quantity: number;
  }>({
    endpoint: API_ROUTES.UPDATE_CART_ITEM(productId),
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

// get all faqs
export const getFaqs = async (type: string, id: number): Promise<ServerActionResponse<FaqResponse[]>> => {
  return await handleRequest<FaqResponse[], unknown>({
    endpoint: API_ROUTES.GET_FAQS(type, id),
    method: 'GET',
  });
};
