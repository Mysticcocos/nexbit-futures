import type { Candle } from "./candles";
import { tfMeta } from "./candles";

export async function fetchKlines(pair: string, tf: string, signal?: AbortSignal): Promise<Candle[]> {
  const url = `/api/klines?pair=${encodeURIComponent(pair)}&tf=${encodeURIComponent(tfMeta(tf).id)}`;
  const res = await fetch(url, { cache: "no-store", signal });
  if (!res.ok) throw new Error("klines");
  const body = (await res.json()) as { candles?: Candle[] };
  const rows = Array.isArray(body.candles) ? body.candles : [];
  return rows.filter((c) => Number.isFinite(c.t) && Number.isFinite(c.o) && Number.isFinite(c.c));
}

export function toUtcSec(ms: number): number {
  return Math.floor(ms / 1000);
}
