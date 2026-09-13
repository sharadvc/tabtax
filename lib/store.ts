/**
 * Auction state — durable via GitHub Contents API when a token is set;
 * otherwise module-level memory (not shared across serverless instances).
 */

import { isLocked, lockPriceFromAmount } from "./lock";
import {
  isPersistenceEnabled,
  loadPersistedState,
  readForUpdate,
  savePersistedState,
} from "./persist";

export type BidEntry = {
  id: string;
  brand: string;
  url: string;
  logoUrl?: string;
  amount: number;
  at: string;
  /** Brand evicted by this bid (steal feed) */
  stoleFrom?: string;
  kind?: "steal" | "lock";
};

export type FounderEntry = {
  rank: number;
  brand: string;
  url: string;
  logoUrl?: string;
  amount: number;
  at: string;
};

export type AuctionState = {
  version: number;
  currentBid: number;
  winner: {
    brand: string;
    url: string;
    logoUrl?: string;
    amount: number;
  } | null;
  lock: {
    unlockAt: string;
    lockPaid: number;
  } | null;
  founders: FounderEntry[];
  history: BidEntry[];
};

const FLOOR = 5;
const MAX_FOUNDERS = 10;
const LOCK_HOURS = 24;

let memoryState: AuctionState = {
  version: 0,
  currentBid: 0,
  winner: null,
  lock: null,
  founders: [],
  history: [],
};

export function getDemoMode(): boolean {
  return !process.env.STRIPE_SECRET_KEY;
}

export function persistenceActive(): boolean {
  return isPersistenceEnabled();
}

function migrateState(raw: Partial<AuctionState> & Record<string, unknown>): AuctionState {
  return {
    version: typeof raw.version === "number" ? raw.version : 0,
    currentBid: typeof raw.currentBid === "number" ? raw.currentBid : 0,
    winner: (raw.winner as AuctionState["winner"]) ?? null,
    lock: (raw.lock as AuctionState["lock"]) ?? null,
    founders: Array.isArray(raw.founders) ? (raw.founders as FounderEntry[]) : [],
    history: Array.isArray(raw.history) ? (raw.history as BidEntry[]) : [],
  };
}

function normalizeState(state: AuctionState): AuctionState {
  const locked = isLocked(state);
  return {
    version: state.version,
    currentBid: Math.max(state.currentBid, state.winner?.amount ?? 0),
    winner: state.winner,
    lock: locked ? state.lock : null,
    founders: [...state.founders].slice(0, MAX_FOUNDERS),
    history: [...state.history].slice(-50).reverse(),
  };
}

export async function getState(): Promise<AuctionState> {
  const persisted = await loadPersistedState();
  if (persisted) {
    return normalizeState(migrateState(persisted));
  }
  return normalizeState(memoryState);
}

function minBidFrom(state: AuctionState): number {
  if (isLocked(state)) {
    return Infinity;
  }
  const high = Math.max(state.currentBid, state.winner?.amount ?? 0);
  const next = high + 1;
  return Math.max(FLOOR, next);
}

export async function getMinBid(): Promise<number> {
  const state = await getState();
  const min = minBidFrom(state);
  return min === Infinity ? 0 : min;
}

function maybeAddFounder(state: AuctionState, entry: Omit<FounderEntry, "rank">): void {
  if (state.founders.length >= MAX_FOUNDERS) {
    return;
  }
  const exists = state.founders.some(
    (f) => f.brand.toLowerCase() === entry.brand.toLowerCase()
  );
  if (exists) {
    return;
  }
  state.founders.push({
    rank: state.founders.length + 1,
    ...entry,
  });
}

export type PlaceBidInput = {
  brand: string;
  url: string;
  logoUrl?: string;
  amount: number;
  expectedVersion?: number;
  withLock?: boolean;
};

async function loadWorkingState(): Promise<{
  working: AuctionState;
  sha: string | null;
}> {
  if (isPersistenceEnabled()) {
    const loaded = await readForUpdate();
    if (!loaded) {
      return {
        working: migrateState({ ...memoryState, history: [...memoryState.history] }),
        sha: null,
      };
    }
    return {
      working: migrateState({ ...loaded.state, history: [...loaded.state.history] }),
      sha: loaded.sha,
    };
  }
  const persisted = await loadPersistedState();
  if (persisted) {
    return {
      working: migrateState({ ...persisted, history: [...persisted.history] }),
      sha: null,
    };
  }
  return { working: memoryState, sha: null };
}

