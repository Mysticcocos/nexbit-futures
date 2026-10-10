import type { Position } from "./types";

export function direction(side: "long" | "short"): 1 | -1 {
  return side === "long" ? 1 : -1;
}

export function qtyFromNotional(notional: number, entry: number): number {
  if (entry <= 0) return 0;
  return notional / entry;
}

export function marginFromNotional(notional: number, leverage: number): number {
  return notional / Math.max(1, leverage);
}


export function positionNotionalAtPrice(p: Position, price: number): number {
  return qtyFromNotional(p.sizeUsdt, p.entryPrice) * Math.max(0, price);
}

export function unrealizedPnl(p: Position, current: number): number {
  const qty = qtyFromNotional(p.sizeUsdt, p.entryPrice);
  return (current - p.entryPrice) * qty * direction(p.side);
}

export function pnlPct(pnl: number, margin: number): number {
  if (margin <= 0) return 0;
  return (pnl / margin) * 100;
}

export function liquidationPrice(p: Position): number {
  const move = 1 / Math.max(1, p.leverage);
  if (p.side === "long") return p.entryPrice * (1 - move) * 0.99;
  return p.entryPrice * (1 + move) * 1.01;
}

export function isLiquidated(p: Position, current: number): boolean {
  const liq = liquidationPrice(p);
  return p.side === "long" ? current <= liq : current >= liq;
}

export function maxNotional(freeUsdt: number, leverage: number): number {
  return Math.max(0, freeUsdt) * Math.max(1, leverage);
}


// Futures fees (VIP 0, Bybit-style rates supplied for this demo)
export const FUTURES_MAKER_FEE_RATE = 0.0002; // 0.02%
export const FUTURES_TAKER_FEE_RATE = 0.00055; // 0.055%

export function futuresFee(notional: number, role: "maker" | "taker"): number {
  const rate = role === "maker" ? FUTURES_MAKER_FEE_RATE : FUTURES_TAKER_FEE_RATE;
  return Math.max(0, notional) * rate;
}

export function maxNotionalWithFee(freeUsdt: number, leverage: number, role: "maker" | "taker"): number {
  const lev = Math.max(1, leverage);
  const rate = role === "maker" ? FUTURES_MAKER_FEE_RATE : FUTURES_TAKER_FEE_RATE;
  return Math.max(0, freeUsdt) / (1 / lev + rate);
}
