import { useEffect, useMemo, useState } from "react";
import { fmtPrice } from "@/lib/format";
import { cn } from "@/lib/utils";

const STEPS = [0.1, 1, 10] as const;
const ROWS = 6;

type Lvl = { price: number; amt: number; w: number };

export function OrderBook({
  pair,
  price,
  change,
  wide = false,
}: {
  pair: string;
  price: number;
  change: number;
  wide?: boolean;
}) {
  const [step, setStep] = useState<(typeof STEPS)[number]>(0.1);
  const [live, setLive] = useState<{ bids: [number, number][]; asks: [number, number][] } | null>(null);

  useEffect(() => {
    let stop = false;
    const load = async () => {
      try {
        const res = await fetch(`/api/depth?pair=${encodeURIComponent(pair)}`, { cache: "no-store" });
        const body = (await res.json()) as { ok?: boolean; bids?: [number, number][]; asks?: [number, number][] };
        if (!stop && body.ok && body.bids && body.asks) setLive({ bids: body.bids, asks: body.asks });
      } catch {
        /* keep last */
      }
    };
    void load();
    const id = window.setInterval(() => void load(), 2500);
    return () => {
      stop = true;
      window.clearInterval(id);
    };
  }, [pair]);

  const { asks, bids, buyPct } = useMemo(() => {
    if (live?.asks.length && live.bids.length) return fromLive(live.asks, live.bids);
    return buildBook(price, step);
  }, [live, price, step]);
  const funding = ((change || 0) * 0.0024).toFixed(5);
  const countdown = nextFunding();

  return (
    <div className={cn("flex shrink-0 flex-col overflow-hidden text-[10px]", wide ? "w-[168px]" : "w-[132px]")}>
      <p className="text-right text-[9px] leading-tight text-nx-muted">
        Funding (8h)
        <span className="mt-0.5 block tabular-nums text-nx-fg">
          {funding}% / {countdown}
        </span>
      </p>
      <div className="mt-1.5 flex text-[9px] text-nx-muted">
        <span className="min-w-0 flex-1">Price</span>
        <span className="shrink-0">Size</span>
      </div>
      <ul className="mt-0.5">
        {asks.map((r) => (
          <BookRow key={`a${r.price}`} row={r} tone="ask" />
        ))}
      </ul>
      <div className="py-1 text-center">
        <p className={cn("text-[13px] font-semibold tabular-nums leading-tight", change >= 0 ? "text-nx-positive" : "text-nx-negative")}>
          {fmtPrice(price)}
        </p>
        <p className="text-[9px] tabular-nums text-nx-muted">{fmtPrice(price)}</p>
      </div>
      <ul>
        {bids.map((r) => (
          <BookRow key={`b${r.price}`} row={r} tone="bid" />
        ))}
      </ul>
      <div className="mt-1.5 flex items-center gap-1">
        <span className="tabular-nums text-[9px] text-nx-positive">{buyPct.toFixed(0)}%</span>
        <div className="flex h-1 min-w-0 flex-1 overflow-hidden rounded-full">
          <span className="bg-nx-positive" style={{ width: `${buyPct}%` }} />
          <span className="bg-nx-negative" style={{ width: `${100 - buyPct}%` }} />
        </div>
        <span className="tabular-nums text-[9px] text-nx-negative">{(100 - buyPct).toFixed(0)}%</span>
      </div>
      <select
        value={step}
        onChange={(e) => setStep(Number(e.target.value) as (typeof STEPS)[number])}
        className="mt-1 h-6 w-full rounded bg-nx-chip px-1 text-[10px] text-nx-muted outline-none"
      >
        {STEPS.map((s) => (
          <option key={s} value={s}>
            {s}
          </option>
        ))}
      </select>
    </div>
  );
}

