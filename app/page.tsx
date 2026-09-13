import type { Metadata } from "next";
import { HomeClient } from "@/components/HomeClient";
import { getState } from "@/lib/store";
export const dynamic = "force-dynamic";

export async function generateMetadata(): Promise<Metadata> {
  const state = await getState();
  const brand = state.winner?.brand ?? "TabTax";
  const amount = state.winner?.amount ?? state.currentBid;

  return {
    title: `TabTax — ${brand} owns the tab`,
    description: `Public steal auction for the indie new tab. Current high: $${amount}.`,
    openGraph: {
      title: `I own the indie new tab — $${amount}`,
      description: `${brand} on TabTax. Outbid them.`,
      images: [{ url: `/api/og?brand=${encodeURIComponent(brand)}&amount=${amount}`, width: 1200, height: 630 }],
    },
    twitter: {
      card: "summary_large_image",
      title: `TabTax — $${amount}`,
      images: [`/api/og?brand=${encodeURIComponent(brand)}&amount=${amount}`],
    },
  };
}

export default function Home() {
  return <HomeClient />;
}
