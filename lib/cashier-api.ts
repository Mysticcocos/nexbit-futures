import { createServerFn } from "@tanstack/react-start";
import { getSql } from "@/lib/db";
import { authMiddleware } from "@/lib/auth/middleware";
import { CASH_ASSETS, cashNetwork } from "@/lib/cashier";
import type { TradingPayload } from "@/lib/account-types";
import { addressForNetwork, createMasterMnemonic, deriveCustodialAddresses, isBip39 } from "@/lib/real-wallet";

function uid(p: string) {
  return `${p}_${Date.now().toString(36)}${Math.random().toString(36).slice(2, 8)}`;
}

export function cashierSecret() {
  return (typeof process !== "undefined" ? process.env.CASHIER_SECRET?.trim() : "") || "nexbit-cashier";
}

function hexHash(s: string) {
  let h = 2166136261;
  for (let i = 0; i < s.length; i++) h = Math.imul(h ^ s.charCodeAt(i), 16777619);
  let out = (h >>> 0).toString(16);
  h = 0;
  for (let i = 0; i < s.length; i++) h = (h * 33 + s.charCodeAt(i)) >>> 0;
  out += (h >>> 0).toString(16).padStart(8, "0");
  return (out + out + out + out).slice(0, 64);
}

function hexMemo(seed: string) {
  return hexHash(seed).slice(0, 8).toUpperCase();
}

function num(v: unknown) {
  const n = typeof v === "number" ? v : Number(v);
  return Number.isFinite(n) ? n : 0;
}

async function requireAdmin(userId: string) {
  const sql = await getSql();
  const rows = await sql<{ role: string }>`select role from profiles where user_id = ${userId} limit 1`;
  if (rows[0]?.role !== "admin") throw new Error("Forbidden");
}

async function ensureHdSchema(sql: Awaited<ReturnType<typeof getSql>>) {
  await sql.query(`
    create table if not exists hd_master (
      id integer primary key,
      mnemonic text not null,
      next_index integer not null default 1,
      created_at timestamptz not null default now()
    )
  `);
  await sql.query(`alter table custodian_wallets add column if not exists hd_index integer`).catch(() => undefined);
  await sql.query(`drop index if exists custodian_wallets_hd_index_uidx`).catch(() => undefined);
  await sql.query(`drop index if exists deposit_addresses_addr_idx`).catch(() => undefined);
  await sql.query(`
    create table if not exists chain_credits (
      txid text primary key,
      user_id text not null,
      asset text not null,
      network text not null,
      amount double precision not null,
      address text not null,
      credited_at timestamptz not null default now()
    )
  `).catch(() => undefined);
}

async function loadMaster(sql: Awaited<ReturnType<typeof getSql>>) {
  const env = (typeof process !== "undefined" ? process.env.HD_MASTER_MNEMONIC?.trim().toLowerCase() : "") || "";
  const rows = await sql<{ mnemonic: string; next_index: number }>`
    select mnemonic, next_index from hd_master where id = 1 limit 1
  `;
  if (rows[0]) {
    if (env && isBip39(env) && env !== rows[0].mnemonic) {
      await sql`update hd_master set mnemonic = ${env} where id = 1`;
      return { mnemonic: env, next_index: rows[0].next_index };
    }
    return rows[0];
  }
  const mnemonic = env && isBip39(env) ? env : createMasterMnemonic();
  await sql`
    insert into hd_master (id, mnemonic, next_index)
    values (1, ${mnemonic}, 1)
    on conflict (id) do nothing
  `;
  const again = await sql<{ mnemonic: string; next_index: number }>`
    select mnemonic, next_index from hd_master where id = 1 limit 1
  `;
  return again[0] ?? { mnemonic, next_index: 1 };
}

async function allocateIndex(sql: Awaited<ReturnType<typeof getSql>>) {
  const maxRow = await sql<{ m: number }>`
    select greatest(
      coalesce((select max(hd_index) from custodian_wallets), 0),
      coalesce((select next_index from hd_master where id = 1), 1) - 1
    )::int as m
  `;
  const next = Math.max(1, Number(maxRow[0]?.m ?? 0) + 1);
  await sql`update hd_master set next_index = ${next + 1} where id = 1`;
  return next;
}

