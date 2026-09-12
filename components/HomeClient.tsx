"use client";

import { useCallback, useEffect, useState } from "react";
import type { BidEntry } from "@/lib/store";
import { formatUsd } from "@/lib/format";
import { BidForm } from "./BidForm";
import { ChromeTabMock } from "./ChromeTabMock";
import { DemoBanner } from "./DemoBanner";
import { LiveTicker } from "./LiveTicker";

type State = {
  demoMode: boolean;
  minBid: number;
  currentBid: number;
  winner: {
    brand: string;
    url: string;
    logoUrl?: string;
    amount: number;
  } | null;
  history: BidEntry[];
};

export function HomeClient() {
  const [state, setState] = useState<State | null>(null);

  const refresh = useCallback(async () => {
    const res = await fetch("/api/state");
    const data = await res.json();
    setState(data);
  }, []);

  useEffect(() => {
    refresh();
    const t = setInterval(refresh, 4000);
    return () => clearInterval(t);
  }, [refresh]);

  if (!state) {
    return <p className="p-8 text-sm">Loading…</p>;
  }

  const displayAmount = state.winner?.amount ?? state.currentBid;
  const mock = state.winner ?? {
    brand: "Your brand here",
    url: "https://tabtax.live",
  };

  return (
    <>
      {state.demoMode ? <DemoBanner /> : null}
      <main className="mx-auto max-w-3xl px-4 py-10">
        <header className="mb-12 border-b-2 border-[var(--line)] pb-6">
          <p className="text-xs uppercase tracking-[0.3em]">TabTax</p>
          <h1 className="mt-2 text-6xl font-bold leading-none tracking-tighter md:text-8xl">
            {formatUsd(displayAmount)}
          </h1>
          <p className="mt-4 max-w-md text-sm text-[var(--muted)]">
            Highest bid owns the indie new-tab creative. Set{" "}
            <a href="/tab" className="underline">
              /tab
            </a>{" "}
            as your Chrome homepage to see the winner.
          </p>
        </header>

        <section className="mb-12 grid gap-8 md:grid-cols-2">
          <div>
            <p className="mb-3 text-xs uppercase tracking-widest">Live tab preview</p>
            <ChromeTabMock
              brand={mock.brand}
              url={mock.url}
              logoUrl={state.winner?.logoUrl}
            />
          </div>
          <div>
            <BidForm minBid={state.minBid} onSuccess={refresh} />
          </div>
        </section>

        <section className="mb-12">
          <p className="mb-3 text-xs uppercase tracking-widest">Ticker</p>
          <LiveTicker history={state.history} />
        </section>

        <section className="border-t-2 border-[var(--line)] pt-8 text-sm leading-relaxed text-[var(--muted)]">
          <p className="text-xs uppercase tracking-widest text-[var(--ink)]">How it works</p>
          <ol className="mt-4 list-decimal space-y-2 pl-5">
            <li>Bid at least $1 above the current high (floor $5).</li>
            <li>Your brand, link, and optional logo become the live new-tab creative.</li>
            <li>Outbid someone? You take the tab until the next higher bid.</li>
          </ol>
        </section>
      </main>
    </>
  );
}
