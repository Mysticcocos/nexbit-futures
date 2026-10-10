import { sparkPoints } from "@/lib/markets";

export function Sparkline({
  symbol,
  change,
  width = 72,
  height = 28,
}: {
  symbol: string;
  change: number;
  width?: number;
  height?: number;
}) {
  const pts = sparkPoints(symbol, change);
  const min = Math.min(...pts);
  const max = Math.max(...pts);
  const span = max - min || 1;
  const d = pts
    .map((v, i) => {
      const x = (i / (pts.length - 1)) * width;
      const y = height - ((v - min) / span) * (height - 2) - 1;
      return `${i === 0 ? "M" : "L"}${x.toFixed(1)} ${y.toFixed(1)}`;
    })
    .join(" ");
  const up = change >= 0;
  return (
    <svg width={width} height={height} viewBox={`0 0 ${width} ${height}`} className="overflow-visible">
      <path
        d={d}
        fill="none"
        stroke={up ? "var(--nx-positive)" : "var(--nx-negative)"}
        strokeWidth="1.6"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}
