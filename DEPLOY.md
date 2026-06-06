# Bridal OS — Deploy & QA Runbook

One followable path from a clean machine to a live URL you can demo. Most of
this requires **interactive logins** (Convex, Vercel) that must be run by a human
in a real terminal — they can't be automated headlessly.

---

## 0. Prereqs

- Node + this repo on branch `pilot/bridal-live-addon`.
- A **Convex** account, a **Clerk** app, **Stripe** (test mode is fine),
  **Resend**, and a **Vercel** account.
- `cp .env.example .env.local` (Convex CLI will fill the Convex bits in step 1).

---

## 1. Link Convex + regenerate types + push backend (DEV)

```bash
npx convex dev --once --configure
```

This logs you in, creates/links the Convex project, writes
`NEXT_PUBLIC_CONVEX_URL` + `CONVEX_DEPLOYMENT` into `.env.local`, regenerates
`convex/_generated/`, and pushes the functions to your **dev** deployment.

> ⛔ This is the step that has been blocking everything — it needs a browser
> login and can't run in CI/headless.

## 2. Set Convex deployment secrets

Read by `convex/` functions (NOT by Next.js):

```bash
npx convex env set SITE_URL https://YOUR-VERCEL-DOMAIN
npx convex env set STRIPE_SECRET_KEY sk_test_...
npx convex env set STRIPE_WEBHOOK_SECRET whsec_...
npx convex env set RESEND_API_KEY re_...
```

## 3. Push backend to PRODUCTION

```bash
npx convex deploy
```

Note the **production** `https://<name>.convex.cloud` URL it prints — that's the
`NEXT_PUBLIC_CONVEX_URL` for Vercel (the prod one, not the dev one from step 1).

## 4. Deploy the frontend (Vercel)

```bash
vercel link            # pick/create the bridal-os project
# set Production env vars (dashboard or `vercel env add ... production`):
#   NEXT_PUBLIC_CONVEX_URL            <- prod URL from step 3
#   NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY
#   CLERK_SECRET_KEY
vercel deploy --prod
```

Then set `SITE_URL` (step 2) to the real Vercel domain and re-run
`npx convex deploy` if it was a placeholder.

---

## Env var matrix (who reads what)

| Variable | Lives in | Used by |
|---|---|---|
| `NEXT_PUBLIC_CONVEX_URL` | Vercel + `.env.local` | Next.js → Convex client |
| `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` | Vercel + `.env.local` | Clerk (browser) |
| `CLERK_SECRET_KEY` | Vercel + `.env.local` | Clerk (server) |
| `CONVEX_DEPLOYMENT` | `.env.local` only | Convex CLI (don't set in Vercel) |
| `SITE_URL` | Convex env | portal + Stripe return links |
| `STRIPE_SECRET_KEY` | Convex env | checkout sessions |
| `STRIPE_WEBHOOK_SECRET` | Convex env | webhook verification |
| `RESEND_API_KEY` | Convex env | transactional email |

---

## ⚠️ Two gotchas that will silently break QA

1. **Clerk issuer domain is hardcoded.** `convex/auth.config.ts` pins
   `domain: "https://still-thrush-91.clerk.accounts.dev"`. The Clerk instance
   behind your publishable key **must** issue JWTs from that same domain, with a
   JWT template named **`convex`**. If they don't match, login *succeeds* but the
   dashboard shows **no data** (Convex rejects the token). Update that domain to
   match your Clerk instance if you're not using `still-thrush-91`.

2. **Stripe webhook URL.** Point the Stripe webhook at the Convex **HTTP actions**
   host, not the deployment host:
   `https://<your-deployment>.convex.site/stripe-webhook`
   (`.convex.site`, not `.convex.cloud`). Without a matching
   `STRIPE_WEBHOOK_SECRET`, the endpoint **fails safely** (returns 500, payments
   just don't auto-mark paid) — by design.

---

## Post-deploy QA — core path only

Run against the live Vercel URL. Don't QA edge features; prove the demo path.

- [ ] **Homepage** `/` loads — headline "A calmer bride journey from sale to
      pickup", no console errors.
- [ ] **Sign up / log in** `/sign-up` → redirects to `/onboarding`.
      *(If dashboard is empty after login → gotcha #1.)*
- [ ] **Dashboard** `/dashboard` loads with pulse/metrics.
- [ ] **Add a bride** (onboarding **Skip** seeds a sample bride, or add one).
- [ ] **Document upload** — bride → Details → Documents → upload a PDF: no crash.
- [ ] **Bride page** — click **Portal link**, open `/p/<token>`: renders.
- [ ] **Confirm measurements** in the portal → shows "Confirmed".
- [ ] **Stripe** — Pay Now opens test checkout, or fails safely if Stripe unset.

**Demo portal URL pattern:** `https://<prod-domain>/p/<token>` — get the
`<token>` from the dashboard bride card's **Portal link** button. Tokens are
secure/random by design, so there's no fixed demo link.

---

## Then: stop deploying, start discovery

Build is green and tsc is clean today. Once the core path passes, **freeze the
product** and run the 20 discovery calls in `PILOT_OUTREACH.md`. No more product
work until the same pain shows up repeatedly. The bar: **5 owners who'd pay
$49–$99/mo because their bride journey still leaks outside their current system.**
