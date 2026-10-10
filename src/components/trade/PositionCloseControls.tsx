import { useEffect, useState } from "react";
import { toast } from "sonner";
import { useNexbit } from "@/lib/store";
import { futuresFee, positionNotionalAtPrice } from "@/lib/trading";
import { fmtNum, fmtPrice } from "@/lib/format";
import type { Position } from "@/lib/types";

export function PositionCloseControls({ position }: { position: Position }) {
  const mark = useNexbit((s) => s.prices[position.pair]?.price ?? position.entryPrice);
  const closePosition = useNexbit((s) => s.closePosition);
  const placeCloseOrder = useNexbit((s) => s.placeCloseOrder);
  const [limitPrice, setLimitPrice] = useState(mark ? String(mark) : "");

  useEffect(() => {
    if (mark > 0) setLimitPrice(mark >= 100 ? mark.toFixed(1) : mark.toFixed(4));
  }, [position.id]); // seed when switching position

  const marketFee = futuresFee(positionNotionalAtPrice(position, mark), "taker");
  const limitPx = Number(limitPrice) || mark;
  const limitFee = futuresFee(positionNotionalAtPrice(position, limitPx), "maker");

  return (
    <div className="mt-2 rounded-md border border-nx-border p-2">
      <div className="flex items-center gap-1.5">
        <input
          inputMode="decimal"
          value={limitPrice}
          onChange={(e) => setLimitPrice(e.target.value)}
          className="h-8 min-w-0 flex-1 rounded-md bg-nx-chip px-2 text-[11px] tabular outline-none"
          aria-label="Limit close price"
        />
        <button
          type="button"
          onClick={() => setLimitPrice(mark >= 100 ? mark.toFixed(1) : mark.toFixed(4))}
          className="h-8 rounded-md bg-nx-chip px-2 text-[10px] font-semibold"
        >
          Mark
        </button>
      </div>
      <div className="mt-1.5 grid grid-cols-2 gap-1.5">
        <button
          type="button"
          onClick={() => {
            const r = placeCloseOrder(position.id, Number(limitPrice));
            if (r.ok) toast.success("Limit close order placed");
            else toast.error(r.error ?? "Rejected");
          }}
          className="h-8 rounded-md bg-nx-chip text-[11px] font-semibold"
        >
          Close Limit
        </button>
        <button
          type="button"
          onClick={() => {
            const r = closePosition(position.id);
            if (r.ok) toast.success("Position closed by market");
            else toast.error(r.error ?? "Rejected");
          }}
          className="h-8 rounded-md bg-nx-accent text-[11px] font-semibold text-nx-accent-fg"
        >
          Close Market
        </button>
      </div>
      <p className="mt-1.5 text-[9px] text-nx-muted">
        Maker 0.02% ≈ {fmtNum(limitFee, 4)} USDT · Taker 0.055% ≈ {fmtNum(marketFee, 4)} USDT · Mark {fmtPrice(mark)}
      </p>
    </div>
  );
}
