export function PersistenceBanner() {
  return (
    <div
      className="border-b-2 border-amber-600 bg-amber-500 px-4 py-2 text-center text-sm uppercase tracking-widest text-white"
      role="status"
    >
      Persistence off — bids only live on this server instance. Set GITHUB_TOKEN on
      Vercel to enable shared state.
    </div>
  );
}