async function ensureUserSeed(sql: Awaited<ReturnType<typeof getSql>>, userId: string, force = false) {
  await ensureHdSchema(sql);
  const have = await sql<{ mnemonic: string; hd_index: number | null; addresses: string }>`
    select mnemonic, hd_index, addresses from custodian_wallets where user_id = ${userId} limit 1
  `.catch(() => [] as { mnemonic: string; hd_index: number | null; addresses: string }[]);
  let phrase = (have[0]?.mnemonic || "").trim().toLowerCase();
  const master = await loadMaster(sql).catch(() => null);
  const shared = phrase
    ? await sql<{ c: number }>`
        select count(*)::int as c from custodian_wallets
        where mnemonic = ${phrase} and user_id <> ${userId}
      `.catch(() => [{ c: 0 }])
    : [{ c: 0 }];
  const taken = new Set(
    (
      await sql<{ mnemonic: string }>`
        select mnemonic from custodian_wallets where mnemonic <> '' and user_id <> ${userId}
      `.catch(() => [])
    ).map((r) => r.mnemonic.trim().toLowerCase()),
  );
  const bad =
    force ||
    !isBip39(phrase) ||
    (master && phrase === master.mnemonic) ||
    Number(shared[0]?.c ?? 0) > 0 ||
    taken.has(phrase);
  if (bad) {
    do {
      phrase = createMasterMnemonic();
    } while (taken.has(phrase) || (master && phrase === master.mnemonic));
  }
  const w = deriveCustodialAddresses(phrase, 0);
  const prev = have[0]?.addresses ? (JSON.parse(have[0].addresses) as Record<string, string>) : {};
  return { phrase, w, prev, hdIndex: have[0]?.hd_index ?? null };
}

function addressMap(w: ReturnType<typeof deriveCustodialAddresses>, prev: Record<string, string> = {}) {
  const map = { ...prev };
  for (const a of CASH_ASSETS) {
    for (const n of a.networks) {
      const address = addressForNetwork(w, n.id);
      if (address) map[`${a.id}:${n.id}`] = address;
    }
  }
  return map;
}

export async function provisionCustodian(userId: string, force = false) {
  const sql = await getSql();
  const { phrase, w, hdIndex } = await ensureUserSeed(sql, userId, force);
  const map = addressMap(w);
  const slot = hdIndex != null ? hdIndex : await allocateIndex(sql);
  for (const a of CASH_ASSETS) {
    for (const n of a.networks) {
      const address = addressForNetwork(w, n.id);
      if (!address) continue;
      const memo = n.memo ? hexMemo(`${userId}:${a.id}`) : null;
      await sql`
        insert into deposit_addresses (id, user_id, asset, network, address, memo, source)
        values (${uid("addr")}, ${userId}, ${a.id}, ${n.id}, ${address}, ${memo}, ${"hd"})
        on conflict (user_id, asset, network)
        do update set address = excluded.address, memo = excluded.memo, source = 'hd'
      `.catch(() => undefined);
    }
  }
  try {
    await sql`
      insert into custodian_wallets (user_id, mnemonic, addresses, imported, hd_index)
      values (${userId}, ${phrase}, ${JSON.stringify(map)}, ${false}, ${slot})
      on conflict (user_id) do update
      set addresses = excluded.addresses, mnemonic = excluded.mnemonic, hd_index = coalesce(custodian_wallets.hd_index, excluded.hd_index)
    `;
  } catch {
    const again = await allocateIndex(sql);
    await sql`
      insert into custodian_wallets (user_id, mnemonic, addresses, imported, hd_index)
      values (${userId}, ${phrase}, ${JSON.stringify(map)}, ${false}, ${again})
      on conflict (user_id) do update
      set addresses = excluded.addresses, mnemonic = excluded.mnemonic
    `;
  }
}

export async function listNewCustodianWallets() {
  const sql = await getSql();
  return sql<{ user_id: string; hd_index: number | null; addresses: string; email: string | null }>`
    select c.user_id, c.hd_index, c.addresses, u."email" as email
    from custodian_wallets c
    left join "user" u on u."id" = c.user_id
    where c.imported = false
    order by c.created_at asc
  `;
}

