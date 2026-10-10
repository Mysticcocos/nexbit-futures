import { useState } from "react";
import { Link, useNavigate, useRouterState } from "@tanstack/react-router";
import { ClipboardList, ChevronDown, Globe, LogOut, MessageCircle, Moon, Search, Sun, User } from "lucide-react";
import { Toaster, toast } from "sonner";
import { MoneySheet, SearchSheet } from "@/components/layout/Sheets";
import { authEnabled, signOut } from "@/lib/auth/client";
import { useNexbit } from "@/lib/store";
import { useT } from "@/lib/i18n";
import { cn } from "@/lib/utils";

export function DeskShell({ children }: { children: React.ReactNode }) {
  const path = useRouterState({ select: (s) => s.location.pathname });
  const t = useT();
  const setTradeMode = useNexbit((s) => s.setTradeMode);
  const nav = useNavigate();
  const isAdmin = useNexbit((s) => s.isAdmin);
  const locale = useNexbit((s) => s.locale);
  const setLocale = useNexbit((s) => s.setLocale);
  const appearance = useNexbit((s) => s.appearance);
  const setAppearance = useNexbit((s) => s.setAppearance);
  const ru = locale === "ru";
  const [buyOpen, setBuyOpen] = useState(false);
  const [search, setSearch] = useState(false);
  const [deposit, setDeposit] = useState(false);
  const [menu, setMenu] = useState(false);
  const [leaving, setLeaving] = useState(false);

  const leave = () => {
    if (leaving) return;
    setLeaving(true);
    void (async () => {
      try {
        if (authEnabled) await signOut("/login");
      } catch (e) {
        toast.error(e instanceof Error ? e.message : ru ? "Не удалось выйти" : "Could not sign out");
      } finally {
        window.location.href = "/login";
      }
    })();
  };

  const go = (to: "/trade" | "/futures", mode: "spot" | "futures") => {
    setTradeMode(mode);
    void nav({ to });
  };

  const item = (active: boolean) =>
    cn("flex h-9 items-center px-2.5 text-[13px] font-medium", active ? "text-nx-fg" : "text-nx-muted hover:text-nx-fg");

  return (
    <div className="flex min-h-dvh flex-col bg-nx-bg">
      <header className="flex h-14 shrink-0 items-center gap-0.5 border-b border-nx-border px-5">
        <Link to="/" className="mr-4 text-[16px] font-extrabold tracking-tight">
          NEX<span className="text-nx-accent">BIT</span>
        </Link>
        <div className="relative">
          <button
            type="button"
            onClick={() => setBuyOpen((v) => !v)}
            className={cn(item(path === "/p2p" || buyOpen), "gap-1")}
          >
            {ru ? "Купить крипту" : "Buy crypto"}
            <ChevronDown className="size-3.5" />
          </button>
          {buyOpen ? (
            <>
              <button type="button" className="fixed inset-0 z-20 cursor-default" aria-label="Close" onClick={() => setBuyOpen(false)} />
              <div className="absolute left-0 top-10 z-30 w-56 overflow-hidden rounded-xl border border-nx-border bg-nx-card py-1 shadow-lg">
                <Link
                  to="/p2p"
                  onClick={() => setBuyOpen(false)}
                  className="flex h-10 items-center px-3 text-[13px] hover:bg-nx-chip"
                >
                  {ru ? "P2P-торговля" : "P2P Trading"}
                </Link>
                <button
                  type="button"
                  onClick={() => {
                    setBuyOpen(false);
                    setDeposit(true);
                  }}
                  className="flex h-10 w-full items-center px-3 text-left text-[13px] hover:bg-nx-chip"
                >
                  {ru ? "Внести криптовалюту" : "Deposit crypto"}
                </button>
              </div>
            </>
          ) : null}
        </div>
        <Link to="/markets" className={item(path === "/markets")}>{t("markets")}</Link>
        <button type="button" onClick={() => go("/trade", "spot")} className={item(path === "/trade")}>{t("trade")}</button>
        <button type="button" onClick={() => go("/futures", "futures")} className={item(path === "/futures")}>{t("futures")}</button>
        <Link to="/copy" className={item(path === "/copy")}>{ru ? "Копитрейд" : "Copy"}</Link>
        <Link to="/earn" className={item(path === "/earn")}>Earn</Link>
        <Link to="/assets" className={item(path === "/assets")}>{t("assets")}</Link>
        <Link to="/wallet" className={item(path === "/wallet")}>{t("wallet")}</Link>
        {isAdmin ? <Link to="/admin" className={item(path === "/admin")}>Admin</Link> : null}
        <span className="flex-1" />
        <button type="button" onClick={() => setSearch(true)} className="flex size-9 items-center justify-center text-nx-muted" aria-label="Search">
          <Search className="size-4" />
        </button>
        <button
          type="button"
          onClick={() => setDeposit(true)}
          className="mx-1 flex h-8 items-center rounded-md bg-nx-accent px-3 text-[13px] font-semibold text-nx-accent-fg"
        >
          {ru ? "Пополнение" : "Deposit"}
        </button>
        <div className="relative">
          <button
            type="button"
            onClick={() => setMenu((v) => !v)}
            className="flex size-9 items-center justify-center text-nx-muted"
            aria-label="Account"
          >
            <User className="size-4" />
          </button>
          {menu ? (
            <>
              <button type="button" className="fixed inset-0 z-20 cursor-default" aria-label="Close" onClick={() => setMenu(false)} />
              <div className="absolute right-0 top-10 z-30 w-44 overflow-hidden rounded-xl border border-nx-border bg-nx-card py-1 shadow-lg">
              <Link to="/profile" onClick={() => setMenu(false)} className="flex h-10 items-center gap-2 px-3 text-[13px] hover:bg-nx-chip">
                <User className="size-3.5 text-nx-muted" /> {ru ? "Аккаунт" : "Account"}
              </Link>
              <button
                type="button"
                disabled={leaving}
                onClick={leave}
                className="flex h-10 w-full items-center gap-2 px-3 text-left text-[13px] text-nx-negative hover:bg-nx-chip"
              >
                <LogOut className="size-3.5" /> {leaving ? (ru ? "Выходим…" : "Signing out…") : ru ? "Выйти" : "Log out"}
              </button>
              </div>
            </>
          ) : null}
        </div>
        <Link to="/orders" className="flex size-9 items-center justify-center text-nx-muted" aria-label="Orders">
          <ClipboardList className="size-4" />
        </Link>
        <Link to="/support" className="flex size-9 items-center justify-center text-nx-muted" aria-label="Support">
          <MessageCircle className="size-4" />
        </Link>
        <button type="button" onClick={() => setLocale(locale === "ru" ? "en" : "ru")} className="flex size-9 items-center justify-center text-nx-muted" aria-label="Language">
          <Globe className="size-4" />
        </button>
        <button type="button" onClick={() => setAppearance(appearance === "dark" ? "light" : "dark")} className="flex size-9 items-center justify-center text-nx-muted" aria-label="Theme">
          {appearance === "dark" ? <Moon className="size-4" /> : <Sun className="size-4" />}
        </button>
      </header>
      <main className="flex min-h-0 flex-1 flex-col overflow-auto">{children}</main>
      {search ? <SearchSheet onClose={() => setSearch(false)} /> : null}
      {deposit ? <MoneySheet mode="deposit" onClose={() => setDeposit(false)} /> : null}
      <Toaster theme="dark" position="bottom-right" richColors duration={1400} visibleToasts={2} />
    </div>
  );
}
