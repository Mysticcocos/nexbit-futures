export const P2P_ASSETS = ["USDT", "BTC", "ETH", "USDC"] as const;
export const P2P_FIATS = ["EUR", "USD", "RUB", "UAH", "GBP"] as const;
export const P2P_PAYMENTS = ["Monobank", "PrivatBank", "A-Bank", "PUMB", "SEPA", "Revolut", "Wise", "SBP", "Card"] as const;
export const P2P_REGIONS = ["all", "UA", "EU", "RU", "UK"] as const;

export type P2PAsset = (typeof P2P_ASSETS)[number];
export type P2PFiat = (typeof P2P_FIATS)[number];
export type P2PPay = (typeof P2P_PAYMENTS)[number];
export type P2PRegion = (typeof P2P_REGIONS)[number];

export const PAY_COLOR: Record<string, string> = {
  Monobank: "#e11d48",
  PrivatBank: "#16a34a",
  "A-Bank": "#f59e0b",
  PUMB: "#2563eb",
  SEPA: "#0ea5e9",
  Revolut: "#111827",
  Wise: "#86efac",
  SBP: "#22c55e",
  Card: "#a855f7",
};

export type P2PMerchant = {
  id: string;
  name: string;
  initials: string;
  orders: number;
  complete: number;
  minutes: number;
  verified: boolean;
  online: boolean;
  block: boolean;
  termsRu: string;
  termsEn: string;
  payTo: Record<string, { bank: string; account: string; holder: string }>;
};

export type P2PAd = {
  id: string;
  merchantId: string;
  merchantSide: "sell" | "buy";
  asset: P2PAsset;
  fiat: P2PFiat;
  price: number;
  available: number;
  min: number;
  max: number;
  payments: P2PPay[];
  timeLimit: number;
  qualified: boolean;
  kycRequired: boolean;
  region: Exclude<P2PRegion, "all">;
};

export type P2POrder = {
  id: string;
  adId: string;
  merchantId: string;
  merchantName: string;
  side: "buy" | "sell";
  asset: string;
  fiat: string;
  price: number;
  cryptoAmt: number;
  fiatAmt: number;
  payment: string;
  status: "pending_pay" | "paid" | "completed" | "cancelled";
  payUntil: number;
  createdAt: number;
  payTo: { bank: string; account: string; holder: string };
};

const TERMS_RU =
  "Не согласен с условиями — не открывайте ордер. Работаю только по правилам: 1) Принимаю оплату только с указанных банков. 2) Оплата только с личного счёта. 3) Переводы от третьих лиц не принимаю. 4) После оплаты пришлите полный чек в чат. Мошенников и схемы обхожу. Каждый платёж проверяю.";
const TERMS_EN =
  "If you don't accept my terms — don't open an order. 1) Pay only from listed banks. 2) Own account only. 3) No third-party transfers. 4) Send the full receipt in chat after paying. I check every payment.";

