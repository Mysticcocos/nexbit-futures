export function fmtUsd(n: number, digits = 2): string {
  const abs = Math.abs(n);
  if (abs >= 1_000_000_000) return `$${(n / 1_000_000_000).toFixed(2)}B`;
  if (abs >= 1_000_000) return `$${(n / 1_000_000).toFixed(2)}M`;
  return n.toLocaleString("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: digits,
    maximumFractionDigits: digits,
  });
}

export function fmtNum(n: number, digits = 2): string {
  return n.toLocaleString("en-US", {
    minimumFractionDigits: digits,
    maximumFractionDigits: digits,
  });
}

export function fmtPrice(n: number): string {
  if (!Number.isFinite(n)) return "—";
  if (n >= 1000) return fmtNum(n, 2);
  if (n >= 100) return fmtNum(n, 2);
  if (n >= 1) return fmtNum(n, 4);
  return fmtNum(n, 5);
}

export function fmtQty(n: number): string {
  if (n >= 1000) return fmtNum(n, 2);
  if (n >= 1) return fmtNum(n, 4);
  return fmtNum(n, 6);
}

export function fmtPct(n: number, digits = 2): string {
  const sign = n > 0 ? "+" : "";
  return `${sign}${n.toFixed(digits)}%`;
}

export function fmtSignedUsd(n: number): string {
  const sign = n > 0 ? "+" : n < 0 ? "−" : "";
  return `${sign}${fmtUsd(Math.abs(n))}`;
}

export function fmtVol(n: number): string {
  if (n >= 1_000_000_000) return `${(n / 1_000_000_000).toFixed(2)}B`;
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(2)}M`;
  if (n >= 1_000) return `${(n / 1_000).toFixed(2)}K`;
  return n.toFixed(0);
}

export function fmtTime(ts: number): string {
  return new Date(ts).toLocaleString("en-US", {
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function clamp(n: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, n));
}

export function fmtBalance(n: number): string {
  if (!Number.isFinite(n)) return "—";
  const digits = Math.abs(n) < 1 ? 6 : 2;
  return n.toLocaleString("en-US", {
    minimumFractionDigits: 2,
    maximumFractionDigits: digits,
  });
}
