import NextAuth from 'next-auth';
import Credentials from 'next-auth/providers/credentials';
import { authConfig } from '@/auth.config';
import { z } from 'zod';
import type { User } from '@/lib/definitions';
import sql from '@/lib/db';
import { DefaultSession } from 'next-auth';
 
declare module "next-auth" {
  interface Session {
    user: User & DefaultSession["user"]
  }
}

async function getUser(username: string): Promise<User | undefined> {
  try {
    const user = await sql<User[]>`SELECT * FROM users WHERE username=${username}`;
    return user[0];
  } catch (error) {
    console.error('Failed to fetch user:', error);
    throw new Error('Failed to fetch user.');
  }
}
 
export const { auth, signIn, signOut } = NextAuth({
  ...authConfig,
  providers: [
    Credentials({
      async authorize(credentials) {
        const parsedCredentials = z
          .object({ username: z.string() })
          .safeParse(credentials);
 
        if (parsedCredentials.success) {
          const { username } = parsedCredentials.data;
          const user = await getUser(username);
          
          if (!user) return null;
          return user;
        }
 
        console.log('Invalid credentials');
        return null;
      },
    }),
  ],
});