import { ImageResponse } from "next/og";
import { NextRequest } from "next/server";

export const runtime = "edge";

export async function GET(req: NextRequest) {
  const { searchParams } = req.nextUrl;
  const brand = (searchParams.get("brand") || "ANON").slice(0, 32);
  const amountRaw = searchParams.get("amount") || "0";
  const amount = Math.max(0, parseInt(amountRaw, 10) || 0);

  try {
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
  } catch {
    const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="630" viewBox="0 0 1200 630">
      <rect width="1200" height="630" fill="#f4f0e8"/>
      <text x="48" y="80" font-family="monospace" font-size="28" letter-spacing="8">TABTAX</text>
      <text x="48" y="280" font-family="monospace" font-size="52" font-weight="bold">I OWN THE INDIE NEW TAB</text>
      <text x="48" y="400" font-family="monospace" font-size="120" font-weight="bold">$${amount}</text>
      <text x="48" y="500" font-family="monospace" font-size="36">${brand.replace(/[<>&]/g, "")}</text>
    </svg>`;
    return new Response(svg, {
      headers: {
        "Content-Type": "image/svg+xml",
        "Cache-Control": "public, max-age=3600",
      },
    });
  }
}
