"use client";

import Link from "next/link";
import { useCallback, useEffect, useState } from "react";

type Winner = {
  brand: string;
  url: string;
  logoUrl?: string;
  amount: number;
};

export function TabClient() {
  const [winner, setWinner] = useState<Winner | null | undefined>(undefined);

  const refresh = useCallback(async () => {
    try {
      const res = await fetch("/api/state", { cache: "no-store" });
      const data = await res.json();
      setWinner(data.winner ?? null);
    } catch {
      setWinner(null);
    }
  }, []);

  useEffect(() => {
    refresh();
    const t = setInterval(refresh, 5000);
    return () => clearInterval(t);
  }, [refresh]);

  if (winner === undefined) {
    return (
      <div className="flex min-h-screen items-center justify-center font-mono text-sm text-[var(--muted)]">
        Loading…
      </div>
    );
  }

  if (!winner) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-4 p-8 text-center font-mono">
        <p className="text-4xl font-bold">TabTax</p>
        <p className="max-w-sm text-sm text-[var(--muted)]">
          No winner yet. Be the first bid at{" "}
          <Link href="/" className="underline">
            tabtax.live
          </Link>
          .
        </p>
        <p className="text-xs text-[var(--muted)]">
          Tip: set this page as your Chrome homepage for a cold-start new tab.
        </p>
      </div>
    );
  }

  let host = winner.url;
  try {
    host = new URL(winner.url).hostname;
  } catch {
    host = winner.url;
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-6 bg-[var(--bg)] p-8 text-center font-mono">
      {winner.logoUrl ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={winner.logoUrl}
          alt=""
          className="max-h-20 max-w-[200px] object-contain"
        />
      ) : null}
      <h1 className="text-5xl font-bold tracking-tight md:text-7xl">{winner.brand}</h1>
      <a
        href={winner.url}
        className="border-2 border-[var(--line)] px-6 py-3 text-sm uppercase tracking-widest hover:bg-[var(--ink)] hover:text-[var(--bg)]"
        rel="noopener noreferrer"
        target="_blank"
      >
        {host}
      </a>
      <p className="text-xs text-[var(--muted)]">
        <Link href="/" className="underline">TabTax</Link> · ${winner.amount} winning bid
      </p>
    </div>
  );
}
