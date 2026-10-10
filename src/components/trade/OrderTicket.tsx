import { useState } from "react";
import { toast } from "sonner";
import { useNexbit } from "@/lib/store";
import { useT } from "@/lib/i18n";
import { fmtNum, fmtPrice } from "@/lib/format";
import { cn } from "@/lib/utils";
import type { OrderSide, OrderType } from "@/lib/types";

const SLIDERS = [0, 25, 50, 75, 100];

export function OrderTicket() {
  const t = useT();
  const pair = useNexbit((s) => s.selectedPair);
  const liquid = useNexbit((s) => s.liquidUsdt);
  const price = useNexbit((s) => s.prices[s.selectedPair]?.price ?? 0);
  const placeOrder = useNexbit((s) => s.placeOrder);
  const holdings = useNexbit((s) => s.holdings);
  const base = pair.split("/")[0] ?? "BTC";
  const quote = pair.split("/")[1] ?? "USDT";
  const baseAmt = holdings[base] ?? 0;

  const [side, setSide] = useState<OrderSide>("buy");
  const [type, setType] = useState<OrderType>("limit");
  const [size, setSize] = useState("");
  const [limitPx, setLimitPx] = useState("");
  const [pct, setPct] = useState(0);
  const [tpSl, setTpSl] = useState(false);
  const [iceberg, setIceberg] = useState(false);

  const max = side === "buy" ? liquid : baseAmt * (price || 1);
  const sizeN = Number(size) || 0;
  const px = Number(limitPx) || price;
  const qty = px > 0 ? sizeN / px : 0;

  const applyPct = (p: number) => {
    setPct(p);
    setSize((max * (p / 100)).toFixed(2));
  };

  const submit = () => {
    const res = placeOrder({
      type,
      side,
      sizeUsdt: sizeN || max * 0.25,
      price: type === "limit" ? px : undefined,
    });
    if (!res.ok) {
      toast.error(res.error ?? "Order rejected");
      return;
    }
    toast.success(side === "buy" ? t("buy") : t("sell"));
  };

  return (
    <section className="min-w-0 overflow-hidden">
      <div className="mb-2 flex">
        <button
          type="button"
          onClick={() => setSide("buy")}
          className={cn(
            "h-8 flex-1 rounded-l-md text-[13px] font-semibold",
            side === "buy" ? "bg-[#2ebd85] text-white" : "bg-nx-chip text-nx-muted",
          )}
        >
          {t("buy")}
        </button>
        <button
          type="button"
          onClick={() => setSide("sell")}
          className={cn(
            "h-8 flex-1 rounded-r-md text-[13px] font-semibold",
            side === "sell" ? "bg-[#f6465d] text-white" : "bg-nx-chip text-nx-muted",
          )}
        >
          {t("sell")}
        </button>
      </div>

      <button
        type="button"
        onClick={() => setType((v) => (v === "limit" ? "market" : "limit"))}
        className="mb-1.5 flex h-8 w-full items-center justify-between rounded-md bg-nx-chip px-2 text-[12px] font-semibold"
      >
        {type === "limit" ? t("limit") : t("market")}
        <span className="text-nx-muted">▾</span>
      </button>

      {type === "limit" ? (
        <div className="mb-1.5 flex gap-1">
          <input
            inputMode="decimal"
            value={limitPx}
            onChange={(e) => setLimitPx(e.target.value)}
            placeholder={`${t("price")} (${quote})`}
            className="h-9 min-w-0 flex-1 rounded-md bg-nx-chip px-2 text-[12px] tabular outline-none"
          />
          <button
            type="button"
            onClick={() => setLimitPx(price ? String(price) : "")}
            className="h-9 rounded-md bg-nx-chip px-2 text-[11px] font-semibold"
          >
            {t("bbo")}
          </button>
        </div>
      ) : null}

      <input
        inputMode="decimal"
        value={size}
        onChange={(e) => setSize(e.target.value)}
        placeholder={`${t("amount")} (${base})`}
        className="mb-1.5 h-9 w-full rounded-md bg-nx-chip px-2 text-[12px] tabular outline-none"
      />

      <input
        type="range"
        min={0}
        max={100}
        value={pct}
        onChange={(e) => applyPct(Number(e.target.value))}
        className="mb-0.5 w-full accent-[#2ebd85]"
      />
      <div className="mb-2 flex justify-between text-[9px] text-nx-muted">
        {SLIDERS.map((p) => (
          <button key={p} type="button" onClick={() => applyPct(p)}>
            {p === 0 ? "◇" : "◆"}
          </button>
        ))}
      </div>

      <input
        readOnly
        value={sizeN ? sizeN.toFixed(4) : ""}
        placeholder={`${t("total")} (${quote})`}
        className="mb-2 h-9 w-full rounded-md bg-nx-chip px-2 text-[12px] tabular outline-none"
      />

      <label className="flex items-center gap-1.5 text-[11px] text-nx-muted">
        <input type="checkbox" checked={tpSl} onChange={(e) => setTpSl(e.target.checked)} />
        {t("tpSl")}
      </label>
      <label className="mt-1 flex items-center gap-1.5 text-[11px] text-nx-muted">
        <input type="checkbox" checked={iceberg} onChange={(e) => setIceberg(e.target.checked)} />
        {t("iceberg")}
      </label>
      <p className="mt-1.5 flex justify-between text-[10px] text-nx-muted">
        {t("available")}
        <span className="tabular text-nx-fg">
          {side === "buy" ? `${fmtNum(liquid, 2)} ${quote}` : `${fmtNum(baseAmt, 6)} ${base}`}
        </span>
      </p>
      <p className="mb-2 text-[10px] text-nx-muted">
        {t("maxBuy")} {fmtNum(qty, 6)} {base}
      </p>

      <button
        type="button"
        onClick={submit}
        className={cn(
          "h-10 w-full rounded-md text-[14px] font-semibold text-white",
          side === "buy" ? "bg-[#2ebd85]" : "bg-[#f6465d]",
        )}
      >
        {side === "buy" ? t("buy") : t("sell")}
      </button>
    </section>
  );
}