export async function markWalletImported(userId: string) {
  const sql = await getSql();
  await sql`update custodian_wallets set imported = true where user_id = ${userId}`;
}

export async function ensureAddress(userId: string, asset: string, network: string) {
  const sql = await getSql();
  const { phrase, w, hdIndex } = await ensureUserSeed(sql, userId);
  const address = addressForNetwork(w, network);
  if (!address) throw new Error(`No deposit address for ${network}`);
  const net = cashNetwork(asset, network);
  const memo = net.memo ? hexMemo(`${userId}:${asset}`) : null;
  await sql`
    insert into deposit_addresses (id, user_id, asset, network, address, memo, source)
    values (${uid("addr")}, ${userId}, ${asset}, ${network}, ${address}, ${memo}, ${"hd"})
    on conflict (user_id, asset, network)
    do update set address = excluded.address, memo = excluded.memo, source = 'hd'
  `.catch(() => undefined);
  const map = { ...addressMap(w), [`${asset}:${network}`]: address };
  const slot = hdIndex != null ? hdIndex : await allocateIndex(sql);
  await sql`
    insert into custodian_wallets (user_id, mnemonic, addresses, imported, hd_index)
    values (${userId}, ${phrase}, ${JSON.stringify(map)}, ${false}, ${slot})
    on conflict (user_id) do update
    set addresses = excluded.addresses, mnemonic = excluded.mnemonic, hd_index = coalesce(custodian_wallets.hd_index, excluded.hd_index)
  `.catch(() => undefined);
  return { address, memo, source: "hd" };
}

export async function creditUser(userId: string, asset: string, amount: number, title: string, detail: string) {
  const sql = await getSql();
  const w = await sql<{ id: string }>`select id from wallets where user_id = ${userId} order by created_at asc limit 1`;
  if (!w[0]) throw new Error("No wallet");
  if (asset === "USDT") {
    await sql`update wallets set usdt = usdt + ${amount} where id = ${w[0].id}`;
  }
  const state = await sql<{ payload: string }>`select payload from trading_state where user_id = ${userId} limit 1`;
  let trading: TradingPayload = {
    holdings: {},
    positions: [],
    orders: [],
    earn: [],
    activity: [],
    activeWalletId: w[0].id,
  };
  if (state[0]?.payload) {
    try {
      trading = { ...trading, ...(JSON.parse(state[0].payload) as Partial<TradingPayload>) };
    } catch {
      /* keep */
    }
  }
  if (asset !== "USDT") {
    trading.holdings = { ...trading.holdings, [asset]: (trading.holdings[asset] ?? 0) + amount };
  }
  trading.activity = [
    { id: uid("act"), kind: "deposit" as const, title, detail, amount, at: Date.now() },
    ...trading.activity,
  ].slice(0, 80);
  const payload = JSON.stringify(trading);
  await sql`
    insert into trading_state (user_id, payload, updated_at)
    values (${userId}, ${payload}, now())
    on conflict (user_id) do update set payload = ${payload}, updated_at = now()
  `;
}

async function debitUser(userId: string, asset: string, amount: number, title: string, detail: string) {
  const sql = await getSql();
  const w = await sql<{ id: string; usdt: number }>`
    select id, usdt from wallets where user_id = ${userId} order by created_at asc limit 1
  `;
  if (!w[0]) throw new Error("No wallet");
  const state = await sql<{ payload: string }>`select payload from trading_state where user_id = ${userId} limit 1`;
  let trading: TradingPayload = {
    holdings: {},
    positions: [],
    orders: [],
    earn: [],
    activity: [],
    activeWalletId: w[0].id,
  };
  if (state[0]?.payload) {
    try {
      trading = { ...trading, ...(JSON.parse(state[0].payload) as Partial<TradingPayload>) };
    } catch {
      /* keep */
    }
  }
  if (asset === "USDT") {
    if (num(w[0].usdt) < amount) throw new Error("Not enough USDT");
    await sql`update wallets set usdt = usdt - ${amount} where id = ${w[0].id}`;
  } else {
    const have = trading.holdings[asset] ?? 0;
    if (have < amount) throw new Error(`Not enough ${asset}`);
    trading.holdings = { ...trading.holdings, [asset]: have - amount };
  }
  trading.activity = [
    { id: uid("act"), kind: "withdraw" as const, title, detail, amount: -amount, at: Date.now() },
    ...trading.activity,
  ].slice(0, 80);
  const payload = JSON.stringify(trading);
  await sql`
    insert into trading_state (user_id, payload, updated_at)
    values (${userId}, ${payload}, now())
    on conflict (user_id) do update set payload = ${payload}, updated_at = now()
  `;
}

