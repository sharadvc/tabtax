/**
 * Module-level in-memory auction state.
 * Resets on serverless cold starts / new instances — acceptable for MVP demo.
 */

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

let state: AuctionState = {
  currentBid: 0,
  winner: null,
  history: [],
};

export function getDemoMode(): boolean {
  return !process.env.STRIPE_SECRET_KEY;
}

export function getMinBid(): number {
  const next = state.currentBid + 1;
  return Math.max(FLOOR, next);
}

export function getState(): AuctionState {
  return {
    currentBid: Math.max(state.currentBid, state.winner?.amount ?? 0),
    winner: state.winner,
    history: [...state.history].slice(-50).reverse(),
  };
}

export function placeBid(input: {
  brand: string;
  url: string;
  logoUrl?: string;
  amount: number;
}): { ok: true; state: AuctionState } | { ok: false; error: string } {
  const min = getMinBid();
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

  state.currentBid = input.amount;
  state.winner = {
    brand: input.brand.trim(),
    url,
    logoUrl: input.logoUrl?.trim() || undefined,
    amount: input.amount,
  };
  const entry: BidEntry = {
    id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    brand: state.winner.brand,
    url: state.winner.url,
    logoUrl: state.winner.logoUrl,
    amount: input.amount,
    at: new Date().toISOString(),
  };
  state.history.push(entry);

  return { ok: true, state: getState() };
}

export { FLOOR };
