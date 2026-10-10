import { useEffect, useRef, useState } from "react";
import { useNavigate } from "@tanstack/react-router";
import { Flame } from "lucide-react";
import { CoinIcon } from "@/components/icons/CoinIcon";
import type { Market } from "@/lib/markets";
import { fmtPct, fmtPrice } from "@/lib/format";
import { useNexbit } from "@/lib/store";
import { cn } from "@/lib/utils";

export function LivePrice({ value }: { value: number }) {
  const prev = useRef(value);
  const [dir, setDir] = useState<"up" | "down" | "flat">("flat");
  const [token, setToken] = useState(0);

  useEffect(() => {
    if (value > prev.current + 1e-12) setDir("up");
    else if (value < prev.current - 1e-12) setDir("down");
    else setDir("flat");
    prev.current = value;
    setToken((n) => n + 1);
  }, [value]);

  return (
    <span
      key={token}
      className={cn(
        "text-[13px] font-medium leading-tight tabular",
        dir === "up" && "nx-flash-up",
        dir === "down" && "nx-flash-down",
      )}
    >
      {fmtPrice(value)}
    </span>
  );
}

export function ChangePill({ change }: { change: number }) {
  const up = change >= 0;
  return (
    <span
      className={cn(
        "inline-flex h-7 min-w-[72px] items-center justify-center rounded-md px-1.5 text-[11px] font-semibold tabular",
        up ? "bg-[#2ebd85] text-white" : "bg-[#f6465d] text-white",
      )}
    >
      {fmtPct(change)}
    </span>
  );
}

export function TickerRow({
  market,
  hot = false,
}: {
  market: Market;
  hot?: boolean;
}) {
  const tick = useNexbit((s) => s.prices[market.id]);
  const setPair = useNexbit((s) => s.setPair);
  const nav = useNavigate();
  const price = tick?.price ?? market.seedPrice;
  const change = tick?.change ?? market.seedChange;

  return (
    <button
      type="button"
      className="grid w-full grid-cols-[minmax(0,1.1fr)_minmax(0,1fr)_86px] items-center gap-2 py-2.5 text-left"
      onClick={() => {
        setPair(market.id);
        if (market.category === "crypto") void nav({ to: "/trade" });
        else void nav({ to: "/futures" });
      }}
    >
      <span className="flex min-w-0 items-center gap-2">
        <CoinIcon symbol={market.base} size="xs" />
        <span className="truncate text-[13px] font-medium">{market.base}</span>
        {hot ? <Flame className="size-3.5 shrink-0 fill-[#f0b90b] text-[#f0b90b]" /> : null}
      </span>
      <span className="min-w-0 text-right">
        <span className="block">
          <LivePrice value={price} />
        </span>
        <span className="mt-0.5 block truncate text-[11px] text-nx-muted tabular">
          {price.toLocaleString("en-US", { maximumFractionDigits: price >= 10 ? 2 : 6 })} USD
        </span>
      </span>
      <span className="justify-self-end">
        <ChangePill change={change} />
      </span>
    </button>
  );
}
