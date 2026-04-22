import { NextAuthOptions } from "next-auth";
import { PrismaAdapter } from "@auth/prisma-adapter";
import CredentialsProvider from "next-auth/providers/credentials";
import GoogleProvider from "next-auth/providers/google";
import bcrypt from "bcryptjs";
import { db } from "@/lib/db";
import { rateLimit } from "@/lib/rate-limit";
import type { Track, BloomsLevel } from "@prisma/client";

export const authOptions: NextAuthOptions = {
  adapter: PrismaAdapter(db) as NextAuthOptions["adapter"],
  session: {
    strategy: "jwt",
    maxAge: 60 * 60 * 24, // 24 hours
  },
  pages: {
    signIn: "/login",
  },
  providers: [
    ...(process.env.GOOGLE_CLIENT_ID
      ? [
          GoogleProvider({
            clientId: process.env.GOOGLE_CLIENT_ID!,
            clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
          }),
        ]
      : []),
    CredentialsProvider({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          throw new Error("Email and password required");
        }

        // Rate limit: 10 attempts per email per minute
        const rl = rateLimit(`login:${credentials.email}`, 10, 60_000);
        if (!rl.success) {
          throw new Error("Слишком много попыток входа. Подождите немного.");
        }

        const user = await db.user.findUnique({
          where: { email: credentials.email },
        });

        if (!user || !user.hashedPassword) {
          throw new Error("Invalid credentials");
        }

        const isValid = await bcrypt.compare(
          credentials.password,
          user.hashedPassword
        );

        if (!isValid) {
          throw new Error("Invalid credentials");
        }

        return {
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role,
          image: user.image,
        };
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user, trigger }) {
      if (user) {
        token.id = user.id;
      }
      if (user || trigger === "update") {
        const userId = (token.id ?? user?.id) as string | undefined;
        if (userId) {
          try {
            const dbUser = await db.user.findUnique({
              where: { id: userId },
              select: {
                role: true,
                preferredTrack: true,
                preferredLevel: true,
                showAllLevels: true,
                onboardingCompleted: true,
              },
            });
            if (dbUser) {
              token.role = dbUser.role;
              token.preferredTrack = dbUser.preferredTrack ?? null;
              token.preferredLevel = dbUser.preferredLevel ?? null;
              token.showAllLevels = dbUser.showAllLevels;
              token.onboardingCompleted = dbUser.onboardingCompleted;
            }
          } catch {
            // DB unavailable — keep existing token values
            if (!token.role) token.role = "USER";
          }
        }
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id as string;
        session.user.role = token.role as string;
        session.user.preferredTrack = token.preferredTrack as Track | null;
        session.user.preferredLevel = token.preferredLevel as BloomsLevel | null;
        session.user.showAllLevels = token.showAllLevels as boolean;
        session.user.onboardingCompleted = token.onboardingCompleted as boolean;
      }
      return session;
    },
  },
};
