export function siteUrlClient(): string {
  if (typeof window !== "undefined" && window.location.origin) {
    return window.location.origin;
  }
  return process.env.NEXT_PUBLIC_SITE_URL || "https://tabtax-live.vercel.app";
}

export function ogImageUrl(brand: string, amount: number): string {
  const base = siteUrlClient();
  return `${base}/api/og?brand=${encodeURIComponent(brand)}&amount=${amount}`;
}
