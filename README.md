# InvoiceWeMaAd

A modern invoice management SaaS built with Next.js, allowing users to create, manage, and track invoices efficiently.

## Features

### Core
- 🔐 Secure Authentication (NextAuth v5)
- 💰 Invoice Management — create, edit, delete, mark as paid
- 👥 Client Management — full client profiles with addresses, contact persons, and custom fields
- 📧 Email Notifications — automatic emails on invoice create, update, and reminders; per-plan email limits
- 🌙 Light / Dark Mode
- 📱 Fully Responsive — mobile-first design across all pages, forms, tables, and charts
- 🖨️ PDF Generation — download or send invoices as PDF
- 🔢 Decimal Rates — invoice item rate and quantity support decimal values (e.g. 4.5 hours)
- 📨 Email Toggle — optionally skip sending an email when creating or updating an invoice

### Analytics & Reporting
- 📊 Interactive Dashboard Charts — switch between Line, Bar, and Pie views; filter by date range (7d / 30d / 90d) and status (Paid / Pending / All)
- 📈 Reports Page — monthly revenue bar chart, paid/pending breakdown, top-clients revenue table, outstanding invoices list, and CSV export

### Billing & Plans
- 💳 Pricing Plans — Free, Starter ($9/mo), Pro ($29/mo), Business (custom)
- 🔒 Plan-gated features — analytics and advanced features unlock on Starter and above
- 📉 Usage tracking — monthly invoice and email counts enforced per plan
- 🧾 Billing dashboard — view current plan, usage progress bars, and request an upgrade or downgrade
- 📬 Plan upgrade requests — users request a plan change; admin reviews and approves or rejects; user is notified via the in-app notification bell

### Notifications
- 🔔 In-app notification bell — shows unread count badge; marks all read when opened
- ✅ Plan upgrade approved/rejected notifications delivered in real time

### Automation
- 🔄 Recurring Invoices — set up templates that auto-generate on monthly, quarterly, or yearly schedules; pause / resume at any time
- ⏰ Daily cron job — Vercel-scheduled processor respects per-plan invoice limits and logs emails

### Admin Panel
- 🛡️ Admin-only panel accessible from the main navigation (visible only to admins)
- 👤 User management — view all users, stats, plan, and account status
- ✏️ Manage users — change plan, activate/deactivate account, promote/demote admin privileges
- 📋 Pending upgrade requests — review and approve or reject user plan change requests from the user detail page and a global pending list
- 📱 Fully responsive admin panel with mobile sidebar

## Tech Stack

- [Next.js 15](https://nextjs.org/) — React Framework (App Router)
- [Prisma](https://www.prisma.io/) — Database ORM
- [PostgreSQL](https://www.postgresql.org/) — Database
- [TypeScript](https://www.typescriptlang.org/) — Type Safety
- [Tailwind CSS](https://tailwindcss.com/) — Styling
- [Shadcn/ui](https://ui.shadcn.com/) — UI Components
- [Recharts](https://recharts.org/) — Charts
- [Mailtrap](https://mailtrap.io/) — Email Testing
- [NextAuth v5](https://authjs.dev/) — Authentication

## Getting Started

1. Clone the repository:

```bash
git clone https://github.com/yourusername/invoice-wemaad.git
cd invoice-wemaad
```

2. Install the dependencies:

```bash
pnpm install
```

3. Set up your environment variables:

```bash
cp .env.example .env
```

Fill in the required values in `.env`. See `.env.example` for the full list.

4. Run database migrations:

```bash
pnpm prisma migrate deploy
```

5. Run the development server:

```bash
pnpm dev
```

6. Visit `http://localhost:3000` in your browser.

### Environment Variables

| Variable | Description |
|----------|-------------|
| `DATABASE_URL` | PostgreSQL connection string |
| `AUTH_SECRET` | NextAuth secret key |
| `EMAIL_SERVER_*` | SMTP credentials |
| `EMAIL_FROM` | Sender email address |
| `MAILTRAP_TOKEN` | Mailtrap API token (optional) |
| `CRON_SECRET` | Secret for the recurring-invoices cron endpoint |
| `VERCEL_URL` | Set automatically by Vercel; used for invoice email links |

## Project Structure

```
├── app/
│   ├── actions/            # Server actions (invoices, clients, billing, admin, notifications)
│   ├── admin/              # Admin panel pages (users, user detail)
│   ├── api/
│   │   ├── cron/           # Scheduled job endpoints
│   │   ├── dashboard/      # Chart data API
│   │   ├── reports/        # Export endpoints
│   │   └── invoice/        # PDF generation
│   └── dashboard/          # Dashboard pages (invoices, clients, reports, recurring, billing, profile)
├── components/             # React components
│   ├── notifications/      # Notification bell (server + client)
│   ├── mobile-nav/         # Mobile navigation (closes on route change)
│   ├── invoice-form/       # Invoice create/edit form
│   ├── client-form/        # Client create/edit form and dialog
│   └── ...
├── lib/
│   ├── plans.ts            # Plan definitions and feature flags
│   ├── usage.ts            # Usage tracking helpers
│   └── ...
├── prisma/                 # Schema and migrations
├── public/                 # Static assets
└── types/                  # TypeScript types
```

## Roadmap

- [ ] Stripe integration for payment processing and subscription management
- [ ] White label / custom branding for clients
- [ ] Multi-user organizations and team management
- [ ] Client-facing portal to view and pay invoices

## Contributing

Contributions are welcome! Please feel free to submit a PR.

## License

This project is open-sourced under the MIT License — see the LICENSE file for details.
