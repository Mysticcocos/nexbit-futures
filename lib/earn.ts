export type EarnId = "usdt-flex" | "usdt-lock" | "usdt-dual" | "btc-flex" | "eth-flex" | "sol-lock";

export type EarnOffer = {
  id: EarnId;
  asset: string;
  title: string;
  apy: number;
  apyMax?: number;
  lockDays: number;
  min: number;
  settlement: string;
  risk: "Low" | "Medium" | "Higher";
  tvl: number;
  blurb: string;
  terms: string[];
};

export const EARN_OFFERS: EarnOffer[] = [
  {
    id: "usdt-flex",
    asset: "USDT",
    title: "USDT Flexible",
    apy: 4.2,
    lockDays: 0,
    min: 1,
    settlement: "Daily 00:00 UTC",
    risk: "Low",
    tvl: 184_200_000,
    blurb: "Move in and out any time. Yield paid every day in USDT.",
    terms: ["No lock-up", "Interest starts the next UTC day", "Withdraw to Spot instantly"],
  },
  {
    id: "usdt-lock",
    asset: "USDT",
    title: "USDT Locked 30D",
    apy: 8.5,
    lockDays: 30,
    min: 50,
    settlement: "At maturity",
    risk: "Low",
    tvl: 96_400_000,
    blurb: "Lock USDT for 30 days. Higher fixed APY, paid at unlock.",
    terms: ["30-day lock", "Early unlock forfeits unpaid interest", "Principal returns to Spot"],
  },
  {
    id: "usdt-dual",
    asset: "USDT",
    title: "Dual USDT / BTC",
    apy: 6.4,
    apyMax: 12.8,
    lockDays: 7,
    min: 100,
    settlement: "At strike",
    risk: "Higher",
    tvl: 41_800_000,
    blurb: "7-day dual. Settle in USDT or BTC depending on the strike.",
    terms: ["Strike set at subscribe", "Yield range 6.4–12.8% APR", "May convert to BTC"],
  },
  {
    id: "btc-flex",
    asset: "BTC",
    title: "BTC Flexible",
    apy: 1.2,
    lockDays: 0,
    min: 0.001,
    settlement: "Daily 00:00 UTC",
    risk: "Low",
    tvl: 12_600,
    blurb: "Earn BTC on BTC. No lock, withdraw when you want.",
    terms: ["Paid in BTC", "No lock-up", "Subject to network availability"],
  },
  {
    id: "eth-flex",
    asset: "ETH",
    title: "ETH Flexible",
    apy: 2.1,
    lockDays: 0,
    min: 0.01,
    settlement: "Daily 00:00 UTC",
    risk: "Low",
    tvl: 84_200,
    blurb: "Flexible ETH yield, paid daily in ETH.",
    terms: ["Paid in ETH", "No lock-up", "Withdraw to Spot instantly"],
  },
  {
    id: "sol-lock",
    asset: "SOL",
    title: "SOL Locked 14D",
    apy: 5.4,
    lockDays: 14,
    min: 1,
    settlement: "At maturity",
    risk: "Medium",
    tvl: 1_240_000,
    blurb: "Lock SOL for 14 days. Yield paid in SOL at unlock.",
    terms: ["14-day lock", "Paid in SOL", "Early unlock not available"],
  },
];

export function getEarnOffer(id: string): EarnOffer {
  return EARN_OFFERS.find((o) => o.id === id) ?? EARN_OFFERS[0]!;
}

export function normalizeEarnId(id: string): EarnId {
  if (id === "flexible") return "usdt-flex";
  if (id === "locked") return "usdt-lock";
  if (id === "dual") return "usdt-dual";
  if (EARN_OFFERS.some((o) => o.id === id)) return id as EarnId;
  return "usdt-flex";
}

export function dailyYield(amount: number, apy: number) {
  return (amount * (apy / 100)) / 365;
}
