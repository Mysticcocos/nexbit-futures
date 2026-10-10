import { uid } from "./utils";

const WORDS = [
  "alpha","brisk","cedar","delta","ember","flint","grove","harbor","ivory","jade","keel","lunar",
  "maple","nova","orbit","prism","quartz","ridge","sable","tide","umbra","vapor","willow","xenon",
  "yield","zenith","amber","basil","cinder","drift","echo","forge","glint","haven","inlet","jolt",
  "krypton","ledger","mirage","nimbus","onyx","petal","quill","raven","solace","thicket","unit","vale",
];

export const WEB3_ASSETS = ["USDT", "ETH", "BTC", "BNB", "TRX"] as const;
export type Web3Asset = (typeof WEB3_ASSETS)[number];

export const NETWORK_FEE: Record<Web3Asset, number> = {
  USDT: 0.35,
  ETH: 0.00042,
  BTC: 0.000018,
  BNB: 0.00031,
  TRX: 1.1,
};

export type Web3Tx = {
  id: string;
  kind: "send" | "receive";
  asset: Web3Asset;
  amount: number;
  counterparty: string;
  fee: number;
  at: number;
  status: "pending" | "confirmed";
};

export type Web3Account = {
  id: string;
  name: string;
  address: string;
  phrase: string;
  imported: boolean;
  createdAt: number;
  balances: Record<Web3Asset, number>;
  txs: Web3Tx[];
};

const KEY = "nexbit-web3-v2";

function emptyBalances(): Record<Web3Asset, number> {
  return { USDT: 0, ETH: 0, BTC: 0, BNB: 0, TRX: 0 };
}

function migrate(raw: Web3Account): Web3Account {
  return {
    ...raw,
    balances: { ...emptyBalances(), ...(raw.balances ?? {}) },
    txs: raw.txs ?? [],
  };
}

export function loadWeb3(): { accounts: Web3Account[]; activeId: string | null } {
  try {
    const raw = localStorage.getItem(KEY) ?? localStorage.getItem("nexbit-web3-v1");
    if (!raw) return { accounts: [], activeId: null };
    const parsed = JSON.parse(raw) as { accounts: Web3Account[]; activeId: string | null };
    return { accounts: (parsed.accounts ?? []).map(migrate), activeId: parsed.activeId ?? null };
  } catch {
    return { accounts: [], activeId: null };
  }
}

export function saveWeb3(accounts: Web3Account[], activeId: string | null) {
  localStorage.setItem(KEY, JSON.stringify({ accounts, activeId }));
}

export function makePhrase(): string {
  const out: string[] = [];
  const buf = new Uint32Array(12);
  crypto.getRandomValues(buf);
  for (let i = 0; i < 12; i++) out.push(WORDS[buf[i] % WORDS.length]!);
  return out.join(" ");
}

export function addressFrom(secret: string): string {
  let h = 2166136261;
  for (const c of secret) h = Math.imul(h ^ c.charCodeAt(0), 16777619);
  const parts: string[] = [];
  for (let i = 0; i < 5; i++) {
    h = Math.imul(h, 16777619);
    parts.push((Math.abs(h) >>> 0).toString(16).padStart(8, "0"));
  }
  return `0x${parts.join("").slice(0, 40)}`;
}

export function createAccount(name?: string): Web3Account {
  const phrase = makePhrase();
  return {
    id: uid("w3"),
    name: name?.trim() || "Wallet 1",
    address: addressFrom(phrase),
    phrase,
    imported: false,
    createdAt: Date.now(),
    balances: emptyBalances(),
    txs: [],
  };
}

export function importAccount(secret: string, name?: string): { ok: true; account: Web3Account } | { ok: false; error: string } {
  const s = secret.trim().replace(/\s+/g, " ");
  const words = s.split(" ");
  const isKey = /^0x?[0-9a-fA-F]{64}$/.test(s.replace(/\s/g, ""));
  if (!isKey && words.length !== 12) return { ok: false, error: "Enter 12 words or a 64-char private key" };
  const phrase = isKey ? s.replace(/\s/g, "") : words.join(" ").toLowerCase();
  return {
    ok: true,
    account: {
      id: uid("w3"),
      name: name?.trim() || "Imported",
      address: addressFrom(phrase),
      phrase,
      imported: true,
      createdAt: Date.now(),
      balances: emptyBalances(),
      txs: [],
    },
  };
}

export function shortAddr(addr: string) {
  if (addr.length < 12) return addr;
  return `${addr.slice(0, 6)}…${addr.slice(-4)}`;
}

export function walletUsd(acc: Web3Account, prices: Record<string, { price: number }>) {
  const px = (asset: Web3Asset) => {
    if (asset === "USDT") return 1;
    return prices[`${asset}/USDT`]?.price ?? prices[`${asset}/USD`]?.price ?? 0;
  };
  return WEB3_ASSETS.reduce((s, a) => s + (acc.balances[a] ?? 0) * px(a), 0);
}