export const P2P_MERCHANTS: P2PMerchant[] = [
  {
    id: "nova",
    name: "Nova OTC",
    initials: "NO",
    orders: 12840,
    complete: 99.2,
    minutes: 4,
    verified: true,
    online: true,
    block: true,
    termsRu: TERMS_RU,
    termsEn: TERMS_EN,
    payTo: {
      Monobank: { bank: "Monobank", account: "4441 11•• •••• 2281", holder: "NOVA OTC" },
      PrivatBank: { bank: "PrivatBank", account: "5168 75•• •••• 1044", holder: "NOVA OTC" },
      "A-Bank": { bank: "A-Bank", account: "4321 00•• •••• 8810", holder: "NOVA OTC" },
      PUMB: { bank: "PUMB", account: "5355 20•• •••• 4412", holder: "NOVA OTC" },
      SEPA: { bank: "Revolut LT", account: "LT12 3250 0123 4567 8901", holder: "NOVA OTC UAB" },
      Revolut: { bank: "Revolut", account: "revtag: novaotc", holder: "Nova OTC" },
      Wise: { bank: "Wise", account: "wise@nova-otc.com", holder: "Nova OTC" },
      SBP: { bank: "Сбербанк", account: "+7 999 120 44 18", holder: "ИП Нова" },
      Card: { bank: "Visa", account: "4149 51•• •••• 2281", holder: "NOVA OTC" },
    },
  },
  {
    id: "helix",
    name: "Helix Desk",
    initials: "HD",
    orders: 8421,
    complete: 98.7,
    minutes: 6,
    verified: true,
    online: true,
    block: false,
    termsRu: TERMS_RU,
    termsEn: TERMS_EN,
    payTo: {
      Monobank: { bank: "Monobank", account: "4441 11•• •••• 7730", holder: "HELIX DESK" },
      PrivatBank: { bank: "PrivatBank", account: "4149 49•• •••• 2201", holder: "HELIX DESK" },
      "A-Bank": { bank: "A-Bank", account: "5351 00•• •••• 0091", holder: "HELIX DESK" },
      PUMB: { bank: "PUMB", account: "5169 33•• •••• 1188", holder: "HELIX DESK" },
      SEPA: { bank: "N26", account: "DE12 1001 1001 2625 9110 00", holder: "Helix Desk Ltd" },
      Revolut: { bank: "Revolut", account: "revtag: helixdesk", holder: "Helix Desk" },
      Wise: { bank: "Wise", account: "helix@wise.com", holder: "Helix Desk" },
      SBP: { bank: "Тинькофф", account: "+7 926 441 09 33", holder: "Хеликс" },
      Card: { bank: "Mastercard", account: "5536 91•• •••• 1044", holder: "HELIX DESK" },
    },
  },
  {
    id: "aurora",
    name: "Aurora",
    initials: "AU",
    orders: 5102,
    complete: 97.9,
    minutes: 8,
    verified: true,
    online: true,
    block: false,
    termsRu: TERMS_RU,
    termsEn: TERMS_EN,
    payTo: {
      Monobank: { bank: "Monobank", account: "5375 41•• •••• 9002", holder: "AURORA" },
      PrivatBank: { bank: "PrivatBank", account: "4149 62•• •••• 3310", holder: "AURORA" },
      "A-Bank": { bank: "A-Bank", account: "4321 55•• •••• 1288", holder: "AURORA" },
      PUMB: { bank: "PUMB", account: "5355 10•• •••• 6621", holder: "AURORA" },
      SEPA: { bank: "Wise", account: "BE71 0961 2345 6769", holder: "Aurora Markets" },
      Revolut: { bank: "Revolut", account: "revtag: aurora_p2p", holder: "Aurora" },
      Wise: { bank: "Wise", account: "aurora-p2p", holder: "Aurora" },
      SBP: { bank: "Альфа-Банк", account: "+7 903 221 77 01", holder: "Аврора" },
      Card: { bank: "Visa", account: "4276 32•• •••• 8810", holder: "AURORA" },
    },
  },
  {
    id: "orbit",
    name: "Orbit",
    initials: "OR",
    orders: 3904,
    complete: 99.6,
    minutes: 3,
    verified: true,
    online: true,
    block: true,
    termsRu: TERMS_RU,
    termsEn: TERMS_EN,
    payTo: {
      Monobank: { bank: "Monobank", account: "4441 22•• •••• 0199", holder: "ORBIT" },
      PrivatBank: { bank: "PrivatBank", account: "5168 11•• •••• 4477", holder: "ORBIT" },
      "A-Bank": { bank: "A-Bank", account: "4321 77•• •••• 5501", holder: "ORBIT" },
      PUMB: { bank: "PUMB", account: "5355 88•• •••• 2104", holder: "ORBIT" },
      SEPA: { bank: "Bunq", account: "NL91 BUNQ 0123 4567 89", holder: "Orbit B.V." },
      Revolut: { bank: "Revolut", account: "revtag: orbitp2p", holder: "Orbit" },
      Wise: { bank: "Wise", account: "orbit-wise", holder: "Orbit" },
      SBP: { bank: "ВТБ", account: "+7 911 555 02 19", holder: "Орбит" },
      Card: { bank: "Mir", account: "2202 20•• •••• 4412", holder: "ORBIT" },
    },
  },
  {
    id: "vector",
    name: "Vector FX",
    initials: "VX",
    orders: 22110,
    complete: 99.4,
    minutes: 5,
    verified: true,
    online: true,
    block: true,
    termsRu: TERMS_RU,
    termsEn: TERMS_EN,
    payTo: {
      Monobank: { bank: "Monobank", account: "4441 90•• •••• 3312", holder: "VECTOR FX" },
      PrivatBank: { bank: "PrivatBank", account: "4149 20•• •••• 8801", holder: "VECTOR FX" },
      "A-Bank": { bank: "A-Bank", account: "4321 10•• •••• 2290", holder: "VECTOR FX" },
      PUMB: { bank: "PUMB", account: "5355 44•• •••• 1180", holder: "VECTOR FX" },
      SEPA: { bank: "Revolut IE", account: "IE64 REVO 9903 5012 3456 78", holder: "Vector FX Ltd" },
      Revolut: { bank: "Revolut", account: "revtag: vectorfx", holder: "Vector FX" },
      Wise: { bank: "Wise", account: "vectorfx", holder: "Vector FX" },
      SBP: { bank: "Сбербанк", account: "+7 495 902 11 70", holder: "Вектор" },
      Card: { bank: "Visa", account: "4095 25•• •••• 7730", holder: "VECTOR FX" },
    },
  },
];

