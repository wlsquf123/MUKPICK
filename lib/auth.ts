import type { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";

import { connectMongoDB } from "./mongodb";
import User from "../models/User";

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: "credentials",

      credentials: {
        email: {
          label: "이메일",
          type: "email",
        },
        password: {
          label: "비밀번호",
          type: "password",
        },
      },

      async authorize(credentials) {
        if (
          !credentials?.email ||
          !credentials?.password
        ) {
          return null;
        }

        await connectMongoDB();

        const email = credentials.email
          .trim()
          .toLowerCase();

        const user = await User.findOne({
          email,
        });

        if (!user) {
          return null;
        }

        const passwordMatches =
          await bcrypt.compare(
            credentials.password,
            user.passwordHash
          );

        if (!passwordMatches) {
          return null;
        }

        return {
          id: user.id,
          name: user.username,
          email: user.email,
        };
      },
    }),
  ],

  session: {
    strategy: "jwt",
  },

  pages: {
    signIn: "/login",
  },

  secret: process.env.NEXTAUTH_SECRET,
};