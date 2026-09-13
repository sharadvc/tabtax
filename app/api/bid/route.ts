import { rateLimitBid } from "@/lib/ratelimit";
import { getDemoMode, placeBid } from "@/lib/store";
import { parseBidBody } from "@/lib/validate";
import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  if (!getDemoMode()) {
    return NextResponse.json(
      { error: "Use Stripe checkout for live bids." },
      { status: 400 }
    );
  }

  const limited = rateLimitBid(req);
  if (!limited.ok) {
    return NextResponse.json(
      { error: "Too many bids — slow down" },
      { status: 429, headers: { "Retry-After": String(limited.retryAfter) } }
    );
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

  const result = await placeBid({
    brand: parsed.brand,
    url: parsed.url,
    logoUrl: parsed.logoUrl,
    amount: Math.round(parsed.amount),
    expectedVersion: parsed.version,
    withLock: parsed.lock === true,
  });

  if (!result.ok) {
    const status = result.code === "stale" ? 409 : 400;
    return NextResponse.json({ error: result.error, code: result.code }, { status });
  }

  return NextResponse.json({ demoMode: true, ...result.state });
}
