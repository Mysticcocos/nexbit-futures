import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import { uid } from "./utils";
import { seedPrices, getMarket } from "./markets";
import { normalizeTf } from "./candles";
import { BOT_GREETING, QUICK_REPLIES } from "./faq";
import { getEarnOffer, normalizeEarnId } from "./earn";
import type { Palette, ThemeId } from "./themes";
import { DEFAULT_CUSTOM, resolvePalette, applyPalette, applyUserChrome, cachePublicTheme, readCachedTheme } from "./themes";
import {
  isLiquidated,
  marginFromNotional,
  maxNotional,
  qtyFromNotional,
  unrealizedPnl,
  positionNotionalAtPrice,
  futuresFee,
  FUTURES_MAKER_FEE_RATE,
  FUTURES_TAKER_FEE_RATE,
} from "./trading";
import type {
  Activity,
  ChatMessage,
  EarnProduct,
  EarnSlot,
  EquityPoint,
  NexbitState,
  Order,
  OrderSide,
  OrderType,
  Position,
  PriceAlert,
  Ticket,
  TradeMode,
  TransferBook,
} from "./types";
import type { PriceTick } from "./markets";
import type { AccountSnapshot, ThemeSnapshot } from "./account-types";
import type { WalletRow } from "./types";

function withWalletCash<T extends { wallets: WalletRow[]; activeWalletId: string | null }>(s: T, liquidUsdt: number) {
  return {
    liquidUsdt,
    wallets: s.wallets.map((w) => (w.id === s.activeWalletId ? { ...w, usdt: liquidUsdt } : w)),
  };
}

function seedHoldings(): Record<string, number> {
  return {};
}

function seedActivity(): Activity[] {
  return [];
}

function seedNotifications() {
  return [] as { id: string; title: string; body: string; at: number; read: boolean }[];
}

export function initialPersisted(): Omit<NexbitState, "prices" | "hydrated" | "chainUsdt"> {
  return {
    themeId: "teal",
    customPalette: DEFAULT_CUSTOM,
    allowUserTheme: false,
    isAdmin: false,
    userName: "Trader",
    liquidUsdt: 0,
    holdings: seedHoldings(),
    watchlist: ["BTC/USDT", "ETH/USDT", "SOL/USDT", "XAU/USD", "EUR/USD"],
    selectedPair: "BTC/USDT",
    tradeMode: "futures",
    timeframe: "15m",
    leverage: 10,
    positions: [],
    orders: [],
    activity: seedActivity(),
    earn: [],
    copiedTraders: [],
    copyFollows: [],
    isLead: false,
    tickets: [],
    chat: [{ id: uid("msg"), from: "agent", text: BOT_GREETING, at: Date.now() - 1000 }],
    alerts: [],
    notifications: seedNotifications(),
    wallets: [],
    activeWalletId: null,
    accountUserId: null,
    futuresUsdt: 0,
    equityLog: [],
    locale: "en",
    appearance: "dark",
  };
}

function pushActivity(list: Activity[], row: Omit<Activity, "id" | "at">): Activity[] {
  return [{ id: uid("act"), at: Date.now(), ...row }, ...list].slice(0, 80);
}

type Actions = {
  setChainUsdt: (n: number) => void;
  hydrateTheme: () => void;
  setHydrated: (v: boolean) => void;
  hydrateAccount: (userId: string, snap: AccountSnapshot) => void;
  applyPublicTheme: (snap: ThemeSnapshot) => void;
  setWallets: (wallets: WalletRow[], activeId?: string | null) => void;
  setActiveWallet: (id: string) => void;
  setTheme: (id: ThemeId) => void;
  setCustomPalette: (p: Palette) => void;
  setAllowUserTheme: (v: boolean) => void;
  setLocale: (l: "en" | "ru") => void;
  setAppearance: (a: "dark" | "light") => void;
  loginAdmin: (user: string, pass: string) => boolean;
  logoutAdmin: () => void;
  resetDemo: () => void;
  setPair: (id: string) => void;
  setTradeMode: (m: TradeMode) => void;
  setTimeframe: (tf: string) => void;
  setLeverage: (n: number) => void;
  toggleWatchlist: (id: string) => void;
  applyPrices: (next: Record<string, PriceTick>) => void;
  placeOrder: (input: {
    type: OrderType;
    side: OrderSide;
    sizeUsdt: number;
    price?: number;
    stopPrice?: number;
  }) => { ok: boolean; error?: string };
  closePosition: (id: string) => { ok: boolean; error?: string };
  placeCloseOrder: (id: string, price: number) => { ok: boolean; error?: string };
  deposit: (amount: number) => void;
  withdraw: (amount: number) => { ok: boolean; error?: string };
  transferToEarn: (amount: number, product: EarnProduct) => { ok: boolean; error?: string };
  withdrawEarn: (product: EarnProduct, amount: number) => { ok: boolean; error?: string };
  transfer: (from: TransferBook, to: TransferBook, amount: number) => { ok: boolean; error?: string };
  convert: (fromSym: string, toSym: string, amount: number) => { ok: boolean; error?: string };
  copyTrader: (
    id: string,
    pair: string,
    leverage: number,
    opts?: { mode?: "margin" | "ratio"; amount?: number },
  ) => { ok: boolean; error?: string };
  uncopyTrader: (id: string) => void;
  becomeLead: () => void;
  sendChat: (text: string, image?: string, category?: string) => void;
  createTicket: (category: string, subject: string, body: string) => void;
  replyTicket: (id: string, text: string, as: "user" | "agent") => void;
  setTicketStatus: (id: string, status: Ticket["status"]) => void;
  addAlert: (pair: string, target: number, direction: "above" | "below") => void;
  removeAlert: (id: string) => void;
  markNotificationsRead: () => void;
  rename: (name: string) => void;
};