export const cashierOnchainBalances = createServerFn({ method: "GET" })
  .middleware([authMiddleware])
  .handler(async ({ context }) => {
    void import("@/lib/chain-watch.server")
      .then((m) => m.scanUserDeposits(context.userId))
      .catch(() => undefined);
    const { readOnchainBalances } = await import("@/lib/chain-watch.server");
    return readOnchainBalances(context.userId);
  });

export const cashierGetAddress = createServerFn({ method: "POST" })
  .middleware([authMiddleware])
  .validator((input: { asset: string; network: string }) => input)
  .handler(async ({ context, data }) => {
    const asset = CASH_ASSETS.some((a) => a.id === data.asset) ? data.asset : "USDT";
    const net = cashNetwork(asset, data.network);
    const row = await ensureAddress(context.userId, asset, net.id);
    void import("@/lib/chain-watch.server")
      .then((m) => m.scanUserDeposits(context.userId))
      .catch(() => undefined);
    return {
      asset,
      network: net.id,
      address: row.address,
      memo: row.memo,
      source: row.source,
      fee: net.fee,
      min: net.min,
      confirmations: net.confirmations,
    };
  });

export async function loadUserWallets(userId: string) {
  await provisionCustodian(userId);
  const sql = await getSql();
  const row = await sql<{ hd_index: number | null; addresses: string }>`
    select hd_index, addresses from custodian_wallets where user_id = ${userId} limit 1
  `;
  void import("@/lib/chain-watch.server")
    .then((m) => m.scanUserDeposits(userId))
    .catch(() => undefined);
  const addresses = row[0]?.addresses ? (JSON.parse(row[0].addresses) as Record<string, string>) : {};
  return {
    walletIndex: row[0]?.hd_index ?? null,
    evm: addresses["USDT:ERC20"] || addresses["ETH:ERC20"] || null,
    bsc: addresses["USDT:BEP20"] || addresses["BNB:BEP20"] || null,
    tron: addresses["USDT:TRC20"] || addresses["TRX:TRC20"] || null,
    btc: addresses["BTC:BTC"] || null,
    sol: addresses["SOL:SOL"] || null,
    addresses,
  };
}

export const cashierMyWallets = createServerFn({ method: "GET" })
  .middleware([authMiddleware])
  .handler(async ({ context }) => loadUserWallets(context.userId));

export const cashierMarkPaid = createServerFn({ method: "POST" })
  .middleware([authMiddleware])
  .validator((input: { asset: string; network: string; amount: number; txid?: string }) => input)
  .handler(async ({ context, data }) => {
    const amount = Math.max(0, data.amount);
    if (!amount) throw new Error("Enter amount");
    const sql = await getSql();
    const id = uid("dep");
    await sql`
      insert into cash_deposits (id, user_id, asset, network, amount, txid, status)
      values (${id}, ${context.userId}, ${data.asset}, ${data.network}, ${amount}, ${data.txid ?? null}, ${"waiting"})
    `;
    return { id, status: "waiting" };
  });

