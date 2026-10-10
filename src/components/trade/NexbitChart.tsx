import { useEffect, useRef, useState } from "react";
import { Maximize2, Minus, Plus } from "lucide-react";
import type { IChartApi, IPriceLine, ISeriesApi, UTCTimestamp } from "lightweight-charts";
import { applyLive, fmtAxisTime, tfMeta, type Candle } from "@/lib/candles";
import { fmtPct, fmtPrice, fmtVol } from "@/lib/format";
import { fetchKlines, toUtcSec } from "@/lib/klines";
import { useNexbit } from "@/lib/store";
import { resolvePalette, type Palette } from "@/lib/themes";
import { cn } from "@/lib/utils";
import { ChartDraw } from "./ChartDraw";

type Pal = Pick<Palette, "bg" | "fg" | "muted" | "accent" | "positive" | "negative">;

function hexRgba(hex: string, a: number) {
  const h = hex.replace("#", "");
  if (h.length !== 6) return hex;
  const n = Number.parseInt(h, 16);
  return `rgba(${(n >> 16) & 255},${(n >> 8) & 255},${n & 255},${a})`;
}

function precisionOf(price: number) {
  if (price >= 1000) return 2;
  if (price >= 1) return 4;
  return 5;
}

function toBar(c: Candle) {
  return {
    time: toUtcSec(c.t) as UTCTimestamp,
    open: c.o,
    high: c.h,
    low: c.l,
    close: c.c,
  };
}

function toVol(c: Candle, pal: Pal) {
  return {
    time: toUtcSec(c.t) as UTCTimestamp,
    value: c.v,
    color: c.c >= c.o ? hexRgba(pal.positive, 0.45) : hexRgba(pal.negative, 0.45),
  };
}

type ChartApi = {
  chart: IChartApi;
  candles: ISeriesApi<"Candlestick">;
  volume: ISeriesApi<"Histogram">;
  ma7: ISeriesApi<"Line">;
  ma25: ISeriesApi<"Line">;
  ma99: ISeriesApi<"Line">;
  lastLine: IPriceLine | null;
};

function sma(rows: Candle[], period: number) {
  const out: { time: UTCTimestamp; value: number }[] = [];
  let sum = 0;
  for (let i = 0; i < rows.length; i++) {
    sum += rows[i].c;
    if (i >= period) sum -= rows[i - period].c;
    if (i >= period - 1) out.push({ time: toUtcSec(rows[i].t) as UTCTimestamp, value: sum / period });
  }
  return out;
}

