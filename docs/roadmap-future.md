# Future roadmap

Future epics only. Features already shipped in the app are listed in [AGENTS.md](../AGENTS.md) and the codebase — not duplicated here.

## Epic 1: Subscription management (Stripe)

- [ ] Integrate Stripe for payments
- [ ] Handle subscription lifecycle events (renewal, cancellation, failed payment)
- [ ] Store subscription data in database
- [ ] Stripe webhooks for plan changes

## Epic 2: Admin enhancements

- [ ] User impersonation for support
- [ ] Revenue analytics dashboard
- [ ] Advanced usage analytics beyond current billing page

## Epic 3: Multi-tenant / organizations

- [ ] Organization management
- [ ] Team member roles and permissions
- [ ] White-labeling (branding per org)
- [ ] Custom domain support

## Epic 4: Notifications and alerts (email)

- [ ] Usage alert emails (approaching invoice/email limits)
- [ ] Billing notification emails
- [ ] Subscription reminder emails
- [ ] Admin alert emails for platform events

(Current in-app notifications via `Notification` model and bell UI are shipped — this epic is outbound email beyond failure notifications.)

## Milestones

TBD — no fixed dates. Prioritize Stripe integration and subscription lifecycle before multi-tenant work.

## Resources needed

- Stripe developer account
- Webhook endpoint infrastructure
- Email templates for billing/usage alerts
