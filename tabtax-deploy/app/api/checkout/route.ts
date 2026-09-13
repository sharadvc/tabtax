import { lockPrice } from "@/lib/lock";
import { getMinBid, getState } from "@/lib/store";
import { getStripe, siteUrl, stripeEnabled } from "@/lib/stripe";
import { parseBidBody } from "@/lib/validate";
import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  if (!stripeEnabled()) {
    return NextResponse.json({ error: "Stripe not configured" }, { status: 501 });
  }

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const parsed = parseBidBody(body);
  if ("error" in parsed) {
    return NextResponse.json({ error: parsed.error }, { status: 400 });
  }

  const state = await getState();
  const withLock = parsed.lock === true;
  const minBid = await getMinBid();
  const due = withLock ? lockPrice(state) : Math.max(minBid, parsed.amount);

  if (Math.round(parsed.amount) < due) {
    return NextResponse.json(
      { error: withLock ? `24h lock requires $${due}` : `Minimum bid is $${due}` },
      { status: 400 }
    );
  }

  const base = siteUrl();
  const stripe = getStripe();

  const session = await stripe.checkout.sessions.create({
    mode: "payment",
    success_url: `${base}/?paid=1&session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: `${base}/?cancel=1`,
    line_items: [
      {
        price_data: {
          currency: "usd",
          unit_amount: Math.round(parsed.amount) * 100,
          product_data: {
            name: withLock ? "TabTax — 24h lock + tab" : "TabTax — steal the tab",
            description: withLock
              ? "Own /tab for 24h. No outbids until unlock."
              : `Public eviction bid for ${parsed.brand}`,
          },
        },
        quantity: 1,
      },
    ],
    metadata: {
      brand: parsed.brand,
      url: parsed.url,
      logoUrl: parsed.logoUrl ?? "",
      amount: String(Math.round(parsed.amount)),
      version: String(parsed.version ?? state.version),
      withLock: withLock ? "1" : "0",
    },
  });

  return NextResponse.json({ url: session.url, sessionId: session.id });
}
