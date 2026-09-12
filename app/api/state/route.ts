import { getDemoMode, getMinBid, getState } from "@/lib/store";
import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export async function GET() {
  return NextResponse.json({
    demoMode: getDemoMode(),
    minBid: getMinBid(),
    ...getState(),
  });
}
