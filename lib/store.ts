/**
 * Auction state — durable via GitHub Contents API when a token is set;
 * otherwise module-level memory (not shared across serverless instances).
 */

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
};

export type AuctionState = {
  currentBid: number;
  winner: {
    brand: string;
    url: string;
    logoUrl?: string;
    amount: number;
  } | null;
  history: BidEntry[];
};

const FLOOR = 5;

let memoryState: AuctionState = {
  currentBid: 0,
  winner: null,
  history: [],
};

export function getDemoMode(): boolean {
  return !process.env.STRIPE_SECRET_KEY;
}

export function persistenceActive(): boolean {
  return isPersistenceEnabled();
}

function normalizeState(state: AuctionState): AuctionState {
  return {
    currentBid: Math.max(state.currentBid, state.winner?.amount ?? 0),
    winner: state.winner,
    history: [...state.history].slice(-50).reverse(),
  };
}

export async function getState(): Promise<AuctionState> {
  if (isPersistenceEnabled()) {
    const persisted = await loadPersistedState();
    if (persisted) {
      return normalizeState(persisted);
    }
  }
  return normalizeState(memoryState);
}

function minBidFrom(state: AuctionState): number {
  const next = state.currentBid + 1;
  return Math.max(FLOOR, next);
}

export async function getMinBid(): Promise<number> {
  const state = await getState();
  return minBidFrom(state);
}

export async function placeBid(input: {
  brand: string;
  url: string;
  logoUrl?: string;
  amount: number;
}): Promise<{ ok: true; state: AuctionState } | { ok: false; error: string }> {
  let working: AuctionState;
  let sha: string | null = null;

  if (isPersistenceEnabled()) {
    const loaded = await readForUpdate();
    if (!loaded) {
      working = { ...memoryState, history: [...memoryState.history] };
    } else {
      working = loaded.state;
      sha = loaded.sha;
    }
  } else {
    working = memoryState;
  }

  const min = minBidFrom(working);
  if (input.amount < min) {
    return { ok: false, error: `Minimum bid is $${min}` };
  }
  if (!input.brand.trim()) {
    return { ok: false, error: "Brand is required" };
  }
  let url = input.url.trim();
  if (!url) {
    return { ok: false, error: "URL is required" };
  }
  if (!/^https?:\/\//i.test(url)) {
    url = `https://${url}`;
  }

  working.currentBid = input.amount;
  working.winner = {
    brand: input.brand.trim(),
    url,
    logoUrl: input.logoUrl?.trim() || undefined,
    amount: input.amount,
  };
  const entry: BidEntry = {
    id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    brand: working.winner.brand,
    url: working.winner.url,
    logoUrl: working.winner.logoUrl,
    amount: input.amount,
    at: new Date().toISOString(),
  };
  working.history = [...working.history, entry];

  if (isPersistenceEnabled()) {
    let saved = await savePersistedState(working, sha);
    if (!saved) {
      const retry = await readForUpdate();
      if (!retry) {
        return { ok: false, error: "Could not save bid — try again" };
      }
      const minRetry = minBidFrom(retry.state);
      if (input.amount < minRetry) {
        return { ok: false, error: `Minimum bid is $${minRetry}` };
      }
      working = retry.state;
      working.currentBid = input.amount;
      working.winner = {
        brand: input.brand.trim(),
        url,
        logoUrl: input.logoUrl?.trim() || undefined,
        amount: input.amount,
      };
      working.history = [...working.history, entry];
      saved = await savePersistedState(working, retry.sha);
      if (!saved) {
        return { ok: false, error: "Could not save bid — try again" };
      }
    }
  } else {
    memoryState = working;
  }

  return { ok: true, state: normalizeState(working) };
}

export { FLOOR };
