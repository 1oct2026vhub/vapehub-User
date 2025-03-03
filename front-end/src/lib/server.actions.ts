import { ServerActionResponse } from "./config/app.config";
import { SignInResponse, VerifyUserEmailResponse } from "./config/auth.config";
import { BrandConfig } from "./config/brand.config";
import { CarouselConfig } from "./config/carousel.config";
import { Category } from "./config/category.config";
import { BlogResponse, mailSubscriptionResponse, TestimonialResponse } from "./config/global.config";
import { CategoryResponseData, Product, ProductResponseData } from "./config/product.config";
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
export const getBlogList = async (): Promise<ServerActionResponse<BlogResponse[]>> => {
  return await handleRequest<BlogResponse[], unknown>({
    endpoint: API_ROUTES.GET_BLOGS,
    method: 'GET',
  });
}
 