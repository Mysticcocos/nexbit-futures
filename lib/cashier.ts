export type CashNetwork = {
  id: string;
  label: string;
  fee: number;
  min: number;
  confirmations: number;
  memo?: boolean;
  family: "evm" | "tron" | "btc" | "sol";
};

export type CashAsset = {
  id: string;
  name: string;
  networks: CashNetwork[];
};

const USDT_NETS: CashNetwork[] = [
  { id: "ERC20", label: "Ethereum (ERC20)", fee: 8, min: 0.005, confirmations: 6, family: "evm" },
  { id: "TRC20", label: "TRON (TRC20)", fee: 1, min: 0.005, confirmations: 20, family: "tron" },
  { id: "MANTLE", label: "Mantle Network (USDT0)", fee: 0.4, min: 0.005, confirmations: 100, family: "evm" },
  { id: "BEP20", label: "BSC (BEP20)", fee: 0.8, min: 0.005, confirmations: 15, family: "evm" },
  { id: "ARB", label: "Arbitrum One", fee: 0.3, min: 0.005, confirmations: 12, family: "evm" },
  { id: "OP", label: "Optimism", fee: 0.3, min: 0.005, confirmations: 12, family: "evm" },
  { id: "BASE", label: "Base", fee: 0.3, min: 0.005, confirmations: 12, family: "evm" },
  { id: "MATIC", label: "Polygon", fee: 0.3, min: 0.005, confirmations: 64, family: "evm" },
  { id: "AVAX", label: "Avalanche C-Chain", fee: 0.4, min: 0.005, confirmations: 12, family: "evm" },
  { id: "PLASMA", label: "Plasma (USDT0)", fee: 0.4, min: 0.005, confirmations: 10, family: "evm" },
  { id: "SOL", label: "SOL", fee: 1, min: 0.005, confirmations: 32, family: "sol" },
];

const EVM_ONLY: CashNetwork[] = [{ id: "ERC20", label: "Ethereum (ERC20)", fee: 0.001, min: 0.001, confirmations: 6, family: "evm" }];

export const CASH_ASSETS: CashAsset[] = [
  { id: "USDT", name: "Tether", networks: USDT_NETS },
  { id: "USDC", name: "USD Coin", networks: USDT_NETS },
  { id: "BTC", name: "Bitcoin", networks: [{ id: "BTC", label: "Bitcoin", fee: 0.0002, min: 0.0001, confirmations: 2, family: "btc" }] },
  { id: "ETH", name: "Ethereum", networks: [{ id: "ERC20", label: "Ethereum", fee: 0.001, min: 0.001, confirmations: 6, family: "evm" }] },
  { id: "TRX", name: "TRON", networks: [{ id: "TRC20", label: "TRON (TRC20)", fee: 1, min: 1, confirmations: 20, family: "tron" }] },
  { id: "SOL", name: "Solana", networks: [{ id: "SOL", label: "Solana", fee: 0.01, min: 0.01, confirmations: 32, family: "sol" }] },
  { id: "BNB", name: "BNB", networks: [{ id: "BEP20", label: "BSC (BEP20)", fee: 0.0005, min: 0.001, confirmations: 15, family: "evm" }] },
  { id: "ARB", name: "Arbitrum", networks: [{ id: "ARB", label: "Arbitrum One", fee: 0.0004, min: 0.001, confirmations: 12, family: "evm" }] },
  { id: "OP", name: "Optimism", networks: [{ id: "OP", label: "Optimism", fee: 0.0004, min: 0.001, confirmations: 12, family: "evm" }] },
  { id: "AVAX", name: "Avalanche", networks: [{ id: "AVAX", label: "Avalanche C-Chain", fee: 0.01, min: 0.01, confirmations: 12, family: "evm" }] },
  { id: "POL", name: "Polygon", networks: [{ id: "MATIC", label: "Polygon", fee: 0.5, min: 1, confirmations: 64, family: "evm" }] },
  { id: "LINK", name: "Chainlink", networks: EVM_ONLY },
  { id: "UNI", name: "Uniswap", networks: EVM_ONLY },
  { id: "AAVE", name: "Aave", networks: EVM_ONLY },
  { id: "PEPE", name: "Pepe", networks: EVM_ONLY },
  { id: "SHIB", name: "Shiba Inu", networks: EVM_ONLY },
  { id: "WIF", name: "dogwifhat", networks: [{ id: "SOL", label: "Solana", fee: 0.01, min: 0.1, confirmations: 32, family: "sol" }] },
];

export const RECOMMENDED_COINS = ["BTC", "ETH", "USDT", "USDC", "TRX", "SOL", "BNB", "ARB"];

export function cashAsset(id: string) {
  return CASH_ASSETS.find((a) => a.id === id) ?? CASH_ASSETS[0];
}

export function cashNetwork(assetId: string, networkId: string) {
  const a = cashAsset(assetId);
  return a.networks.find((n) => n.id === networkId) ?? a.networks[0];
}

export function networkIcon(id: string) {
  if (id === "TRC20") return "TRX";
  if (id === "BEP20") return "BNB";
  if (id === "SOL") return "SOL";
  if (id === "BTC") return "BTC";
  if (id === "ARB") return "ARB";
  if (id === "OP") return "OP";
  if (id === "AVAX") return "AVAX";
  if (id === "MATIC") return "POL";
  if (id === "TON") return "TON";
  return "ETH";
}

export type DepositAddress = {
  asset: string;
  network: string;
  address: string;
  memo?: string | null;
  source: string;
};

export type CashDeposit = {
  id: string;
  asset: string;
  network: string;
  amount: number;
  txid?: string | null;
  status: string;
  createdAt: number;
};

export type CashWithdrawal = {
  id: string;
  asset: string;
  network: string;
  amount: number;
  fee: number;
  address: string;
  status: string;
  txid?: string | null;
  createdAt: number;
};
