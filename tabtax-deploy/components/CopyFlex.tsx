"use client";

import { useState } from "react";
import { siteUrlClient } from "@/lib/site";

type Props = {
  brand: string;
  amount: number;
};

export function CopyFlex({ brand, amount }: Props) {
  const [copied, setCopied] = useState(false);

  async function copy() {
    const base = siteUrlClient();
    const og = `${base}/api/og?brand=${encodeURIComponent(brand)}&amount=${amount}`;
    const text = `I own the indie new tab — ${brand} paid $${amount} on TabTax. Steal it: ${base}\n${og}`;
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    } catch {
      setCopied(false);
    }
  }

  return (
    <button
      type="button"
      onClick={copy}
      className="border-2 border-[var(--line)] px-4 py-2 text-xs uppercase tracking-widest hover:bg-[var(--ink)] hover:text-[var(--bg)]"
    >
      {copied ? "Copied — post it" : "Copy flex"}
    </button>
  );
}
