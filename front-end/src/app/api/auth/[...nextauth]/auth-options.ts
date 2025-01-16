import { NextAuthOptions } from "next-auth"
import GithubProvider from "next-auth/providers/github"

export const NEXT_AUTH_OPTIONS: NextAuthOptions = {
  // Configure one or more authentication providers
  providers: [
    GithubProvider({
      clientId: "",
      clientSecret: "",
    }),
    // ...add more providers here
  ],
}
 