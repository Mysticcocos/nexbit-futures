import { getSql } from "@/lib/db";
import { deriveCustodialSecrets, tronToHex } from "@/lib/real-wallet";
import { secp256k1 } from "@noble/curves/secp256k1.js";
import { sha256 } from "@noble/hashes/sha2.js";

const USDT_TRC20 = "TR7NHqjeKQxGTCi8q8ZY4pL8otSzgjLj6t";
const USDT_BEP20 = "0x55d398326f99059fF775485246999027B3197955";
const USDT_ERC20 = "0xdAC17F958D2ee523a2206206994597C13D831ec7";
const TRON_API = process.env.TRON_API_URL?.trim() || "https://api.trongrid.io";
const BSC_RPC = process.env.BSC_RPC_URL?.trim() || "https://bsc-dataseed.binance.org";
const ETH_RPC = process.env.ETH_RPC_URL?.trim() || "https://eth.llamarpc.com";

function toHex(bytes: Uint8Array) {
  return Array.from(bytes, (b) => b.toString(16).padStart(2, "0")).join("");
}

function pad32(hex: string) {
  return hex.replace(/^0x/i, "").replace(/^41/, "").toLowerCase().padStart(64, "0");
}

function amountFromToken(value: string, decimals: number) {
  const n = Number(value);
  if (!Number.isFinite(n) || n <= 0) return 0;
  return n / 10 ** decimals;
}

async function alreadyCredited(txid: string) {
  const sql = await getSql();
  const row = await sql<{ txid: string }>`select txid from chain_credits where txid = ${txid} limit 1`;
  return Boolean(row[0]);
}

async function recordCredit(txid: string, userId: string, asset: string, network: string, amount: number, address: string) {
  const sql = await getSql();
  try {
    await sql`
      insert into chain_credits (txid, user_id, asset, network, amount, address)
      values (${txid}, ${userId}, ${asset}, ${network}, ${amount}, ${address})
    `;
  } catch {
    return false;
  }
  const { creditUser } = await import("@/lib/cashier-api");
  await creditUser(userId, asset, amount, `Deposit ${asset}`, `${network} · ${txid.slice(0, 10)}…`);
  await sql`
    insert into cash_deposits (id, user_id, asset, network, amount, txid, status)
    values (${`dep_${Date.now().toString(36)}`}, ${userId}, ${asset}, ${network}, ${amount}, ${txid}, ${"credited"})
  `;
  return true;
}

type AddrRow = { user_id: string; address: string; network: string; asset: string };

async function loadAddresses(network: string, userId?: string) {
  const sql = await getSql();
  if (userId) {
    return sql<AddrRow>`
      select user_id, address, network, asset from deposit_addresses
      where network = ${network} and user_id = ${userId} and address not like 'pending:%'
    `;
  }
  return sql<AddrRow>`
    select user_id, address, network, asset from deposit_addresses
    where network = ${network} and address not like 'pending:%'
    order by created_at desc
    limit 80
  `;
}

async function scanTron(userId?: string) {
  const rows = (await loadAddresses("TRC20", userId)).filter((r) => r.address.startsWith("T"));
  let credited = 0;
  for (const row of rows) {
    const url = `${TRON_API}/v1/accounts/${row.address}/transactions/trc20?only_to=true&limit=40&contract_address=${USDT_TRC20}`;
    const res = await fetch(url, { headers: { accept: "application/json" } });
    if (!res.ok) continue;
    const json = (await res.json()) as { data?: Array<{ transaction_id: string; value: string; to: string; token_info?: { decimals?: number } }> };
    for (const tx of json.data ?? []) {
      if (!tx.transaction_id || tx.to !== row.address) continue;
      if (await alreadyCredited(tx.transaction_id)) continue;
      const decimals = tx.token_info?.decimals ?? 6;
      const amount = amountFromToken(tx.value, decimals);
      if (amount < 0.01) continue;
      if (await recordCredit(tx.transaction_id, row.user_id, "USDT", "TRC20", amount, row.address)) credited += 1;
    }
  }
  return credited;
}

