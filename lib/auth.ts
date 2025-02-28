import { PrismaAdapter } from "@auth/prisma-adapter";
import NextAuth from "next-auth";
import Nodemailer from "next-auth/providers/nodemailer";
import { render } from "@react-email/render";
import WelcomeEmail from "./email/templates/welcomeEmail";
import type { NextAuthConfig } from "next-auth";

import prisma from "@/lib/db";

const THIRTY_DAYS = 30 * 24 * 60 * 60;
const TWENTY_FOUR_HOURS = 24 * 60 * 60;

export const { handlers, signIn, signOut, auth } = NextAuth({
  adapter: PrismaAdapter(prisma),
  session: {
    strategy: "jwt",
    maxAge: THIRTY_DAYS,
    updateAge: TWENTY_FOUR_HOURS,
  },
  debug: process.env.NODE_ENV === "development",
  providers: [
    Nodemailer({
      server: {
        host: process.env.EMAIL_SERVER_HOST,
        port: Number(process.env.EMAIL_SERVER_PORT),
        auth: {
          user: process.env.EMAIL_SERVER_USER,
          pass: process.env.EMAIL_SERVER_PASSWORD,
        },
      },
      from: process.env.EMAIL_FROM,
      async sendVerificationRequest({
        identifier: email,
        url,
        provider: { server, from },
      }) {
        const { createTransport } = await import("nodemailer");
        const transport = createTransport(server);

        const html = await render(WelcomeEmail({ url }));
        const text = `Sign in to InvoiceWeMaAd\n${url}\n\n`;

        try {
          await transport.sendMail({
            to: email,
            from: {
              name: "InvoiceWeMaAd",
              address: from!,
            },
            subject: "Sign in to InvoiceWeMaAd",
            text,
            html,
          });
        } catch (error) {
          console.error("SEND_VERIFICATION_EMAIL_ERROR", error);
          throw new Error("SEND_VERIFICATION_EMAIL_ERROR");
        }
      },
    }),
  ],
  pages: {
    verifyRequest: "/verify",
    error: "/auth/error",
  },
  callbacks: {
    async session({ session, token, user }) {
      try {
        if (session?.user) {
          session.user.id = token.sub || user?.id;
        }
        return session;
      } catch (error) {
        console.error("Session callback error:", error);
        return session;
      }
    },
    async jwt({ token, user }) {
      try {
        if (user) {
          token.id = user.id;
        }
        return token;
      } catch (error) {
        console.error("JWT callback error:", error);
        return token;
      }
    },
  },
} satisfies NextAuthConfig);
