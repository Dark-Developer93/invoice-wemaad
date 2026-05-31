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

### Option A — Docker (recommended)

The easiest way to run the full stack locally with a single command.

#### Prerequisites

- [Docker](https://docs.docker.com/get-docker/) and [Docker Compose](https://docs.docker.com/compose/install/) installed.

#### 1. Clone the repository

```bash
git clone https://github.com/yourusername/invoice-wemaad.git
cd invoice-wemaad
```

#### 2. Configure environment variables

```bash
cp .env.example .env
```

Open `.env` and fill in **at minimum** these required values:

| Variable | How to generate |
|----------|----------------|
| `AUTH_SECRET` | `openssl rand -base64 32` |
| `CRON_SECRET` | `openssl rand -base64 32` |
| `EMAIL_SERVER_*` | Your SMTP provider credentials |
| `EMAIL_FROM` | Sender address, e.g. `hello@yourdomain.com` |

The database variables (`POSTGRES_USER`, `POSTGRES_PASSWORD`, `POSTGRES_DB`) are optional — they default to `invoice` / `invoice_pass` / `invoice_db` inside the Compose stack. `DATABASE_URL` is automatically assembled by `docker-compose.yml` from those values, so **you do not need to set `DATABASE_URL` manually** when using Docker.

#### 3. Build and start

```bash
docker compose up --build
```

This will:
1. Start a PostgreSQL 16 container.
2. Build the Next.js app image (multi-stage, standalone output).
3. Wait for the database to be healthy.
4. Run `prisma migrate deploy` automatically on first boot.
5. Start the app on **http://localhost:3000**.

#### 4. Stopping and cleaning up

```bash
# Stop containers (keeps data volume)
docker compose down

# Stop and remove the volume (wipes the database)
docker compose down -v
```

#### Re-building after code changes

```bash
docker compose up --build
```

---

### Option B — Local development (without Docker)

#### Prerequisites

- Node.js 20+, pnpm, and a running PostgreSQL instance.

#### 1. Install dependencies

```bash
pnpm install
```

#### 2. Configure environment variables

```bash
cp .env.example .env
```

Fill in all values in `.env`, including a valid `DATABASE_URL` pointing to your PostgreSQL instance.

#### 3. Run database migrations

```bash
pnpm prisma migrate deploy
```

#### 4. Start the development server

```bash
pnpm dev
```

Visit **http://localhost:3000**.

---

### Environment Variables Reference

| Variable | Required | Description |
|----------|----------|-------------|
| `AUTH_SECRET` | ✅ | NextAuth secret — `openssl rand -base64 32` |
| `NEXT_PUBLIC_APP_URL` | ✅ | Public app URL (used in email links) |
| `DATABASE_URL` | ✅ | PostgreSQL connection string (auto-set in Docker) |
| `EMAIL_SERVER_HOST` | ✅ | SMTP host |
| `EMAIL_SERVER_PORT` | ✅ | SMTP port (default `587`) |
| `EMAIL_SERVER_USER` | ✅ | SMTP username |
| `EMAIL_SERVER_PASSWORD` | ✅ | SMTP password |
| `EMAIL_FROM` | ✅ | Sender email address |
| `CRON_SECRET` | ✅ | Secret for the recurring-invoices cron endpoint |
| `MAILTRAP_TOKEN` | ➖ | Mailtrap API token (optional, for email testing) |
| `POSTGRES_USER` | ➖ | DB username for Docker Compose (default: `invoice`) |
| `POSTGRES_PASSWORD` | ➖ | DB password for Docker Compose (default: `invoice_pass`) |
| `POSTGRES_DB` | ➖ | DB name for Docker Compose (default: `invoice_db`) |

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
