import { createFileRoute } from "@tanstack/react-router";
import { getMarket } from "@/lib/markets";

const UA = {
  "User-Agent": "Mozilla/5.0 (compatible; NEXBIT/1.0)",
  Accept: "application/json",
} as const;

type Level = [number, number];

async function binanceDepth(symbol: string): Promise<{ bids: Level[]; asks: Level[] } | null> {
  const res = await fetch(
    `https://data-api.binance.vision/api/v3/depth?symbol=${encodeURIComponent(symbol)}&limit=20`,
    { headers: UA, signal: AbortSignal.timeout(8_000) },
  );
  if (!res.ok) return null;
  const body = (await res.json()) as { bids?: string[][]; asks?: string[][] };
  const bids = (body.bids ?? []).map((r) => [Number(r[0]), Number(r[1])] as Level).filter((r) => r[0] && r[1]);
  const asks = (body.asks ?? []).map((r) => [Number(r[0]), Number(r[1])] as Level).filter((r) => r[0] && r[1]);
  if (!bids.length || !asks.length) return null;
  return { bids, asks };
}

async function okxDepth(instId: string): Promise<{ bids: Level[]; asks: Level[] } | null> {
  const res = await fetch(
    `https://www.okx.com/api/v5/market/books?instId=${encodeURIComponent(instId)}&sz=20`,
    { headers: UA, signal: AbortSignal.timeout(8_000) },
  );
  if (!res.ok) return null;
  const body = (await res.json()) as { data?: Array<{ bids?: string[][]; asks?: string[][] }> };
  const row = body.data?.[0];
  const bids = (row?.bids ?? []).map((r) => [Number(r[0]), Number(r[1])] as Level).filter((r) => r[0] && r[1]);
  const asks = (row?.asks ?? []).map((r) => [Number(r[0]), Number(r[1])] as Level).filter((r) => r[0] && r[1]);
  if (!bids.length || !asks.length) return null;
  return { bids, asks };
}

export const Route = createFileRoute("/api/depth")({
  server: {
    handlers: {
      GET: async ({ request }) => {
        const pair = new URL(request.url).searchParams.get("pair") ?? "BTC/USDT";
        const m = getMarket(pair);
        try {
          const live = m.binance ? await binanceDepth(m.binance) : m.okx ? await okxDepth(m.okx) : null;
          const book = live ?? (m.okx ? await okxDepth(m.okx) : null);
          if (!book) return Response.json({ ok: false });
          return Response.json({ ok: true, bids: book.bids.slice(0, 12), asks: book.asks.slice(0, 12) });
        } catch {
          return Response.json({ ok: false });
        }
      },
    },
  },
});