export function NexbitChart({ compact = false }: { compact?: boolean }) {
  const pair = useNexbit((s) => s.selectedPair);
  const tf = useNexbit((s) => s.timeframe);
  const tick = useNexbit((s) => s.prices[s.selectedPair]);
  const themeId = useNexbit((s) => s.themeId);
  const custom = useNexbit((s) => s.customPalette);
  const pal = resolvePalette(themeId, custom);
  const hostRef = useRef<HTMLDivElement>(null);
  const apiRef = useRef<ChartApi | null>(null);
  const seriesRef = useRef<Candle[]>([]);
  const palRef = useRef(pal);
  palRef.current = pal;
  const [chartReady, setChartReady] = useState(false);
  const [hover, setHover] = useState<Candle | null>(null);
  const [bar, setBar] = useState<Candle | null>(null);
  const [status, setStatus] = useState<"loading" | "ready" | "error">("loading");
  const [reload, setReload] = useState(0);
  const [maLast, setMaLast] = useState({ ma7: 0, ma25: 0, ma99: 0 });
  const meta = tfMeta(tf);

  const paint = (rows: Candle[], fit: boolean) => {
    const api = apiRef.current;
    const p = palRef.current;
    seriesRef.current = rows;
    if (!api || !rows.length) return;
    const last = rows[rows.length - 1];
    const prec = precisionOf(last.c);
    api.candles.applyOptions({
      priceFormat: { type: "price", precision: prec, minMove: Number((10 ** -prec).toFixed(prec)) },
    });
    api.candles.setData(rows.map(toBar));
    api.volume.setData(rows.map((c) => toVol(c, p)));
    api.ma7.setData(sma(rows, 7));
    api.ma25.setData(sma(rows, 25));
    api.ma99.setData(sma(rows, 99));
    const s7 = sma(rows, 7);
    const s25 = sma(rows, 25);
    const s99 = sma(rows, 99);
    setMaLast({
      ma7: s7.at(-1)?.value ?? 0,
      ma25: s25.at(-1)?.value ?? 0,
      ma99: s99.at(-1)?.value ?? 0,
    });
    if (api.lastLine) {
      try {
        api.candles.removePriceLine(api.lastLine);
      } catch {
        /* already gone */
      }
      api.lastLine = null;
    }
    api.lastLine = api.candles.createPriceLine({
      price: last.c,
      color: last.c >= last.o ? p.positive : p.negative,
      lineWidth: 1,
      lineStyle: 2,
      axisLabelVisible: true,
      title: "",
    });
    if (fit) api.chart.timeScale().fitContent();
    setBar(last);
  };

  useEffect(() => {
    const host = hostRef.current;
    if (!host) return;
    let disposed = false;
    let resize: ResizeObserver | null = null;

    void import("lightweight-charts").then((lc) => {
      if (disposed || !hostRef.current) return;
      const p = palRef.current;
      const chart = lc.createChart(hostRef.current, {
        autoSize: true,
        layout: {
          background: { type: lc.ColorType.Solid, color: p.bg },
          textColor: p.muted,
          fontFamily: "IBM Plex Mono, ui-monospace, monospace",
          attributionLogo: false,
        },
        grid: {
          vertLines: { color: hexRgba(p.fg, 0.045) },
          horzLines: { color: hexRgba(p.fg, 0.06) },
        },
        crosshair: {
          mode: lc.CrosshairMode.Normal,
          vertLine: { color: hexRgba(p.fg, 0.28), style: lc.LineStyle.Dashed, labelBackgroundColor: p.fg },
          horzLine: { color: hexRgba(p.fg, 0.28), style: lc.LineStyle.Dashed, labelBackgroundColor: p.fg },
        },
        rightPriceScale: {
          borderVisible: false,
          scaleMargins: { top: 0.06, bottom: 0.22 },
        },
        timeScale: {
          borderVisible: false,
          timeVisible: true,
          secondsVisible: false,
          minBarSpacing: 4,
        },
        handleScroll: {
          mouseWheel: true,
          pressedMouseMove: true,
          horzTouchDrag: true,
          vertTouchDrag: true,
        },
        handleScale: {
          axisPressedMouseMove: { time: true, price: true },
          axisDoubleClickReset: true,
          mouseWheel: true,
          pinch: true,
        },
        kineticScroll: { mouse: true, touch: true },
      });
      const candles = chart.addSeries(lc.CandlestickSeries, {
        upColor: p.positive,
        downColor: p.negative,
        borderVisible: false,
        wickUpColor: p.positive,
        wickDownColor: p.negative,
      });
      const volume = chart.addSeries(lc.HistogramSeries, {
        priceFormat: { type: "volume" },
        priceScaleId: "vol",
      });
      const lineOpts = {
        lineWidth: 1 as const,
        priceLineVisible: false,
        lastValueVisible: false,
        crosshairMarkerVisible: false,
      };
      const ma7 = chart.addSeries(lc.LineSeries, { ...lineOpts, color: "#F0B90B" });
      const ma25 = chart.addSeries(lc.LineSeries, { ...lineOpts, color: "#E11D48" });
      const ma99 = chart.addSeries(lc.LineSeries, { ...lineOpts, color: "#A78BFA" });
      chart.priceScale("vol").applyOptions({
        scaleMargins: { top: 0.82, bottom: 0 },
        borderVisible: false,
      });
      chart.subscribeCrosshairMove((param) => {
        if (param.time == null || typeof param.time !== "number") {
          setHover(null);
          return;
        }
        const found = seriesRef.current.find((c) => toUtcSec(c.t) === param.time);
        setHover(found ?? null);
      });
      apiRef.current = { chart, candles, volume, ma7, ma25, ma99, lastLine: null };
      resize = new ResizeObserver(() => {
        /* autoSize handles it; observe keeps layout in sync on rotation */
      });
      resize.observe(hostRef.current);
      setChartReady(true);
    });

    return () => {
      disposed = true;
      resize?.disconnect();
      setChartReady(false);
      apiRef.current?.chart.remove();
      apiRef.current = null;
    };
  }, []);

  useEffect(() => {
    const api = apiRef.current;
    if (!api) return;
    void import("lightweight-charts").then((lc) => {
      api.chart.applyOptions({
        layout: {
          background: { type: lc.ColorType.Solid, color: pal.bg },
          textColor: pal.muted,
          attributionLogo: false,
        },
        grid: {
          vertLines: { color: hexRgba(pal.fg, 0.045) },
          horzLines: { color: hexRgba(pal.fg, 0.06) },
        },
        timeScale: {
          timeVisible: meta.ms < 86_400_000,
          secondsVisible: meta.ms < 60_000,
        },
      });
      api.candles.applyOptions({
        upColor: pal.positive,
        downColor: pal.negative,
        wickUpColor: pal.positive,
        wickDownColor: pal.negative,
      });
    });
  }, [pal, meta.ms, chartReady]);

  useEffect(() => {
    if (!chartReady) return;
    const ac = new AbortController();
    setStatus("loading");
    setHover(null);
    void fetchKlines(pair, tf, ac.signal)
      .then((rows) => {
        if (ac.signal.aborted) return;
        paint(rows, true);
        setStatus(rows.length ? "ready" : "error");
      })
      .catch((err: { name?: string }) => {
        if (ac.signal.aborted || err?.name === "AbortError") return;
        setStatus("error");
      });
    return () => ac.abort();
  }, [pair, tf, reload, chartReady]);

  useEffect(() => {
    if (!tick || !seriesRef.current.length || status !== "ready") return;
    const next = applyLive(seriesRef.current, tick.price, tf);
    seriesRef.current = next;
    const last = next[next.length - 1];
    const api = apiRef.current;
    const p = palRef.current;
    if (api) {
      api.candles.update(toBar(last));
      api.volume.update(toVol(last, p));
      if (api.lastLine) {
        api.lastLine.applyOptions({
          price: last.c,
          color: last.c >= last.o ? p.positive : p.negative,
        });
      }
    }
    setBar(last);
  }, [tick?.price, pair, tf, status, tick]);

  const zoom = (factor: number) => {
    const scale = apiRef.current?.chart.timeScale();
    if (!scale) return;
    const range = scale.getVisibleLogicalRange();
    if (!range) return;
    const mid = (range.from + range.to) / 2;
    const span = Math.max(12, (range.to - range.from) * factor);
    scale.setVisibleLogicalRange({ from: mid - span / 2, to: mid + span / 2 });
  };

  const shown = hover ?? bar;
  const chg = shown ? ((shown.c - shown.o) / shown.o) * 100 : (tick?.change ?? 0);
  const delta = shown ? shown.c - shown.o : tick ? tick.price - tick.open : 0;

  return (
    <div className="flex h-full min-h-0 flex-col">
      <div className={cn("flex items-center gap-2 overflow-x-auto px-3 pb-0.5 text-nx-muted tabular", compact ? "text-[10px]" : "px-4 text-[11px]")}>
        {compact && maLast.ma7 ? (
          <>
            <span className="text-[#F0B90B]">MA(7): {fmtPrice(maLast.ma7)}</span>
            <span className="text-[#E11D48]">MA(25): {fmtPrice(maLast.ma25)}</span>
            <span className="text-[#A78BFA]">MA(99): {fmtPrice(maLast.ma99)}</span>
          </>
        ) : (
          <>
        <span>
          O <b className="text-nx-fg">{shown ? fmtPrice(shown.o) : "—"}</b>
        </span>
        <span>
          H <b className="text-nx-positive">{shown ? fmtPrice(shown.h) : "—"}</b>
        </span>
        <span>
          L <b className="text-nx-negative">{shown ? fmtPrice(shown.l) : "—"}</b>
        </span>
        <span>
          C <b className="text-nx-fg">{shown ? fmtPrice(shown.c) : "—"}</b>
        </span>
        <span className={cn("font-medium", chg >= 0 ? "text-nx-positive" : "text-nx-negative")}>
          {delta >= 0 ? "+" : ""}
          {shown ? fmtPrice(Math.abs(delta)) : "—"} ({fmtPct(chg)})
        </span>
        <span className="text-[10px] text-nx-muted">Vol {shown ? fmtVol(shown.v) : "—"}</span>
        <span className="ml-auto text-[10px] uppercase tracking-wide text-nx-muted">{meta.label}</span>
          </>
        )}
      </div>
      <div className="nx-chart relative min-h-0 w-full flex-1 overflow-hidden bg-nx-bg">
        <div ref={hostRef} className="absolute inset-0 touch-none" />
        {chartReady && !compact ? <ChartDraw chart={apiRef.current?.chart ?? null} series={apiRef.current?.candles ?? null} /> : null}
        <div className="pointer-events-none absolute left-1/2 top-[38%] z-10 -translate-x-1/2 select-none">
          <p className={cn("font-extrabold tracking-[0.22em] text-nx-accent/18", compact ? "text-[18px]" : "text-[28px]")}>NEXBIT</p>
        </div>
        {compact ? null : (
        <div className="absolute right-14 top-2 z-10 flex flex-col gap-1">
          <button
            type="button"
            className="flex size-8 items-center justify-center rounded-nx-sm bg-nx-chip/90 text-nx-fg"
            aria-label="Zoom in"
            onClick={() => zoom(0.65)}
          >
            <Plus className="size-4" />
          </button>
          <button
            type="button"
            className="flex size-8 items-center justify-center rounded-nx-sm bg-nx-chip/90 text-nx-fg"
            aria-label="Zoom out"
            onClick={() => zoom(1.5)}
          >
            <Minus className="size-4" />
          </button>
          <button
            type="button"
            className="flex size-8 items-center justify-center rounded-nx-sm bg-nx-chip/90 text-nx-fg"
            aria-label="Fit chart"
            onClick={() => apiRef.current?.chart.timeScale().fitContent()}
          >
            <Maximize2 className="size-3.5" />
          </button>
        </div>
        )}
        {status === "loading" ? (
          <div className="absolute inset-0 z-20 flex items-center justify-center bg-nx-bg/55 text-xs text-nx-muted">
            Loading {pair} · {meta.label}
          </div>
        ) : null}
        {status === "error" ? (
          <div className="absolute inset-0 z-20 flex flex-col items-center justify-center gap-2 bg-nx-bg/70 px-6 text-center">
            <p className="text-sm text-nx-muted">Could not load live candles.</p>
            <button
              type="button"
              onClick={() => setReload((n) => n + 1)}
              className="h-9 rounded-nx-sm bg-nx-accent px-4 text-xs font-semibold text-nx-accent-fg"
            >
              Retry
            </button>
          </div>
        ) : null}
        {hover && status === "ready" ? (
          <div className="pointer-events-none absolute left-2 top-2 z-10 rounded-nx-sm bg-nx-card/90 px-2 py-1.5 text-[10px] tabular shadow-lg">
            <p className="font-semibold text-nx-fg">{fmtAxisTime(hover.t, meta.ms)}</p>
            <p className="mt-0.5 text-nx-muted">
              O {fmtPrice(hover.o)} · H {fmtPrice(hover.h)}
            </p>
            <p className="text-nx-muted">
              L {fmtPrice(hover.l)} · C {fmtPrice(hover.c)}
            </p>
          </div>
        ) : null}
      </div>
    </div>
  );
}
