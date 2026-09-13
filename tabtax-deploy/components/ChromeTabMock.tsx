type Props = {
  brand: string;
  url: string;
  logoUrl?: string;
};

export function ChromeTabMock({ brand, url, logoUrl }: Props) {
  let host = url;
  try {
    host = new URL(url).hostname;
  } catch {
    host = url.replace(/^https?:\/\//, "").split("/")[0] || url;
  }

  return (
    <div className="border-2 border-[var(--line)] bg-white">
      <div className="flex items-center gap-2 border-b border-[var(--line)] px-3 py-2 text-xs text-[var(--muted)]">
        <span className="inline-block h-2.5 w-2.5 rounded-full bg-[#ff5f57]" />
        <span className="inline-block h-2.5 w-2.5 rounded-full bg-[#febc2e]" />
        <span className="inline-block h-2.5 w-2.5 rounded-full bg-[#28c840]" />
        <span className="ml-2 flex-1 truncate border border-[var(--line)] bg-[#e8e8e8] px-2 py-0.5">
          {host}
        </span>
      </div>
      <div className="flex min-h-[140px] flex-col items-center justify-center gap-3 p-8 text-center">
        {logoUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={logoUrl}
            alt=""
            className="max-h-12 max-w-[120px] object-contain"
          />
        ) : null}
        <p className="text-2xl font-bold tracking-tight">{brand}</p>
        <p className="text-xs text-[var(--muted)]">{host}</p>
      </div>
    </div>
  );
}