export const useNexbit = create<NexbitState & Actions>()(
  persist(
    (set, get) => ({
      ...initialPersisted(),
      prices: seedPrices(),
      hydrated: false,
      chainUsdt: 0,

      setChainUsdt: (n) => set({ chainUsdt: Number.isFinite(n) ? Math.max(0, n) : 0 }),

      setHydrated: (v) => set({ hydrated: v }),

      hydrateAccount: (userId, snap) => {
        const active = snap.trading.activeWalletId ?? snap.wallets[0]?.id ?? null;
        const liquid = snap.wallets.find((w) => w.id === active)?.usdt ?? 0;
        set({
          accountUserId: userId,
          userName: snap.displayName,
          isAdmin: snap.role === "admin",
          wallets: snap.wallets,
          activeWalletId: active,
          liquidUsdt: liquid,
          holdings: snap.trading.holdings ?? {},
          positions: snap.trading.positions ?? [],
          orders: snap.trading.orders ?? [],
          earn: snap.trading.earn ?? [],
          activity: snap.trading.activity ?? [],
          futuresUsdt: snap.trading.futuresUsdt ?? 0,
          equityLog:
            snap.trading.equityLog && snap.trading.equityLog.length
              ? snap.trading.equityLog
              : seedEquityWalk(liquid + (snap.trading.futuresUsdt ?? 0) + earnBalance(snap.trading.earn ?? [])),
        });
      },

      applyPublicTheme: (snap) => {
        applyUserChrome(snap.palette, get().appearance);
        cachePublicTheme(snap);
        set({
          themeId: snap.themeId,
          customPalette: snap.themeId === "custom" ? snap.palette : get().customPalette,
          allowUserTheme: false,
        });
      },

      setWallets: (wallets, activeId) => {
        const id = activeId === undefined ? get().activeWalletId : activeId;
        const liquid = wallets.find((w) => w.id === id)?.usdt ?? get().liquidUsdt;
        set({ wallets, activeWalletId: id, liquidUsdt: liquid });
      },

      setActiveWallet: (id) => {
        const s = get();
        const wallets = s.wallets.map((w) => (w.id === s.activeWalletId ? { ...w, usdt: s.liquidUsdt } : w));
        const next = wallets.find((w) => w.id === id);
        set({ wallets, activeWalletId: id, liquidUsdt: next?.usdt ?? 0 });
      },

      hydrateTheme: () => {
        const cached = readCachedTheme();
        const appearance = get().appearance;
        if (cached) {
          applyUserChrome(cached.palette, appearance);
          set({
            themeId: cached.themeId,
            customPalette: cached.themeId === "custom" ? cached.palette : get().customPalette,
            allowUserTheme: false,
          });
          return;
        }
        const s = get();
        applyUserChrome(resolvePalette(s.themeId, s.customPalette), appearance);
      },

      setTheme: (id) => {
        if (!get().isAdmin) return;
        const pal = resolvePalette(id, get().customPalette);
        applyUserChrome(pal, get().appearance);
        cachePublicTheme({ themeId: id, palette: pal, allowUserTheme: false });
        set({ themeId: id });
      },

      setCustomPalette: (p) => {
        if (!get().isAdmin) return;
        applyUserChrome(p, get().appearance);
        cachePublicTheme({ themeId: "custom", palette: p, allowUserTheme: false });
        set({ customPalette: p, themeId: "custom" });
      },

      setLocale: (l) => set({ locale: l }),
      setAppearance: (a) => {
        set({ appearance: a });
        const s = get();
        const cached = readCachedTheme();
        applyUserChrome(cached?.palette ?? resolvePalette(s.themeId, s.customPalette), a);
      },

      setAllowUserTheme: (v) => set({ allowUserTheme: v }),

      loginAdmin: (user, pass) => {
        if (user.trim() === "admin" && pass === "admin123") {
          set({ isAdmin: true });
          return true;
        }
        return false;
      },

      logoutAdmin: () => set({ isAdmin: false }),

      resetDemo: () => {
        const keep = {
          themeId: get().themeId,
          customPalette: get().customPalette,
          allowUserTheme: get().allowUserTheme,
          isAdmin: get().isAdmin,
        };
        set({ ...initialPersisted(), ...keep, prices: get().prices, hydrated: true, chainUsdt: 0 });
        applyPalette(resolvePalette(keep.themeId, keep.customPalette));
      },

      setPair: (id) => set({ selectedPair: id }),
      setTradeMode: (m) => set({ tradeMode: m }),
      setTimeframe: (tf) => set({ timeframe: normalizeTf(tf) }),
      setLeverage: (n) => set({ leverage: n }),

      toggleWatchlist: (id) =>
        set((s) => ({
          watchlist: s.watchlist.includes(id)
            ? s.watchlist.filter((x) => x !== id)
            : [...s.watchlist, id],
        })),

      applyPrices: (next) => {
        set((s) => {
          const prices = { ...s.prices, ...next };
          const openOrders = s.orders.some((o) => o.status === "open");
          const liveAlerts = s.alerts.some((a) => !a.triggered);
          if (!s.positions.length && !openOrders && !liveAlerts) {
            return { prices };
          }
          let liquidUsdt = s.liquidUsdt;
          let futuresUsdt = s.futuresUsdt;
          let positions = [...s.positions];
          let orders = [...s.orders];
          let activity = s.activity;
          let holdings = { ...s.holdings };
          const notes = [...s.notifications];

          const closed: Position[] = [];
          positions = positions.filter((p) => {
            const px = prices[p.pair]?.price;
            if (!px) return true;
            if (isLiquidated(p, px)) {
              closed.push(p);
              activity = pushActivity(activity, {
                kind: "liquidation",
                title: `Liquidated ${p.pair}`,
                detail: `${p.leverage}x ${p.side} · lost ${p.margin.toFixed(2)} USDT`,
                amount: -p.margin,
              });
              notes.unshift({
                id: uid("nt"),
                title: "Position liquidated",
                body: `${p.pair} ${p.side} ${p.leverage}x was closed at mark.`,
                at: Date.now(),
                read: false,
              });
              return false;
            }
            return true;
          });

          orders = orders.map((o) => {
            if (o.status !== "open") return o;
            if (o.reduceOnly && o.positionId && !positions.some((p) => p.id === o.positionId)) {
              return { ...o, status: "cancelled" as const };
            }
            const tick = prices[o.pair];
            if (!tick) return o;
            const px = tick.price;
            let hit = false;
            if (o.type === "limit" && o.price) {
              hit = o.side === "buy" ? px <= o.price : px >= o.price;
            } else if (o.type === "stop" && o.stopPrice) {
              hit = o.side === "buy" ? px >= o.stopPrice : px <= o.stopPrice;
            }
            if (!hit) return o;
            const fillAt = o.price ?? px;
            if (o.mode === "futures") {
              let chargedFee = 0;
              if (o.reduceOnly && o.positionId) {
                const pos = positions.find((p) => p.id === o.positionId);
                if (!pos) return { ...o, status: "cancelled" as const };
                const pnl = unrealizedPnl(pos, fillAt);
                const fee = futuresFee(positionNotionalAtPrice(pos, fillAt), "maker");
                chargedFee = fee;
                futuresUsdt += pos.margin + pnl - fee;
                positions = positions.filter((p) => p.id !== pos.id);
                activity = pushActivity(activity, {
                  kind: "trade",
                  title: `Closed ${pos.pair}`,
                  detail: `Limit · Maker fee ${fee.toFixed(4)} USDT · PNL ${pnl.toFixed(2)}`,
                  amount: pos.margin + pnl - fee,
                });
              } else {
                const fee = futuresFee(o.sizeUsdt, "maker");
                chargedFee = fee;
                const margin = marginFromNotional(o.sizeUsdt, o.leverage);
                if (futuresUsdt < margin + fee) return { ...o, status: "cancelled" as const };
                futuresUsdt -= margin + fee;
                positions.push({
                  id: uid("pos"),
                  pair: o.pair,
                  side: o.side === "buy" ? "long" : "short",
                  leverage: o.leverage,
                  entryPrice: fillAt,
                  sizeUsdt: o.sizeUsdt,
                  margin,
                  openedAt: Date.now(),
                });
                activity = pushActivity(activity, {
                  kind: "trade",
                  title: `Filled ${o.side} ${o.pair}`,
                  detail: `${o.type} · ${o.leverage}x · Maker fee ${fee.toFixed(4)} USDT`,
                  amount: -(margin + fee),
                });
              }
              return {
                ...o,
                status: "filled" as const,
                filledAt: Date.now(),
                fillPrice: fillAt,
                fee: chargedFee,
                feeRate: FUTURES_MAKER_FEE_RATE,
                liquidity: "maker" as const,
              };
            } else {
              const mkt = getMarket(o.pair);
              if (o.side === "buy") {
                if (liquidUsdt < o.sizeUsdt) return { ...o, status: "cancelled" };
                liquidUsdt -= o.sizeUsdt;
                holdings[mkt.base] = (holdings[mkt.base] ?? 0) + qtyFromNotional(o.sizeUsdt, fillAt);
              } else {
                const qty = qtyFromNotional(o.sizeUsdt, fillAt);
                if ((holdings[mkt.base] ?? 0) < qty) return { ...o, status: "cancelled" };
                holdings[mkt.base] -= qty;
                liquidUsdt += o.sizeUsdt;
              }
            }
            return { ...o, status: "filled" as const, filledAt: Date.now(), fillPrice: fillAt };
          });

          const alerts = s.alerts.map((a) => {
            if (a.triggered) return a;
            const px = prices[a.pair]?.price;
            if (!px) return a;
            const hit = a.direction === "above" ? px >= a.target : px <= a.target;
            if (!hit) return a;
            notes.unshift({
              id: uid("nt"),
              title: `Alert · ${a.pair}`,
              body: `Price is ${a.direction} ${a.target}`,
              at: Date.now(),
              read: false,
            });
            return { ...a, triggered: true };
          });

          return {
            prices,
            positions,
            orders,
            activity,
            holdings,
            futuresUsdt,
            notifications: notes.slice(0, 40),
            alerts,
            ...withWalletCash(s, liquidUsdt),
          };
        });
      },

      placeOrder: ({ type, side, sizeUsdt, price, stopPrice }) => {
        const s = get();
        const pair = s.selectedPair;
        const tick = s.prices[pair];
        if (!tick) return { ok: false, error: "No mark for this pair" };
        if (sizeUsdt <= 0) return { ok: false, error: "Enter a size" };

        if (type !== "market") {
          const order: Order = {
            id: uid("ord"),
            pair,
            mode: s.tradeMode,
            type,
            side,
            sizeUsdt,
            price,
            stopPrice,
            leverage: s.leverage,
            status: "open",
            createdAt: Date.now(),
          };
          set({ orders: [order, ...s.orders] });
          return { ok: true };
        }

        const px = tick.price;
        if (s.tradeMode === "futures") {
          const cap = maxNotional(s.futuresUsdt, s.leverage);
          if (sizeUsdt > cap + 1e-8) return { ok: false, error: "Not enough futures margin — transfer first" };
          const margin = marginFromNotional(sizeUsdt, s.leverage);
          const fee = futuresFee(sizeUsdt, "taker");
          if (s.futuresUsdt < margin + fee) return { ok: false, error: "Not enough futures USDT for margin + fee" };
          const pos: Position = {
            id: uid("pos"),
            pair,
            side: side === "buy" ? "long" : "short",
            leverage: s.leverage,
            entryPrice: px,
            sizeUsdt,
            margin,
            openedAt: Date.now(),
          };
          const order: Order = {
            id: uid("ord"),
            pair,
            mode: "futures",
            type: "market",
            side,
            sizeUsdt,
            leverage: s.leverage,
            status: "filled",
            createdAt: Date.now(),
            filledAt: Date.now(),
            fillPrice: px,
            fee,
            feeRate: FUTURES_TAKER_FEE_RATE,
            liquidity: "taker",
          };
          set({
            futuresUsdt: s.futuresUsdt - margin - fee,
            positions: [pos, ...s.positions],
            orders: [order, ...s.orders],
            activity: pushActivity(s.activity, {
              kind: "trade",
              title: `${side === "buy" ? "Long" : "Short"} ${pair}`,
              detail: `Market · ${s.leverage}x · ${sizeUsdt.toFixed(2)} USDT · Taker fee ${fee.toFixed(4)} USDT`,
              amount: -(margin + fee),
            }),
            equityLog: pushEquity({ ...s, futuresUsdt: s.futuresUsdt - margin - fee }),
          });
          return { ok: true };
        }

        const mkt = getMarket(pair);
        const holdings = { ...s.holdings };
        let liquid = s.liquidUsdt;
        if (side === "buy") {
          if (liquid < sizeUsdt) return { ok: false, error: "Not enough USDT" };
          liquid -= sizeUsdt;
          holdings[mkt.base] = (holdings[mkt.base] ?? 0) + qtyFromNotional(sizeUsdt, px);
        } else {
          const qty = qtyFromNotional(sizeUsdt, px);
          if ((holdings[mkt.base] ?? 0) < qty) return { ok: false, error: `Not enough ${mkt.base}` };
          holdings[mkt.base] -= qty;
          liquid += sizeUsdt;
        }
        const order: Order = {
          id: uid("ord"),
          pair,
          mode: "spot",
          type: "market",
          side,
          sizeUsdt,
          leverage: 1,
          status: "filled",
          createdAt: Date.now(),
          filledAt: Date.now(),
          fillPrice: px,
        };
        set({
          ...withWalletCash(s, liquid),
          holdings,
          orders: [order, ...s.orders],
          activity: pushActivity(s.activity, {
            kind: "trade",
            title: `${side === "buy" ? "Bought" : "Sold"} ${mkt.base}`,
            detail: `Spot · ${pair}`,
            amount: side === "buy" ? -sizeUsdt : sizeUsdt,
          }),
          equityLog: pushEquity({ ...s, liquidUsdt: liquid, holdings }),
        });
        return { ok: true };
      },

      closePosition: (id) => {
        const s = get();
        const p = s.positions.find((x) => x.id === id);
        if (!p) return { ok: false, error: "Position gone" };
        const px = s.prices[p.pair]?.price ?? p.entryPrice;
        const pnl = unrealizedPnl(p, px);
        const fee = futuresFee(positionNotionalAtPrice(p, px), "taker");
        const proceeds = p.margin + pnl - fee;
        const order: Order = {
          id: uid("ord"),
          pair: p.pair,
          mode: "futures",
          type: "market",
          side: p.side === "long" ? "sell" : "buy",
          sizeUsdt: p.sizeUsdt,
          leverage: p.leverage,
          status: "filled",
          createdAt: Date.now(),
          filledAt: Date.now(),
          fillPrice: px,
          reduceOnly: true,
          positionId: p.id,
          fee,
          feeRate: FUTURES_TAKER_FEE_RATE,
          liquidity: "taker",
        };
        const nextPositions = s.positions.filter((x) => x.id !== id);
        const cancelledCloseOrders = s.orders.map((o) =>
          o.status === "open" && o.reduceOnly && o.positionId === id ? { ...o, status: "cancelled" as const } : o,
        );
        set({
          futuresUsdt: s.futuresUsdt + proceeds,
          positions: nextPositions,
          orders: [order, ...cancelledCloseOrders],
          activity: pushActivity(s.activity, {
            kind: "trade",
            title: `Closed ${p.pair}`,
            detail: `${p.side} ${p.leverage}x · Market · Taker fee ${fee.toFixed(4)} USDT · PNL ${pnl.toFixed(2)}`,
            amount: proceeds,
          }),
          equityLog: pushEquity({
            ...s,
            futuresUsdt: s.futuresUsdt + proceeds,
            positions: nextPositions,
          }),
        });
        return { ok: true };
      },

      placeCloseOrder: (id, price) => {
        const s = get();
        const p = s.positions.find((x) => x.id === id);
        if (!p) return { ok: false, error: "Position gone" };
        if (!Number.isFinite(price) || price <= 0) return { ok: false, error: "Enter a valid limit price" };
        const existing = s.orders.some((o) => o.status === "open" && o.reduceOnly && o.positionId === id);
        if (existing) return { ok: false, error: "A limit close order already exists for this position" };
        const order: Order = {
          id: uid("ord"),
          pair: p.pair,
          mode: "futures",
          type: "limit",
          side: p.side === "long" ? "sell" : "buy",
          sizeUsdt: p.sizeUsdt,
          price,
          leverage: p.leverage,
          status: "open",
          createdAt: Date.now(),
          reduceOnly: true,
          positionId: p.id,
          feeRate: FUTURES_MAKER_FEE_RATE,
          liquidity: "maker",
        };
        set({ orders: [order, ...s.orders] });
        return { ok: true };
      },

      deposit: (amount) => {
        if (amount <= 0) return;
        const s = get();
        const liquid = s.liquidUsdt + amount;
        set({
          ...withWalletCash(s, liquid),
          activity: pushActivity(s.activity, {
            kind: "deposit",
            title: "USDT top up",
            detail: s.wallets.find((w) => w.id === s.activeWalletId)?.name ?? "Spot",
            amount,
          }),
          equityLog: pushEquity({ ...s, liquidUsdt: liquid }),
        });
      },

      withdraw: (amount) => {
        const s = get();
        if (amount <= 0) return { ok: false, error: "Enter an amount" };
        if (s.liquidUsdt < amount) return { ok: false, error: "Not enough free USDT" };
        set({
          ...withWalletCash(s, s.liquidUsdt - amount),
          activity: pushActivity(s.activity, {
            kind: "withdraw",
            title: "USDT withdraw",
            detail: s.wallets.find((w) => w.id === s.activeWalletId)?.name ?? "Wallet",
            amount: -amount,
          }),
        });
        return { ok: true };
      },

      transferToEarn: (amount, product) => {
        const s = get();
        if (amount <= 0) return { ok: false, error: "Enter an amount" };
        if (s.liquidUsdt < amount) return { ok: false, error: "Not enough USDT" };
        const offer = getEarnOffer(normalizeEarnId(product));
        const apy = offer.apy;
        const id = offer.id;
        const earn = [...s.earn];
        const i = earn.findIndex((e) => e.product === id);
        if (i >= 0) earn[i] = { ...earn[i], amount: earn[i].amount + amount };
        else earn.push({ product: id, amount, apy, startedAt: Date.now() });
        set({
          ...withWalletCash(s, s.liquidUsdt - amount),
          earn,
          activity: pushActivity(s.activity, {
            kind: "earn",
            title: `Earn ${offer.title}`,
            detail: `${apy}% APY`,
            amount: -amount,
          }),
        });
        return { ok: true };
      },

      withdrawEarn: (product, amount) => {
        const s = get();
        const id = normalizeEarnId(product);
        const slot = s.earn.find((e) => e.product === id || e.product === product);
        if (!slot || slot.amount < amount) return { ok: false, error: "Not enough Earn balance" };
        set({
          ...withWalletCash(s, s.liquidUsdt + amount),
          earn: s.earn
            .map((e) => (e.product === slot.product ? { ...e, amount: e.amount - amount } : e))
            .filter((e) => e.amount > 0.0001),
          activity: pushActivity(s.activity, {
            kind: "transfer",
            title: "Earn → Wallet",
            detail: product,
            amount,
          }),
        });
        return { ok: true };
      },

      transfer: (from, to, amount) => {
        const s = get();
        if (from === to) return { ok: false, error: "Pick two different wallets" };
        if (amount <= 0) return { ok: false, error: "Enter an amount" };
        const books = bookBalances(s);
        if (books[from] < amount) return { ok: false, error: `Not enough in ${from}` };
        let liquid = s.liquidUsdt;
        let futures = s.futuresUsdt;
        let earn = [...s.earn];
        if (from === "spot") liquid -= amount;
        if (from === "futures") futures -= amount;
        if (from === "earn") {
          let left = amount;
          earn = earn
            .map((e) => {
              if (left <= 0) return e;
              const take = Math.min(e.amount, left);
              left -= take;
              return { ...e, amount: e.amount - take };
            })
            .filter((e) => e.amount > 0.0001);
          if (left > 0.01) return { ok: false, error: "Not enough Earn" };
        }
        if (to === "spot") liquid += amount;
        if (to === "futures") futures += amount;
        if (to === "earn") {
          const offer = getEarnOffer("flexible");
          const i = earn.findIndex((e) => e.product === offer.id);
          if (i >= 0) earn[i] = { ...earn[i], amount: earn[i].amount + amount };
          else earn.push({ product: offer.id, amount, apy: offer.apy, startedAt: Date.now() });
        }
        const next = { ...s, liquidUsdt: liquid, futuresUsdt: futures, earn };
        set({
          ...withWalletCash(s, liquid),
          futuresUsdt: futures,
          earn,
          activity: pushActivity(s.activity, {
            kind: "transfer",
            title: `${labelBook(from)} → ${labelBook(to)}`,
            detail: `${amount.toFixed(2)} USDT`,
            amount: to === "spot" ? amount : -amount,
          }),
          equityLog: pushEquity(next),
        });
        return { ok: true };
      },

      convert: (fromSym, toSym, amount) => {
        const s = get();
        if (fromSym === toSym) return { ok: false, error: "Pick two assets" };
        if (amount <= 0) return { ok: false, error: "Enter an amount" };
        const pxOf = (sym: string) => {
          if (sym === "USDT" || sym === "USD") return 1;
          const id = Object.keys(s.prices).find((k) => k.startsWith(`${sym}/`));
          return id ? s.prices[id]?.price : getMarket(`${sym}/USDT`).seedPrice;
        };
        const fromPx = pxOf(fromSym) ?? 0;
        const toPx = pxOf(toSym) ?? 0;
        if (!fromPx || !toPx) return { ok: false, error: "No market" };
        let liquid = s.liquidUsdt;
        const holdings = { ...s.holdings };
        const fromBal = fromSym === "USDT" ? liquid : (holdings[fromSym] ?? 0);
        if (fromBal < amount) return { ok: false, error: `Not enough ${fromSym}` };
        const usdt = amount * fromPx;
        const got = usdt / toPx;
        if (fromSym === "USDT") liquid -= amount;
        else holdings[fromSym] = fromBal - amount;
        if (toSym === "USDT") liquid += usdt;
        else holdings[toSym] = (holdings[toSym] ?? 0) + got;
        set({
          ...withWalletCash(s, liquid),
          holdings,
          activity: pushActivity(s.activity, {
            kind: "trade",
            title: `Convert ${fromSym} → ${toSym}`,
            detail: `${amount} ${fromSym} · ${got.toFixed(6)} ${toSym}`,
            amount: fromSym === "USDT" ? -amount : usdt,
          }),
        });
        return { ok: true };
      },

      copyTrader: (id, pair, leverage, opts) => {
        const s = get();
        if (s.copiedTraders.includes(id)) return { ok: true };
        const amount = Math.max(20, opts?.amount ?? 250);
        const size = Math.min(amount, maxNotional(s.futuresUsdt, leverage));
        if (size < 20) return { ok: false, error: "Transfer USDT to Futures first" };
        const px = s.prices[pair]?.price;
        if (!px) return { ok: false, error: "No mark" };
        const margin = marginFromNotional(size, leverage);
        if (s.futuresUsdt < margin) return { ok: false, error: "Not enough futures margin" };
        const pos: Position = {
          id: uid("pos"),
          pair,
          side: "long",
          leverage,
          entryPrice: px,
          sizeUsdt: size,
          margin,
          openedAt: Date.now(),
          copyOf: id,
        };
        set({
          futuresUsdt: s.futuresUsdt - margin,
          positions: [pos, ...s.positions],
          copiedTraders: [...s.copiedTraders, id],
          copyFollows: [
            { traderId: id, mode: opts?.mode ?? "margin", amount: margin, startedAt: Date.now(), realized: 0 },
            ...s.copyFollows,
          ],
          selectedPair: pair,
          leverage,
          activity: pushActivity(s.activity, {
            kind: "copy",
            title: "Copied trader",
            detail: `${id} · ${pair} ${leverage}x`,
            amount: -margin,
          }),
        });
        return { ok: true };
      },

      uncopyTrader: (id) =>
        set((s) => ({
          copiedTraders: s.copiedTraders.filter((x) => x !== id),
          copyFollows: s.copyFollows.filter((x) => x.traderId !== id),
        })),

      becomeLead: () => set({ isLead: true }),

      sendChat: (text, image, category) => {
        const trimmed = text.trim();
        if (!trimmed && !image) return;
        const userMsg: ChatMessage = {
          id: uid("msg"),
          from: "user",
          text: trimmed || "Attachment",
          at: Date.now(),
          image,
          category,
        };
        set((s) => ({ chat: [...s.chat, userMsg] }));
        const key = category && QUICK_REPLIES[category] ? category : guessCategory(trimmed);
        const reply = QUICK_REPLIES[key] ?? QUICK_REPLIES.Other;
        window.setTimeout(() => {
          set((s) => ({
            chat: [
              ...s.chat,
              { id: uid("msg"), from: "agent", text: reply, at: Date.now() },
            ],
          }));
        }, 700);
      },

      createTicket: (category, subject, body) => {
        const t: Ticket = {
          id: uid("tkt"),
          category,
          subject,
          status: "open",
          messages: [{ from: "user", text: body, at: Date.now() }],
          createdAt: Date.now(),
        };
        set((s) => ({ tickets: [t, ...s.tickets] }));
      },

      replyTicket: (id, text, as) => {
        set((s) => ({
          tickets: s.tickets.map((t) =>
            t.id === id
              ? {
                  ...t,
                  status: as === "agent" && t.status === "open" ? "in_progress" : t.status,
                  messages: [...t.messages, { from: as, text, at: Date.now() }],
                }
              : t,
          ),
        }));
      },

      setTicketStatus: (id, status) =>
        set((s) => ({
          tickets: s.tickets.map((t) => (t.id === id ? { ...t, status } : t)),
        })),

      addAlert: (pair, target, direction) =>
        set((s) => ({
          alerts: [
            { id: uid("al"), pair, target, direction, createdAt: Date.now() },
            ...s.alerts,
          ],
        })),

      removeAlert: (id) => set((s) => ({ alerts: s.alerts.filter((a) => a.id !== id) })),

      markNotificationsRead: () =>
        set((s) => ({
          notifications: s.notifications.map((n) => ({ ...n, read: true })),
        })),

      rename: (name) => set({ userName: name.trim() || "Alex Rivera" }),
    }),
    {
      name: "nexbit-v2",
      storage: createJSONStorage(() => {
        if (typeof window === "undefined") {
          return {
            getItem: () => null,
            setItem: () => {},
            removeItem: () => {},
          };
        }
        return localStorage;
      }),
      skipHydration: true,
      partialize: (s) => ({
        selectedPair: s.selectedPair,
        timeframe: s.timeframe,
        leverage: s.leverage,
        watchlist: s.watchlist,
        tradeMode: s.tradeMode,
        locale: s.locale,
        appearance: s.appearance,
        copiedTraders: s.copiedTraders,
        copyFollows: s.copyFollows,
        isLead: s.isLead,
      }),
    },
  ),
);

