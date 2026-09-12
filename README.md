# TabTax

Public auction for the indie new-tab creative. Highest bid wins; set `/tab` as your browser homepage to see it cold.

## Stack

- Next.js App Router, TypeScript, Tailwind
- In-memory auction state (resets on serverless cold start — fine for demo)

## Demo mode

Without `STRIPE_SECRET_KEY`, the app runs in **DEMO_MODE**: simulated bids, red banner, no charges.

## Develop

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Deploy

Push to `main`; Vercel builds from git. Min bid = current + $1, floor $5.
