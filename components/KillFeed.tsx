"use client";

import type { BidEntry } from "@/lib/store";
import { formatUsd } from "@/lib/format";

type Props = {
  history: BidEntry[];
};

export function KillFeed({ history }: Props) {
  const kills = history.filter((b) => b.stoleFrom || b.kind === "steal");

  if (kills.length === 0) {
    return (
      <p className="text-xs text-[var(--muted)]">
        No steals yet. First blood opens at $5.
      </p>
    );
  }

  return (
    <ul className="max-h-56 space-y-3 overflow-y-auto border-2 border-[var(--line)] p-4 text-sm">
      {kills.map((b) => (
        <li key={b.id} className="leading-snug">
          <span className="font-bold">{b.brand}</span>
          {b.stoleFrom ? (
            <>
              {" "}
              stole the tab from <span className="font-bold">{b.stoleFrom}</span>
            </>
          ) : (
            " took the tab"
          )}
          {" "}
          for <span className="font-bold">{formatUsd(b.amount)}</span>
          {b.kind === "lock" ? (
            <span className="ml-2 text-xs uppercase tracking-widest text-[var(--muted)]">
              · 24h lock
            </span>
          ) : null}
        </li>
      ))}
    </ul>
  );
}
