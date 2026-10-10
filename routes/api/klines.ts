import { createFileRoute } from "@tanstack/react-router";
import { tfMeta, type Candle } from "@/lib/candles";
import { getMarket } from "@/lib/markets";

const UA = {
  "User-Agent": "Mozilla/5.0 (compatible; NEXBIT/1.0)",
  Accept: "application/json",
} as const;

const cache = new Map<string, { at: number; candles: Candle[] }>();
const TTL = 6_000;

const BINANCE_TF: Record<string, string> = {
  "1m": "1m",
  "3m": "3m",
  "5m": "5m",
  "15m": "15m",
  "30m": "30m",
  "1h": "1h",
  "2h": "2h",
  "4h": "4h",
  "6h": "6h",
  "12h": "12h",
  "1D": "1d",
  "3D": "3d",
  "1W": "1w",
  "1M": "1M",
};

const OKX_TF: Record<string, string> = {
  "5s": "1s",
  "15s": "1s",
  "1m": "1m",
  "3m": "3m",
  "5m": "5m",
  "15m": "15m",
  "30m": "30m",
  "1h": "1H",
  "2h": "2H",
  "4h": "4H",
  "6h": "6H",
  "12h": "12H",
  "1D": "1D",
  "3D": "1D",
  "1W": "1W",
  "1M": "1M",
  "2M": "1M",
};

function yahooPlan(tfId: string): { interval: string; range: string } {
  switch (tfId) {
    case "5s":
    case "15s":
    case "1m":
    case "3m":
      return { interval: "1m", range: "7d" };
    case "5m":
      return { interval: "5m", range: "60d" };
    case "15m":
      return { interval: "15m", range: "60d" };
    case "30m":
      return { interval: "30m", range: "60d" };
    case "1h":
    case "2h":
      return { interval: "60m", range: "6mo" };
    case "4h":
    case "6h":
    case "12h":
      return { interval: "60m", range: "1y" };
    case "1D":
      return { interval: "1d", range: "2y" };
    case "3D":
      return { interval: "1d", range: "5y" };
    case "1W":
      return { interval: "1wk", range: "10y" };
    default:
      return { interval: "1mo", range: "max" };
  }
}

function resample(candles: Candle[], tfMs: number): Candle[] {
  if (!candles.length) return [];
  const map = new Map<number, Candle>();
  for (const c of candles) {
    const t = Math.floor(c.t / tfMs) * tfMs;
    const prev = map.get(t);
    if (!prev) {
      map.set(t, { t, o: c.o, h: c.h, l: c.l, c: c.c, v: c.v });
    } else {
      prev.h = Math.max(prev.h, c.h);
      prev.l = Math.min(prev.l, c.l);
      prev.c = c.c;
      prev.v += c.v;
    }
  }
  return [...map.values()].sort((a, b) => a.t - b.t);
}

function dedupe(rows: Candle[]): Candle[] {
  const map = new Map<number, Candle>();
  for (const c of rows) {
    if (!Number.isFinite(c.t) || !Number.isFinite(c.o) || !Number.isFinite(c.c)) continue;
    map.set(c.t, c);
  }
  return [...map.values()].sort((a, b) => a.t - b.t);
}

async function fetchJson(url: string): Promise<unknown> {
  const res = await fetch(url, { headers: UA, signal: AbortSignal.timeout(12_000) });
  if (!res.ok) throw new Error(`http ${res.status}`);
  return res.json();
}

function parseBinance(rows: unknown): Candle[] {
  if (!Array.isArray(rows)) return [];
  return rows
    .map((row) => {
      const a = row as unknown[];
      return {
        t: Number(a[0]),
        o: Number(a[1]),
        h: Number(a[2]),
        l: Number(a[3]),
        c: Number(a[4]),
        v: Number(a[5]),
      };
    })
    .filter((c) => Number.isFinite(c.o) && Number.isFinite(c.c) && c.h >= c.l);
}

function parseOkx(body: unknown): Candle[] {
  const data = (body as { data?: string[][] })?.data;
  if (!Array.isArray(data)) return [];
  return data
    .map((a) => ({
      t: Number(a[0]),
      o: Number(a[1]),
      h: Number(a[2]),
      l: Number(a[3]),
      c: Number(a[4]),
      v: Number(a[5]),
    }))
    .filter((c) => Number.isFinite(c.o) && Number.isFinite(c.c));
}

function parseYahoo(body: unknown): Candle[] {
  const res = (body as { chart?: { result?: Array<{
    timestamp?: number[];
    indicators?: { quote?: Array<{
      open?: Array<number | null>;
      high?: Array<number | null>;
      low?: Array<number | null>;
      close?: Array<number | null>;
      volume?: Array<number | null>;
    }> };
  }> } })?.chart?.result?.[0];
  if (!res?.timestamp) return [];
  const q = res.indicators?.quote?.[0] ?? {};
  const out: Candle[] = [];
  for (let i = 0; i < res.timestamp.length; i++) {
    const o = q.open?.[i];
    const h = q.high?.[i];
    const l = q.low?.[i];
    const c = q.close?.[i];
    if (![o, h, l, c].every((n) => typeof n === "number" && Number.isFinite(n))) continue;
    out.push({
      t: res.timestamp[i] * 1000,
      o: o as number,
      h: h as number,
      l: l as number,
      c: c as number,
      v: Number(q.volume?.[i]) || 0,
    });
  }
  return out;
}

