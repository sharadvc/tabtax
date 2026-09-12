import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "TabTax — own the indie new tab",
  description: "Highest bid wins the creative on every new tab.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="min-h-screen font-mono antialiased">{children}</body>
    </html>
  );
}
