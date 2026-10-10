import { useEffect, useRef } from "react";
import { useCurrentUser } from "@/lib/auth/use-current-user";
import { bootstrapAccount, getPublicTheme, saveTrading } from "@/lib/account";
import { cashierOnchainBalances } from "@/lib/cashier-api";
import { useNexbit } from "@/lib/store";

export async function persistAccount() {
  const cur = useNexbit.getState();
  await saveTrading({
    data: {
      holdings: cur.holdings,
      positions: cur.positions,
      orders: cur.orders,
      earn: cur.earn,
      activity: cur.activity,
      activeWalletId: cur.activeWalletId,
      wallets: cur.wallets,
      futuresUsdt: cur.futuresUsdt,
      equityLog: cur.equityLog,
    },
  });
}

export function ThemeSync() {
  const applyPublicTheme = useNexbit((s) => s.applyPublicTheme);
  const hydrateTheme = useNexbit((s) => s.hydrateTheme);

  useEffect(() => {
    hydrateTheme();
    let alive = true;
    const apply = () => {
      void getPublicTheme()
        .then((snap) => {
          if (alive) applyPublicTheme(snap);
        })
        .catch(() => {
          if (alive) hydrateTheme();
        });
    };
    apply();
    const unsub = useNexbit.persist.onFinishHydration(apply);
    const timer = window.setInterval(apply, 20000);
    return () => {
      alive = false;
      unsub();
      window.clearInterval(timer);
    };
  }, [applyPublicTheme, hydrateTheme]);

  return null;
}

export function AccountSync() {
  const user = useCurrentUser();
  const hydrateAccount = useNexbit((s) => s.hydrateAccount);
  const setChainUsdt = useNexbit((s) => s.setChainUsdt);
  const bootstrapped = useRef<string | null>(null);
  const timer = useRef<number | null>(null);
  const ready = useRef(false);

  useEffect(() => {
    if (!user) return;
    if (bootstrapped.current === user.id) return;
    let alive = true;
    void (async () => {
      for (let i = 0; i < 6; i++) {
        if (!alive) return;
        try {
          const snap = await bootstrapAccount({
            data: { displayName: user.displayName ?? user.primaryEmail ?? "Trader" },
          });
          if (!alive) return;
          hydrateAccount(user.id, snap);
          bootstrapped.current = user.id;
          ready.current = true;
          void cashierOnchainBalances()
            .then((b) => setChainUsdt(b.usdt))
            .catch(() => undefined);
          return;
        } catch {
          await new Promise((r) => setTimeout(r, 400 * (i + 1)));
        }
      }
    })();
    return () => {
      alive = false;
    };
  }, [user, hydrateAccount, setChainUsdt]);

  useEffect(() => {
    if (!user) return;
    const pull = () => {
      void cashierOnchainBalances()
        .then((b) => setChainUsdt(b.usdt))
        .catch(() => undefined);
    };
    const id = window.setInterval(pull, 20000);
    return () => window.clearInterval(id);
  }, [user, setChainUsdt]);

  useEffect(() => {
    if (!user) return;
    const unsub = useNexbit.subscribe((s, prev) => {
      if (!ready.current) return;
      const changed =
        s.liquidUsdt !== prev.liquidUsdt ||
        s.activeWalletId !== prev.activeWalletId ||
        s.wallets !== prev.wallets ||
        s.holdings !== prev.holdings ||
        s.positions !== prev.positions ||
        s.orders !== prev.orders ||
        s.earn !== prev.earn ||
        s.activity !== prev.activity ||
        s.futuresUsdt !== prev.futuresUsdt;
      if (!changed) return;
      if (timer.current) window.clearTimeout(timer.current);
      timer.current = window.setTimeout(() => {
        const cur = useNexbit.getState();
        void saveTrading({
          data: {
            holdings: cur.holdings,
            positions: cur.positions,
            orders: cur.orders,
            earn: cur.earn,
            activity: cur.activity,
            activeWalletId: cur.activeWalletId,
            wallets: cur.wallets,
            futuresUsdt: cur.futuresUsdt,
            equityLog: cur.equityLog,
          },
        }).catch(() => {
          /* next tick retries */
        });
      }, 900);
    });
    return () => {
      unsub();
      if (timer.current) window.clearTimeout(timer.current);
    };
  }, [user]);

  return null;
}
