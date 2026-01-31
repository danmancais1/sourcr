# Sourcr – UK Property Sourcing & Quiet-Sale Marketplace

Production-ready MVP SaaS for investors (leads, distress scoring, compliant outreach) and landlords (Quiet Sale submission, matching, messaging).

## Stack

- **Next.js** (App Router) + TypeScript
- **Supabase** (Auth, Postgres, Storage, RLS)
- **Stripe** (subscriptions Starter/Pro, customer portal, webhooks)
- **UI**: shadcn/ui + Tailwind; theme: `#363020`, `#605C4E`, `#A49966`, `#C7C7A6`, `#EAFFDA`

## Prerequisites

- Node.js 18+
- npm or pnpm
- Supabase account
- Stripe account

---

## 1) Create Supabase project, run migrations, set RLS

1. Go to [supabase.com](https://supabase.com) and create a new project.
2. In **Project Settings → API**, copy:
   - **Project URL** → `NEXT_PUBLIC_SUPABASE_URL`
   - **anon public** key → `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - **service_role** key → `SUPABASE_SERVICE_ROLE_KEY` (keep secret)
3. In **SQL Editor**, run the contents of `supabase/migrations/20250101000000_initial_schema.sql` (creates all tables and RLS).
4. In **Authentication → Providers**, enable Email (and optionally others). Set **Site URL** and **Redirect URLs** to your app URL (e.g. `http://localhost:3000`, `https://your-app.vercel.app`).

---

## 2) Create Stripe products/prices, set webhooks

1. In [Stripe Dashboard](https://dashboard.stripe.com):
   - **Products**: create two products, e.g. "Starter" and "Pro".
   - For each, add a **recurring price** (e.g. £29/month, £79/month) and copy the **Price ID**.
   - Set `STRIPE_STARTER_PRICE_ID` and `STRIPE_PRO_PRICE_ID` in env.
2. **Developers → API keys**: copy **Secret key** → `STRIPE_SECRET_KEY`.
3. **Developers → Webhooks**: Add endpoint:
   - URL: `https://your-app.vercel.app/api/webhooks/stripe` (or `http://localhost:3000/api/webhooks/stripe` for local testing with Stripe CLI).
   - Events: `checkout.session.completed`, `customer.subscription.updated`, `customer.subscription.deleted`.
   - Copy **Signing secret** → `STRIPE_WEBHOOK_SECRET`.

---

## 3) Add env vars

1. Copy `.env.example` to `.env.local`.
2. Fill in all required values (Supabase URL/keys, Stripe keys/price IDs, `NEXT_PUBLIC_APP_URL`).
3. Optional: API keys for Companies House, EPC, Resend, Twilio (can also be validated and stored per workspace in **Settings → API keys**).

---

## 4) Run locally

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000). Sign up, create a workspace (onboarding will redirect to Stripe checkout). After payment, you can use Dashboard, Leads, Pipeline, Campaigns, Templates, Direct Sellers, Messaging, Settings.

### Seed demo data

After at least one user exists (sign up once):

```bash
npm run seed
```

This creates a workspace, 15 leads, 5 landlord submissions, 6 investor buy boxes, and 3 matches.

---

## 5) Deploy to Vercel

1. Push the repo to GitHub and import the project in [Vercel](https://vercel.com).
2. Add all env vars from `.env.example` in **Project Settings → Environment Variables**.
3. Deploy. Set **Root Directory** to the repo root.
4. In Supabase **Authentication → URL Configuration**, set **Site URL** and **Redirect URLs** to your Vercel URL (e.g. `https://sourcr.vercel.app`).
5. In Stripe **Webhooks**, set the endpoint URL to `https://your-vercel-domain.vercel.app/api/webhooks/stripe`.

### Cron: Refresh PPD (Land Registry Price Paid Data)

To refresh PPD on a schedule (e.g. monthly):

1. In Vercel **Project → Settings → Cron Jobs**, add a cron job:
   - Path: `/api/cron/refresh-ppd`
   - Schedule: e.g. `0 0 1 * *` (1st of month at midnight).
2. Set `CRON_SECRET` in env and configure the cron to send `Authorization: Bearer <CRON_SECRET>`.

Alternatively, use **Settings → Land Registry PPD → Refresh PPD (manual)** in the app (requires an authenticated workspace).

---

## Core flows

- **Investors**: Dashboard → Leads (import CSV, filters) → Pipeline (kanban) → Campaigns (templates, assisted send) → Direct Sellers (matches) → Messaging.
- **Landlords**: Public **Quiet Sale** form → submission → matching to investors → messaging.
- **Settings**: Workspace name, API keys (Companies House, EPC, Resend, Twilio) with validation, billing (Stripe customer portal), Land Registry PPD refresh.

## Integrations (real, no placeholders)

- **Companies House API**: company search, profile, insolvency, charges (API key in Settings).
- **EPC Open Data**: domestic EPC by postcode/address (email:key in Settings).
- **The Gazette**: insolvency notices search (company/director name).
- **Land Registry PPD**: CSV import, postcode sector median and last 10 sales (comps).

## Outreach & compliance

- **Letters**: PDF from templates (assisted send).
- **Email / SMS**: Resend and Twilio; assisted sending only by default; suppression list, opt-out, audit log, daily limits (Starter 25, Pro 200); block unless `consent_status = consented` or B2B basis confirmed on campaign.

## Errors

Errors are logged with clear messages (context: `userId`, `workspaceId`, operation). Check server logs and Supabase/Stripe dashboards for details.
