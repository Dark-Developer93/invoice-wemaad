import { NextResponse } from "next/server";

const SITE_URL = "https://invoice-wemaad.vercel.app";

const content = `# WeMaAd Invoice

> Professional invoicing and billing software for freelancers and small businesses.

WeMaAd Invoice helps you create, send, and track professional invoices in minutes.
Manage clients, automate recurring billing, and get paid faster — all from one dashboard.

## Key Pages

- [Home](${SITE_URL}/): Landing page with features overview, pricing plans, and contact form
- [Login](${SITE_URL}/login): Sign in to your WeMaAd Invoice account (magic link / email)
- [Dashboard](${SITE_URL}/dashboard): Overview of invoices, revenue, and recent activity
- [Invoices](${SITE_URL}/dashboard/invoices): Create, view, and manage all invoices
- [Clients](${SITE_URL}/dashboard/clients): Manage client contact details and invoice history
- [Recurring Invoices](${SITE_URL}/dashboard/recurring-invoices): Set up automated recurring billing
- [Reports](${SITE_URL}/dashboard/reports): Financial reports and revenue analytics
- [Billing](${SITE_URL}/dashboard/billing): Manage your subscription plan and usage limits

## Features

- Invoice creation with PDF export and email delivery
- Client management with full invoice history
- Recurring invoices sent automatically on a schedule
- Financial reports and analytics dashboard
- Dark and light mode support
- Multi-plan subscription system (free tier available)

## Pricing

Free plan available. Premium plans unlock higher limits and advanced features.
See [Pricing](${SITE_URL}/#pricing) for current plan details.

## Contact

Reach the team via the [Contact form](${SITE_URL}/#contact) on the homepage.

## Technical

- Built with Next.js 15 (App Router), TypeScript, Tailwind CSS
- Authentication via magic link (email)
- Hosted on Vercel
`;

export async function GET() {
  return new NextResponse(content, {
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
      "Cache-Control": "public, max-age=86400, stale-while-revalidate=3600",
    },
  });
}