async function fetchBinanceUs(symbol: string, interval: string, limit = 500): Promise<Candle[]> {
  const url = `https://data-api.binance.vision/api/v3/klines?symbol=${symbol}&interval=${interval}&limit=${limit}`;
  return parseBinance(await fetchJson(url));
}

async function fetchOkx(instId: string, bar: string, want: number): Promise<Candle[]> {
  const all: Candle[] = [];
  let after: number | undefined;
  const pages = bar === "1s" ? 12 : 4;
  for (let i = 0; i < pages && all.length < want; i++) {
    const endpoint = i === 0 ? "candles" : "history-candles";
    const limit = endpoint === "candles" ? 300 : 100;
    let url = `https://www.okx.com/api/v5/market/${endpoint}?instId=${encodeURIComponent(instId)}&bar=${bar}&limit=${limit}`;
    if (after) url += `&after=${after}`;
    const body = await fetchJson(url);
    const raw = (body as { data?: string[][] })?.data ?? [];
    const rows = parseOkx(body);
    if (!rows.length) break;
    after = Number(raw[raw.length - 1]?.[0]) || rows[0].t;
    all.push(...rows);
    if (raw.length < 15) break;
  }
  return dedupe(all);
}

async function fetchYahoo(symbol: string, interval: string, range: string): Promise<Candle[]> {
  const url = `https://query1.finance.yahoo.com/v8/finance/chart/${encodeURIComponent(symbol)}?interval=${interval}&range=${range}&includePrePost=false`;
  return parseYahoo(await fetchJson(url));
}

async function fetchOkxIndex(instId: string, bar: string): Promise<Candle[]> {
  const url = `https://www.okx.com/api/v5/market/index-candles?instId=${encodeURIComponent(instId)}&bar=${bar}&limit=300`;
  return parseOkx(await fetchJson(url));
}

async function loadCandles(pair: string, tf: string): Promise<Candle[]> {
  const market = getMarket(pair);
  const meta = tfMeta(tf);
  const tfId = meta.id;

  const maybeResample = (rows: Candle[], _nativeId?: string) => {
    if (!rows.length) return [];
    const aligned = resample(rows, meta.ms);
    return aligned.length > 720 ? aligned.slice(-720) : aligned;
  };

  if (market.okx) {
    try {
      if (tfId === "5s" || tfId === "15s") {
        const rows = await fetchOkx(market.okx, "1s", tfId === "5s" ? 1200 : 900);
        if (rows.length) return resample(rows, meta.ms);
      } else {
        const bar = OKX_TF[tfId];
        if (bar) {
          const rows = await fetchOkx(market.okx, bar, 500);
          if (rows.length) return maybeResample(rows, tfId === "3D" || tfId === "2M" ? undefined : tfId);
        }
      }
    } catch {
      /* next source */
    }
  }

  if (market.binance && BINANCE_TF[tfId === "2M" ? "1M" : tfId]) {
    try {
      const interval = BINANCE_TF[tfId === "2M" ? "1M" : tfId];
      const rows = await fetchBinanceUs(market.binance, interval, 500);
      if (rows.length) return maybeResample(rows, tfId === "2M" ? undefined : tfId);
    } catch {
      /* next source */
    }
  }

  const indexId = pair.replace("/", "-");
  const bar = OKX_TF[tfId];
  if (bar && market.category === "forex") {
    try {
      const rows = await fetchOkxIndex(indexId, bar === "1s" ? "1m" : bar);
      if (rows.length) return maybeResample(rows);
    } catch {
      /* next */
    }
  }

  try {
    const plan = yahooPlan(tfId);
    const rows = await fetchYahoo(market.yahoo, plan.interval, plan.range);
    if (rows.length) {
      return maybeResample(rows);
    }
  } catch {
    /* empty */
  }

  return [];
}

export const Route = createFileRoute("/api/klines")({
  server: {
    handlers: {
      GET: async ({ request }) => {
        const url = new URL(request.url);
        const pair = url.searchParams.get("pair") || "BTC/USDT";
        const tf = url.searchParams.get("tf") || "15m";
        const key = `${pair}:${tfMeta(tf).id}`;
        const hit = cache.get(key);
        if (hit && Date.now() - hit.at < TTL) {
          return Response.json({ ok: true, candles: hit.candles, cached: true });
        }
        try {
          const candles = await loadCandles(pair, tf);
          if (candles.length) cache.set(key, { at: Date.now(), candles });
          return Response.json({ ok: candles.length > 0, candles });
        } catch {
          return Response.json({ ok: false, candles: hit?.candles ?? [] }, { status: 502 });
        }
      },
    },
  },
});
