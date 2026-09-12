export function DemoBanner() {
  return (
    <div
      className="border-b-2 border-[var(--demo)] bg-[var(--demo)] px-4 py-2 text-center text-sm uppercase tracking-widest text-white"
      role="status"
    >
      Demo mode — no card charged. Bids are simulated.
    </div>
  );
}
