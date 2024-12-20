import { PrismaAdapter } from "@auth/prisma-adapter";
import NextAuth from "next-auth";
import Nodemailer from "next-auth/providers/nodemailer";

import prisma from "@/lib/db";

export const { handlers, signIn, signOut, auth } = NextAuth({
  adapter: PrismaAdapter(prisma),
  session: {
    strategy: "database",
    maxAge: 30 * 24 * 60 * 60, // 30 days
    updateAge: 24 * 60 * 60, // 24 hours
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

        const html = `<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Welcome to InvoiceWeMaAd</title>
    <style>
      body {
        font-family: 'Geist', Arial, sans-serif;
        line-height: 1.6;
        color: #09090B;
        margin: 0;
        padding: 0;
        background-color: #FAFAFA;
      }
      .container {
        max-width: 600px;
        margin: 0 auto;
        padding: 24px;
        background-color: #FFFFFF;
        border-radius: 12px;
        box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
      }
      .header {
        text-align: left;
        margin-bottom: 32px;
        display: flex;
        align-items: center;
        justify-content: space-between;
        padding: 0 16px;
      }
      .brand {
        font-size: 24px;
        font-weight: 600;
        color: #18181B;
      }
      .brand span {
        color: #3B82F6;
      }
      .badge {
        display: inline-block;
        padding: 6px 12px;
        background-color: #ECFDF5;
        color: #059669;
        border-radius: 9999px;
        font-size: 14px;
        font-weight: 500;
      }
      .content {
        padding: 0 16px;
      }
      .hero-text {
        font-size: 32px;
        font-weight: 600;
        margin: 24px 0;
        background: linear-gradient(to right, #3B82F6, #14B8A6, #22C55E);
        -webkit-background-clip: text;
        background-clip: text;
        -webkit-text-fill-color: transparent;
        display: inline-block;
      }
      .magic-link-box {
        background-color: #F8FAFC;
        border: 1px solid #E2E8F0;
        border-radius: 8px;
        padding: 24px;
        margin: 24px 0;
        text-align: center;
      }
      .button {
        display: inline-block;
        padding: 12px 32px;
        background: linear-gradient(to right, #3B82F6, #14B8A6, #22C55E);
        color: #FFFFFF !important;
        text-decoration: none;
        border-radius: 6px;
        font-weight: 500;
        margin: 16px 0;
        text-align: center;
      }
      .notice {
        background-color: #FEF3C7;
        border-left: 4px solid #D97706;
        padding: 16px;
        margin: 24px 0;
        border-radius: 0 8px 8px 0;
        font-size: 14px;
      }
      .features {
        display: grid;
        grid-template-columns: repeat(2, 1fr);
        gap: 16px;
        margin: 32px 0;
      }
      .feature {
        padding: 16px;
        background-color: #F8FAFC;
        border-radius: 8px;
      }
      .feature-title {
        font-weight: 600;
        margin-bottom: 8px;
        color: #18181B;
      }
      .footer {
        margin-top: 48px;
        text-align: center;
        color: #71717A;
        font-size: 14px;
        border-top: 1px solid #E4E4E7;
        padding-top: 24px;
      }
    </style>
  </head>
  <body>
    <div class="container">
      <div class="header">
        <div class="brand">
          Invoice<span>WeMaAd</span>
        </div>
        <div class="badge">Magic Link</div>
      </div>
      
      <div class="content">
        <div class="hero-text">Welcome to InvoiceWeMaAd!</div>

        <p>Hello there,</p>

        <p>
          Thank you for choosing InvoiceWeMaAd. To access your account, simply click the secure login button below:
        </p>

        <div class="magic-link-box">
          <p>Your secure login link is ready</p>
          <a href="${url}" class="button">Sign in to InvoiceWeMaAd</a>
          <p style="font-size: 14px; color: #64748B;">
            This link will expire in 24 hours
          </p>
        </div>

        <div class="notice">
          <strong>Security Notice:</strong> If you didn't request this email, please ignore it. Your account security is important to us.
        </div>

        <div class="features">
          <div class="feature">
            <div class="feature-title">📊 Dashboard Analytics</div>
            <p>Track your invoices and payments in real-time</p>
          </div>
          <div class="feature">
            <div class="feature-title">💰 Invoice Management</div>
            <p>Create and manage professional invoices easily</p>
          </div>
        </div>

        <div class="footer">
          <p>© 2024 InvoiceWeMaAd. All rights reserved.</p>
          <p>Making invoicing super easy!</p>
        </div>
      </div>
    </div>
  </body>
</html>`;

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
