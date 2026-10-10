import type { PriceTick } from "./markets";

export type Candle = {
  t: number;
  o: number;
  h: number;
  l: number;
  c: number;
  v: number;
};

export const ALL_TIMEFRAMES = [
  { id: "5s", label: "5s", ms: 5_000 },
  { id: "15s", label: "15s", ms: 15_000 },
  { id: "1m", label: "1m", ms: 60_000 },
  { id: "3m", label: "3m", ms: 180_000 },
  { id: "5m", label: "5m", ms: 300_000 },
  { id: "15m", label: "15m", ms: 900_000 },
  { id: "30m", label: "30m", ms: 1_800_000 },
  { id: "1h", label: "1h", ms: 3_600_000 },
  { id: "2h", label: "2h", ms: 7_200_000 },
  { id: "4h", label: "4h", ms: 14_400_000 },
  { id: "6h", label: "6h", ms: 21_600_000 },
  { id: "12h", label: "12h", ms: 43_200_000 },
  { id: "1D", label: "1D", ms: 86_400_000 },
  { id: "3D", label: "3D", ms: 259_200_000 },
  { id: "1W", label: "1W", ms: 604_800_000 },
  { id: "1M", label: "1M", ms: 2_592_000_000 },
  { id: "2M", label: "2M", ms: 5_184_000_000 },
] as const;

export const QUICK_TIMEFRAMES = ["5s", "1m", "15m", "1h", "4h", "1D"] as const;

const LEGACY: Record<string, string> = {
  "15": "15m",
  "60": "1h",
  "240": "4h",
  D: "1D",
  W: "1W",
};

export function normalizeTf(id: string): string {
  return LEGACY[id] ?? id;
}

export function tfMeta(id: string) {
  const n = normalizeTf(id);
  return ALL_TIMEFRAMES.find((t) => t.id === n) ?? ALL_TIMEFRAMES[4];
}

export function isQuickTf(id: string) {
  const n = normalizeTf(id);
  return (QUICK_TIMEFRAMES as readonly string[]).includes(n);
}

export function fmtAxisTime(t: number, ms: number): string {
  const d = new Date(t);
  const pad = (n: number) => String(n).padStart(2, "0");
  if (ms < 60_000) return `${pad(d.getHours())}:${pad(d.getMinutes())}:${pad(d.getSeconds())}`;
  if (ms < 86_400_000) return `${pad(d.getHours())}:${pad(d.getMinutes())}`;
  if (ms < 2_592_000_000) {
    return `${d.toLocaleString("en-US", { month: "short" })} ${pad(d.getDate())}`;
  }
  return `${d.toLocaleString("en-US", { month: "short" })} ${d.getFullYear()}`;
}

function hash(s: string) {
  let h = 2166136261;
  for (const c of s) h = Math.imul(h ^ c.charCodeAt(0), 16777619);
  return h >>> 0;
}

function rng(seed: number) {
  let s = seed || 1;
  return () => {
    s = Math.imul(s ^ (s >>> 16), 2246822519);
    s = Math.imul(s ^ (s >>> 13), 3266489917);
    s ^= s >>> 16;
    return (s >>> 0) / 4294967296;
  };
}

export function buildCandles(pair: string, tf: string, tick: PriceTick, count = 96): Candle[] {
  const meta = tfMeta(tf);
  const rand = rng(hash(`${pair}:${meta.id}`));
  const now = Date.now();
  const aligned = Math.floor(now / meta.ms) * meta.ms;
  const out: Candle[] = [];
  let price = tick.close / (1 + tick.change / 100);
  const volBase = Math.max(tick.vol / 48, 1);
  const drift = tick.change / 100 / count;

  for (let i = count - 1; i >= 1; i--) {
    const t = aligned - i * meta.ms;
    const shock = (rand() - 0.48) * 0.012 + drift;
    const open = price;
    price = Math.max(open * (1 + shock), open * 0.0001);
    const span = Math.abs(price - open) * (1.4 + rand());
    const high = Math.max(open, price) + span * rand() * 0.55;
    const low = Math.min(open, price) - span * rand() * 0.55;
    const v = volBase * (0.35 + rand() * 1.4) * (1 + Math.abs(shock) * 40);
    out.push({ t, o: open, h: high, l: Math.max(low, open * 0.2), c: price, v });
  }

  const lastHist = out[out.length - 1];
  if (lastHist) {
    lastHist.c = tick.price * (0.999 + rand() * 0.002);
    lastHist.h = Math.max(lastHist.h, lastHist.o, lastHist.c);
    lastHist.l = Math.min(lastHist.l, lastHist.o, lastHist.c);
  }
  const lastOpen = lastHist?.c ?? tick.price;
  out.push({
    t: aligned,
    o: lastOpen,
    h: Math.max(lastOpen, tick.price),
    l: Math.min(lastOpen, tick.price),
    c: tick.price,
    v: volBase * 0.8,
  });
  return out;
}

export function applyLive(candles: Candle[], price: number, tf: string, now = Date.now()): Candle[] {
  if (!candles.length) return candles;
  const ms = tfMeta(tf).ms;
  const aligned = Math.floor(now / ms) * ms;
  const last = candles[candles.length - 1];
  if (aligned > last.t) {
    const next: Candle = {
      t: aligned,
      o: last.c,
      h: Math.max(last.c, price),
      l: Math.min(last.c, price),
      c: price,
      v: Math.max(last.v * 0.15, 0.0001),
    };
    return [...candles, next];
  }
  return [
    ...candles.slice(0, -1),
    {
      ...last,
      c: price,
      h: Math.max(last.h, price),
      l: Math.min(last.l, price),
      v: last.v + last.v * 0.001,
    },
  ];
}
