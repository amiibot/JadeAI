import NextAuth from 'next-auth';
import Credentials from 'next-auth/providers/credentials';
import type { User } from 'next-auth';
import { z } from 'zod';
import { userRepository } from '@/lib/db/repositories/user.repository';
import { dbReady } from '@/lib/db';
import { findFamilyUserByUsername } from '@/lib/auth/family-users';
import { verifyLocalPassword } from '@/lib/auth/password';

interface LocalAuthUser extends User {
  id: string;
  username?: string;
  authType: 'local';
}

const localSignInSchema = z.object({
  username: z.string().trim().min(1),
  password: z.string().min(1),
});

export const { handlers, auth, signIn, signOut } = NextAuth({
  trustHost: true,
  session: {
    strategy: 'jwt',
  },
  providers: [
    Credentials({
      name: 'Local',
      credentials: {
        username: { label: 'Username', type: 'text' },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(credentials) {
        await dbReady;

        const parsed = localSignInSchema.safeParse(credentials);
        if (!parsed.success) return null;

        const username = parsed.data.username.trim().toLowerCase();
        const configuredUser = findFamilyUserByUsername(username);
        if (!configuredUser) return null;

        const isPasswordValid = verifyLocalPassword(parsed.data.password, configuredUser.passwordHash);
        if (!isPasswordValid) return null;

        const dbUser = await userRepository.findOrCreateByLocalUsername({
          username: configuredUser.username,
          name: configuredUser.name,
        });

        if (!dbUser) return null;

        const authUser: LocalAuthUser = {
          id: dbUser.id,
          name: dbUser.name,
          email: dbUser.email ?? undefined,
          image: dbUser.avatarUrl ?? undefined,
          username: dbUser.username ?? undefined,
          authType: 'local',
        };

        return authUser;
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        const localUser = user as LocalAuthUser;
        token.userId = localUser.id;
        token.username = localUser.username ?? undefined;
        token.authType = localUser.authType;
      }

      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = (token.userId || token.sub) as string;
        session.user.username = token.username as string | undefined;
        session.user.authType = 'local';
        if (token.name) session.user.name = token.name as string;
        if (token.email) session.user.email = token.email as string;
        if (token.picture) session.user.image = token.picture as string;
      }
      return session;
    },
  },
  pages: {
    signIn: '/login',
  },
  secret: process.env.AUTH_SECRET,
});
