import { z } from "zod";

const MAX_BRAND = 64;
const MAX_URL = 2048;

const blockedUrlPattern = /^\s*javascript:/i;

export function sanitizeUrl(raw: string): string | null {
  let url = raw.trim();
  if (!url || blockedUrlPattern.test(url)) {
    return null;
  }
  if (!/^https?:\/\//i.test(url)) {
    url = `https://${url}`;
  }
  try {
    const parsed = new URL(url);
    if (parsed.protocol !== "http:" && parsed.protocol !== "https:") {
      return null;
    }
    if (url.length > MAX_URL) {
      return null;
    }
    return parsed.href;
  } catch {
    return null;
  }
}

export const bidBodySchema = z.object({
  brand: z.string().trim().min(1).max(MAX_BRAND),
  url: z.string().trim().min(1).max(MAX_URL),
  logoUrl: z.string().trim().max(MAX_URL).optional(),
  amount: z.number().int().positive(),
  version: z.number().int().nonnegative().optional(),
  lock: z.boolean().optional(),
});

export type BidBody = z.infer<typeof bidBodySchema>;

export function parseBidBody(data: unknown): BidBody | { error: string } {
  const amountRaw =
    typeof data === "object" && data !== null && "amount" in data
      ? (data as { amount: unknown }).amount
      : undefined;
  const normalized =
    typeof amountRaw === "string" ? { ...(data as object), amount: parseFloat(amountRaw) } : data;

  const parsed = bidBodySchema.safeParse(normalized);
  if (!parsed.success) {
    const msg = parsed.error.issues[0]?.message ?? "Invalid input";
    return { error: msg };
  }

  const url = sanitizeUrl(parsed.data.url);
  if (!url) {
    return { error: "Invalid URL" };
  }

  let logoUrl: string | undefined;
  if (parsed.data.logoUrl?.trim()) {
    const logo = sanitizeUrl(parsed.data.logoUrl);
    if (!logo) {
      return { error: "Invalid logo URL" };
    }
    logoUrl = logo;
  }

  return { ...parsed.data, url, logoUrl };
}
