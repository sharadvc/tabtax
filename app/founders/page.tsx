import Link from "next/link";
import { getState, MAX_FOUNDERS } from "@/lib/store";
import { formatUsd } from "@/lib/format";

export const dynamic = "force-dynamic";

export default async function FoundersPage() {
  const state = await getState();
  const slotsLeft = MAX_FOUNDERS - state.founders.length;

  return (
    <main className="mx-auto max-w-2xl px-4 py-12 font-mono">
      <Link href="/" className="text-xs uppercase tracking-widest underline">
        ← TabTax
      </Link>
      <h1 className="mt-6 text-5xl font-bold tracking-tighter">Founding wall</h1>
      <p className="mt-4 text-sm text-[var(--muted)]">
        The first {MAX_FOUNDERS} winners who paid (or demo-confirmed) get etched here forever —
        even when someone steals your tab.{" "}
        <span className="text-[var(--ink)]">{slotsLeft} slots remain.</span>
      </p>

      <ul className="mt-10 space-y-0 border-2 border-[var(--line)]">
        {state.founders.length === 0 ? (
          <li className="p-6 text-sm text-[var(--muted)]">No founders yet. Be first.</li>
        ) : (
          state.founders.map((f) => (
            <li
              key={f.rank}
              className="flex items-center justify-between gap-4 border-b border-[var(--line)] p-4 last:border-b-0"
            >
              <div>
                <span className="text-xs text-[var(--muted)]">#{f.rank}</span>
                <p className="text-lg font-bold">{f.brand}</p>
                <a
                  href={f.url}
                  className="text-xs underline"
                  rel="noopener noreferrer"
                  target="_blank"
                >
                  {f.url}
                </a>
              </div>
              <div className="text-right">
                <p className="font-bold">{formatUsd(f.amount)}</p>
                <p className="text-xs text-[var(--muted)]">founder</p>
              </div>
            </li>
          ))
        )}
      </ul>

      {state.founders.length < MAX_FOUNDERS ? (
        <p className="mt-8 border-2 border-dashed border-[var(--line)] p-4 text-center text-xs uppercase tracking-widest">
          {slotsLeft} founder badge{slotsLeft === 1 ? "" : "s"} left — steal the tab on the homepage
        </p>
      ) : null}
    </main>
  );
}
