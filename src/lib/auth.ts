import NextAuth, { type NextAuthConfig } from "next-auth";
import Credentials from "next-auth/providers/credentials";
import { prisma } from "@/lib/prisma";
import argon2 from "argon2";

export const authOptions: NextAuthConfig = {
  session: { strategy: "jwt" },
  pages: {
    signIn: "/login"
  },
  providers: [
    Credentials({
      credentials: {
        username: { label: "Benutzername", type: "text" },
        password: { label: "Passwort", type: "password" }
      },
      authorize: async (credentials) => {
        if (!credentials?.username || !credentials?.password) {
          return null;
        }
        const user = await prisma.user.findUnique({ where: { username: credentials.username } });
        if (!user) {
          return null;
        }
        const valid = await argon2.verify(user.passwordHash, credentials.password);
        if (!valid) {
          return null;
        }
        return {
          id: user.id,
          name: user.profile ? `${user.profile.vorname} ${user.profile.nachname}`.trim() : null,
          username: user.username,
          role: user.role
        } as any;
      }
    })
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = (user as any).id;
        token.role = (user as any).role;
        token.username = (user as any).username;
        token.name = user.name ?? null;
      }
      return token;
    },
    async session({ session, token }) {
      session.user = {
        id: token.id as string,
        role: token.role as string,
        username: token.username as string,
        name: (token.name as string | null) ?? undefined
      } as any;
      return session;
    }
  },
  trustHost: true,
  secret: process.env.NEXTAUTH_SECRET
};

export const { auth, signIn, signOut } = NextAuth(authOptions);
