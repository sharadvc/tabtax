import type { AuctionState } from "./store";

export function isLocked(state: AuctionState): boolean {
  if (!state.lock?.unlockAt) {
    return false;
  }
  return new Date(state.lock.unlockAt).getTime() > Date.now();
}

export function lockPriceFromAmount(currentHigh: number): number {
  return Math.max(currentHigh * 3, currentHigh + 25);
}

export function lockPrice(state: AuctionState): number {
  const high = Math.max(state.currentBid, state.winner?.amount ?? 0);
  return lockPriceFromAmount(high);
}

export function msUntilUnlock(state: AuctionState): number {
  if (!state.lock?.unlockAt) {
    return 0;
  }
  return Math.max(0, new Date(state.lock.unlockAt).getTime() - Date.now());
}
