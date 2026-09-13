# TabTax v2 — launch flex

## Live

- Production: https://tabtax-live.vercel.app
- Chrome homepage: `https://tabtax-live.vercel.app/tab`
- Repo: https://github.com/sharadvc/tabtax (`main`)

## v2 tweet (copy flex)

```
TabTax v2: steal the indie new tab in public.

→ Outbid = instant eviction (kill feed on homepage)
→ Whale SKU: 24h lock — nobody steals you until timer ends
→ First 10 winners → permanent /founders badge

I'm flexing: https://tabtax-live.vercel.app
```

With a winner, hit **Copy flex** on the homepage for tweet text + OG link.

## Demo vs live $

| Env | Effect |
|-----|--------|
| No `STRIPE_SECRET_KEY` | Red DEMO banner; `/api/bid` simulates steals + locks (same state machine) |
| `STRIPE_SECRET_KEY` + `STRIPE_WEBHOOK_SECRET` | `/api/checkout` → Stripe; webhook confirms → winner written |
| `TABTAX_GITHUB_TOKEN` or `GITHUB_TOKEN` | Auction state persists to `data/auction.json` on `main` (optimistic `version`) |
| `NEXT_PUBLIC_SITE_URL` | Canonical URLs for OG + checkout redirects (optional; defaults to Vercel prod URL) |

## Stripe webhook

Point Stripe to: `https://tabtax-live.vercel.app/api/webhooks/stripe`  
Events: `checkout.session.completed`

## Verify after deploy

1. `GET /api/state` — `version`, `founders`, `lockPrice`
2. Demo steal — kill feed shows “X stole from Y for $Z”
3. Demo lock — countdown on `/` and `/tab`
4. `GET /api/og?brand=You&amount=99` — brutalist image
5. `/founders` — EggCo seed founder #1

## Build

```bash
npm run build
```