async function evmTokenTxs(explorer: string, contract: string, address: string) {
  const url = `${explorer}&module=account&action=tokentx&contractaddress=${contract}&address=${address}&sort=desc`;
  const res = await fetch(url);
  if (!res.ok) return [];
  const json = (await res.json()) as { status?: string; result?: Array<{ hash: string; to: string; value: string; tokenDecimal: string; confirmations: string }> };
  if (!Array.isArray(json.result)) return [];
  return json.result;
}

async function scanEvm(userId?: string) {
  let credited = 0;
  const bscKey = process.env.BSCSCAN_KEY?.trim() ?? "";
  const ethKey = process.env.ETHERSCAN_KEY?.trim() ?? "";
  const bscRows = await loadAddresses("BEP20", userId);
  const ethRows = await loadAddresses("ERC20", userId);
  const jobs: Array<{ row: AddrRow; explorer: string; contract: string; network: string; decimals: number }> = [];
  if (bscKey) {
    for (const row of bscRows) {
      jobs.push({
        row,
        explorer: `https://api.bscscan.com/api?apikey=${encodeURIComponent(bscKey)}`,
        contract: USDT_BEP20,
        network: "BEP20",
        decimals: 18,
      });
    }
  }
  if (ethKey) {
    for (const row of ethRows) {
      jobs.push({
        row,
        explorer: `https://api.etherscan.io/api?apikey=${encodeURIComponent(ethKey)}`,
        contract: USDT_ERC20,
        network: "ERC20",
        decimals: 6,
      });
    }
  }
  for (const job of jobs) {
    const txs = await evmTokenTxs(job.explorer, job.contract, job.row.address);
    for (const tx of txs) {
      if (tx.to?.toLowerCase() !== job.row.address.toLowerCase()) continue;
      if (Number(tx.confirmations) < 12) continue;
      if (await alreadyCredited(tx.hash)) continue;
      const amount = amountFromToken(tx.value, Number(tx.tokenDecimal) || job.decimals);
      if (amount < 0.01) continue;
      if (await recordCredit(tx.hash, job.row.user_id, "USDT", job.network, amount, job.row.address)) credited += 1;
    }
  }
  void BSC_RPC;
  void ETH_RPC;
  return credited;
}

export async function scanUserDeposits(userId: string) {
  const tron = await scanTron(userId).catch(() => 0);
  const evm = await scanEvm(userId).catch(() => 0);
  return { credited: tron + evm };
}

export async function scanAllDeposits() {
  const tron = await scanTron().catch(() => 0);
  const evm = await scanEvm().catch(() => 0);
  return { credited: tron + evm };
}

function trc20Usdt(acc: { trc20?: Array<Record<string, string>> } | undefined) {
  if (!acc?.trc20) return 0;
  let n = 0;
  for (const row of acc.trc20) {
    const raw = row[USDT_TRC20] ?? row[USDT_TRC20.toLowerCase()];
    if (raw) n += Number(raw) / 1e6;
  }
  return Number.isFinite(n) ? n : 0;
}

async function tronBalances(address: string) {
  const res = await fetch(`${TRON_API}/v1/accounts/${address}`, { headers: { accept: "application/json" } });
  if (!res.ok) return { usdt: 0, trx: 0 };
  const json = (await res.json()) as { data?: Array<{ balance?: number; trc20?: Array<Record<string, string>> }> };
  const acc = json.data?.[0];
  if (!acc) return { usdt: 0, trx: 0 };
  return { usdt: trc20Usdt(acc), trx: (acc.balance ?? 0) / 1e6 };
}

async function evmTokenBalance(rpc: string, contract: string, wallet: string, decimals: number) {
  const addr = wallet.replace(/^0x/i, "").toLowerCase().padStart(64, "0");
  const res = await fetch(rpc, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({
      jsonrpc: "2.0",
      id: 1,
      method: "eth_call",
      params: [{ to: contract, data: `0x70a08231${addr}` }, "latest"],
    }),
  });
  if (!res.ok) return 0;
  const json = (await res.json()) as { result?: string };
  if (!json.result || json.result === "0x") return 0;
  return Number(BigInt(json.result)) / 10 ** decimals;
}

