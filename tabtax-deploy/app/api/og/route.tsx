import { ImageResponse } from "@vercel/og";
import { NextRequest } from "next/server";

export const runtime = "edge";

export async function GET(req: NextRequest) {
  const { searchParams } = req.nextUrl;
  const brand = (searchParams.get("brand") || "ANON").slice(0, 32);
  const amountRaw = searchParams.get("amount") || "0";
  const amount = Math.max(0, parseInt(amountRaw, 10) || 0);

  return new ImageResponse(
    (
      <div
        style={{
          height: "100%",
          width: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          backgroundColor: "#f4f0e8",
          color: "#0a0a0a",
          padding: 48,
          fontFamily: "ui-monospace, monospace",
        }}
      >
        <div style={{ fontSize: 28, letterSpacing: 8, textTransform: "uppercase" }}>
          TabTax
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          <div style={{ fontSize: 52, fontWeight: 700, lineHeight: 1.1 }}>
            I OWN THE INDIE NEW TAB
          </div>
          <div style={{ fontSize: 120, fontWeight: 800, letterSpacing: -4 }}>
            ${amount}
          </div>
          <div style={{ fontSize: 36, borderTop: "4px solid #0a0a0a", paddingTop: 24 }}>
            {brand}
          </div>
        </div>
        <div style={{ fontSize: 22, opacity: 0.6 }}>tabtax.live · steal the tab</div>
      </div>
    ),
    { width: 1200, height: 630 }
  );
}
