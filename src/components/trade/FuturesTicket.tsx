import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import { useNexbit } from "@/lib/store";
import { futuresFee, marginFromNotional, maxNotionalWithFee } from "@/lib/trading";
import { fmtNum, fmtPrice } from "@/lib/format";
import { cn } from "@/lib/utils";
import type { OrderSide, OrderType } from "@/lib/types";

export function FuturesTicket() {
  const pair = useNexbit((s) => s.selectedPair);
  const lev = useNexbit((s) => s.leverage);
  const setLeverage = useNexbit((s) => s.setLeverage);
  const liquid = useNexbit((s) => s.futuresUsdt);
  const price = useNexbit((s) => s.prices[s.selectedPair]?.price ?? 0);
  const placeOrder = useNexbit((s) => s.placeOrder);
  const [margin, setMargin] = useState<"Cross" | "Isolated">("Cross");
  const [type, setType] = useState<OrderType>("limit");
  const [unit, setUnit] = useState<"BTC" | "USDT">("USDT");
  const [limitPx, setLimitPx] = useState("");
  const [amt, setAmt] = useState("");
  const [pct, setPct] = useState(0);
  const [tpSl, setTpSl] = useState(false);
  const [reduce, setReduce] = useState(false);
  const [levOpen, setLevOpen] = useState(false);

  useEffect(() => {
    if (price && !limitPx) setLimitPx(price >= 100 ? price.toFixed(1) : price.toFixed(4));
    // eslint-disable-next-line react-hooks/exhaustive-deps -- seed once from first tick
  }, [price]);

  const role = type === "limit" ? "maker" : "taker";
  const max = maxNotionalWithFee(liquid, lev, role);
  const px = Number(limitPx) || price;
  const amtN = Number(amt) || 0;
  const sizeUsdt = unit === "USDT" ? amtN : amtN * px;
  const usedMargin = marginFromNotional(sizeUsdt, lev);
  const qty = px > 0 ? sizeUsdt / px : 0;
  const estFee = futuresFee(sizeUsdt, role);
  const base = pair.split("/")[0] ?? "BTC";

  const applyPct = (p: number) => {
    setPct(p);
    const usdt = max * (p / 100);
    setAmt(unit === "USDT" ? usdt.toFixed(2) : px ? (usdt / px).toFixed(6) : "");
  };

  const submit = (side: OrderSide) => {
    const res = placeOrder({
      type,
      side,
      sizeUsdt: sizeUsdt || max * 0.1,
      price: type === "limit" ? px : undefined,
    });
    if (!res.ok) {
      toast.error(res.error ?? "Rejected");
      return;
    }
    toast.success(type === "market" ? (side === "buy" ? "Long opened" : "Short opened") : "Limit order placed");
  };

  const levLabel = useMemo(() => `${lev}x`, [lev]);

  return (
    <div className="min-w-0 overflow-hidden">
      <div className="flex gap-1">
        <Chip active={margin === "Cross"} onClick={() => setMargin("Cross")}>
          Cross
        </Chip>
        <button
          type="button"
          onClick={() => setLevOpen((v) => !v)}
          className="h-7 rounded-md bg-nx-chip px-2 text-[11px] font-semibold text-nx-fg"
        >
          {levLabel}
        </button>
        <Chip active={margin === "Isolated"} onClick={() => setMargin("Isolated")}>
          Iso
        </Chip>
      </div>
      {levOpen ? (
        <div className="mt-2 rounded-md bg-nx-chip px-2 py-2">
          <div className="flex items-center justify-between text-[11px]">
            <span className="text-nx-muted">Leverage</span>
            <span className="font-semibold text-nx-accent">{lev}x</span>
          </div>
          <input
            type="range"
            min={1}
            max={100}
            value={lev}
            onChange={(e) => setLeverage(Number(e.target.value))}
            className="mt-1 w-full accent-[var(--nx-accent)]"
          />
          <div className="flex justify-between text-[9px] text-nx-muted">
            <span>1x</span>
            <span>25x</span>
            <span>50x</span>
            <span>75x</span>
            <span>100x</span>
          </div>
        </div>
      ) : null}

      <button
        type="button"
        onClick={() => setType((t) => (t === "limit" ? "market" : "limit"))}
        className="mt-2 flex h-8 w-full items-center justify-between rounded-md bg-nx-chip px-2 text-[12px] font-semibold"
      >
        {type === "limit" ? "Limit" : "Market"}
        <span className="text-nx-muted">▾</span>
      </button>

      {type === "limit" ? (
        <div className="mt-1.5 flex gap-1">
          <label className="min-w-0 flex-1">
            <span className="sr-only">Price</span>
            <input
              inputMode="decimal"
              value={limitPx}
              onChange={(e) => setLimitPx(e.target.value)}
              placeholder={fmtPrice(price)}
              className="h-9 w-full rounded-md bg-nx-chip px-2 text-[12px] tabular outline-none"
            />
          </label>
          <button
            type="button"
            onClick={() => setLimitPx(price ? price.toFixed(1) : "")}
            className="h-9 rounded-md bg-nx-chip px-2 text-[11px] font-semibold"
          >
            BBO
          </button>
        </div>
      ) : null}

      <div className="mt-1.5 flex gap-1">
        <input
          inputMode="decimal"
          value={amt}
          onChange={(e) => setAmt(e.target.value)}
          placeholder="Amount"
          className="h-9 min-w-0 flex-1 rounded-md bg-nx-chip px-2 text-[12px] tabular outline-none"
        />
        <button
          type="button"
          onClick={() => setUnit((u) => (u === "USDT" ? "BTC" : "USDT"))}
          className="h-9 rounded-md bg-nx-chip px-2 text-[11px] font-semibold"
        >
          {unit === "USDT" ? "USDT" : base}
        </button>
      </div>

      <div className="mt-2">
        <input
          type="range"
          min={0}
          max={100}
          value={pct}
          onChange={(e) => applyPct(Number(e.target.value))}
          className="w-full accent-[var(--nx-accent)]"
        />
        <div className="flex justify-between text-[9px] text-nx-muted">
          <span>0%</span>
          <span>25%</span>
          <span>50%</span>
          <span>75%</span>
          <span>100%</span>
        </div>
      </div>

      <p className="mt-2 flex items-center justify-between text-[10px] text-nx-muted">
        Futures
        <span className="tabular text-nx-fg">{fmtNum(liquid, 2)} USDT</span>
      </p>
      {liquid < 1 ? <p className="text-[10px] text-nx-accent">Transfer from Spot to open positions</p> : null}

      <label className="mt-1.5 flex items-center gap-1.5 text-[11px] text-nx-muted">
        <input type="checkbox" checked={tpSl} onChange={(e) => setTpSl(e.target.checked)} />
        TP/SL
      </label>
      {tpSl ? (
        <div className="mt-1 grid grid-cols-2 gap-1">
          <input placeholder="TP" className="h-8 rounded-md bg-nx-chip px-2 text-[11px] outline-none" />
          <input placeholder="SL" className="h-8 rounded-md bg-nx-chip px-2 text-[11px] outline-none" />
        </div>
      ) : null}
      <label className="mt-1 flex items-center gap-1.5 text-[11px] text-nx-muted">
        <input type="checkbox" checked={reduce} onChange={(e) => setReduce(e.target.checked)} />
        Reduce only
      </label>

      <p className="mt-1.5 text-[10px] text-nx-muted">
        Max <span className="float-right tabular text-nx-fg">{fmtNum(qty, 4)} {base}</span>
      </p>
      <p className="text-[10px] text-nx-muted">
        Margin <span className="float-right tabular text-nx-fg">{fmtNum(usedMargin, 2)} USDT</span>
      </p>
      <p className="text-[10px] text-nx-muted">
        Fee ({role === "maker" ? "Maker 0.02%" : "Taker 0.055%"})
        <span className="float-right tabular text-nx-fg">{fmtNum(estFee, 4)} USDT</span>
      </p>

      <button
        type="button"
        onClick={() => submit("buy")}
        className="mt-1.5 h-9 w-full rounded-md bg-nx-positive text-[13px] font-semibold text-nx-accent-fg"
      >
        Buy / Long
      </button>
      <button
        type="button"
        onClick={() => submit("sell")}
        className="mt-1.5 h-9 w-full rounded-md bg-nx-negative text-[13px] font-semibold text-nx-fg"
      >
        Sell / Short
      </button>
    </div>
  );
}

function Chip({ active, onClick, children }: { active: boolean; onClick: () => void; children: React.ReactNode }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "h-7 rounded-md px-2 text-[11px] font-semibold",
        active ? "bg-nx-chip text-nx-fg" : "bg-nx-chip/60 text-nx-muted",
      )}
    >
      {children}
    </button>
  );
}