function guessCategory(text: string): string {
  const t = text.toLowerCase();
  if (/(lever|futur|pnl|long|short|liq)/.test(t)) return "Futures & Leverage";
  if (/(deposit|withdraw|wallet|transfer)/.test(t)) return "Deposit / Withdraw";
  if (/earn|apy|lock/.test(t)) return "Earn";
  if (/theme|color|admin/.test(t)) return "Technical";
  if (/verif|kyc/.test(t)) return "Verification";
  if (/trade|chart|pair|spot/.test(t)) return "Trading";
  return "Other";
}

export function earnBalance(earn: EarnSlot[]): number {
  return earn.reduce((a, e) => a + e.amount, 0);
}

export function bookBalances(s: Pick<NexbitState, "liquidUsdt" | "futuresUsdt" | "earn">) {
  return {
    spot: s.liquidUsdt,
    futures: s.futuresUsdt,
    earn: earnBalance(s.earn),
  };
}

function labelBook(b: TransferBook) {
  if (b === "spot") return "Spot";
  if (b === "futures") return "Futures";
  return "Earn";
}

export function seedEquityWalk(now: number): EquityPoint[] {
  const end = Date.now();
  const pts: EquityPoint[] = [];
  let v = now;
  const n = 28;
  const tmp: EquityPoint[] = [];
  for (let i = 0; i < n; i++) {
    const t = end - (n - 1 - i) * 12 * 3600_000;
    const wave = Math.sin(i / 3.2) * 0.018 + Math.cos(i / 5.1) * 0.01;
    v = Math.max(0, now * (0.82 + wave + i / n * 0.18));
    tmp.push({ t, v });
  }
  if (tmp.length) tmp[tmp.length - 1] = { t: end, v: now };
  return tmp;
}

