# InvoiceWeMaAd

A modern invoice management application built with Next.js, allowing users to create, manage and track invoices efficiently.

## Features

- 🔐 Secure Authentication
- 📊 Dashboard Analytics
- 💰 Invoice Management
- 📧 Email Notifications
- 🌙 Light/Dark Mode
- 📱 Responsive Design

## Tech Stack

- [Next.js 15](https://nextjs.org/) - React Framework
- [Prisma](https://www.prisma.io/) - Database ORM
- [TypeScript](https://www.typescriptlang.org/) - Type Safety
- [Tailwind CSS](https://tailwindcss.com/) - Styling
- [Shadcn/ui](https://ui.shadcn.com/) - UI Components
- [Mailtrap](https://mailtrap.io/) - Email Testing
- [PostgreSQL](https://www.postgresql.org/) - Database

## Getting Started

1. Clone the repository:

```bash
git clone https://github.com/yourusername/invoice-wemaad.git
```

cd invoice-wemaad

2. Install the dependencies:

```bash
pnpm install
```

or

```bash
bun install
```

3. Set up your environment variables:

Create a `.env` file in the root directory and add your environment variables as per the `.env.example` file.

4. Run the development server:

```bash
pnpm run dev
```

5. Visit `http://localhost:3000` in your browser to see the app.

## Project Structure

```
├── app/ # Next.js app directory
│ ├── actions/ # Server actions
│ ├── api/ # API routes
│ ├── dashboard/ # Dashboard pages
│ ├── onboarding/ # Onboarding flow
│ ├── verify/ # Verify email
│ ├── login/ # Login flow
├── config/ # Configuration files
├── components/ # React components
├── lib/ # Utility functions
├── prisma/ # Database schema
├── public/ # Static assets
├── types/ # TypeScript types
└── .env # Environment variables
```

## List of future features

- [ ] Add Stripe integration for payment processing
- [ ] Add user profile page
- [ ] Add invoice history
- [ ] Add invoice templates
- [ ] White label for clients
- [ ] Make the app SaaS ready like adding organizations, user management, pricing plans, subscription management, etc.
- [ ] Add a dashboard for clients to manage their invoices
- [ ] Add a dashboard for clients to manage their payments
- [ ] Add a dashboard for clients to manage their clients
- [ ] Add a dashboard for clients to manage their team
- [ ] Add a dashboard for clients to manage their documents
- [ ] Add a dashboard for us to mangage the SaaS app

## Contributing

Contributions are welcome! Please feel free to submit a PR.

## License

This project is open-sourced under the MIT License - see the LICENSE file for details.
