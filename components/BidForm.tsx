"use client";

import { useState } from "react";

type Props = {
  minBid: number;
  onSuccess: () => void;
};

export function BidForm({ minBid, onSuccess }: Props) {
  const [brand, setBrand] = useState("");
  const [url, setUrl] = useState("");
  const [logoUrl, setLogoUrl] = useState("");
  const [amount, setAmount] = useState(String(minBid));
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const res = await fetch("/api/bid", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          brand,
          url,
          logoUrl: logoUrl || undefined,
          amount: parseInt(amount, 10),
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "Bid failed");
        return;
      }
      onSuccess();
    } catch {
      setError("Network error");
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={submit} className="space-y-4 border-2 border-[var(--line)] p-4">
      <p className="text-xs uppercase tracking-widest text-[var(--muted)]">
        Place bid · min ${minBid}
      </p>
      <label className="block">
        <span className="text-xs">Brand</span>
        <input
          required
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
          min={minBid}
          step={1}
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          className="mt-1 w-full border-2 border-[var(--line)] bg-transparent px-2 py-2 text-sm outline-none focus:bg-white"
        />
      </label>
      {error ? (
        <p className="text-sm text-[var(--demo)]">{error}</p>
      ) : null}
      <button
        type="submit"
        disabled={loading}
        className="w-full border-2 border-[var(--line)] bg-[var(--ink)] py-3 text-sm uppercase tracking-widest text-[var(--bg)] disabled:opacity-50"
      >
        {loading ? "…" : "Bid"}
      </button>
    </form>
  );
}
