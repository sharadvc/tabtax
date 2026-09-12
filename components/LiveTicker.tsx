"use client";

import type { BidEntry } from "@/lib/store";
import { formatUsd } from "@/lib/format";

type Props = {
  history: BidEntry[];
};

export function LiveTicker({ history }: Props) {
  if (history.length === 0) {
    return (
      <p className="text-xs text-[var(--muted)]">No bids yet. Floor opens at $5.</p>
    );
  }

  return (
    <ul className="max-h-48 space-y-2 overflow-y-auto border-t-2 border-[var(--line)] pt-4 text-xs">
      {history.map((b) => (
        <li key={b.id} className="flex justify-between gap-4 border-b border-[var(--line)]/30 pb-2">
          <span className="truncate">{b.brand}</span>
          <span className="shrink-0">{formatUsd(b.amount)}</span>
        </li>
      ))}
    </ul>
  );
}
