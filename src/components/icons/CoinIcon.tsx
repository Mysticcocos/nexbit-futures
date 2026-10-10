import { useState, type ReactNode } from "react";
import { cn } from "@/lib/utils";

type Size = "xs" | "sm" | "md" | "lg";

const LOCAL = new Set([
  "BTC",
  "ETH",
  "SOL",
  "XRP",
  "DOGE",
  "BNB",
  "AVAX",
  "LINK",
  "ADA",
  "DOT",
  "SUI",
  "TON",
  "PEPE",
  "WIF",
  "APT",
  "TRX",
  "LTC",
  "ATOM",
  "ETC",
  "GALA",
  "ZEC",
  "USDT",
  "UNI",
  "SHIB",
  "ARB",
  "OP",
  "NEAR",
  "POL",
]);

function Frame({
  fill,
  children,
}: {
  fill: string;
  children: ReactNode;
}) {
  return (
    <svg viewBox="0 0 32 32" className="size-full" aria-hidden>
      <circle cx="16" cy="16" r="16" fill={fill} />
      {children}
    </svg>
  );
}

const ICONS: Record<string, () => ReactNode> = {
  EUR: () => (
    <Frame fill="#3B82F6">
      <path fill="#fff" d="M20.4 10.6A6.8 6.8 0 0 0 11.6 16a6.8 6.8 0 0 0 8.8 5.4l.7-1.9a4.9 4.9 0 0 1-6.2-3h5.1v-1.7h-5.3a4.9 4.9 0 0 1 6-3.2l-.3-2Z" />
      <path fill="#fff" d="M9.6 14.6h7.2v1.5H9.6zm0 2.4h6.6v1.5H9.6z" />
    </Frame>
  ),
  GBP: () => (
    <Frame fill="#6366F1">
      <path fill="#fff" d="M18.8 22.4h-6.6v-1.6h.7c.6 0 1-.3 1-.9v-3.3h-1.9v-1.6h1.9v-1.4c0-2.4 1.3-3.8 3.7-3.8 1.2 0 2.2.3 3 .8l-.8 1.7c-.5-.3-1.1-.5-1.8-.5-1.1 0-1.7.7-1.7 2v1.2h2.8v1.6h-2.8v3.1c0 .6.1 1.1.4 1.5.3.4.8.6 1.5.6h1.6v1.6Z" />
    </Frame>
  ),
  USD: () => (
    <Frame fill="#22C55E">
      <path fill="#fff" d="M17 13.2c0-.9-.8-1.4-2.3-1.4-1.2 0-2 .4-2.6 1l-1.1-1.5c.9-.8 2.2-1.3 3.8-1.4V8.4h1.6v1.5c1.9.3 3.2 1.5 3.2 3.3 0 2.1-1.6 3-3.5 3.5l-1.4.4c-1 .3-1.5.6-1.5 1.3s.7 1.3 2.1 1.3c1.4 0 2.4-.5 3.1-1.2l1.1 1.5c-1 .9-2.4 1.5-4.2 1.6v1.6h-1.6v-1.5c-2-.3-3.4-1.6-3.4-3.5 0-2.2 1.6-3.1 3.6-3.6l1.4-.4c.9-.2 1.3-.6 1.3-1.2Z" />
    </Frame>
  ),
  AUD: () => (
    <Frame fill="#0EA5E9">
      <path fill="#fff" d="M16 7.6 18.2 14h6.2l-5 3.8 1.9 6.2L16 20.4l-5.3 3.6 1.9-6.2-5-3.8h6.2z" />
    </Frame>
  ),
  NZD: () => (
    <Frame fill="#14B8A6">
      <path fill="#fff" d="M16 8.2 17.8 14h5.8l-4.7 3.5 1.8 5.7L16 19.8l-4.7 3.4 1.8-5.7-4.7-3.5h5.8z" />
    </Frame>
  ),
  CHF: () => (
    <Frame fill="#EF4444">
      <path fill="#fff" d="M14.6 9.2h2.8v4.2h4.2v2.8h-4.2v6.6h-2.8v-6.6H10.4v-2.8h4.2z" />
    </Frame>
  ),
  CAD: () => (
    <Frame fill="#F43F5E">
      <path fill="#fff" d="M16 8.4c.4 1.6 1.6 3 2.2 4.4.8-.2 1.8.2 2.4 1.2.4 2-1 3.2-1.6 4.2 1.2.6 2 1.8 1.6 3.2-1.4.4-2.4-.4-3.2-1.2-.2 1.6-.6 3.2-1.4 3.6-.8-.4-1.2-2-1.4-3.6-.8.8-1.8 1.6-3.2 1.2-.4-1.4.4-2.6 1.6-3.2-.6-1-2-2.2-1.6-4.2.6-1 1.6-1.4 2.4-1.2.6-1.4 1.8-2.8 2.2-4.4Z" />
    </Frame>
  ),
  JPY: () => (
    <Frame fill="#94A3B8">
      <path fill="#111" d="m12.2 8.8 3.8 6.2 3.8-6.2h2.2l-4.6 7.4h1.8v1.6h-2.1v1.4h2.1v1.6h-2.1V22h-2.2v-1.2h-2.1v-1.6h2.1v-1.4h-2.1v-1.6h1.8l-4.6-7.4h2.1Z" />
    </Frame>
  ),
  XAU: () => (
    <Frame fill="#D4AF37">
      <path fill="#1A1406" d="M8.8 13.2h14.4l-1.6 8.4H10.4zm2.2 1.8v4.8h10v-4.8zm1.6-3.4h7.2L21 13H11z" />
    </Frame>
  ),
  XAG: () => (
    <Frame fill="#C0C7D1">
      <path fill="#111" d="M8.8 13.2h14.4l-1.6 8.4H10.4zm2.2 1.8v4.8h10v-4.8zm1.6-3.4h7.2L21 13H11z" />
    </Frame>
  ),
  XPT: () => (
    <Frame fill="#9CA3AF">
      <path fill="#111" d="M10.4 10.2h11.2v2H18v9.6h-4v-9.6h-3.6z" />
    </Frame>
  ),
  XPD: () => (
    <Frame fill="#CBD5E1">
      <path fill="#111" d="M11 10.2h6.2c2.8 0 4.6 1.6 4.6 4.2s-1.8 4.2-4.6 4.2H13.4V21.8H11V10.2Zm2.4 6.4h3.6c1.4 0 2.3-.8 2.3-2.2s-.9-2.2-2.3-2.2h-3.6v4.4Z" />
    </Frame>
  ),
  XCU: () => (
    <Frame fill="#B87333">
      <path fill="#fff" d="M10.4 10.4h11.2v2.2h-4.4v9h-2.4v-9H10.4z" />
    </Frame>
  ),
  ALU: () => (
    <Frame fill="#A8B2C1">
      <path fill="#111" d="M16 8.8 21.6 23h-2.4l-1.1-3H13.9l-1.1 3H10.4L16 8.8Zm0 3.4-1.7 4.6h3.4L16 12.2Z" />
    </Frame>
  ),
  NI: () => (
    <Frame fill="#7A9E7E">
      <path fill="#fff" d="M10.6 10.2h3.2l4.4 6.6V10.2H21v11.6h-3.2l-4.4-6.6v6.6H10.6z" />
    </Frame>
  ),
  ZNC: () => (
    <Frame fill="#7D9B76">
      <path fill="#fff" d="M10.4 10.4h11.2v2.2l-6.2 6.8h6.2V22H10.4v-2.2l6.2-6.8H10.4z" />
    </Frame>
  ),
  PB: () => (
    <Frame fill="#5B6770">
      <path fill="#fff" d="M11 10.2h6c2.6 0 4.4 1.5 4.4 3.8 0 1.6-.9 2.8-2.4 3.3L21.4 22h-2.8l-2.2-4.4H13.4V22H11V10.2Zm2.4 5.4h3.4c1.2 0 2-.7 2-1.8s-.8-1.8-2-1.8h-3.4v3.6Z" />
    </Frame>
  ),
  SN: () => (
    <Frame fill="#BFC7C9">
      <path fill="#111" d="M10.6 10.2h4.2c3.2 0 5.2 1.6 5.2 4.2 0 1.8-1 3.1-2.6 3.7l3.2 3.9h-2.8l-2.8-3.5h-1.6V22h-2.8V10.2Zm2.8 6.2h1.4c1.4 0 2.2-.7 2.2-1.9s-.8-1.9-2.2-1.9h-1.4v3.8Z" />
    </Frame>
  ),
};

