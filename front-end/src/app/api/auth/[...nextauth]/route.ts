import NextAuth from 'next-auth/next';
import { NEXT_AUTH_OPTIONS } from './auth-options';

const handler = NextAuth(NEXT_AUTH_OPTIONS);

export { handler as GET, handler as POST };
