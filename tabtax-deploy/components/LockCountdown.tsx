"use client";

import { useEffect, useState } from "react";

type Props = {
  unlockAt: string | null;
  locked: boolean;
  variant?: "hero" | "compact";
};

function formatRemaining(ms: number): string {
  const s = Math.floor(ms / 1000);
  const h = Math.floor(s / 3600);
  const m = Math.floor((s % 3600) / 60);
  const sec = s % 60;
  return `${h}h ${String(m).padStart(2, "0")}m ${String(sec).padStart(2, "0")}s`;
}

export function LockCountdown({ unlockAt, locked, variant = "compact" }: Props) {
  const [remaining, setRemaining] = useState(0);

  useEffect(() => {
    if (!locked || !unlockAt) {
      setRemaining(0);
      return;
    }
    const tick = () => {
      const ms = Math.max(0, new Date(unlockAt).getTime() - Date.now());
      setRemaining(ms);
    };
    tick();
    const t = setInterval(tick, 1000);
    return () => clearInterval(t);
  }, [unlockAt, locked]);

  if (!locked || !unlockAt || remaining <= 0) {
    return null;
  }

  if (variant === "hero") {
    return (
      <div
        className="mb-8 border-4 border-[var(--ink)] bg-[var(--ink)] p-6 text-center text-[var(--bg)]"
        role="timer"
      >
        <p className="text-xs uppercase tracking-[0.4em]">Locked — no steals</p>
        <p className="mt-2 text-4xl font-bold tabular-nums md:text-6xl">
          {formatRemaining(remaining)}
        </p>
        <p className="mt-2 text-xs opacity-80">Whale hold. Outbids resume when timer hits zero.</p>
      </div>
    );
  }

  return (
    <p className="text-xs uppercase tracking-widest text-[var(--demo)]">
      Locked · {formatRemaining(remaining)} left
    </p>
  );
}