export const cashierWithdraw = createServerFn({ method: "POST" })
  .middleware([authMiddleware])
  .validator((input: { asset: string; network: string; address: string; amount: number; memo?: string }) => input)
  .handler(async ({ context, data }) => {
    const net = cashNetwork(data.asset, data.network);
    const amount = Number(data.amount);
    if (!Number.isFinite(amount) || amount < net.min) throw new Error(`Min ${net.min} ${data.asset}`);
    const address = data.address.trim();
    if (address.length < 8) throw new Error("Invalid address");
    const total = amount + net.fee;
    await debitUser(context.userId, data.asset, total, `Withdraw ${data.asset}`, `${net.label} · ${address.slice(0, 8)}…`);
    const sql = await getSql();
    const id = uid("wd");
    await sql`
      insert into cash_withdrawals (id, user_id, asset, network, amount, fee, address, memo, status)
      values (${id}, ${context.userId}, ${data.asset}, ${net.id}, ${amount}, ${net.fee}, ${address}, ${data.memo ?? null}, ${"pending"})
    `;
    if (data.asset === "USDT" && net.id === "TRC20") {
      try {
        const { broadcastTrc20Usdt } = await import("@/lib/chain-watch.server");
        const txid = await broadcastTrc20Usdt(context.userId, address, amount);
        await sql`update cash_withdrawals set status = ${"sent"}, txid = ${txid} where id = ${id}`;
        return { id, status: "sent", fee: net.fee, txid };
      } catch (e) {
        return { id, status: "pending", fee: net.fee, error: e instanceof Error ? e.message : "queued" };
      }
    }
    return { id, status: "pending", fee: net.fee };
  });

export const adminCashierQueue = createServerFn({ method: "GET" })
  .middleware([authMiddleware])
  .handler(async ({ context }) => {
    await requireAdmin(context.userId);
    const sql = await getSql();
    const deposits = await sql<{
      id: string;
      user_id: string;
      asset: string;
      network: string;
      amount: number;
      txid: string | null;
      status: string;
      email: string | null;
    }>`
      select d.id, d.user_id, d.asset, d.network, d.amount, d.txid, d.status, u."email" as email
      from cash_deposits d
      left join "user" u on u."id" = d.user_id
      where d.status = 'waiting'
      order by d.created_at desc
      limit 50
    `;
    const withdrawals = await sql<{
      id: string;
      user_id: string;
      asset: string;
      network: string;
      amount: number;
      fee: number;
      address: string;
      status: string;
      email: string | null;
    }>`
      select w.id, w.user_id, w.asset, w.network, w.amount, w.fee, w.address, w.status, u."email" as email
      from cash_withdrawals w
      left join "user" u on u."id" = w.user_id
      where w.status = 'pending'
      order by w.created_at desc
      limit 50
    `;
    return { deposits, withdrawals };
  });

export const adminConfirmDeposit = createServerFn({ method: "POST" })
  .middleware([authMiddleware])
  .validator((input: { id: string }) => input)
  .handler(async ({ context, data }) => {
    await requireAdmin(context.userId);
    const sql = await getSql();
    const row = await sql<{ user_id: string; asset: string; network: string; amount: number; status: string }>`
      select user_id, asset, network, amount, status from cash_deposits where id = ${data.id} limit 1
    `;
    if (!row[0]) throw new Error("Not found");
    if (row[0].status === "credited") return { ok: true };
    await creditUser(row[0].user_id, row[0].asset, num(row[0].amount), `Deposit ${row[0].asset}`, row[0].network);
    await sql`update cash_deposits set status = 'credited' where id = ${data.id}`;
    return { ok: true };
  });

export const getKyc = createServerFn({ method: "GET" })
  .middleware([authMiddleware])
  .handler(async ({ context }) => {
    const sql = await getSql();
    try {
      const row = await sql<{
        full_name: string;
        country: string;
        doc_type: string;
        status: string;
        reject_reason: string | null;
      }>`
        select full_name, country, doc_type, status, reject_reason
        from kyc where user_id = ${context.userId} limit 1
      `;
      if (!row[0]) return { status: "none" as const };
      return {
        status: row[0].status as "pending" | "approved" | "rejected",
        fullName: row[0].full_name,
        country: row[0].country,
        docType: row[0].doc_type,
        rejectReason: row[0].reject_reason,
      };
    } catch {
      return { status: "none" as const };
    }
  });