function coinBase(pairOrSymbol: string) {
  return pairOrSymbol.includes("/") ? pairOrSymbol.split("/")[0] : pairOrSymbol;
}

function Letter({ keyName }: { keyName: string }) {
  return (
    <Frame fill="#334155">
      <text x="16" y="20.5" textAnchor="middle" fontSize="11" fontWeight="700" fill="#fff">
        {keyName.slice(0, 3)}
      </text>
    </Frame>
  );
}

export function CoinIcon({
  symbol,
  size = "md",
  className,
}: {
  symbol: string;
  size?: Size;
  className?: string;
}) {
  const key = coinBase(symbol);
  const [fail, setFail] = useState(false);
  const dim = size === "xs" ? "size-5" : size === "sm" ? "size-7" : size === "lg" ? "size-11" : "size-9";
  const local = LOCAL.has(key) ? `/coins/${key.toLowerCase()}.png` : null;
  const Fallback = ICONS[key];

  return (
    <span
      className={cn("inline-flex shrink-0 overflow-hidden rounded-full", dim, className)}
      title={key}
      aria-hidden
    >
      {local && !fail ? (
        <img src={local} alt="" className="size-full object-cover" onError={() => setFail(true)} />
      ) : Fallback ? (
        Fallback()
      ) : (
        <Letter keyName={key} />
      )}
    </span>
  );
}
