import { useEffect, useState } from "react";
import { Outlet, Navigate, useRouterState } from "@tanstack/react-router";
import { Toaster } from "sonner";
import { useCurrentUserState } from "@/lib/auth/use-current-user";
import { useNexbit } from "@/lib/store";
import { startPriceEngine } from "@/lib/prices";
import { AccountSync, ThemeSync } from "./AccountSync";
import { Header } from "./Header";
import { BottomNav } from "./BottomNav";
import { DeskShell } from "./DeskShell";
import { GuestDesk } from "./GuestDesk";
import { PnLBar } from "@/components/trade/PnLBar";
import { MoreSheet } from "./Sheets";
import { useIsDesk } from "@/lib/desk";

export function Splash() {
  return (
    <div className="flex min-h-dvh items-center justify-center bg-nx-bg">
      <div className="text-center">
        <p className="text-3xl font-extrabold tracking-tight">
          NEX<span className="text-nx-accent">BIT</span>
        </p>
        <p className="mt-2 text-xs text-nx-muted">Loading exchange</p>
      </div>
    </div>
  );
}

export function AppFrame() {
  const path = useRouterState({ select: (s) => s.location.pathname });
  const { user, isPending } = useCurrentUserState();
  const desk = useIsDesk();

  return (
    <>
      <ThemeSync />
      {path === "/login" || path === "/source" ? (
        <Outlet />
      ) : isPending ? (
        <Splash />
      ) : !user && desk ? (
        <GuestDesk />
      ) : !user ? (
        <Navigate to="/login" replace />
      ) : (
        <AppShell>
          <AccountSync />
          <Outlet />
        </AppShell>
      )}
    </>
  );
}

export function AppShell({ children }: { children: React.ReactNode }) {
  const path = useRouterState({ select: (s) => s.location.pathname });
  const [ready, setReady] = useState(false);
  const [more, setMore] = useState(false);
  const desk = useIsDesk();

  useEffect(() => {
    let alive = true;
    const persist = useNexbit.persist;
    const finish = () => {
      if (!alive) return;
      useNexbit.getState().hydrateTheme();
      setReady(true);
    };
    const unsub = persist.onFinishHydration(finish);
    void Promise.resolve(persist.rehydrate()).then(finish).catch(finish);
    if (persist.hasHydrated()) finish();
    const fallback = window.setTimeout(finish, 250);
    return () => {
      alive = false;
      unsub();
      window.clearTimeout(fallback);
    };
  }, []);

  useEffect(() => {
    if (!ready) return;
    return startPriceEngine();
  }, [ready]);

  if (!ready) return <Splash />;
  if (desk) return <DeskShell>{children}</DeskShell>;

  return (
    <div className="min-h-dvh bg-nx-bg">
      <div className="relative mx-auto flex min-h-dvh w-full max-w-[430px] flex-col bg-nx-bg nx-elev-lg">
        {(path === "/" || path === "/wallet") ? <Header /> : <div className="h-[max(6px,env(safe-area-inset-top))]" />}
        <main className="relative flex min-h-0 flex-1 flex-col overflow-y-auto pb-2">{children}</main>
        <PnLBar />
        <BottomNav onMore={() => setMore(true)} />
        {more ? <MoreSheet onClose={() => setMore(false)} /> : null}
        <Toaster theme="dark" position="bottom-center" offset={64} richColors duration={1200} visibleToasts={2} />
      </div>
    </div>
  );
}
