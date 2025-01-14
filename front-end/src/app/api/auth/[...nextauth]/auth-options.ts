import type { NextAuthOptions, Session, User } from 'next-auth'; 
import { JWT } from 'next-auth/jwt';
import GithubProvider from "next-auth/providers/github"


export const NEXT_AUTH_OPTIONS: NextAuthOptions = {
  providers: [
    GithubProvider({
      clientId:  '',
      clientSecret: "",
    }),
    // ...add more providers here
  ],
  pages: {
    signIn: "",
  },
  session: {
    strategy: 'jwt',
    maxAge: 2592000,
  },
  callbacks: {
    session: async ({ session, token }: { session: Session; token: JWT }) => {
      
      return session;
    },
    signIn: async ({ user }) => {
      if ((user as any)?.error) {
        throw new Error((user as any)?.error);
      }
      return true;
    },
    jwt: async ({
      token,
      trigger,
      user,
      session,
    }: {
      token: JWT;
      user: User;
      trigger?: 'signIn' | 'signUp' | 'update';
      session?: Session;
    }) => {
      if (trigger === 'signIn') {
        
      }

      if (trigger === 'update' && session) {
       
      }

      return token;
    },
  },
  events: {
    async signOut({ token }) {
      // signOutAction(token)
      //   .then()
      //   .catch((err) => {
      //     console.log('Error signing out', err);
      //   });
    },
  },
};
