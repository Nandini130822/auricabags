# Aurica Bags — e-commerce site

Storefront, customer dashboard, and admin dashboard for **auricabags.com / auricabags.in**.
Built with Next.js 15 (App Router), Tailwind CSS v4, and Supabase (Postgres, Auth, Storage).

## Run locally

```bash

npm install
npm run dev          # http://localhost:3000
```

If `.env.local` has no Supabase keys, the site runs in **demo mode**. Demo mode uses the sample catalogue,
orders, customers, and reviews in memory, so every page works, including checkout and the admin.
Anything you change resets when the server restarts. This mode is for showing the client the flow.

Requires Node 20+ (Node 22 recommended by Supabase).

## Connect Supabase (go live)

1. Create a project at https://supabase.com, then open **SQL Editor**.
2. Run `supabase/schema.sql`. This creates the tables, security policies, the coupon RPC, and the `products` image bucket.
3. Run `supabase/seed.sql` to add the sample categories, products, and coupons. Skip it if you want an empty store.
4. Copy `.env.example` to `.env.local` and fill in the values from **Project Settings → API**:
   `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY`.
5. Restart `npm run dev`, sign in once on the site, then make yourself an admin:
   ```sql
   update public.profiles set role = 'admin' where email = 'you@example.com';
   ```

## Google sign-in

1. In Google Cloud Console, go to **APIs & Services → Credentials → Create OAuth client ID** and choose Web application.
   - Authorised JavaScript origins: `http://localhost:3000` and `https://auricabags.com`
   - Authorised redirect URI: `https://<your-project>.supabase.co/auth/v1/callback`
2. In Supabase, go to **Authentication → Providers → Google**. Enable it and paste the Client ID and Client Secret.
3. In Supabase, go to **Authentication → URL Configuration**:
   - Site URL: `https://auricabags.com`
   - Redirect URLs: `http://localhost:3000/auth/callback`, `https://auricabags.com/auth/callback`, `https://auricabags.in/auth/callback`

Email magic-link sign-in works with no extra setup.

## What's where

| Area | Path |
|---|---|
| Storefront (home, shop, product, cart, checkout) | `src/app/(shop)` |
| Customer dashboard (orders and tracking, wishlist, addresses, profile) | `src/app/(shop)/account` |
| Admin dashboard | `src/app/admin` (`/admin`) |
| Storefront server actions (orders, coupons, reviews, demo payment) | `src/app/actions/shop.ts` |
| Admin server actions | `src/app/actions/admin.ts` |
| Data access, with Supabase or demo fallback | `src/lib/data.ts`, `src/lib/admin-data.ts` |
| Sample catalogue (source for `seed.sql`) | `src/data/catalog.json` → `node scripts/gen-seed.mjs` |
| Database schema and RLS | `supabase/schema.sql` |

## Payments & delivery (demo)

- **Payments:** checkout opens a payment sheet that looks like Razorpay's, in test mode. It can simulate a successful
  or a failed payment and records a row in `payments`. To go live, replace `completeDemoPayment` with Razorpay
  Orders, Checkout.js, and a signature-verified webhook.
- **Delivery:** in the admin, open **Orders → order → Create shipment**. It gives courier quotes, generates an AWB, prints a label,
  and has an "advance status" button that simulates courier webhooks. Customers see the tracking timeline in
  their account. To go live, swap in the Shiprocket API (`/courier/serviceability`, `/orders/create/adhoc`, tracking webhooks).

## Replacing the catalogue

Product images are placeholder photos from Unsplash. When the client sends the real catalogue, you can either:
- add products in **Admin → Products → New** (images upload to Supabase Storage), or
- edit `src/data/catalog.json`, run `node scripts/gen-seed.mjs`, and re-run `seed.sql`.

## Deploy

Import this repo in Vercel (framework: Next.js, root directory: default). Add the same env vars, plus `NEXT_PUBLIC_SITE_URL=https://auricabags.com`.
Point both domains at the project and pick one as primary, then redirect the other to it.
