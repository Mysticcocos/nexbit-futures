import { useState } from "react";
import { ChevronDown, ChevronUp } from "lucide-react";
import { CoinIcon } from "@/components/icons/CoinIcon";
import { PositionCloseControls } from "@/components/trade/PositionCloseControls";
import { useNexbit } from "@/lib/store";
import { liquidationPrice, pnlPct, unrealizedPnl } from "@/lib/trading";
import { fmtPct, fmtPrice, fmtSignedUsd, fmtTime, fmtUsd } from "@/lib/format";
import { cn } from "@/lib/utils";

export function TradeDock() {
  const [open, setOpen] = useState(false);
  const [tab, setTab] = useState<"positions" | "orders">("positions");
  const positions = useNexbit((s) => s.positions);
  const orders = useNexbit((s) => s.orders);
  const prices = useNexbit((s) => s.prices);
  const setPair = useNexbit((s) => s.setPair);

  const live = positions.reduce((sum, p) => sum + unrealizedPnl(p, prices[p.pair]?.price ?? p.entryPrice), 0);

  return (
    <div className="sticky bottom-0 z-30 border-t border-nx-border bg-nx-bg/95 backdrop-blur-md pb-[max(8px,env(safe-area-inset-bottom))]">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="flex h-11 w-full items-center justify-between px-4 text-left"
      >
        <span className="flex items-center gap-3 text-xs font-semibold">
          <span className={positions.length ? "text-nx-fg" : "text-nx-muted"}>
            Positions {positions.length}
          </span>
          {positions.length ? (
            <span className={cn("tabular", live >= 0 ? "text-nx-positive" : "text-nx-negative")}>{fmtSignedUsd(live)}</span>
          ) : (
            <span className="font-normal text-nx-muted">Tap to open</span>
          )}
        </span>
        {open ? <ChevronDown className="size-4 text-nx-muted" /> : <ChevronUp className="size-4 text-nx-muted" />}
      </button>

      {open ? (
        <div className="max-h-[36vh] overflow-y-auto px-3 pb-2">
          <div className="mb-2 flex gap-1">
            {(["positions", "orders"] as const).map((t) => (
              <button
                key={t}
                type="button"
                onClick={() => setTab(t)}
                className={cn(
                  "h-8 flex-1 rounded-full text-xs font-semibold capitalize",
                  tab === t ? "bg-nx-accent text-nx-accent-fg" : "bg-nx-chip text-nx-muted",
                )}
              >
                {t}
              </button>
            ))}
          </div>

          {tab === "positions" ? (
            positions.length === 0 ? (
              <p className="py-6 text-center text-xs text-nx-muted">No open positions</p>
            ) : (
              <ul className="space-y-2">
                {positions.map((p) => {
                  const px = prices[p.pair]?.price ?? p.entryPrice;
                  const pnl = unrealizedPnl(p, px);
                  const pct = pnlPct(pnl, p.margin);
                  const up = pnl >= 0;
                  return (
                    <li key={p.id} className="rounded-nx-sm bg-nx-card px-3 py-3">
                      <div className="flex items-center gap-2">
                        <CoinIcon symbol={p.pair} size="sm" />
                        <button type="button" className="min-w-0 flex-1 text-left" onClick={() => setPair(p.pair)}>
                          <p className="text-sm font-semibold">
                            {p.pair}{" "}
                            <span className={p.side === "long" ? "text-nx-positive" : "text-nx-negative"}>
                              {p.side.toUpperCase()}
                            </span>{" "}
                            {p.leverage}x
                          </p>
                          <p className="text-[11px] text-nx-muted">
                            Entry {fmtPrice(p.entryPrice)} · Mark {fmtPrice(px)} · Liq {fmtPrice(liquidationPrice(p))}
                          </p>
                        </button>
                        <div className="text-right">
                          <p className={cn("text-sm font-semibold tabular", up ? "text-nx-positive" : "text-nx-negative")}>
                            {fmtSignedUsd(pnl)}
                          </p>
                          <p className={cn("text-[11px]", up ? "text-nx-positive" : "text-nx-negative")}>{fmtPct(pct)}</p>
                        </div>
                      </div>
<PositionCloseControls position={p} />
                    </li>
                  );
                })}
              </ul>
            )
          ) : orders.length === 0 ? (
            <p className="py-6 text-center text-xs text-nx-muted">No orders yet</p>
          ) : (
            <ul className="space-y-2">
              {orders.map((o) => (
                <li key={o.id} className="flex items-center gap-2 rounded-nx-sm bg-nx-card px-3 py-3">
                  <CoinIcon symbol={o.pair} size="sm" />
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium">
                      {o.pair} · {o.side.toUpperCase()} · {o.type}{o.reduceOnly ? " · CLOSE" : ""}
                    </p>
                    <p className="text-[11px] text-nx-muted">
                      {fmtUsd(o.sizeUsdt)}
                      {o.fillPrice ? ` @ ${fmtPrice(o.fillPrice)}` : o.price ? ` · ${fmtPrice(o.price)}` : ""} · {fmtTime(o.createdAt)}
                      {o.fee !== undefined ? ` · Fee ${o.fee.toFixed(4)} USDT` : o.feeRate ? ` · Fee ${(o.feeRate * 100).toFixed(3)}%` : ""}
                    </p>
                  </div>
                  <span
                    className={cn(
                      "text-[11px] font-medium capitalize",
                      o.status === "filled" ? "text-nx-positive" : o.status === "cancelled" ? "text-nx-negative" : "text-nx-accent",
                    )}
                  >
                    {o.status.replace("_", " ")}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </div>
      ) : null}
    </div>
  );
}
