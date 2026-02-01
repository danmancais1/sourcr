# Prop IX

UK property sourcing and quiet-sale marketplace for investors and sellers. Next.js App Router, TypeScript, Supabase (Auth + Postgres + RLS), Stripe subscriptions.

## Prerequisites

- Node.js 18+
- Supabase project
- Stripe account

## Local setup

1. **Clone and install**
   ```bash
   git clone <repo-url>
   cd Sourcer
   npm install
   ```

2. **Environment**
   - Copy `.env.example` to `.env.local`
   - Fill in Supabase URL and keys (Dashboard → Settings → API)
   - Fill in Stripe keys and Price IDs (Dashboard → Developers → API keys; Products → copy Price IDs)
   - Set `NEXT_PUBLIC_APP_URL=http://localhost:3000`

3. **Supabase database**
   ```bash
   npx supabase login
   npx supabase link --project-ref <YOUR_PROJECT_REF>
   npx supabase db push
   ```
   Create an `avatars` bucket in Supabase Dashboard → Storage (public) for profile photos.

4. **Stripe webhook (local)**
   - Install Stripe CLI, then: `stripe listen --forward-to localhost:3000/api/webhooks/stripe`
   - Copy the webhook signing secret into `.env.local` as `STRIPE_WEBHOOK_SECRET`

5. **Run**
   ```bash
   npm run dev
   ```
   Open [http://localhost:3000](http://localhost:3000).

## Deploy to production (Vercel)

1. **Push code**
   ```bash
   git add .
   git commit -m "Prepare production deploy"
   git push origin main
   ```

2. **Vercel**
   - Go to [vercel.com](https://vercel.com) and import your repo (or connect existing project)
   - Framework: **Next.js** (auto-detected)
   - Add **Environment Variables** (Settings → Environment Variables). Use the same names as `.env.example`; set all required vars for **Production** (and Preview if you use preview deploys):
     - `NEXT_PUBLIC_SUPABASE_URL`
     - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
     - `SUPABASE_SERVICE_ROLE_KEY`
     - `NEXT_PUBLIC_APP_URL` → your production URL (e.g. `https://your-app.vercel.app`)
     - `STRIPE_SECRET_KEY`
     - `STRIPE_WEBHOOK_SECRET` (production webhook secret; see step 3)
     - `STRIPE_STARTER_PRICE_ID`
     - `STRIPE_PRO_PRICE_ID`
   - Deploy. After the first deploy, note your production URL.

3. **Stripe production webhook**
   - Stripe Dashboard → Developers → Webhooks → Add endpoint
   - URL: `https://<your-production-domain>/api/webhooks/stripe`
   - Events: `checkout.session.completed`, `customer.subscription.updated`, `customer.subscription.deleted`
   - Copy the **Signing secret** and set it as `STRIPE_WEBHOOK_SECRET` in Vercel (Production), then redeploy if needed.

4. **Supabase**
   - Ensure all migrations are applied (e.g. run `npx supabase db push` from your machine with the same linked project)
   - In Authentication → URL Configuration, set **Site URL** to your production URL and add it to **Redirect URLs**

5. **Optional**
   - Resend/Twilio: set `RESEND_API_KEY`, `RESEND_FROM`, `TWILIO_*` in Vercel if you use email/SMS
   - Cron: set `CRON_SECRET` if you use the refresh-ppd cron route

## Scripts

| Command        | Description              |
|----------------|--------------------------|
| `npm run dev`  | Start dev server         |
| `npm run build`| Production build         |
| `npm run start`| Start production server  |
| `npm run db:push` | Apply Supabase migrations |

## Env reference

See `.env.example` for all variable names. Required for minimal run: Supabase (URL + anon + service role), `NEXT_PUBLIC_APP_URL`, Stripe (secret, webhook secret, both price IDs).
