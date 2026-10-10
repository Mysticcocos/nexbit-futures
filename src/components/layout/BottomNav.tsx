import { Link, useNavigate, useRouterState } from "@tanstack/react-router";
import { BarChart3, CandlestickChart, Home, LineChart, Wallet } from "lucide-react";
import { useNexbit } from "@/lib/store";
import { useT } from "@/lib/i18n";
import { cn } from "@/lib/utils";

export function BottomNav({ onMore: _onMore }: { onMore: () => void }) {
  const path = useRouterState({ select: (s) => s.location.pathname });
  const t = useT();
  const setTradeMode = useNexbit((s) => s.setTradeMode);
  const nav = useNavigate();

  const goTrade = () => {
    setTradeMode("spot");
    void nav({ to: "/trade" });
  };
  const goFutures = () => {
    setTradeMode("futures");
    void nav({ to: "/futures" });
  };

  const item = (active: boolean) =>
    cn(
      "flex h-12 w-full flex-col items-center justify-center gap-0.5 transition-colors duration-150",
      active ? "text-nx-accent" : "text-nx-muted",
    );

  return (
    <nav className="sticky bottom-0 z-30 border-t border-nx-border bg-nx-bg/95 px-0.5 pt-0.5 backdrop-blur-md pb-[max(4px,env(safe-area-inset-bottom))]">
      <ul className="grid grid-cols-5">
        <li>
          <Link to="/" className={item(path === "/")}>
            <Home className="size-4" strokeWidth={path === "/" ? 2.2 : 1.7} />
            <span className="text-[9px] font-medium">{t("home")}</span>
          </Link>
        </li>
        <li>
          <Link to="/markets" className={item(path === "/markets")}>
            <BarChart3 className="size-4" strokeWidth={path === "/markets" ? 2.2 : 1.7} />
            <span className="text-[9px] font-medium">{t("markets")}</span>
          </Link>
        </li>
        <li>
          <button type="button" onClick={goTrade} className={item(path === "/trade")}>
            <CandlestickChart className="size-4" strokeWidth={path === "/trade" ? 2.2 : 1.7} />
            <span className="text-[9px] font-medium">{t("trade")}</span>
          </button>
        </li>
        <li>
          <button type="button" onClick={goFutures} className={item(path === "/futures")}>
            <LineChart className="size-4" strokeWidth={path === "/futures" ? 2.2 : 1.7} />
            <span className="text-[9px] font-medium">{t("futures")}</span>
          </button>
        </li>
        <li>
          <Link to="/assets" className={item(path === "/assets")}>
            <Wallet className="size-4" strokeWidth={path === "/assets" ? 2.2 : 1.7} />
            <span className="text-[9px] font-medium">{t("assets")}</span>
          </Link>
        </li>
      </ul>
    </nav>
  );
}
