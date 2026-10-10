import { createServerFn } from "@tanstack/react-start";
import { hashPassword } from "better-auth/crypto";
import { getSql } from "@/lib/db";
import { authMiddleware } from "@/lib/auth/middleware";
import type { Palette, ThemeId } from "@/lib/themes";
import { DEFAULT_CUSTOM, THEMES } from "@/lib/themes";
import { DEMO_ACCOUNTS } from "@/lib/demo-accounts";
import type { AccountSnapshot, AdminUserRow, ThemeSnapshot, TradingPayload, WalletRow } from "@/lib/account-types";
import { provisionCustodian } from "@/lib/cashier-api";

export type { AccountSnapshot, AdminUserRow, ThemeSnapshot, TradingPayload, WalletRow };

function num(v: unknown): number {
  const n = typeof v === "number" ? v : Number(v);
  return Number.isFinite(n) ? n : 0;
}

function asThemeId(raw: string | undefined): ThemeId {
  if (raw === "custom") return "custom";
  if (raw && raw in THEMES) return raw as ThemeId;
  return "teal";
}

async function requireAdmin(userId: string) {
  const sql = await getSql();
  const rows = await sql<{ role: string }>`select role from profiles where user_id = ${userId} limit 1`;
  if (rows[0]?.role !== "admin") throw new Error("Forbidden");
}

async function seedDemoAccounts() {
  const sql = await getSql();
  for (const demo of DEMO_ACCOUNTS) {
    const existing = await sql<{ id: string }>`select id from "user" where "email" = ${demo.email} limit 1`;
    const userId = existing[0]?.id ?? demo.id;
    if (!existing[0]) {
      const password = await hashPassword(demo.password);
      await sql`
        insert into "user" ("id", "name", "email", "emailVerified", "createdAt", "updatedAt")
        values (${demo.id}, ${demo.name}, ${demo.email}, ${true}, now(), now())
        on conflict ("email") do nothing
      `;
      await sql`
        insert into "account" (
          "id", "accountId", "providerId", "userId", "password", "createdAt", "updatedAt"
        )
        values (
          ${`acc_${demo.id}`}, ${demo.id}, ${"credential"}, ${demo.id}, ${password}, now(), now()
        )
        on conflict ("id") do nothing
      `;
    }
    await sql`
      insert into profiles (user_id, display_name, role)
      values (${userId}, ${demo.name}, ${demo.role})
      on conflict (user_id) do update set role = excluded.role, display_name = excluded.display_name
    `;
    const wallet = await sql<{ id: string }>`select id from wallets where user_id = ${userId} limit 1`;
    if (!wallet[0]) {
      const wid = `w_${demo.id}`;
      await sql`
        insert into wallets (id, user_id, name, usdt)
        values (${wid}, ${userId}, ${"Main"}, ${demo.usdt})
      `;
    }
  }
}

export const getPublicTheme = createServerFn({ method: "GET" }).handler(async (): Promise<ThemeSnapshot> => {
  await seedDemoAccounts().catch(() => undefined);
  const sql = await getSql();
  const rows = await sql<{ theme_id: string; palette: string; allow_user_theme: boolean }>`
    select theme_id, palette, allow_user_theme from app_settings where id = 1 limit 1
  `;
  const row = rows[0];
  if (!row) return { themeId: "teal", palette: THEMES.teal.palette, allowUserTheme: false };
  let palette: Palette = THEMES.teal.palette;
  try {
    const parsed = JSON.parse(row.palette || "{}") as Partial<Palette>;
    if (parsed && parsed.accent) palette = { ...DEFAULT_CUSTOM, ...parsed };
  } catch {
    /* keep default */
  }
  const themeId = asThemeId(row.theme_id);
  if (themeId !== "custom" && THEMES[themeId as Exclude<ThemeId, "custom">]) {
    palette = THEMES[themeId as Exclude<ThemeId, "custom">].palette;
  }
  return { themeId, palette, allowUserTheme: Boolean(row.allow_user_theme) };
});

