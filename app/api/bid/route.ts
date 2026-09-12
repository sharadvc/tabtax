import { getDemoMode, placeBid } from "@/lib/store";
import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  if (!getDemoMode()) {
    return NextResponse.json(
      { error: "Live payments not configured on this deployment." },
      { status: 501 }
    );
  }

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const { brand, url, logoUrl, amount } = body as Record<string, unknown>;
  const num =
    typeof amount === "number"
      ? amount
      : typeof amount === "string"
        ? parseFloat(amount)
        : NaN;

  if (Number.isNaN(num)) {
    return NextResponse.json({ error: "Invalid amount" }, { status: 400 });
  }

  const result = await placeBid({
    brand: String(brand ?? ""),
    url: String(url ?? ""),
    logoUrl: logoUrl != null ? String(logoUrl) : undefined,
    amount: Math.round(num),
  });

  if (!result.ok) {
    return NextResponse.json({ error: result.error }, { status: 400 });
  }

  return NextResponse.json({ demoMode: true, ...result.state });
}
