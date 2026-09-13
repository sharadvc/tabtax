import { NextRequest } from "next/server";

export const dynamic = "force-dynamic";

function escapeXml(s: string): string {
  return s.replace(/[<>&"']/g, (c) => {
    switch (c) {
      case "<":
        return "&lt;";
      case ">":
        return "&gt;";
      case "&":
        return "&amp;";
      case '"':
        return "&quot;";
      case "'":
        return "&apos;";
      default:
        return c;
    }
  });
}

export async function GET(req: NextRequest) {
  const { searchParams } = req.nextUrl;
  const brand = escapeXml((searchParams.get("brand") || "ANON").slice(0, 32));
  const amountRaw = searchParams.get("amount") || "0";
  const amount = Math.max(0, parseInt(amountRaw, 10) || 0);

  const svg = `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="630" viewBox="0 0 1200 630">
  <rect width="1200" height="630" fill="#f4f0e8"/>
  <text x="48" y="72" font-family="ui-monospace, monospace" font-size="28" letter-spacing="8" fill="#0a0a0a">TABTAX</text>
  <text x="48" y="260" font-family="ui-monospace, monospace" font-size="52" font-weight="700" fill="#0a0a0a">I OWN THE INDIE NEW TAB</text>
  <text x="48" y="400" font-family="ui-monospace, monospace" font-size="120" font-weight="800" fill="#0a0a0a">$${amount}</text>
  <line x1="48" y1="440" x2="1152" y2="440" stroke="#0a0a0a" stroke-width="4"/>
  <text x="48" y="510" font-family="ui-monospace, monospace" font-size="36" fill="#0a0a0a">${brand}</text>
  <text x="48" y="580" font-family="ui-monospace, monospace" font-size="22" fill="#5c5c5c">tabtax.live · steal the tab</text>
</svg>`;

  return new Response(svg, {
    headers: {
      "Content-Type": "image/svg+xml",
      "Cache-Control": "public, max-age=300",
    },
  });
}
