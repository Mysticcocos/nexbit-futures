import { useEffect, useRef, useState } from "react";
import { Minus, Pencil, Square, TrendingUp, Trash2, Move } from "lucide-react";
import type { IChartApi, ISeriesApi, UTCTimestamp } from "lightweight-charts";
import { cn } from "@/lib/utils";

export type DrawTool = "cursor" | "trend" | "hline" | "rect" | "fib";
type Pt = { t: number; p: number };
type Shape = { id: string; tool: Exclude<DrawTool, "cursor">; a: Pt; b: Pt };

export function ChartDraw({
  chart,
  series,
}: {
  chart: IChartApi | null;
  series: ISeriesApi<"Candlestick"> | null;
}) {
  const [tool, setTool] = useState<DrawTool>("cursor");
  const [shapes, setShapes] = useState<Shape[]>([]);
  const [draft, setDraft] = useState<Shape | null>(null);
  const overlay = useRef<SVGSVGElement>(null);
  const start = useRef<Pt | null>(null);
  const [, tick] = useState(0);

  useEffect(() => {
    if (!chart) return;
    const redraw = () => tick((n) => n + 1);
    chart.timeScale().subscribeVisibleLogicalRangeChange(redraw);
    const id = window.setInterval(redraw, 400);
    return () => {
      try {
        chart.timeScale().unsubscribeVisibleLogicalRangeChange(redraw);
      } catch {
        /* gone */
      }
      window.clearInterval(id);
    };
  }, [chart]);

  useEffect(() => {
    if (!chart) return;
    const on = tool !== "cursor";
    chart.applyOptions({
      handleScroll: { mouseWheel: !on, pressedMouseMove: !on, horzTouchDrag: !on, vertTouchDrag: !on },
      handleScale: { mouseWheel: !on, pinch: !on, axisPressedMouseMove: !on },
    });
  }, [tool, chart]);

  const toPt = (clientX: number, clientY: number): Pt | null => {
    if (!chart || !series || !overlay.current) return null;
    const r = overlay.current.getBoundingClientRect();
    const x = clientX - r.left;
    const y = clientY - r.top;
    const t = chart.timeScale().coordinateToTime(x);
    const p = series.coordinateToPrice(y);
    if (t == null || p == null) return null;
    return { t: Number(t), p };
  };

  const xy = (pt: Pt) => {
    if (!chart || !series) return null;
    const x = chart.timeScale().timeToCoordinate(pt.t as UTCTimestamp);
    const y = series.priceToCoordinate(pt.p);
    if (x == null || y == null) return null;
    return { x, y };
  };

  const onDown = (e: React.PointerEvent) => {
    if (tool === "cursor") return;
    const pt = toPt(e.clientX, e.clientY);
    if (!pt) return;
    (e.target as HTMLElement).setPointerCapture(e.pointerId);
    start.current = pt;
    setDraft({ id: "draft", tool, a: pt, b: pt });
  };

  const onMove = (e: React.PointerEvent) => {
    if (!start.current || tool === "cursor") return;
    const pt = toPt(e.clientX, e.clientY);
    if (!pt) return;
    setDraft({ id: "draft", tool, a: start.current, b: pt });
  };

  const onUp = (e: React.PointerEvent) => {
    if (!start.current || tool === "cursor") return;
    const pt = toPt(e.clientX, e.clientY) ?? start.current;
    const shape: Shape = { id: `d${Date.now()}`, tool, a: start.current, b: tool === "hline" ? start.current : pt };
    setShapes((s) => [...s, shape]);
    setDraft(null);
    start.current = null;
  };

  const all = draft ? [...shapes, draft] : shapes;

  return (
    <>
      <div className="absolute left-2 top-2 z-20 flex flex-col gap-1">
        {(
          [
            ["cursor", Move, "Move"],
            ["trend", TrendingUp, "Trend"],
            ["hline", Minus, "Horiz"],
            ["rect", Square, "Rect"],
            ["fib", Pencil, "Fib"],
          ] as const
        ).map(([id, Icon, label]) => (
          <button
            key={id}
            type="button"
            title={label}
            onClick={() => setTool(id)}
            className={cn(
              "flex size-8 items-center justify-center rounded-nx-sm",
              tool === id ? "bg-nx-accent text-nx-accent-fg" : "bg-nx-chip/90 text-nx-fg",
            )}
          >
            <Icon className="size-3.5" />
          </button>
        ))}
        <button
          type="button"
          title="Clear drawings"
          onClick={() => {
            setShapes([]);
            setDraft(null);
          }}
          className="flex size-8 items-center justify-center rounded-nx-sm bg-nx-chip/90 text-nx-negative"
        >
          <Trash2 className="size-3.5" />
        </button>
      </div>
      <svg
        ref={overlay}
        className={cn("absolute inset-0 z-[15] h-full w-full", tool === "cursor" ? "pointer-events-none" : "pointer-events-auto")}
        onPointerDown={onDown}
        onPointerMove={onMove}
        onPointerUp={onUp}
      >
        {all.map((s) => (
          <ShapeEl key={s.id} shape={s} xy={xy} />
        ))}
      </svg>
    </>
  );
}

function ShapeEl({ shape, xy }: { shape: Shape; xy: (pt: Pt) => { x: number; y: number } | null }) {
  const a = xy(shape.a);
  const b = xy(shape.b);
  if (!a || !b) return null;
  const stroke = "var(--nx-accent)";
  if (shape.tool === "hline") {
    return <line x1={0} x2="100%" y1={a.y} y2={a.y} stroke={stroke} strokeWidth={1.2} />;
  }
  if (shape.tool === "trend") {
    return <line x1={a.x} y1={a.y} x2={b.x} y2={b.y} stroke={stroke} strokeWidth={1.4} />;
  }
  if (shape.tool === "rect") {
    const x = Math.min(a.x, b.x);
    const y = Math.min(a.y, b.y);
    return (
      <rect
        x={x}
        y={y}
        width={Math.abs(b.x - a.x)}
        height={Math.abs(b.y - a.y)}
        fill="color-mix(in oklab, var(--nx-accent) 12%, transparent)"
        stroke={stroke}
        strokeWidth={1.2}
      />
    );
  }
  const hi = Math.min(a.y, b.y);
  const lo = Math.max(a.y, b.y);
  const h = lo - hi || 1;
  const levels = [0, 0.236, 0.382, 0.5, 0.618, 0.786, 1];
  return (
    <g>
      <line x1={a.x} y1={a.y} x2={b.x} y2={b.y} stroke={stroke} strokeWidth={1} strokeDasharray="3 3" />
      {levels.map((lv) => {
        const y = a.y + (b.y - a.y) * lv;
        return (
          <g key={lv}>
            <line x1={Math.min(a.x, b.x)} x2={Math.max(a.x, b.x) + 48} y1={y} y2={y} stroke={stroke} strokeOpacity={0.7} strokeWidth={1} />
            <text x={Math.max(a.x, b.x) + 4} y={y - 2} fill={stroke} fontSize="9">
              {(lv * 100).toFixed(1)}
            </text>
          </g>
        );
      })}
      <rect x={Math.min(a.x, b.x)} y={hi} width={Math.abs(b.x - a.x)} height={h} fill="none" />
    </g>
  );
}
