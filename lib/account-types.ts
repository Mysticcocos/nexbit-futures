import type { Palette, ThemeId } from "@/lib/themes";
import type { Activity, EarnSlot, EquityPoint, Order, Position, WalletRow } from "@/lib/types";

export type { WalletRow };

export type TradingPayload = {
  holdings: Record<string, number>;
  positions: Position[];
  orders: Order[];
  earn: EarnSlot[];
  activity: Activity[];
  activeWalletId: string | null;
  futuresUsdt?: number;
  equityLog?: EquityPoint[];
};

export type AccountSnapshot = {
  displayName: string;
  role: "admin" | "user";
  wallets: WalletRow[];
  trading: TradingPayload;
};

export type AdminUserRow = {
  id: string;
  name: string;
  email: string;
  role: string;
  usdt: number;
  chainUsdt?: number;
  wallets: number;
  createdAt: string;
};

export type ThemeSnapshot = {
  themeId: ThemeId;
  palette: Palette;
  allowUserTheme: boolean;
};
