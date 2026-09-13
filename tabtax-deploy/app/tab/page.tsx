import type { Metadata } from "next";
import { TabClient } from "@/components/TabClient";
import { getState } from "@/lib/store";

export const dynamic = "force-dynamic";

export async function generateMetadata(): Promise<Metadata> {
  const state = await getState();
  const brand = state.winner?.brand ?? "TabTax";
  const amount = state.winner?.amount ?? 0;

  return {
    title: `${brand} — TabTax /tab`,
    description: state.winner
      ? `${brand} owns your new tab for $${amount}.`
      : "Set this as your Chrome homepage.",
    openGraph: {
      title: `${brand} owns the indie new tab`,
      images: [{ url: `/api/og?brand=${encodeURIComponent(brand)}&amount=${amount}`, width: 1200, height: 630 }],
    },
  };
}

export default function TabPage() {
  return <TabClient />;
}
