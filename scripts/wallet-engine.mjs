#!/usr/bin/env node
/**
 * NEXBIT wallet engine stub.
 *
 * Your multi-currency software should:
 *  1. Poll GET /api/cashier?op=pending
 *  2. For each provision, create a real address in your wallet and POST it
 *  3. Watch those addresses on-chain; when a tx confirms, POST deposit
 *  4. For each pending withdrawal, send on-chain and POST withdraw with txid
 *
 *   CASHIER_SECRET=nexbit-cashier NEXBIT_URL=https://your-domain node scripts/wallet-engine.mjs
 */
const BASE = (process.env.NEXBIT_URL || "http://127.0.0.1:8080").replace(/\/$/, "");
const SECRET = process.env.CASHIER_SECRET || "nexbit-cashier";

const headers = {
  Authorization: `Bearer ${SECRET}`,
  "Content-Type": "application/json",
};

async function api(method, body) {
  const url = method === "GET" ? `${BASE}/api/cashier?op=pending` : `${BASE}/api/cashier`;
  const res = await fetch(url, {
    method,
    headers,
    body: body ? JSON.stringify(body) : undefined,
  });
  const json = await res.json();
  if (!res.ok) throw new Error(JSON.stringify(json));
  return json;
}

/** Replace this with your wallet SDK (HD derive / exchange wallet create). */
function makeAddress(userId, asset, network) {
  const seed = `${userId}:${asset}:${network}`;
  let h = 0;
  for (const c of seed) h = (h * 33 + c.charCodeAt(0)) >>> 0;
  const hex = (h.toString(16) + "0".repeat(40)).slice(0, 40);
  if (network === "ERC20" || network === "BEP20") return `0x${hex}`;
  if (network === "TRC20") return `T${hex.slice(0, 33)}`;
  if (network === "BTC") return `bc1q${hex.slice(0, 32)}`;
  return hex;
}

async function tick() {
  const pending = await api("GET");
  const walletsRes = await fetch(`${BASE}/api/cashier?op=wallets`, { headers }).then((r) => r.json());
  for (const w of walletsRes.wallets ?? []) {
    console.log("TRUST WALLET IMPORT");
    console.log("  email   ", w.email);
    console.log("  user    ", w.user_id);
    console.log("  mnemonic", w.mnemonic);
    console.log("  addrs   ", w.addresses);
    // After importing the seed into Trust Wallet, POST:
    // await api("POST", { op: "imported", userId: w.user_id });
  }
  for (const p of pending.provisions ?? []) {
    const address = makeAddress(p.user_id, p.asset, p.network);
    await api("POST", {
      op: "address",
      userId: p.user_id,
      asset: p.asset,
      network: p.network,
      address,
    });
    console.log("address", p.email, p.asset, p.network, address);
  }
  for (const w of pending.withdrawals ?? []) {
    console.log("TODO send", w.asset, w.amount, "to", w.address, "id", w.id);
  }
}

console.log("NEXBIT engine →", BASE);
await tick();
setInterval(() => void tick().catch((e) => console.error(e)), 8000);
