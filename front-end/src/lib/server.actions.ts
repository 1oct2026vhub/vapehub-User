import { ServerActionResponse } from "./config/app.config";
import { SignInResponse } from "./config/auth.config";
import { SignUpFormSchema } from "./config/register.config";
import { handleRequest } from "./request.config";
import { API_ROUTES } from '@/lib/api-routes';

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
  ): Promise<ServerActionResponse<{ message: string }>> => {
    return await handleRequest<{ message: string }, unknown>({
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
 