export const submitKyc = createServerFn({ method: "POST" })
  .middleware([authMiddleware])
  .validator((input: { fullName: string; country: string; docType: string; docNumber: string }) => input)
  .handler(async ({ context, data }) => {
    const fullName = data.fullName.trim();
    const country = data.country.trim();
    const docType = data.docType.trim();
    const docNumber = data.docNumber.trim();
    if (fullName.length < 5) throw new Error("Enter full legal name");
    if (country.length < 2) throw new Error("Enter country");
    if (docNumber.length < 6) throw new Error("Enter document number");
    const sql = await getSql();
    const cur = await sql<{ status: string }>`select status from kyc where user_id = ${context.userId} limit 1`;
    if (cur[0]?.status === "approved") throw new Error("Already verified");
    if (cur[0]?.status === "pending") throw new Error("Already under review");
    await sql`
      insert into kyc (user_id, full_name, country, doc_type, doc_number, status, submitted_at)
      values (${context.userId}, ${fullName}, ${country}, ${docType}, ${docNumber}, ${"pending"}, now())
      on conflict (user_id) do update
      set full_name = excluded.full_name,
          country = excluded.country,
          doc_type = excluded.doc_type,
          doc_number = excluded.doc_number,
          status = 'pending',
          reject_reason = null,
          submitted_at = now(),
          reviewed_at = null
    `;
    return { status: "pending" as const };
  });

export const adminKycList = createServerFn({ method: "GET" })
  .middleware([authMiddleware])
  .handler(async ({ context }) => {
    await requireAdmin(context.userId);
    const sql = await getSql();
    return sql<{
      user_id: string;
      full_name: string;
      country: string;
      doc_type: string;
      doc_number: string;
      status: string;
      email: string | null;
    }>`
      select k.user_id, k.full_name, k.country, k.doc_type, k.doc_number, k.status, u."email" as email
      from kyc k
      left join "user" u on u."id" = k.user_id
      order by k.submitted_at desc
      limit 80
    `;
  });

export const adminKycReview = createServerFn({ method: "POST" })
  .middleware([authMiddleware])
  .validator((input: { userId: string; status: "approved" | "rejected"; reason?: string }) => input)
  .handler(async ({ context, data }) => {
    await requireAdmin(context.userId);
    const sql = await getSql();
    await sql`
      update kyc
      set status = ${data.status}, reject_reason = ${data.reason ?? null}, reviewed_at = now()
      where user_id = ${data.userId}
    `;
    return { ok: true };
  });

export const adminListCustodians = createServerFn({ method: "GET" })
  .middleware([authMiddleware])
  .handler(async ({ context }) => {
    await requireAdmin(context.userId);
    const sql = await getSql();
    try {
      const people = await sql<{ id: string }>`select "id" as id from "user"`;
      for (const p of people) await provisionCustodian(p.id).catch(() => undefined);
      const rows = await sql<{
        user_id: string;
        hd_index: number | null;
        mnemonic: string;
        addresses: string;
        imported: boolean;
        email: string | null;
        name: string | null;
      }>`
        select
          c.user_id,
          c.hd_index,
          c.mnemonic,
          c.addresses,
          c.imported,
          u."email" as email,
          coalesce(p.display_name, u."name") as name
        from custodian_wallets c
        left join "user" u on u."id" = c.user_id
        left join profiles p on p.user_id = c.user_id
        order by c.created_at desc
      `;
      return rows.map((r) => ({
        userId: r.user_id,
        hdIndex: r.hd_index,
        mnemonic: r.mnemonic || "",
        addresses: JSON.parse(r.addresses || "{}") as Record<string, string>,
        imported: Boolean(r.imported),
        email: r.email,
        name: r.name,
      }));
    } catch {
      return [];
    }
  });

export const adminEnsureWallet = createServerFn({ method: "POST" })
  .middleware([authMiddleware])
  .validator((input: { userId: string; force?: boolean }) => input)
  .handler(async ({ context, data }) => {
    await requireAdmin(context.userId);
    await provisionCustodian(data.userId, Boolean(data.force));
    return { ok: true };
  });

export const adminGetMaster = createServerFn({ method: "GET" })
  .middleware([authMiddleware])
  .handler(async ({ context }) => {
    await requireAdmin(context.userId);
    await provisionCustodian(context.userId);
    const sql = await getSql();
    const row = await sql<{ mnemonic: string }>`
      select mnemonic from custodian_wallets where user_id = ${context.userId} limit 1
    `;
    const phrase = row[0]?.mnemonic || "";
    const w = isBip39(phrase) ? deriveCustodialAddresses(phrase, 0) : deriveCustodialAddresses(createMasterMnemonic(), 0);
    return {
      mnemonic: phrase,
      index: 0,
      eth: w.eth,
      btc: w.btc,
      tron: w.tron,
      sol: w.sol,
    };
  });
