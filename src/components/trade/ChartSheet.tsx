import { useState } from "react";
import { ChevronDown } from "lucide-react";
import { Backdrop } from "@/components/layout/Sheets";
import { NexbitChart } from "@/components/trade/NexbitChart";
import { ALL_TIMEFRAMES, isQuickTf, normalizeTf } from "@/lib/candles";
import { getMarket } from "@/lib/markets";
import { useNexbit } from "@/lib/store";
import { useT } from "@/lib/i18n";
import { cn } from "@/lib/utils";

const DOCK_TF = ["15m", "30m", "1h", "2h", "4h", "6h", "12h"] as const;

export function ChartSheet({ pair, onClose }: { pair: string; onClose: () => void }) {
  const t = useT();
  const setTf = useNexbit((s) => s.setTimeframe);
  const tf = normalizeTf(useNexbit((s) => s.timeframe));
  const [all, setAll] = useState(false);
  const market = getMarket(pair);

  return (
    <div className="pointer-events-none fixed inset-x-0 z-20 mx-auto flex w-full max-w-[430px] justify-center bottom-[calc(3.25rem+env(safe-area-inset-bottom))]">
      <div className="pointer-events-auto flex h-[42vh] min-h-[260px] w-full flex-col rounded-t-xl border-t border-nx-border bg-nx-bg shadow-[0_-8px_24px_rgba(0,0,0,0.35)]">
        <button type="button" onClick={onClose} className="flex h-5 w-full items-center justify-center" aria-label="Collapse chart">
          <span className="h-1 w-10 rounded-full bg-nx-muted/45" />
        </button>
        <div className="flex items-center gap-2 px-3 pb-1">
          <p className="min-w-0 flex-1 truncate text-[11px] font-semibold text-nx-muted">
            {t("chart")} {market.base}
            {market.quote} {market.kind === "perp" ? t("perp") : t("spot")}
          </p>
          <button type="button" onClick={onClose} className="flex items-center text-[11px] text-nx-muted">
            <ChevronDown className="size-4" />
          </button>
        </div>
        <div className="flex items-center gap-1 px-2">
          <div className="flex min-w-0 flex-1 gap-1 overflow-x-auto">
            {DOCK_TF.map((id) => (
              <button
                key={id}
                type="button"
                onClick={() => setTf(id)}
                className={cn(
                  "h-7 shrink-0 px-2 text-[11px] font-medium",
                  tf === id ? "text-nx-fg" : "text-nx-muted",
                )}
              >
                {id === "30m" ? "30m" : id}
              </button>
            ))}
          </div>
          <button
            type="button"
            onClick={() => setAll(true)}
            className="h-7 shrink-0 rounded bg-nx-chip px-2 text-[10px] text-nx-muted"
          >
            {isQuickTf(tf) || DOCK_TF.includes(tf as (typeof DOCK_TF)[number]) ? "▾" : tf}
          </button>
        </div>
        <div className="min-h-0 flex-1 overflow-hidden [&_.nx-chart]:aspect-auto [&_.nx-chart]:h-full">
          <NexbitChart compact />
        </div>
      </div>
      {all ? (
        <Backdrop onClose={() => setAll(false)}>
          <p className="mb-3 text-sm font-semibold">{t("chart")}</p>
          <div className="grid grid-cols-4 gap-2">
            {ALL_TIMEFRAMES.map((item) => (
              <button
                key={item.id}
                type="button"
                onClick={() => {
                  setTf(item.id);
                  setAll(false);
                }}
                className={cn(
                  "h-10 rounded-nx-sm text-sm font-semibold",
                  tf === item.id ? "bg-nx-accent text-nx-accent-fg" : "bg-nx-chip text-nx-muted",
                )}
              >
                {item.label}
              </button>
            ))}
          </div>
        </Backdrop>
      ) : null}
    </div>
  );
}
