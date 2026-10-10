import { createFileRoute } from "@tanstack/react-router";
import { MARKETS } from "@/lib/markets";
import type { PriceTick } from "@/lib/markets";

const UA = {
  "User-Agent": "Mozilla/5.0 (compatible; NEXBIT/1.0)",
  Accept: "application/json",
} as const;

const METAL_OKX: Record<string, string> = {
  "XAU/USD": "XAU-USDT-SWAP",
  "XAG/USD": "XAG-USDT-SWAP",
  "XPT/USD": "XPT-USDT-SWAP",
  "XPD/USD": "XPD-USDT-SWAP",
};

function toTick(price: number, open: number, high?: number, low?: number, vol?: number): PriceTick {
  return {
    price,
    change: open ? ((price - open) / open) * 100 : 0,
    open,
    high: high ?? Math.max(price, open),
    low: low ?? Math.min(price, open),
    close: price,
    vol: vol ?? 0,
  };
}

async function fromBinance(): Promise<Record<string, PriceTick>> {
  const res = await fetch("https://data-api.binance.vision/api/v3/ticker/24hr", {
    headers: UA,
    signal: AbortSignal.timeout(10_000),
  });
  if (!res.ok) throw new Error("binance");
  const body = (await res.json()) as Array<{
    symbol: string;
    lastPrice: string;
    priceChangePercent: string;
    openPrice: string;
    highPrice: string;
    lowPrice: string;
    quoteVolume: string;
  }>;
  if (!Array.isArray(body)) throw new Error("binance");
  const bySym = Object.fromEntries(body.map((r) => [r.symbol, r]));
  const out: Record<string, PriceTick> = {};
  for (const m of MARKETS) {
    if (!m.binance) continue;
    const r = bySym[m.binance];
    if (!r) continue;
    const price = Number(r.lastPrice);
    if (!Number.isFinite(price)) continue;
    const open = Number(r.openPrice) || price;
    out[m.id] = {
      price,
      change: Number(r.priceChangePercent) || 0,
      open,
      high: Number(r.highPrice) || price,
      low: Number(r.lowPrice) || price,
      close: price,
      vol: Number(r.quoteVolume) || 0,
    };
  }
  return out;
}

async function fromOkxSpot(): Promise<Record<string, PriceTick>> {
  const res = await fetch("https://www.okx.com/api/v5/market/tickers?instType=SPOT", {
    headers: UA,
    signal: AbortSignal.timeout(10_000),
  });
  if (!res.ok) throw new Error("okx");
  const body = (await res.json()) as {
    data?: Array<{ instId: string; last: string; open24h: string; high24h: string; low24h: string; volCcy24h: string }>;
  };
  const byId = Object.fromEntries((body.data ?? []).map((r) => [r.instId, r]));
  const out: Record<string, PriceTick> = {};
  for (const m of MARKETS) {
    if (!m.okx) continue;
    const r = byId[m.okx];
    if (!r) continue;
    const price = Number(r.last);
    const open = Number(r.open24h) || price;
    out[m.id] = toTick(price, open, Number(r.high24h), Number(r.low24h), Number(r.volCcy24h));
  }
  return out;
}

async function fromOkxSwap(): Promise<Record<string, PriceTick>> {
  const res = await fetch("https://www.okx.com/api/v5/market/tickers?instType=SWAP", {
    headers: UA,
    signal: AbortSignal.timeout(10_000),
  });
  if (!res.ok) throw new Error("okx-swap");
  const body = (await res.json()) as {
    data?: Array<{ instId: string; last: string; open24h: string; high24h: string; low24h: string; volCcy24h: string }>;
  };
  const byId = Object.fromEntries((body.data ?? []).map((r) => [r.instId, r]));
  const out: Record<string, PriceTick> = {};
  for (const [pair, inst] of Object.entries(METAL_OKX)) {
    const r = byId[inst];
    if (!r) continue;
    const price = Number(r.last);
    const open = Number(r.open24h) || price;
    out[pair] = toTick(price, open, Number(r.high24h), Number(r.low24h), Number(r.volCcy24h));
  }
  return out;
}

async function fromFx(): Promise<Record<string, PriceTick>> {
  const res = await fetch("https://open.er-api.com/v6/latest/USD", {
    headers: UA,
    signal: AbortSignal.timeout(8_000),
  });
  if (!res.ok) throw new Error("fx");
  const body = (await res.json()) as { result?: string; rates?: Record<string, number> };
  const r = body.rates ?? {};
  const usd = (ccy: string) => {
    const n = r[ccy];
    return n ? 1 / n : NaN;
  };
  const pairs: Array<[string, number]> = [
    ["EUR/USD", usd("EUR")],
    ["GBP/USD", usd("GBP")],
    ["USD/JPY", r.JPY],
    ["AUD/USD", usd("AUD")],
    ["USD/CHF", r.CHF],
    ["USD/CAD", r.CAD],
    ["NZD/USD", usd("NZD")],
    ["EUR/GBP", r.GBP && r.EUR ? r.GBP / r.EUR : NaN],
    ["EUR/JPY", r.JPY && r.EUR ? r.JPY / r.EUR : NaN],
    ["GBP/JPY", r.JPY && r.GBP ? r.JPY / r.GBP : NaN],
  ];
  const out: Record<string, PriceTick> = {};
  for (const [id, price] of pairs) {
    if (!Number.isFinite(price)) continue;
    out[id] = toTick(price, price);
  }
  return out;
}

async function fromGoldApi(): Promise<Record<string, PriceTick>> {
  const out: Record<string, PriceTick> = {};
  await Promise.all(
    (
      [
        ["XAU/USD", "XAU"],
        ["XAG/USD", "XAG"],
        ["XPT/USD", "XPT"],
        ["XPD/USD", "XPD"],
      ] as const
    ).map(async ([pair, sym]) => {
      try {
        const res = await fetch(`https://api.gold-api.com/price/${sym}`, {
          headers: UA,
          signal: AbortSignal.timeout(6_000),
        });
        if (!res.ok) return;
        const body = (await res.json()) as { price?: number };
        if (typeof body.price === "number") out[pair] = toTick(body.price, body.price);
      } catch {
        /* skip */
      }
    }),
  );
  return out;
}

export const Route = createFileRoute("/api/tickers")({
  server: {
    handlers: {
      GET: async () => {
        try {
          const [binance, okx, swap, fx, gold] = await Promise.allSettled([
            fromBinance(),
            fromOkxSpot(),
            fromOkxSwap(),
            fromFx(),
            fromGoldApi(),
          ]);
          const rows: Record<string, PriceTick> = {};
          if (gold.status === "fulfilled") Object.assign(rows, gold.value);
          if (okx.status === "fulfilled") Object.assign(rows, okx.value);
          if (swap.status === "fulfilled") Object.assign(rows, swap.value);
          if (fx.status === "fulfilled") Object.assign(rows, fx.value);
          if (binance.status === "fulfilled") Object.assign(rows, binance.value);
          if (!Object.keys(rows).length) return Response.json({ ok: false, ticks: {} });
          return Response.json({ ok: true, ticks: rows });
        } catch {
          return Response.json({ ok: false, ticks: {} });
        }
      },
    },
  },
});