const FX: Record<P2PFiat, number> = { EUR: 0.92, USD: 1, RUB: 92, UAH: 41.2, GBP: 0.78 };
const REGION: Record<P2PFiat, Exclude<P2PRegion, "all">> = { EUR: "EU", USD: "EU", RUB: "RU", UAH: "UA", GBP: "UK" };

function px(asset: P2PAsset, fiat: P2PFiat, skew: number) {
  const usd = asset === "USDT" || asset === "USDC" ? 1 : asset === "BTC" ? 111400 : 4120;
  return +(usd * FX[fiat] * skew).toFixed(asset === "BTC" ? 0 : fiat === "RUB" || fiat === "UAH" ? 2 : 4);
}

export const P2P_ADS: P2PAd[] = P2P_MERCHANTS.flatMap((m, i) => {
  const skewSell = 1.001 + i * 0.0008;
  const skewBuy = 0.997 - i * 0.0006;
  const pays = (["Monobank", "PrivatBank", "A-Bank", "PUMB", "SEPA", "Revolut", "Wise", "SBP"] as P2PPay[]).filter((_, k) => (i + k) % 2 === 0 || k < 4);
  return (["EUR", "USD", "RUB", "UAH", "GBP"] as P2PFiat[]).flatMap((fiat) => {
    const max = fiat === "RUB" ? 500000 : fiat === "UAH" ? 80000 : fiat === "GBP" ? 4000 : 5000;
    const min = fiat === "RUB" ? 5000 : fiat === "UAH" ? 500 : 50;
    const timeLimit = i % 2 === 0 ? 15 : 30;
    return [
      {
        id: `${m.id}-sell-usdt-${fiat}`,
        merchantId: m.id,
        merchantSide: "sell" as const,
        asset: "USDT" as const,
        fiat,
        price: px("USDT", fiat, skewSell),
        available: 8000 + i * 2200,
        min,
        max,
        payments: pays,
        timeLimit,
        qualified: true,
        kycRequired: i === 2,
        region: REGION[fiat],
      },
      {
        id: `${m.id}-buy-usdt-${fiat}`,
        merchantId: m.id,
        merchantSide: "buy" as const,
        asset: "USDT" as const,
        fiat,
        price: px("USDT", fiat, skewBuy),
        available: 5000 + i * 1500,
        min,
        max,
        payments: pays,
        timeLimit,
        qualified: i !== 3,
        kycRequired: false,
        region: REGION[fiat],
      },
    ];
  });
});

export function p2pMerchant(id: string) {
  return P2P_MERCHANTS.find((m) => m.id === id) ?? P2P_MERCHANTS[0];
}

export function p2pAd(id: string) {
  return P2P_ADS.find((a) => a.id === id) ?? null;
}

const KEY = "nexbit-p2p-orders";

export function loadP2POrders(): P2POrder[] {
  try {
    return JSON.parse(localStorage.getItem(KEY) || "[]") as P2POrder[];
  } catch {
    return [];
  }
}

export function saveP2POrders(rows: P2POrder[]) {
  localStorage.setItem(KEY, JSON.stringify(rows.slice(0, 40)));
}

export function uidP2P() {
  return `p2p_${Date.now().toString(36)}${Math.random().toString(36).slice(2, 6)}`;
}
