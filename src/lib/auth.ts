import NextAuth from "next-auth";
import { PrismaAdapter } from "@auth/prisma-adapter";
import Credentials from "next-auth/providers/credentials";
import Google from "next-auth/providers/google";
import bcrypt from "bcryptjs";
import { prisma } from "./prisma";
import { authConfig } from "./auth.config";

export const { handlers, signIn, signOut, auth } = NextAuth({
  ...authConfig,
  adapter: PrismaAdapter(prisma),
  providers: [
    Google({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
      allowDangerousEmailAccountLinking: true,
    }),
    Credentials({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          throw new Error("Email y contraseña son requeridos");
        }

        const user = await prisma.user.findUnique({
          where: { email: credentials.email as string },
          include: { profile: true },
        });

        if (!user || !user.password) {
          throw new Error("Credenciales inválidas");
        }

        const isPasswordValid = await bcrypt.compare(
          credentials.password as string,
          user.password
        );

        if (!isPasswordValid) {
          throw new Error("Credenciales inválidas");
        }

        return {
          id: user.id,
          email: user.email,
          name: user.profile?.displayName || user.profile?.firstName || user.email,
          image: user.profile?.avatar,
          role: user.role,
        };
      },
    }),
  ],
  callbacks: {
    ...authConfig.callbacks,
    async signIn({ user, account }) {
      // For OAuth, check if profile exists, if not create it
      if (account?.provider !== "credentials" && user.id) {
        const existingProfile = await prisma.profile.findUnique({
          where: { userId: user.id },
        });

        if (!existingProfile) {
          const nameParts = (user.name || "").split(" ");
          await prisma.profile.create({
            data: {
              userId: user.id,
              firstName: nameParts[0] || null,
              lastName: nameParts.slice(1).join(" ") || null,
              displayName: user.name || null,
              avatar: user.image || null,
            },
          });
        }
      }

      return true;
    },
  },
  events: {
    async createUser({ user }) {
      // Create profile for new users if it doesn't exist
      if (user.id) {
        const existingProfile = await prisma.profile.findUnique({
          where: { userId: user.id },
        });

        if (!existingProfile) {
          const nameParts = (user.name || "").split(" ");
          await prisma.profile.create({
            data: {
              userId: user.id,
              firstName: nameParts[0] || null,
              lastName: nameParts.slice(1).join(" ") || null,
              displayName: user.name || null,
              avatar: user.image || null,
            },
          });
        }
      }
    },
  },
});
