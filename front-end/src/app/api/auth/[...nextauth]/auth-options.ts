import { ServerActionStatus } from "@/lib/config/app.config";
import { ROUTES } from "@/lib/routes";
import { signInAction } from "@/lib/server.actions";
import { NextAuthOptions } from "next-auth"
import { JWT } from "next-auth/jwt";
import CredentialsProvider from "next-auth/providers/credentials";
 
export const NEXT_AUTH_OPTIONS: NextAuthOptions = {
  // Configure one or more authentication providers
  providers: [
    CredentialsProvider({
      name: 'VapeHub Authentication',
      credentials: {
        email: {},
        password: {}
      },
      authorize: async (credentials) => {
       
        if(!credentials) return null
        const userDetails = await signInAction(credentials.email, credentials.password, false);
         
        if (userDetails.status === ServerActionStatus.ERROR) {
          return Promise.reject(new Error(userDetails.message ?? 'Oops! Something went wrong. Please try again later.'));
        }
        const userProfile = userDetails.data; 
         
        return {
          id: userProfile.accessToken,
          name: `${userProfile.first_name} ${userProfile.last_name}`,
          email: userProfile.email, 
          sub: userProfile.accessToken,
          image:  userProfile.profile_pic_url,
          userId: userProfile.id
        };
      },
    }),
  ],
  pages: {
    signIn: ROUTES.MY_ACCOUNT,
  },
  session: {
    strategy: 'jwt',
    maxAge: 3600, 
  },
  callbacks: {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    session: async ({ session, token }: { session: any; token: JWT  }) => {
       
      if(session.user) {
        session.user.accessToken = token.sub as string;
        session.user.id = token.userId;
      }
      return session;
    },
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    jwt: async ({ token, user }: {token:any; user:any; }) => {
      if(user)  {
        token.userId = user.userId
      }
      return token;
    }
  }
}
 