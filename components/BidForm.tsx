"use client";

import { useEffect, useState } from "react";
import { formatUsd } from "@/lib/format";

type Props = {
  minBid: number;
  lockPrice: number;
  locked: boolean;
  version: number;
  demoMode: boolean;
  onSuccess: () => void;
};

export function BidForm({
  minBid,
  lockPrice,
  locked,
  version,
  demoMode,
  onSuccess,
}: Props) {
  const [brand, setBrand] = useState("");
  const [url, setUrl] = useState("");
  const [logoUrl, setLogoUrl] = useState("");
  const [withLock, setWithLock] = useState(false);
  const [amount, setAmount] = useState(String(minBid || 5));
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const effectiveMin = withLock ? lockPrice : minBid;
  const stealBlocked = locked;

  useEffect(() => {
    setAmount(String(withLock ? lockPrice : minBid || 5));
  }, [minBid, lockPrice, withLock]);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const payload = {
        brand,
        url,
        logoUrl: logoUrl || undefined,
        amount: parseInt(amount, 10),
        version,
        lock: withLock,
      };

      if (demoMode) {
        const res = await fetch("/api/bid", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
        const data = await res.json();
        if (!res.ok) {
          setError(data.error ?? "Bid failed");
          if (data.code === "stale") {
            onSuccess();
          }
          return;
        }
        onSuccess();
        return;
      }

      const res = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "Checkout failed");
        return;
      }
      if (data.url) {
        window.location.href = data.url;
      }
    } catch {
      setError("Network error");
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={submit} className="space-y-4 border-2 border-[var(--line)] p-4">
      <p className="text-xs uppercase tracking-widest text-[var(--muted)]">
        {withLock ? "24h lock takeover" : "Steal the tab"} · min{" "}
        {formatUsd(effectiveMin || 5)}
      </p>
      <label className="flex cursor-pointer items-start gap-3 border-2 border-dashed border-[var(--line)] p-3">
        <input
          type="checkbox"
          checked={withLock}
          onChange={(e) => setWithLock(e.target.checked)}
          className="mt-1"
        />
        <span className="text-xs leading-relaxed">
          <span className="font-bold uppercase tracking-widest">Whale SKU</span> — pay{" "}
          {formatUsd(lockPrice)} to lock /tab for 24h. No public steals until unlock.
        </span>
      </label>
      <label className="block">
        <span className="text-xs">Brand</span>
        <input
          required
          maxLength={64}
          value={brand}
          onChange={(e) => setBrand(e.target.value)}
          className="mt-1 w-full border-2 border-[var(--line)] bg-transparent px-2 py-2 text-sm outline-none focus:bg-white"
          placeholder="Your name"
        />
      </label>
      <label className="block">
        <span className="text-xs">URL</span>
        <input
          required
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          className="mt-1 w-full border-2 border-[var(--line)] bg-transparent px-2 py-2 text-sm outline-none focus:bg-white"
          placeholder="yoursite.com"
        />
      </label>
      <label className="block">
        <span className="text-xs">Logo URL (optional)</span>
        <input
          value={logoUrl}
          onChange={(e) => setLogoUrl(e.target.value)}
          className="mt-1 w-full border-2 border-[var(--line)] bg-transparent px-2 py-2 text-sm outline-none focus:bg-white"
          placeholder="https://…"
        />
      </label>
      <label className="block">
        <span className="text-xs">Amount (USD)</span>
        <input
          required
          type="number"
          min={effectiveMin || 5}
          step={1}
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          className="mt-1 w-full border-2 border-[var(--line)] bg-transparent px-2 py-2 text-sm outline-none focus:bg-white"
        />
      </label>
      {stealBlocked ? (
        <p className="text-xs text-[var(--demo)]">
          Tab is locked — enable 24h lock premium or wait for countdown.
        </p>
      ) : null}
      {error ? <p className="text-sm text-[var(--demo)]">{error}</p> : null}
      <button
        type="submit"
        disabled={loading || stealBlocked}
        className="w-full border-2 border-[var(--line)] bg-[var(--ink)] py-3 text-sm uppercase tracking-widest text-[var(--bg)] disabled:opacity-50"
      >
        {loading ? "…" : withLock ? "Lock & own" : demoMode ? "Steal (demo)" : "Pay & steal"}
      </button>
    </form>
  );
}
