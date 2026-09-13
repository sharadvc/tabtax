"use client";

import { useEffect, useState } from "react";

export function FlashToast() {
  const [msg, setMsg] = useState<string | null>(null);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get("paid") === "1") {
      setMsg("Payment confirmed — you own the tab. Set /tab as your homepage.");
      window.history.replaceState({}, "", window.location.pathname);
    } else if (params.get("cancel") === "1") {
      setMsg("Checkout canceled — tab still up for grabs.");
      window.history.replaceState({}, "", window.location.pathname);
    }
  }, []);

  if (!msg) {
    return null;
  }

  return (
    <div className="border-b-2 border-[var(--ink)] bg-[var(--ink)] px-4 py-3 text-center text-sm text-[var(--bg)]">
      {msg}
    </div>
  );
}