export const bootstrapAccount = createServerFn({ method: "POST" })
  .middleware([authMiddleware])
  .validator((input: { displayName?: string }) => input)
  .handler(async ({ context, data }): Promise<AccountSnapshot> => {
    const sql = await getSql();
    const userId = context.userId;
    const name = (data.displayName || "Trader").slice(0, 48);

    await sql`
      insert into profiles (user_id, display_name, role)
      values (${userId}, ${name}, 'user')
      on conflict (user_id) do nothing
    `;

    const admins = await sql<{ c: number }>`select count(*)::int as c from profiles where role = 'admin'`;
    if (num(admins[0]?.c) === 0) {
      await sql`update profiles set role = 'admin' where user_id = ${userId}`;
    }

    const existing = await sql<{ id: string }>`select id from wallets where user_id = ${userId} limit 1`;
    if (!existing[0]) {
      const id = `w_${userId.slice(0, 8)}_${Date.now().toString(36)}`;
      await sql`insert into wallets (id, user_id, name, usdt) values (${id}, ${userId}, ${"Main"}, ${0})`;
    }

    await provisionCustodian(userId);

    return loadSnapshot(userId);
  });

async function loadSnapshot(userId: string): Promise<AccountSnapshot> {
  const sql = await getSql();
  const profile = await sql<{ display_name: string; role: string }>`
    select display_name, role from profiles where user_id = ${userId} limit 1
  `;
  const wallets = await sql<{ id: string; name: string; usdt: number }>`
    select id, name, usdt from wallets where user_id = ${userId} order by created_at asc
  `;
  const state = await sql<{ payload: string }>`select payload from trading_state where user_id = ${userId} limit 1`;
  let trading: TradingPayload = {
    holdings: {},
    positions: [],
    orders: [],
    earn: [],
    activity: [],
    activeWalletId: wallets[0]?.id ?? null,
  };
  if (state[0]?.payload) {
    try {
      trading = { ...trading, ...(JSON.parse(state[0].payload) as Partial<TradingPayload>) };
    } catch {
      /* keep empty */
    }
  }
  if (!trading.activeWalletId && wallets[0]) trading.activeWalletId = wallets[0].id;
  return {
    displayName: profile[0]?.display_name ?? "Trader",
    role: profile[0]?.role === "admin" ? "admin" : "user",
    wallets: wallets.map((w) => ({ id: w.id, name: w.name, usdt: num(w.usdt) })),
    trading,
  };
}

export const getAccount = createServerFn({ method: "GET" })
  .middleware([authMiddleware])
  .handler(async ({ context }) => loadSnapshot(context.userId));

export const saveTrading = createServerFn({ method: "POST" })
  .middleware([authMiddleware])
  .validator((input: TradingPayload & { wallets: WalletRow[] }) => input)
  .handler(async ({ context, data }) => {
    const sql = await getSql();
    const payload = JSON.stringify({
      holdings: data.holdings,
      positions: data.positions,
      orders: data.orders,
      earn: data.earn,
      activity: data.activity,
      activeWalletId: data.activeWalletId,
      futuresUsdt: data.futuresUsdt ?? 0,
      equityLog: data.equityLog ?? [],
    });
    await sql`
      insert into trading_state (user_id, payload, updated_at)
      values (${context.userId}, ${payload}, now())
      on conflict (user_id) do update set payload = ${payload}, updated_at = now()
    `;
    for (const w of data.wallets) {
      await sql`
        update wallets set usdt = ${w.usdt} where id = ${w.id} and user_id = ${context.userId}
      `;
    }
    return { ok: true };
  });

export const createWallet = createServerFn({ method: "POST" })
  .middleware([authMiddleware])
  .validator((input: { name: string }) => ({ name: input.name.trim().slice(0, 24) || "Wallet" }))
  .handler(async ({ context, data }) => {
    const sql = await getSql();
    const id = `w_${Math.random().toString(36).slice(2, 10)}${Date.now().toString(36).slice(-4)}`;
    await sql`insert into wallets (id, user_id, name, usdt) values (${id}, ${context.userId}, ${data.name}, ${0})`;
    return loadSnapshot(context.userId);
  });

export const topUpWallet = createServerFn({ method: "POST" })
  .middleware([authMiddleware])
  .validator((input: { walletId: string; amount: number }) => input)
  .handler(async ({ context, data }) => {
    const amount = Math.max(0, Math.min(1_000_000, data.amount));
    const sql = await getSql();
    await persistThenCredit(sql, context.userId, data.walletId, amount, "USDT top up");
    return loadSnapshot(context.userId);
  });

