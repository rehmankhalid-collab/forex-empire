# Forex Empire

A real storefront for Forex Empire's products — modeled on the existing
[Whop store](https://whop.com/forex-empire-88/) — built as an actual
Next.js app instead of a hosted platform:

- **Premium Forex & XAUUSD Signals** — subscription (weekly / monthly / yearly)
- **Tradingview indicator/script** — one-time purchase
- **Join Our Discord For Free** — free membership

It has real accounts, real Stripe checkout, gated content that only unlocks
after purchase, and a built-in affiliate program with commission tracking.

## Stack

- Next.js (App Router) + TypeScript + Tailwind CSS
- Prisma 7 + Postgres (e.g. [Neon](https://neon.tech))
- Auth.js (NextAuth v5) with email/password credentials
- Stripe Checkout for payments + webhooks for fulfillment

## Getting started

```bash
npm install
cp .env.example .env   # fill in DATABASE_URL and AUTH_SECRET
npx prisma migrate deploy
npx prisma db seed
npm run dev
```

Open http://localhost:3000.

Seeded accounts:

- Admin: `admin@forexempire.com` / `admin12345` — visit `/admin`
- Sign up your own customer account at `/register`

### Environment variables

| Variable | Required | Notes |
| --- | --- | --- |
| `DATABASE_URL` | yes | Postgres connection string (Neon, Supabase, etc.) |
| `AUTH_SECRET` | yes | `openssl rand -base64 32` |
| `STRIPE_SECRET_KEY` | for paid checkout | Stripe **test** secret key |
| `STRIPE_WEBHOOK_SECRET` | for paid checkout | from `stripe listen` (below) |

Without Stripe keys, the free product ("Join Our Discord") still works end
to end; paid products return a clear "payments aren't configured" message
instead of erroring.

### Testing Stripe payments locally

```bash
stripe listen --forward-to localhost:3000/api/webhooks/stripe
# copy the printed whsec_... into STRIPE_WEBHOOK_SECRET
```

Use Stripe's test card `4242 4242 4242 4242`, any future expiry, any CVC.

## How it works

- **Products & plans** live in `prisma/schema.prisma`. Each product has one
  or more `Plan`s (a price + billing interval). Subscriptions get multiple
  plans (weekly/monthly/yearly); the indicator is a single one-time plan;
  Discord is a single free plan.
- **Checkout** (`/api/checkout`) creates a Stripe Checkout Session for paid
  plans, or records a `Purchase` directly for free ones. Stripe's webhook
  (`/api/webhooks/stripe`) creates the `Purchase` row once payment is
  confirmed, and pays out a 20% affiliate commission if the buyer arrived
  via a `?ref=` link.
- **Gated content** — each `Product.deliveryContent` (the Discord invite,
  signals channel link, indicator setup steps) only renders on the product
  page and dashboard once a matching `Purchase` exists for the signed-in
  user.
- **Affiliates** — any signed-in user can generate a referral code at
  `/dashboard/affiliate` and share `/products/<slug>?ref=<code>`. Referred
  purchases create a `Commission` row the admin can mark paid.
- **Admin** (`/admin`, role `ADMIN` only) shows total revenue, sales per
  product, the member list, and commissions owed.

## Notes

- This is a single-seller storefront for Forex Empire specifically (not a
  multi-tenant marketplace like Whop itself).
- `deliveryContent` for each product is a realistic placeholder — replace it
  with your real Discord invite, Telegram channel, and indicator delivery
  instructions via Prisma Studio (`npx prisma studio`) or by editing
  `prisma/seed.ts` and re-seeding.
- Deployed on Vercel: since serverless functions don't have a persistent
  filesystem, `DATABASE_URL` must point at a real Postgres instance (not a
  local file) — set it in the Vercel project's Environment Variables.
