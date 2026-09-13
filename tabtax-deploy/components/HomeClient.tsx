"use client";

import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import type { BidEntry, FounderEntry } from "@/lib/store";
import { formatUsd } from "@/lib/format";
import { MAX_FOUNDERS } from "@/lib/store";
import { BidForm } from "./BidForm";
import { ChromeTabMock } from "./ChromeTabMock";
import { CopyFlex } from "./CopyFlex";
import { DemoBanner } from "./DemoBanner";
import { FlashToast } from "./FlashToast";
import { KillFeed } from "./KillFeed";
import { LockCountdown } from "./LockCountdown";
import { PersistenceBanner } from "./PersistenceBanner";

type State = {
  demoMode: boolean;
  persistence?: boolean;
  minBid: number;
  lockPrice: number;
  locked: boolean;
  unlockAt: string | null;
  version: number;
  currentBid: number;
  winner: {
    brand: string;
    url: string;
    logoUrl?: string;
    amount: number;
  } | null;
  founders: FounderEntry[];
  history: BidEntry[];
};

export function HomeClient() {
  const [state, setState] = useState<State | null>(null);

  const refresh = useCallback(async () => {
    const res = await fetch("/api/state", { cache: "no-store" });
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
  const slotsLeft = MAX_FOUNDERS - (state.founders?.length ?? 0);

  return (
    <>
      <FlashToast />
      {state.demoMode ? <DemoBanner /> : null}
      {state.persistence === false ? <PersistenceBanner /> : null}
      <main className="mx-auto max-w-3xl px-4 py-10">
        <header className="mb-8 border-b-2 border-[var(--line)] pb-6">
          <div className="flex flex-wrap items-end justify-between gap-4">
            <p className="text-xs uppercase tracking-[0.3em]">TabTax</p>
            <nav className="flex gap-4 text-xs uppercase tracking-widest">
              <Link href="/tab" className="underline">/tab</Link>
              <Link href="/founders" className="underline">Founders</Link>
            </nav>
          </div>
          <h1 className="mt-2 text-6xl font-bold leading-none tracking-tighter md:text-8xl">
            {formatUsd(displayAmount)}
          </h1>
          <p className="mt-4 max-w-lg text-sm text-[var(--muted)]">
            Public steal auction. Outbid = instant eviction. Kill feed below. Set{" "}
            <Link href="/tab" className="underline">/tab</Link> as your Chrome homepage.
          </p>
          {state.winner ? (
            <div className="mt-4 flex flex-wrap items-center gap-3">
              <CopyFlex brand={state.winner.brand} amount={state.winner.amount} />
              <span className="text-xs text-[var(--muted)]">
                {state.winner.brand} holds the tab
              </span>
            </div>
          ) : null}
        </header>

        <LockCountdown
          unlockAt={state.unlockAt}
          locked={state.locked}
          variant="hero"
        />

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
            <BidForm
              minBid={state.minBid}
              lockPrice={state.lockPrice}
              locked={state.locked}
              version={state.version}
              demoMode={state.demoMode}
              onSuccess={refresh}
            />
          </div>
        </section>

        <section className="mb-12">
          <p className="mb-3 text-xs uppercase tracking-widest">Kill feed</p>
          <KillFeed history={state.history} />
        </section>

        <section className="mb-12 border-2 border-[var(--line)] p-4">
          <p className="text-xs uppercase tracking-widest">Founding wall</p>
          <p className="mt-2 text-sm text-[var(--muted)]">
            First {MAX_FOUNDERS} paid winners get permanent badges — even after someone steals
            you.{" "}
            <span className="text-[var(--ink)] font-bold">{slotsLeft} slots left.</span>
          </p>
          <Link
            href="/founders"
            className="mt-3 inline-block text-xs uppercase tracking-widest underline"
          >
            View hall of fame →
          </Link>
        </section>

        <section className="border-t-2 border-[var(--line)] pt-8 text-sm leading-relaxed text-[var(--muted)]">
          <p className="text-xs uppercase tracking-widest text-[var(--ink)]">Receipts</p>
          <ol className="mt-4 list-decimal space-y-2 pl-5">
            <li>Steal: bid $1 above the high (floor $5). Previous holder gets evicted publicly.</li>
            <li>Lock: pay max(3× current, current+25) — 24h immunity from steals.</li>
            <li>Founders: first ten winners etched forever on /founders.</li>
          </ol>
        </section>
      </main>
    </>
  );
}