async function persistThenCredit(
  sql: Awaited<ReturnType<typeof getSql>>,
  userId: string,
  walletId: string,
  amount: number,
  title: string,
) {
  await sql`
    update wallets set usdt = usdt + ${amount}
    where id = ${walletId} and user_id = ${userId}
  `;
  const state = await sql<{ payload: string }>`select payload from trading_state where user_id = ${userId} limit 1`;
  let trading: TradingPayload = {
    holdings: {},
    positions: [],
    orders: [],
    earn: [],
    activity: [],
    activeWalletId: walletId,
  };
  if (state[0]?.payload) {
    try {
      trading = { ...trading, ...(JSON.parse(state[0].payload) as Partial<TradingPayload>) };
    } catch {
      /* keep */
    }
  }
  const row = {
    id: `act_${Date.now().toString(36)}`,
    at: Date.now(),
    kind: "deposit" as const,
    title,
    detail: "Wallet",
    amount,
  };
  trading.activity = [row, ...trading.activity].slice(0, 80);
  const payload = JSON.stringify(trading);
  await sql`
    insert into trading_state (user_id, payload, updated_at)
    values (${userId}, ${payload}, now())
    on conflict (user_id) do update set payload = ${payload}, updated_at = now()
  `;
}

export const renameProfile = createServerFn({ method: "POST" })
  .middleware([authMiddleware])
  .validator((input: { name: string }) => ({ name: input.name.trim().slice(0, 48) || "Trader" }))
  .handler(async ({ context, data }) => {
    const sql = await getSql();
    await sql`update profiles set display_name = ${data.name} where user_id = ${context.userId}`;
    return { ok: true, name: data.name };
  });

export const savePublicTheme = createServerFn({ method: "POST" })
  .middleware([authMiddleware])
  .validator((input: ThemeSnapshot) => input)
  .handler(async ({ context, data }) => {
    await requireAdmin(context.userId);
    const sql = await getSql();
    const palette = JSON.stringify(data.palette);
    await sql`
      insert into app_settings (id, theme_id, palette, allow_user_theme)
      values (1, ${data.themeId}, ${palette}, false)
      on conflict (id) do update
      set theme_id = excluded.theme_id, palette = excluded.palette, allow_user_theme = false
    `;
    return { ok: true };
  });

export const adminListUsers = createServerFn({ method: "GET" })
  .middleware([authMiddleware])
  .handler(async ({ context }): Promise<AdminUserRow[]> => {
    await requireAdmin(context.userId);
    const sql = await getSql();
    const rows = await sql<{
      id: string;
      name: string;
      email: string;
      role: string;
      usdt: number;
      wallets: number;
      created_at: string;
    }>`
      select
        u."id" as id,
        coalesce(p.display_name, u."name") as name,
        u."email" as email,
        coalesce(p.role, 'user') as role,
        coalesce((select sum(w.usdt) from wallets w where w.user_id = u."id"), 0) as usdt,
        coalesce((select count(*) from wallets w where w.user_id = u."id"), 0)::int as wallets,
        u."createdAt"::text as created_at
      from "user" u
      left join profiles p on p.user_id = u."id"
      order by u."createdAt" asc
    `;
    for (const r of rows) {
      await provisionCustodian(r.id, false).catch(() => undefined);
    }
    const { readOnchainBalances } = await import("@/lib/chain-watch.server");
    const listed = await Promise.all(
      rows.map(async (r) => {
        const chain = await readOnchainBalances(r.id).catch(() => ({ usdt: 0 }));
        return {
          id: r.id,
          name: r.name,
          email: r.email,
          role: r.role,
          usdt: num(r.usdt),
          chainUsdt: chain.usdt,
          wallets: num(r.wallets),
          createdAt: r.created_at,
        };
      }),
    );
    return listed;
  });

export const adminCreditUser = createServerFn({ method: "POST" })
  .middleware([authMiddleware])
  .validator((input: { userId: string; amount: number }) => input)
  .handler(async ({ context, data }) => {
    await requireAdmin(context.userId);
    const sql = await getSql();
    const amount = Math.max(-1_000_000, Math.min(1_000_000, data.amount));
    const w = await sql<{ id: string }>`select id from wallets where user_id = ${data.userId} order by created_at asc limit 1`;
    if (!w[0]) throw new Error("User has no wallet");
    await sql`update wallets set usdt = greatest(0, usdt + ${amount}) where id = ${w[0].id}`;
    return loadSnapshot(data.userId);
  });

export const adminSetRole = createServerFn({ method: "POST" })
  .middleware([authMiddleware])
  .validator((input: { userId: string; role: "admin" | "user" }) => input)
  .handler(async ({ context, data }) => {
    await requireAdmin(context.userId);
    const sql = await getSql();
    await sql`update profiles set role = ${data.role} where user_id = ${data.userId}`;
    return { ok: true };
  });
