import { getStripe, stripeEnabled } from "@/lib/stripe";
import { placeBid } from "@/lib/store";
import { NextResponse } from "next/server";
import type Stripe from "stripe";

export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  if (!stripeEnabled()) {
    return NextResponse.json({ error: "Stripe not configured" }, { status: 501 });
  }

  const stripe = getStripe();
  const sig = req.headers.get("stripe-signature");
  const secret = process.env.STRIPE_WEBHOOK_SECRET;
  if (!sig || !secret) {
    return NextResponse.json({ error: "Missing signature" }, { status: 400 });
  }

  const raw = await req.text();
  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(raw, sig, secret);
  } catch (err) {
    console.error("Webhook signature failed", err);
    return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
  }

  if (event.type === "checkout.session.completed") {
    const session = event.data.object as Stripe.Checkout.Session;
    const meta = session.metadata;
    if (!meta?.brand || !meta.url || !meta.amount) {
      return NextResponse.json({ received: true });
    }

    const amount = parseInt(meta.amount, 10);
    const expectedVersion = meta.version ? parseInt(meta.version, 10) : undefined;
    const withLock = meta.withLock === "1";

    const result = await placeBid({
      brand: meta.brand,
      url: meta.url,
      logoUrl: meta.logoUrl || undefined,
      amount,
      expectedVersion,
      withLock,
    });

    if (!result.ok) {
      console.error("Webhook placeBid failed", result.error);
      return NextResponse.json({ error: result.error }, { status: 500 });
    }
  }

  return NextResponse.json({ received: true });
}