function pushEquity(s: Pick<NexbitState, "liquidUsdt" | "holdings" | "positions" | "earn" | "prices" | "futuresUsdt" | "equityLog">): EquityPoint[] {
  const v = portfolioUsd(s);
  const log = s.equityLog ?? [];
  const last = log[log.length - 1];
  if (last && Date.now() - last.t < 20_000 && Math.abs(last.v - v) < 0.5) return log;
  return [...log, { t: Date.now(), v }].slice(-360);
}

export function portfolioUsd(
  s: Pick<NexbitState, "liquidUsdt" | "holdings" | "positions" | "earn" | "prices"> & { futuresUsdt?: number },
): number {
  let total = s.liquidUsdt + (s.futuresUsdt ?? 0) + earnBalance(s.earn);
  for (const [sym, amt] of Object.entries(s.holdings)) {
    const pair = Object.keys(s.prices).find((id) => id.startsWith(`${sym}/`));
    const px = pair ? s.prices[pair]?.price : undefined;
    if (px) total += amt * px;
  }
  for (const p of s.positions) {
    const px = s.prices[p.pair]?.price ?? p.entryPrice;
    total += p.margin + unrealizedPnl(p, px);
  }
  return total;
}

export function change24hPct(s: NexbitState): number {
  let weighted = 0;
  let total = 0;
  for (const [sym, amt] of Object.entries(s.holdings)) {
    const pair = Object.keys(s.prices).find((id) => id.startsWith(`${sym}/`));
    const tick = pair ? s.prices[pair] : undefined;
    if (!tick) continue;
    const value = amt * tick.price;
    weighted += value * tick.change;
    total += value;
  }
  const usdt = s.liquidUsdt + (s.futuresUsdt ?? 0) + earnBalance(s.earn);
  total += usdt;
  if (total <= 0) return 0;
  return weighted / total;
}