function BookRow({ row, tone }: { row: Lvl; tone: "ask" | "bid" }) {
  return (
    <li className="relative isolate h-4 overflow-hidden">
      <span
        className={cn("absolute inset-y-0 right-0", tone === "ask" ? "bg-nx-negative/20" : "bg-nx-positive/20")}
        style={{ width: `${Math.min(100, row.w)}%` }}
      />
      <span className="relative z-[1] flex h-full items-center justify-between gap-1 px-0.5 tabular-nums">
        <span className={cn("min-w-0 truncate", tone === "ask" ? "text-nx-negative" : "text-nx-positive")}>
          {fmtBookPx(row.price)}
        </span>
        <span className="shrink-0 text-nx-fg">{fmtSize(row.amt)}</span>
      </span>
    </li>
  );
}

function fromLive(asksIn: [number, number][], bidsIn: [number, number][]) {
  const asksRaw = [...asksIn].sort((a, b) => a[0] - b[0]).slice(0, ROWS);
  const bidsRaw = [...bidsIn].sort((a, b) => b[0] - a[0]).slice(0, ROWS);
  const max = Math.max(...asksRaw.map((x) => x[1]), ...bidsRaw.map((x) => x[1]), 0.001);
  const asks: Lvl[] = asksRaw.reverse().map(([price, amt]) => ({
    price,
    amt,
    w: Math.max(8, (amt / max) * 100),
  }));
  const bids: Lvl[] = bidsRaw.map(([price, amt]) => ({
    price,
    amt,
    w: Math.max(8, (amt / max) * 100),
  }));
  const askVol = asks.reduce((a, l) => a + l.amt, 0);
  const bidVol = bids.reduce((a, l) => a + l.amt, 0);
  const buyPct = (bidVol / (askVol + bidVol)) * 100 || 50;
  return { asks, bids, buyPct };
}

function buildBook(mid: number, step: number) {
  if (!Number.isFinite(mid) || mid <= 0) {
    return { asks: [] as Lvl[], bids: [] as Lvl[], buyPct: 50 };
  }
  const tick = mid >= 1000 ? step : mid >= 10 ? step / 10 : step / 100;
  const asks: Lvl[] = [];
  const bids: Lvl[] = [];
  for (let i = ROWS; i >= 1; i -= 1) {
    const amt = 0.001 + Math.abs(Math.sin(mid * 0.017 + i * 1.7)) * (i === 1 ? 6 : 0.03);
    asks.push({ price: mid + tick * i, amt, w: 8 });
  }
  for (let i = 0; i < ROWS; i += 1) {
    const amt = 0.001 + Math.abs(Math.cos(mid * 0.013 + i * 1.3)) * (i === 0 ? 0.9 : 0.02);
    bids.push({ price: mid - tick * i, amt, w: 8 });
  }
  const max = Math.max(...asks.map((l) => l.amt), ...bids.map((l) => l.amt), 0.001);
  asks.forEach((l) => {
    l.w = Math.max(8, (l.amt / max) * 100);
  });
  bids.forEach((l) => {
    l.w = Math.max(8, (l.amt / max) * 100);
  });
  const askVol = asks.reduce((a, l) => a + l.amt, 0);
  const bidVol = bids.reduce((a, l) => a + l.amt, 0);
  const buyPct = (bidVol / (askVol + bidVol)) * 100 || 50;
  return { asks, bids, buyPct };
}

function fmtBookPx(n: number) {
  if (n >= 100) return n.toFixed(1);
  if (n >= 1) return n.toFixed(2);
  return n.toFixed(4);
}

function fmtSize(n: number) {
  if (n >= 100) return n.toFixed(1);
  if (n >= 1) return n.toFixed(3);
  return n.toFixed(4);
}

function nextFunding() {
  const now = new Date();
  const h = now.getUTCHours();
  const nextH = h < 8 ? 8 : h < 16 ? 16 : 24;
  const ms = Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate(), nextH, 0, 0) - now.getTime();
  const t = Math.max(0, ms);
  const hh = String(Math.floor(t / 3600000)).padStart(2, "0");
  const mm = String(Math.floor((t % 3600000) / 60000)).padStart(2, "0");
  const ss = String(Math.floor((t % 60000) / 1000)).padStart(2, "0");
  return `${hh}:${mm}:${ss}`;
}
