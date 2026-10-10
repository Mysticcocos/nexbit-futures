import { useMemo, useState } from "react";
import { ArrowDownUp } from "lucide-react";
import { toast } from "sonner";
import { CoinIcon } from "@/components/icons/CoinIcon";
import { MARKETS } from "@/lib/markets";
import { useNexbit } from "@/lib/store";
import { useT } from "@/lib/i18n";
import { fmtPct, fmtPrice } from "@/lib/format";
import { cn } from "@/lib/utils";

export function ConvertPanel() {
  const t = useT();
  const convert = useNexbit((s) => s.convert);
  const liquid = useNexbit((s) => s.liquidUsdt);
  const holdings = useNexbit((s) => s.holdings);
  const prices = useNexbit((s) => s.prices);
  const [mode, setMode] = useState<"instant" | "recurring" | "limit">("instant");
  const [from, setFrom] = useState("USDT");
  const [to, setTo] = useState("BNB");
  const [amt, setAmt] = useState("");
  const assets = useMemo(
    () => ["USDT", ...MARKETS.filter((m) => m.category === "crypto").map((m) => m.base).filter((v, i, a) => a.indexOf(v) === i)],
    [],
  );
  const px = (sym: string) => {
    if (sym === "USDT") return 1;
    const id = Object.keys(prices).find((k) => k.startsWith(`${sym}/`));
    return id ? prices[id]?.price ?? 0 : 0;
  };
  const n = Number(amt) || 0;
  const rate = px(to) && px(from) ? px(to) / px(from) : 0;
  const got = px(from) && px(to) ? (n * px(from)) / px(to) : 0;
  const chg = prices[`${to}/USDT`]?.change ?? 0;

  return (
    <div className="flex min-h-0 flex-1 flex-col">
      <div className="rounded-md bg-nx-chip px-3 py-2 text-[11px] text-nx-muted">
        {t("convert")} · 1 {to} = {fmtPrice(px(to))} USDT{" "}
        <span className={chg >= 0 ? "text-nx-positive" : "text-nx-negative"}>{fmtPct(chg)}</span>
      </div>
      <div className="mt-3 flex gap-4 text-[13px]">
        {(
          [
            ["instant", t("instant")],
            ["recurring", t("recurring")],
            ["limit", t("limit")],
          ] as const
        ).map(([id, label]) => (
          <button
            key={id}
            type="button"
            onClick={() => setMode(id)}
            className={cn("h-8 border-b-2 font-semibold", mode === id ? "border-nx-accent text-nx-fg" : "border-transparent text-nx-muted")}
          >
            {label}
          </button>
        ))}
      </div>

      <AssetRow
        label={t("from")}
        symbol={from}
        assets={assets}
        onSymbol={setFrom}
        value={amt}
        onValue={setAmt}
        bal={from === "USDT" ? liquid : (holdings[from] ?? 0)}
      />
      <div className="flex justify-center py-1">
        <button
          type="button"
          onClick={() => {
            setFrom(to);
            setTo(from);
          }}
          className="flex size-8 items-center justify-center rounded-full bg-nx-chip text-nx-fg"
        >
          <ArrowDownUp className="size-4" />
        </button>
      </div>
      <AssetRow
        label={t("to")}
        symbol={to}
        assets={assets}
        onSymbol={setTo}
        value={got ? got.toFixed(6) : ""}
        onValue={() => undefined}
        bal={to === "USDT" ? liquid : (holdings[to] ?? 0)}
        readOnly
      />

      <button
        type="button"
        onClick={() => {
          const r = convert(from, to, n);
          if (!r.ok) toast.error(r.error);
          else toast.success(t("preview"));
        }}
        className="mt-6 h-12 w-full rounded-md bg-nx-accent text-[15px] font-semibold text-nx-accent-fg"
      >
        {t("preview")}
      </button>
      {mode !== "instant" ? <p className="mt-2 text-center text-[11px] text-nx-muted">{t("limit")} / {t("recurring")}</p> : null}
    </div>
  );
}

function AssetRow({
  label,
  symbol,
  assets,
  onSymbol,
  value,
  onValue,
  bal,
  readOnly,
}: {
  label: string;
  symbol: string;
  assets: string[];
  onSymbol: (s: string) => void;
  value: string;
  onValue: (s: string) => void;
  bal: number;
  readOnly?: boolean;
}) {
  return (
    <div className="mt-2 border-b border-nx-border py-2">
      <p className="text-[11px] text-nx-muted">{label}</p>
      <div className="flex items-center gap-2">
        <CoinIcon symbol={symbol} size="sm" />
        <select
          value={symbol}
          onChange={(e) => onSymbol(e.target.value)}
          className="bg-transparent text-[16px] font-semibold outline-none"
        >
          {assets.map((a) => (
            <option key={a} value={a}>
              {a}
            </option>
          ))}
        </select>
        <input
          readOnly={readOnly}
          inputMode="decimal"
          value={value}
          onChange={(e) => onValue(e.target.value)}
          placeholder="0.01 – 1000000"
          className="h-10 min-w-0 flex-1 bg-transparent text-right text-[16px] text-nx-muted tabular outline-none"
        />
      </div>
      <p className="text-right text-[10px] text-nx-muted">{bal.toFixed(4)} {symbol}</p>
    </div>
  );
}