async function commitState(working: AuctionState, sha: string | null): Promise<boolean> {
  if (isPersistenceEnabled()) {
    return savePersistedState(working, sha);
  }
  memoryState = working;
  return true;
}

export async function placeBid(
  input: PlaceBidInput
): Promise<
  | { ok: true; state: AuctionState }
  | { ok: false; error: string; code?: "stale" | "locked" }
> {
  let { working, sha } = await loadWorkingState();

  if (
    input.expectedVersion !== undefined &&
    input.expectedVersion !== working.version
  ) {
    return { ok: false, error: "State changed — refresh and try again", code: "stale" };
  }

  if (isLocked(working)) {
    const until = working.lock?.unlockAt
      ? new Date(working.lock.unlockAt).toLocaleString()
      : "later";
    return {
      ok: false,
      error: `Tab is locked until ${until}. No steals until countdown ends.`,
      code: "locked",
    };
  }

  const high = Math.max(working.currentBid, working.winner?.amount ?? 0);
  const min = minBidFrom(working);

  if (input.withLock) {
    const lockDue = lockPriceFromAmount(high);
    if (input.amount < lockDue) {
      return { ok: false, error: `24h lock requires $${lockDue}` };
    }
  } else if (input.amount < min) {
    return { ok: false, error: `Minimum steal bid is $${min}` };
  }

  const prevBrand = working.winner?.brand;
  const stoleFrom = prevBrand && prevBrand !== input.brand.trim() ? prevBrand : undefined;

  working.version += 1;
  working.currentBid = input.amount;
  working.winner = {
    brand: input.brand.trim(),
    url: input.url,
    logoUrl: input.logoUrl?.trim() || undefined,
    amount: input.amount,
  };

  if (input.withLock) {
    const unlockAt = new Date(Date.now() + LOCK_HOURS * 60 * 60 * 1000).toISOString();
    working.lock = { unlockAt, lockPaid: input.amount };
  } else if (!isLocked(working)) {
    working.lock = null;
  }

  const entry: BidEntry = {
    id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    brand: working.winner.brand,
    url: working.winner.url,
    logoUrl: working.winner.logoUrl,
    amount: input.amount,
    at: new Date().toISOString(),
    stoleFrom,
    kind: input.withLock ? "lock" : "steal",
  };
  working.history = [...working.history, entry];

  maybeAddFounder(working, {
    brand: working.winner.brand,
    url: working.winner.url,
    logoUrl: working.winner.logoUrl,
    amount: input.amount,
    at: entry.at,
  });

  if (isPersistenceEnabled()) {
    let saved = await commitState(working, sha);
    if (!saved) {
      const retry = await loadWorkingState();
      if (
        input.expectedVersion !== undefined &&
        retry.working.version !== input.expectedVersion
      ) {
        return { ok: false, error: "State changed — refresh and try again", code: "stale" };
      }
      working = retry.working;
      const minRetry = input.withLock
        ? lockPriceFromAmount(Math.max(working.currentBid, working.winner?.amount ?? 0))
        : minBidFrom(working);
      if (input.amount < minRetry) {
        return { ok: false, error: `Minimum bid is now $${minRetry}` };
      }
      working.version += 1;
      working.currentBid = input.amount;
      working.winner = {
        brand: input.brand.trim(),
        url: input.url,
        logoUrl: input.logoUrl?.trim() || undefined,
        amount: input.amount,
      };
      if (input.withLock) {
        working.lock = {
          unlockAt: new Date(Date.now() + LOCK_HOURS * 60 * 60 * 1000).toISOString(),
          lockPaid: input.amount,
        };
      }
      working.history = [...working.history, entry];
      maybeAddFounder(working, {
        brand: working.winner.brand,
        url: working.winner.url,
        logoUrl: working.winner.logoUrl,
        amount: input.amount,
        at: entry.at,
      });
      saved = await commitState(working, retry.sha);
      if (!saved) {
        return { ok: false, error: "Could not save bid — try again" };
      }
    }
  } else {
    memoryState = working;
  }

  return { ok: true, state: normalizeState(working) };
}

export { FLOOR, MAX_FOUNDERS };
