import { useNexbit } from "@/lib/store";
import { unrealizedPnl, pnlPct } from "@/lib/trading";
import { fmtPct, fmtSignedUsd } from "@/lib/format";
import { cn } from "@/lib/utils";
import { useRouterState } from "@tanstack/react-router";

export function PnLBar() {
  const path = useRouterState({ select: (s) => s.location.pathname });
  const positions = useNexbit((s) => s.positions);
  const prices = useNexbit((s) => s.prices);
  const pair = useNexbit((s) => s.selectedPair);

  if (path === "/trade") return null;
  if (path !== "/positions" && path !== "/orders") return null;
  if (positions.length === 0) return null;

  const focus = positions.find((p) => p.pair === pair) ?? positions[0];
  const px = prices[focus.pair]?.price ?? focus.entryPrice;
  const pnl = unrealizedPnl(focus, px);
  const pct = pnlPct(pnl, focus.margin);
  const up = pnl >= 0;

  return (
    <div className="border-t border-nx-border bg-nx-card px-4 py-2">
      <div className="flex items-center justify-between gap-3">
        <div className="min-w-0">
          <p className="truncate text-xs font-medium">
            {focus.pair} Perp {focus.leverage}x{" "}
            <span className={focus.side === "long" ? "text-nx-positive" : "text-nx-negative"}>
              {focus.side === "long" ? "Long" : "Short"}
            </span>
          </p>
          <p className="text-[11px] text-nx-muted">Invested: {fmtSignedUsd(focus.margin).replace("+", "")}</p>
        </div>
        <div className="text-right">
          <p className={cn("text-sm font-semibold tabular", up ? "text-nx-positive" : "text-nx-negative")}>
            {fmtPct(pct)}
          </p>
          <p className={cn("text-[11px] tabular", up ? "text-nx-positive" : "text-nx-negative")}>
            uPNL {fmtSignedUsd(pnl)}
          </p>
        </div>
      </div>
    </div>
  );
}