export async function readOnchainBalances(userId: string) {
  const sql = await getSql();
  const rows = await sql<{ address: string; network: string }>`
    select address, network from deposit_addresses
    where user_id = ${userId} and address not like 'pending:%'
  `.catch(() => [] as { address: string; network: string }[]);
  const seen = new Set<string>();
  let usdt = 0;
  const lines: Array<{ network: string; address: string; usdt: number }> = [];
  for (const row of rows) {
    const key = `${row.network}:${row.address}`;
    if (seen.has(key)) continue;
    seen.add(key);
    try {
      if (row.network === "TRC20" && row.address.startsWith("T")) {
        const b = await tronBalances(row.address);
        usdt += b.usdt;
        lines.push({ network: "TRC20", address: row.address, usdt: b.usdt });
      } else if (row.network === "BEP20" && row.address.startsWith("0x")) {
        const n = await evmTokenBalance(BSC_RPC, USDT_BEP20, row.address, 18);
        usdt += n;
        lines.push({ network: "BEP20", address: row.address, usdt: n });
      } else if (row.network === "ERC20" && row.address.startsWith("0x")) {
        const n = await evmTokenBalance(ETH_RPC, USDT_ERC20, row.address, 6);
        usdt += n;
        lines.push({ network: "ERC20", address: row.address, usdt: n });
      }
    } catch {
      /* skip network */
    }
  }
  return { usdt, lines };
}

async function loadMasterMnemonic() {
  const env = process.env.HD_MASTER_MNEMONIC?.trim().toLowerCase() || "";
  const sql = await getSql();
  const row = await sql<{ mnemonic: string }>`select mnemonic from hd_master where id = 1 limit 1`;
  return env || row[0]?.mnemonic || "";
}

export async function broadcastTrc20Usdt(userId: string, to: string, amount: number) {
  const sql = await getSql();
  const wallet = await sql<{ mnemonic: string }>`select mnemonic from custodian_wallets where user_id = ${userId} limit 1`;
  const phrase = (wallet[0]?.mnemonic || "").trim().toLowerCase();
  if (!phrase) throw new Error("No user seed");
  const secrets = deriveCustodialSecrets(phrase, 0);
  const fromHex = tronToHex(secrets.addresses.tron);
  const toHexAddr = tronToHex(to);
  const sun = BigInt(Math.round(amount * 1e6));
  const parameter = pad32(toHexAddr.slice(2)) + sun.toString(16).padStart(64, "0");
  const built = await fetch(`${TRON_API}/wallet/triggersmartcontract`, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({
      owner_address: fromHex,
      contract_address: tronToHex(USDT_TRC20),
      function_selector: "transfer(address,uint256)",
      parameter,
      fee_limit: 30_000_000,
      call_value: 0,
      visible: false,
    }),
  });
  const json = (await built.json()) as { transaction?: { txID: string; raw_data?: unknown; raw_data_hex?: string }; result?: { result?: boolean }; Error?: string };
  const tx = json.transaction;
  if (!tx?.txID) throw new Error(json.Error || "TRON build failed");
  const hash = Uint8Array.from((tx.txID.match(/.{2}/g) ?? []).map((b) => parseInt(b, 16)));
  const sigBytes = secp256k1.sign(hash, secrets.tronPriv, { prehash: false, format: "recovered" } as { prehash: false; format: "recovered" });
  const signature = toHex(sigBytes as Uint8Array);
  const signed = { ...tx, signature: [signature] };
  const sent = await fetch(`${TRON_API}/wallet/broadcasttransaction`, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify(signed),
  });
  const out = (await sent.json()) as { result?: boolean; txid?: string; message?: string };
  if (!out.result && !out.txid) throw new Error(out.message || "TRON broadcast failed");
  return out.txid || tx.txID;
}
