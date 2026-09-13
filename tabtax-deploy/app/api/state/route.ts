import { isLocked, lockPrice, msUntilUnlock } from "@/lib/lock";
import { getDemoMode, getMinBid, getState, persistenceActive } from "@/lib/store";
import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export async function GET() {
  const state = await getState();
  const minBid = await getMinBid();
  const locked = isLocked(state);
  return NextResponse.json({
    demoMode: getDemoMode(),
    persistence: persistenceActive(),
    minBid,
    lockPrice: lockPrice(state),
    locked,
    lockMsRemaining: locked ? msUntilUnlock(state) : 0,
    unlockAt: state.lock?.unlockAt ?? null,
    ...state,
  });
}
