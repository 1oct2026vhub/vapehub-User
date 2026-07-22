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
        password: {},
        id: {},
        first_name: {},
        last_name: {},
        phone: {},
        profile_pic_url: {},
        gender: {},
        dob: {},
        accessToken: {},
        refreshToken: {},

      },
      authorize: async (credentials) => {

        if (!credentials) return null;
        if (credentials?.accessToken) {
          return {
            id: credentials.accessToken,
            name: `${credentials.first_name} ${credentials.last_name}`,
            email: credentials.email,
            sub: credentials.accessToken,
            image: credentials.profile_pic_url,
            userId: credentials.id
          };
        }

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
          image: userProfile.profile_pic_url,
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
    session: async ({ session, token }: { session: any; token: JWT }) => {
      // Do NOT put the backend Bearer token on session.user — /api/auth/session
      // is readable by client JS. Keep the API token only on the encrypted JWT
      // (token.accessToken / token.sub) and read it server-side via getToken().
      if (session.user) {
        session.user.id = token.userId;
      }
      return session;
    },
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    jwt: async ({ token, user }: { token: any; user: any; }) => {
      if (user) {
        token.userId = user.userId;
        // Persist backend API token on the encrypted JWT only (never on the client session).
        // authorize() sets user.id / user.sub to the backend accessToken.
        token.accessToken = user.sub ?? user.id;
      }
      return token;
    }
  }
}
