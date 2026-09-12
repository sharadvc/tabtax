import { getDemoMode, getMinBid, getState, persistenceActive } from "@/lib/store";
import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export async function GET() {
  const state = await getState();
  const minBid = await getMinBid();
  return NextResponse.json({
    demoMode: getDemoMode(),
    persistence: persistenceActive(),
    minBid,
    ...state,
  });
}
