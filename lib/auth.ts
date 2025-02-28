import { PrismaAdapter } from "@auth/prisma-adapter";
import NextAuth from "next-auth";
import Nodemailer from "next-auth/providers/nodemailer";
import { render } from "@react-email/render";
import WelcomeEmail from "./email/templates/welcomeEmail";

import prisma from "@/lib/db";

const THIRTY_DAYS = 30 * 24 * 60 * 60;
const TWENTY_FOUR_HOURS = 24 * 60 * 60;

// Create a custom adapter that extends PrismaAdapter
const customPrismaAdapter = () => {
  const adapter = PrismaAdapter(prisma);
  return {
    ...adapter,
    deleteSession: async (sessionToken: string) => {
      // Check if session exists first
      const session = await prisma.session.findUnique({
        where: { sessionToken },
      });

      if (!session) {
        return null;
      }

      return prisma.session.delete({
        where: { sessionToken },
      });
    },
  };
};

export const { handlers, signIn, signOut, auth } = NextAuth({
  adapter: customPrismaAdapter(),
  session: {
    strategy: "database",
    maxAge: THIRTY_DAYS,
    updateAge: TWENTY_FOUR_HOURS,
  },
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
    session: async ({ session, user }) => {
      if (session?.user) {
        session.user.id = user.id;
      }
      return session;
    },
  },
});
