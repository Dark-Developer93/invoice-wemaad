# InvoiceWeMaAd

A modern invoice management SaaS built with Next.js — create, manage, and track invoices with plan-based feature gating, recurring billing, and a built-in admin panel.

---

## Quick Start (Docker — recommended)

**Prerequisites:** [Docker](https://docs.docker.com/get-docker/) and Docker Compose.

```bash
# 1. Clone
git clone https://github.com/yourusername/invoice-wemaad.git
cd invoice-wemaad

# 2. Copy env template
cp .env.example .env

# 3. Fill in the two required secrets (everything else has dev defaults)
openssl rand -base64 32   # paste into AUTH_SECRET
openssl rand -base64 32   # paste into CRON_SECRET

# 4. Start
docker compose up --build
```

That's it. On first boot the stack will:
1. Start **PostgreSQL 16**
2. Run all **database migrations** automatically
3. **Seed the admin account** from `ADMIN_EMAIL` in your `.env`
4. Start the **Next.js app** on http://localhost:3000
5. Start **Mailhog** (local email catcher) on http://localhost:8025

### Signing in for the first time

1. Open http://localhost:3000
2. Enter the email you set as `ADMIN_EMAIL` in `.env` (default: `admin@localhost.dev`)
3. Open **http://localhost:8025** — the magic link email is there
4. Click the link → complete onboarding → you're in as admin

> **Tip:** All outgoing emails (invoice notifications, reminders, magic links) go to Mailhog in dev — no real inbox needed.

---

## Local Dev (without Docker)

**Prerequisites:** Node.js 22+, pnpm, PostgreSQL running locally.

```bash
# Install dependencies
pnpm install

# Copy and fill in env
cp .env.example .env
# Set DATABASE_URL to your local Postgres, e.g.:
# DATABASE_URL="postgresql://invoice:invoice_pass@localhost:5432/invoice_db"

# Run migrations
pnpm prisma migrate deploy

# Seed admin account
pnpm prisma db seed

# Start dev server (Turbopack)
pnpm dev
```

Visit http://localhost:3000. For email in local dev, either run Mailhog separately (`docker run -p 1025:1025 -p 8025:8025 mailhog/mailhog`) or point `EMAIL_SERVER_*` to a real SMTP provider.

---

## Environment Variables

| Variable | Required | Default | Description |
|----------|----------|---------|-------------|
| `AUTH_SECRET` | ✅ | — | NextAuth secret — `openssl rand -base64 32` |
| `CRON_SECRET` | ✅ | — | Protects the recurring-invoice cron endpoint |
| `NEXT_PUBLIC_APP_URL` | ✅ | `http://localhost:3000` | Public app URL — used in email links |
| `ADMIN_EMAIL` | ➖ | — | Auto-seeded admin account email |
| `ADMIN_FIRST_NAME` | ➖ | `Admin` | Admin account first name |
| `ADMIN_LAST_NAME` | ➖ | `User` | Admin account last name |
| `EMAIL_SERVER_HOST` | ✅ | `mailhog` (Docker) | SMTP host |
| `EMAIL_SERVER_PORT` | ✅ | `1025` (Docker) | SMTP port |
| `EMAIL_SERVER_USER` | ➖ | _(empty)_ | SMTP username — not needed for Mailhog |
| `EMAIL_SERVER_PASSWORD` | ➖ | _(empty)_ | SMTP password — not needed for Mailhog |
| `EMAIL_FROM` | ✅ | `noreply@localhost.dev` | Sender address |
| `MAILTRAP_TOKEN` | ➖ | — | Mailtrap API token (optional) |
| `DATABASE_URL` | ✅ | _(auto in Docker)_ | PostgreSQL connection string |
| `POSTGRES_USER` | ➖ | `invoice` | Docker Compose DB user |
| `POSTGRES_PASSWORD` | ➖ | `invoice_pass` | Docker Compose DB password |
| `POSTGRES_DB` | ➖ | `invoice_db` | Docker Compose DB name |

> `DATABASE_URL` is assembled automatically in Docker Compose from the `POSTGRES_*` vars. You only need to set it manually for local non-Docker dev.

---

## Common Operations

```bash
# Stop containers (keeps data)
docker compose down

# Wipe database and start fresh
docker compose down -v && docker compose up --build

# Rebuild after code changes
docker compose up --build

# Run tests
pnpm test

# Run tests with coverage
pnpm test -- --coverage

# Open Prisma Studio (DB browser)
pnpm prisma studio

# Add a migration after schema changes
pnpm prisma migrate dev --name your-migration-name
```

---

## Production Deployment

For production, override the dev defaults in your environment:

```bash
# Real SMTP instead of Mailhog
EMAIL_SERVER_HOST=smtp.yourprovider.com
EMAIL_SERVER_PORT=587
EMAIL_SERVER_USER=your-smtp-user
EMAIL_SERVER_PASSWORD=your-smtp-password
EMAIL_FROM=hello@yourdomain.com

# Real database
DATABASE_URL=postgresql://user:pass@your-db-host/dbname?sslmode=require

# Real app URL
NEXT_PUBLIC_APP_URL=https://yourdomain.com
```

The Mailhog service is only included in the Docker Compose stack for local dev. Remove or exclude it in a production compose file.

---

## Features

### Core
- 🔐 Magic-link authentication (NextAuth v5, passwordless)
- 💰 Invoice management — create, edit, delete, mark paid, send reminders
- 👥 Client management — full profiles with addresses, contact persons, custom fields
- 📧 Email notifications — invoice create, update, reminders; per-plan limits enforced
- 🖨️ PDF generation — download or send invoices as PDF (logo, stamp, bank details)
- 🌙 Dark / light mode, fully responsive

### Analytics & Reporting
- 📊 Dashboard charts — line, bar, pie; filter by date range and status
- 📈 Reports — monthly revenue, top clients, outstanding invoices, CSV export

### Billing & Plans
- 💳 Plans: Free · Starter ($9/mo) · Pro ($29/mo) · Business (custom)
- 🔒 Feature gating — analytics, recurring invoices, custom branding unlock by plan
- 📉 Monthly usage tracking — invoice and email counts enforced per plan
- 📬 Upgrade requests — users request a plan change; admin approves or rejects

### Automation
- 🔄 Recurring invoices — monthly, quarterly, or yearly auto-generation
- ⏰ Daily cron — Vercel-scheduled, respects per-plan limits

### Admin Panel
- 🛡️ User management — view all users, change plans, activate/deactivate
- ✏️ Promote / demote admin privileges
- 📋 Review and action pending plan upgrade requests

---

## Tech Stack

- [Next.js 15](https://nextjs.org/) (App Router, Turbopack in dev)
- [PostgreSQL](https://www.postgresql.org/) + [Prisma](https://www.prisma.io/) ORM
- [NextAuth v5](https://authjs.dev/) — magic-link auth
- [Tailwind CSS](https://tailwindcss.com/) + [shadcn/ui](https://ui.shadcn.com/)
- [Recharts](https://recharts.org/) — dashboard charts
- [@react-pdf/renderer](https://react-pdf.org/) — PDF generation
- [Mailhog](https://github.com/mailhog/MailHog) — local email catcher (dev)
- [Vitest](https://vitest.dev/) — unit tests

---

## Project Structure

```
├── app/
│   ├── actions/        # Server actions (invoices, clients, billing, admin, notifications)
│   ├── admin/          # Admin panel (users, user detail)
│   ├── api/
│   │   ├── cron/       # Recurring invoice scheduler
│   │   ├── dashboard/  # Chart data
│   │   ├── invoice/    # Public invoice PDF endpoint
│   │   └── reports/    # CSV export
│   └── dashboard/      # App pages (invoices, clients, reports, recurring, billing, profile)
├── components/         # React components
├── lib/
│   ├── plans.ts        # Plan definitions and feature flags
│   ├── usage.ts        # Monthly usage tracking
│   └── env.ts          # Validated environment variables
├── prisma/
│   ├── schema.prisma   # Database schema
│   ├── migrations/     # Migration history
│   └── seed.mjs        # Admin account seeder
└── types/              # TypeScript type extensions
```

---

## Roadmap

- [ ] Stripe integration for subscription management
- [ ] Multi-line invoice items
- [ ] Multi-user organizations and team management
- [ ] Client-facing portal to view and pay invoices
- [ ] Public API with token authentication

## License

MIT
