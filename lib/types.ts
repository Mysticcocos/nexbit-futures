import type { Palette, ThemeId } from "./themes";
import type { PriceTick } from "./markets";

export type Side = "long" | "short";
export type OrderType = "market" | "limit" | "stop";
export type OrderSide = "buy" | "sell";
export type TradeMode = "spot" | "futures";
export type TicketStatus = "open" | "in_progress" | "resolved";
export type EarnProduct = string;
export type TransferBook = "spot" | "futures" | "earn";
export type CopyFollow = {
  traderId: string;
  mode: "margin" | "ratio";
  amount: number;
  startedAt: number;
  realized: number;
};


export type Position = {
  id: string;
  pair: string;
  side: Side;
  leverage: number;
  entryPrice: number;
  sizeUsdt: number;
  margin: number;
  openedAt: number;
  copyOf?: string;
};

export type Order = {
  id: string;
  pair: string;
  mode: TradeMode;
  type: OrderType;
  side: OrderSide;
  sizeUsdt: number;
  price?: number;
  stopPrice?: number;
  leverage: number;
  status: "open" | "filled" | "cancelled";
  createdAt: number;
  filledAt?: number;
  fillPrice?: number;
  reduceOnly?: boolean;
  positionId?: string;
  fee?: number;
  feeRate?: number;
  liquidity?: "maker" | "taker";
};

export type Activity = {
  id: string;
  kind: "deposit" | "withdraw" | "transfer" | "trade" | "earn" | "liquidation" | "copy";
  title: string;
  detail: string;
  amount: number;
  at: number;
};

export type EarnSlot = {
  product: EarnProduct;
  amount: number;
  apy: number;
  startedAt: number;
};

export type ChatMessage = {
  id: string;
  from: "user" | "agent";
  text: string;
  at: number;
  image?: string;
  category?: string;
};

export type TicketMessage = {
  from: "user" | "agent";
  text: string;
  at: number;
};

export type Ticket = {
  id: string;
  category: string;
  subject: string;
  status: TicketStatus;
  messages: TicketMessage[];
  createdAt: number;
};

export type PriceAlert = {
  id: string;
  pair: string;
  target: number;
  direction: "above" | "below";
  createdAt: number;
  triggered?: boolean;
};

export type NotificationItem = {
  id: string;
  title: string;
  body: string;
  at: number;
  read: boolean;
};

export type WalletRow = {
  id: string;
  name: string;
  usdt: number;
};

export type EquityPoint = {
  t: number;
  v: number;
};

export type PersistedSlice = {
  themeId: ThemeId;
  customPalette: Palette;
  allowUserTheme: boolean;
  isAdmin: boolean;
  userName: string;
  liquidUsdt: number;
  holdings: Record<string, number>;
  watchlist: string[];
  selectedPair: string;
  tradeMode: TradeMode;
  timeframe: string;
  leverage: number;
  positions: Position[];
  orders: Order[];
  activity: Activity[];
  earn: EarnSlot[];
  copiedTraders: string[];
  copyFollows: CopyFollow[];
  isLead: boolean;
  tickets: Ticket[];
  chat: ChatMessage[];
  alerts: PriceAlert[];
  notifications: NotificationItem[];
  wallets: WalletRow[];
  activeWalletId: string | null;
  accountUserId: string | null;
  futuresUsdt: number;
  equityLog: EquityPoint[];
  locale: "en" | "ru";
  appearance: "dark" | "light";
};

export type NexbitState = PersistedSlice & {
  prices: Record<string, PriceTick>;
  hydrated: boolean;
  chainUsdt: number;
};
