export type MarketCategory = "crypto" | "forex" | "metals";
export type MarketKind = "spot" | "perp";

export type Market = {
  id: string;
  base: string;
  quote: string;
  name: string;
  category: MarketCategory;
  tvSymbol: string;
  binance?: string;
  yahoo: string;
  okx?: string;
  seedPrice: number;
  seedChange: number;
  seedVol: number;
  kind: MarketKind;
  listed?: boolean;
};

export const MARKETS: Market[] = [
  { id: "BTC/USDT", base: "BTC", quote: "USDT", name: "Bitcoin", category: "crypto", tvSymbol: "BINANCE:BTCUSDT", binance: "BTCUSDT", yahoo: "BTC-USD", okx: "BTC-USDT", seedPrice: 78117, seedChange: -1.67, seedVol: 24.18e9, kind: "perp" },
  { id: "ETH/USDT", base: "ETH", quote: "USDT", name: "Ethereum", category: "crypto", tvSymbol: "BINANCE:ETHUSDT", binance: "ETHUSDT", yahoo: "ETH-USD", okx: "ETH-USDT", seedPrice: 2473, seedChange: -1.91, seedVol: 12.64e9, kind: "perp" },
  { id: "SOL/USDT", base: "SOL", quote: "USDT", name: "Solana", category: "crypto", tvSymbol: "BINANCE:SOLUSDT", binance: "SOLUSDT", yahoo: "SOL-USD", okx: "SOL-USDT", seedPrice: 101.28, seedChange: -3.52, seedVol: 3.91e9, kind: "perp" },
  { id: "XRP/USDT", base: "XRP", quote: "USDT", name: "XRP", category: "crypto", tvSymbol: "BINANCE:XRPUSDT", binance: "XRPUSDT", yahoo: "XRP-USD", okx: "XRP-USDT", seedPrice: 0.6124, seedChange: 1.22, seedVol: 1.82e9, kind: "perp" },
  { id: "DOGE/USDT", base: "DOGE", quote: "USDT", name: "Dogecoin", category: "crypto", tvSymbol: "BINANCE:DOGEUSDT", binance: "DOGEUSDT", yahoo: "DOGE-USD", okx: "DOGE-USDT", seedPrice: 0.14268, seedChange: 3.18, seedVol: 987.32e6, kind: "perp" },
  { id: "BNB/USDT", base: "BNB", quote: "USDT", name: "BNB", category: "crypto", tvSymbol: "BINANCE:BNBUSDT", binance: "BNBUSDT", yahoo: "BNB-USD", okx: "BNB-USDT", seedPrice: 612.4, seedChange: 1.54, seedVol: 1.42e9, kind: "perp" },
  { id: "AVAX/USDT", base: "AVAX", quote: "USDT", name: "Avalanche", category: "crypto", tvSymbol: "BINANCE:AVAXUSDT", binance: "AVAXUSDT", yahoo: "AVAX-USD", okx: "AVAX-USDT", seedPrice: 38.62, seedChange: 2.81, seedVol: 612e6, kind: "perp" },
  { id: "LINK/USDT", base: "LINK", quote: "USDT", name: "Chainlink", category: "crypto", tvSymbol: "BINANCE:LINKUSDT", binance: "LINKUSDT", yahoo: "LINK-USD", okx: "LINK-USDT", seedPrice: 14.86, seedChange: 1.97, seedVol: 428e6, kind: "perp" },
  { id: "ADA/USDT", base: "ADA", quote: "USDT", name: "Cardano", category: "crypto", tvSymbol: "BINANCE:ADAUSDT", binance: "ADAUSDT", yahoo: "ADA-USD", okx: "ADA-USDT", seedPrice: 0.4521, seedChange: 0.84, seedVol: 512e6, kind: "perp" },
  { id: "DOT/USDT", base: "DOT", quote: "USDT", name: "Polkadot", category: "crypto", tvSymbol: "BINANCE:DOTUSDT", binance: "DOTUSDT", yahoo: "DOT-USD", okx: "DOT-USDT", seedPrice: 7.18, seedChange: 1.12, seedVol: 218e6, kind: "perp" },
  { id: "SUI/USDT", base: "SUI", quote: "USDT", name: "Sui", category: "crypto", tvSymbol: "BINANCE:SUIUSDT", binance: "SUIUSDT", yahoo: "SUI-USD", okx: "SUI-USDT", seedPrice: 1.84, seedChange: 12.4, seedVol: 890e6, kind: "perp", listed: true },
  { id: "TON/USDT", base: "TON", quote: "USDT", name: "Toncoin", category: "crypto", tvSymbol: "BINANCE:TONUSDT", binance: "TONUSDT", yahoo: "TON-USD", okx: "TON-USDT", seedPrice: 5.62, seedChange: 8.14, seedVol: 420e6, kind: "perp", listed: true },
  { id: "PEPE/USDT", base: "PEPE", quote: "USDT", name: "Pepe", category: "crypto", tvSymbol: "BINANCE:PEPEUSDT", binance: "PEPEUSDT", yahoo: "PEPE-USD", okx: "PEPE-USDT", seedPrice: 0.00000912, seedChange: 18.6, seedVol: 1.1e9, kind: "perp", listed: true },
  { id: "WIF/USDT", base: "WIF", quote: "USDT", name: "dogwifhat", category: "crypto", tvSymbol: "BINANCE:WIFUSDT", binance: "WIFUSDT", yahoo: "WIF-USD", okx: "WIF-USDT", seedPrice: 2.18, seedChange: -6.22, seedVol: 510e6, kind: "perp", listed: true },
  { id: "APT/USDT", base: "APT", quote: "USDT", name: "Aptos", category: "crypto", tvSymbol: "BINANCE:APTUSDT", binance: "APTUSDT", yahoo: "APT-USD", okx: "APT-USDT", seedPrice: 9.42, seedChange: 5.37, seedVol: 340e6, kind: "perp", listed: true },
  { id: "TRX/USDT", base: "TRX", quote: "USDT", name: "TRON", category: "crypto", tvSymbol: "BINANCE:TRXUSDT", binance: "TRXUSDT", yahoo: "TRX-USD", okx: "TRX-USDT", seedPrice: 0.1624, seedChange: 0.84, seedVol: 780e6, kind: "perp" },
  { id: "LTC/USDT", base: "LTC", quote: "USDT", name: "Litecoin", category: "crypto", tvSymbol: "BINANCE:LTCUSDT", binance: "LTCUSDT", yahoo: "LTC-USD", okx: "LTC-USDT", seedPrice: 84.2, seedChange: 1.05, seedVol: 410e6, kind: "perp" },
  { id: "ATOM/USDT", base: "ATOM", quote: "USDT", name: "Cosmos", category: "crypto", tvSymbol: "BINANCE:ATOMUSDT", binance: "ATOMUSDT", yahoo: "ATOM-USD", okx: "ATOM-USDT", seedPrice: 6.42, seedChange: 0.74, seedVol: 186e6, kind: "perp" },
  { id: "ETC/USDT", base: "ETC", quote: "USDT", name: "Ethereum Classic", category: "crypto", tvSymbol: "BINANCE:ETCUSDT", binance: "ETCUSDT", yahoo: "ETC-USD", okx: "ETC-USDT", seedPrice: 22.18, seedChange: -0.52, seedVol: 210e6, kind: "perp" },
  { id: "GALA/USDT", base: "GALA", quote: "USDT", name: "Gala", category: "crypto", tvSymbol: "BINANCE:GALAUSDT", binance: "GALAUSDT", yahoo: "GALA-USD", okx: "GALA-USDT", seedPrice: 0.0184, seedChange: 3.12, seedVol: 96e6, kind: "perp" },
  { id: "ZEC/USDT", base: "ZEC", quote: "USDT", name: "Zcash", category: "crypto", tvSymbol: "BINANCE:ZECUSDT", binance: "ZECUSDT", yahoo: "ZEC-USD", okx: "ZEC-USDT", seedPrice: 42.6, seedChange: 8.28, seedVol: 280e6, kind: "perp" },
  { id: "UNI/USDT", base: "UNI", quote: "USDT", name: "Uniswap", category: "crypto", tvSymbol: "BINANCE:UNIUSDT", binance: "UNIUSDT", yahoo: "UNI-USD", okx: "UNI-USDT", seedPrice: 8.42, seedChange: 2.14, seedVol: 190e6, kind: "perp" },
  { id: "SHIB/USDT", base: "SHIB", quote: "USDT", name: "Shiba Inu", category: "crypto", tvSymbol: "BINANCE:SHIBUSDT", binance: "SHIBUSDT", yahoo: "SHIB-USD", okx: "SHIB-USDT", seedPrice: 0.0000184, seedChange: 3.8, seedVol: 620e6, kind: "perp" },
  { id: "ARB/USDT", base: "ARB", quote: "USDT", name: "Arbitrum", category: "crypto", tvSymbol: "BINANCE:ARBUSDT", binance: "ARBUSDT", yahoo: "ARB-USD", okx: "ARB-USDT", seedPrice: 0.72, seedChange: 1.44, seedVol: 210e6, kind: "perp" },
  { id: "OP/USDT", base: "OP", quote: "USDT", name: "Optimism", category: "crypto", tvSymbol: "BINANCE:OPUSDT", binance: "OPUSDT", yahoo: "OP-USD", okx: "OP-USDT", seedPrice: 1.48, seedChange: -0.62, seedVol: 160e6, kind: "perp" },
  { id: "NEAR/USDT", base: "NEAR", quote: "USDT", name: "NEAR", category: "crypto", tvSymbol: "BINANCE:NEARUSDT", binance: "NEARUSDT", yahoo: "NEAR-USD", okx: "NEAR-USDT", seedPrice: 4.86, seedChange: 2.05, seedVol: 240e6, kind: "perp" },
  { id: "POL/USDT", base: "POL", quote: "USDT", name: "Polygon", category: "crypto", tvSymbol: "BINANCE:POLUSDT", binance: "POLUSDT", yahoo: "POL-USD", okx: "POL-USDT", seedPrice: 0.42, seedChange: 0.88, seedVol: 150e6, kind: "perp" },

  { id: "BCH/USDT", base: "BCH", quote: "USDT", name: "Bitcoin Cash", category: "crypto", tvSymbol: "BINANCE:BCHUSDT", binance: "BCHUSDT", yahoo: "BCH-USD", okx: "BCH-USDT", seedPrice: 520, seedChange: 0, seedVol: 0, kind: "perp" },
  { id: "FIL/USDT", base: "FIL", quote: "USDT", name: "Filecoin", category: "crypto", tvSymbol: "BINANCE:FILUSDT", binance: "FILUSDT", yahoo: "FIL-USD", okx: "FIL-USDT", seedPrice: 4, seedChange: 0, seedVol: 0, kind: "perp" },
  { id: "ICP/USDT", base: "ICP", quote: "USDT", name: "Internet Computer", category: "crypto", tvSymbol: "BINANCE:ICPUSDT", binance: "ICPUSDT", yahoo: "ICP-USD", okx: "ICP-USDT", seedPrice: 8, seedChange: 0, seedVol: 0, kind: "perp" },
  { id: "AAVE/USDT", base: "AAVE", quote: "USDT", name: "Aave", category: "crypto", tvSymbol: "BINANCE:AAVEUSDT", binance: "AAVEUSDT", yahoo: "AAVE-USD", okx: "AAVE-USDT", seedPrice: 160, seedChange: 0, seedVol: 0, kind: "perp" },
  { id: "INJ/USDT", base: "INJ", quote: "USDT", name: "Injective", category: "crypto", tvSymbol: "BINANCE:INJUSDT", binance: "INJUSDT", yahoo: "INJ-USD", okx: "INJ-USDT", seedPrice: 20, seedChange: 0, seedVol: 0, kind: "perp" },
  { id: "SEI/USDT", base: "SEI", quote: "USDT", name: "Sei", category: "crypto", tvSymbol: "BINANCE:SEIUSDT", binance: "SEIUSDT", yahoo: "SEI-USD", okx: "SEI-USDT", seedPrice: 0.3, seedChange: 0, seedVol: 0, kind: "perp" },
  { id: "TIA/USDT", base: "TIA", quote: "USDT", name: "Celestia", category: "crypto", tvSymbol: "BINANCE:TIAUSDT", binance: "TIAUSDT", yahoo: "TIA-USD", okx: "TIA-USDT", seedPrice: 4, seedChange: 0, seedVol: 0, kind: "perp" },
  { id: "RENDER/USDT", base: "RENDER", quote: "USDT", name: "Render", category: "crypto", tvSymbol: "BINANCE:RENDERUSDT", binance: "RENDERUSDT", yahoo: "RENDER-USD", okx: "RENDER-USDT", seedPrice: 5, seedChange: 0, seedVol: 0, kind: "perp" },
  { id: "FET/USDT", base: "FET", quote: "USDT", name: "Artificial Superintelligence Alliance", category: "crypto", tvSymbol: "BINANCE:FETUSDT", binance: "FETUSDT", yahoo: "FET-USD", okx: "FET-USDT", seedPrice: 1, seedChange: 0, seedVol: 0, kind: "perp" },
  { id: "WLD/USDT", base: "WLD", quote: "USDT", name: "Worldcoin", category: "crypto", tvSymbol: "BINANCE:WLDUSDT", binance: "WLDUSDT", yahoo: "WLD-USD", okx: "WLD-USDT", seedPrice: 1.5, seedChange: 0, seedVol: 0, kind: "perp" },
  { id: "RUNE/USDT", base: "RUNE", quote: "USDT", name: "THORChain", category: "crypto", tvSymbol: "BINANCE:RUNEUSDT", binance: "RUNEUSDT", yahoo: "RUNE-USD", okx: "RUNE-USDT", seedPrice: 4, seedChange: 0, seedVol: 0, kind: "perp" },
  { id: "STX/USDT", base: "STX", quote: "USDT", name: "Stacks", category: "crypto", tvSymbol: "BINANCE:STXUSDT", binance: "STXUSDT", yahoo: "STX-USD", okx: "STX-USDT", seedPrice: 1.3, seedChange: 0, seedVol: 0, kind: "perp" },
  { id: "IMX/USDT", base: "IMX", quote: "USDT", name: "Immutable", category: "crypto", tvSymbol: "BINANCE:IMXUSDT", binance: "IMXUSDT", yahoo: "IMX-USD", okx: "IMX-USDT", seedPrice: 1.3, seedChange: 0, seedVol: 0, kind: "perp" },
  { id: "MKR/USDT", base: "MKR", quote: "USDT", name: "Maker", category: "crypto", tvSymbol: "BINANCE:MKRUSDT", binance: "MKRUSDT", yahoo: "MKR-USD", okx: "MKR-USDT", seedPrice: 1500, seedChange: 0, seedVol: 0, kind: "perp" },
  { id: "LDO/USDT", base: "LDO", quote: "USDT", name: "Lido DAO", category: "crypto", tvSymbol: "BINANCE:LDOUSDT", binance: "LDOUSDT", yahoo: "LDO-USD", okx: "LDO-USDT", seedPrice: 1.5, seedChange: 0, seedVol: 0, kind: "perp" },
  { id: "CRV/USDT", base: "CRV", quote: "USDT", name: "Curve DAO", category: "crypto", tvSymbol: "BINANCE:CRVUSDT", binance: "CRVUSDT", yahoo: "CRV-USD", okx: "CRV-USDT", seedPrice: 0.7, seedChange: 0, seedVol: 0, kind: "perp" },
  { id: "SAND/USDT", base: "SAND", quote: "USDT", name: "The Sandbox", category: "crypto", tvSymbol: "BINANCE:SANDUSDT", binance: "SANDUSDT", yahoo: "SAND-USD", okx: "SAND-USDT", seedPrice: 0.5, seedChange: 0, seedVol: 0, kind: "perp" },
  { id: "MANA/USDT", base: "MANA", quote: "USDT", name: "Decentraland", category: "crypto", tvSymbol: "BINANCE:MANAUSDT", binance: "MANAUSDT", yahoo: "MANA-USD", okx: "MANA-USDT", seedPrice: 0.4, seedChange: 0, seedVol: 0, kind: "perp" },
  { id: "AXS/USDT", base: "AXS", quote: "USDT", name: "Axie Infinity", category: "crypto", tvSymbol: "BINANCE:AXSUSDT", binance: "AXSUSDT", yahoo: "AXS-USD", okx: "AXS-USDT", seedPrice: 5, seedChange: 0, seedVol: 0, kind: "perp" },
  { id: "ENS/USDT", base: "ENS", quote: "USDT", name: "Ethereum Name Service", category: "crypto", tvSymbol: "BINANCE:ENSUSDT", binance: "ENSUSDT", yahoo: "ENS-USD", okx: "ENS-USDT", seedPrice: 21, seedChange: 0, seedVol: 0, kind: "perp" },
  { id: "GRT/USDT", base: "GRT", quote: "USDT", name: "The Graph", category: "crypto", tvSymbol: "BINANCE:GRTUSDT", binance: "GRTUSDT", yahoo: "GRT-USD", okx: "GRT-USDT", seedPrice: 0.2, seedChange: 0, seedVol: 0, kind: "perp" },
  { id: "JUP/USDT", base: "JUP", quote: "USDT", name: "Jupiter", category: "crypto", tvSymbol: "BINANCE:JUPUSDT", binance: "JUPUSDT", yahoo: "JUP-USD", okx: "JUP-USDT", seedPrice: 0.8, seedChange: 0, seedVol: 0, kind: "perp" },
  { id: "PYTH/USDT", base: "PYTH", quote: "USDT", name: "Pyth Network", category: "crypto", tvSymbol: "BINANCE:PYTHUSDT", binance: "PYTHUSDT", yahoo: "PYTH-USD", okx: "PYTH-USDT", seedPrice: 0.3, seedChange: 0, seedVol: 0, kind: "perp" },
  { id: "BONK/USDT", base: "BONK", quote: "USDT", name: "Bonk", category: "crypto", tvSymbol: "BINANCE:BONKUSDT", binance: "BONKUSDT", yahoo: "BONK-USD", okx: "BONK-USDT", seedPrice: 2e-05, seedChange: 0, seedVol: 0, kind: "perp" },
  { id: "FLOKI/USDT", base: "FLOKI", quote: "USDT", name: "Floki", category: "crypto", tvSymbol: "BINANCE:FLOKIUSDT", binance: "FLOKIUSDT", yahoo: "FLOKI-USD", okx: "FLOKI-USDT", seedPrice: 0.0001, seedChange: 0, seedVol: 0, kind: "perp" },
  { id: "1000SATS/USDT", base: "1000SATS", quote: "USDT", name: "Sats", category: "crypto", tvSymbol: "BINANCE:1000SATSUSDT", binance: "1000SATSUSDT", yahoo: "1000SATS-USD", okx: "1000SATS-USDT", seedPrice: 0.0003, seedChange: 0, seedVol: 0, kind: "perp" },
  { id: "ORDI/USDT", base: "ORDI", quote: "USDT", name: "Ordinals", category: "crypto", tvSymbol: "BINANCE:ORDIUSDT", binance: "ORDIUSDT", yahoo: "ORDI-USD", okx: "ORDI-USDT", seedPrice: 25, seedChange: 0, seedVol: 0, kind: "perp" },
  { id: "W/USDT", base: "W", quote: "USDT", name: "Wormhole", category: "crypto", tvSymbol: "BINANCE:WUSDT", binance: "WUSDT", yahoo: "W-USD", okx: "W-USDT", seedPrice: 0.3, seedChange: 0, seedVol: 0, kind: "perp" },
  { id: "ENA/USDT", base: "ENA", quote: "USDT", name: "Ethena", category: "crypto", tvSymbol: "BINANCE:ENAUSDT", binance: "ENAUSDT", yahoo: "ENA-USD", okx: "ENA-USDT", seedPrice: 0.5, seedChange: 0, seedVol: 0, kind: "perp" },
  { id: "PENDLE/USDT", base: "PENDLE", quote: "USDT", name: "Pendle", category: "crypto", tvSymbol: "BINANCE:PENDLEUSDT", binance: "PENDLEUSDT", yahoo: "PENDLE-USD", okx: "PENDLE-USDT", seedPrice: 4, seedChange: 0, seedVol: 0, kind: "perp" },
  { id: "AR/USDT", base: "AR", quote: "USDT", name: "Arweave", category: "crypto", tvSymbol: "BINANCE:ARUSDT", binance: "ARUSDT", yahoo: "AR-USD", okx: "AR-USDT", seedPrice: 15, seedChange: 0, seedVol: 0, kind: "perp" },
  { id: "ALGO/USDT", base: "ALGO", quote: "USDT", name: "Algorand", category: "crypto", tvSymbol: "BINANCE:ALGOUSDT", binance: "ALGOUSDT", yahoo: "ALGO-USD", okx: "ALGO-USDT", seedPrice: 0.2, seedChange: 0, seedVol: 0, kind: "perp" },
  { id: "HBAR/USDT", base: "HBAR", quote: "USDT", name: "Hedera", category: "crypto", tvSymbol: "BINANCE:HBARUSDT", binance: "HBARUSDT", yahoo: "HBAR-USD", okx: "HBAR-USDT", seedPrice: 0.1, seedChange: 0, seedVol: 0, kind: "perp" },
  { id: "VET/USDT", base: "VET", quote: "USDT", name: "VeChain", category: "crypto", tvSymbol: "BINANCE:VETUSDT", binance: "VETUSDT", yahoo: "VET-USD", okx: "VET-USDT", seedPrice: 0.03, seedChange: 0, seedVol: 0, kind: "perp" },
  { id: "XLM/USDT", base: "XLM", quote: "USDT", name: "Stellar", category: "crypto", tvSymbol: "BINANCE:XLMUSDT", binance: "XLMUSDT", yahoo: "XLM-USD", okx: "XLM-USDT", seedPrice: 0.13, seedChange: 0, seedVol: 0, kind: "perp" },
  { id: "EGLD/USDT", base: "EGLD", quote: "USDT", name: "MultiversX", category: "crypto", tvSymbol: "BINANCE:EGLDUSDT", binance: "EGLDUSDT", yahoo: "EGLD-USD", okx: "EGLD-USDT", seedPrice: 30, seedChange: 0, seedVol: 0, kind: "perp" },
  { id: "KAS/USDT", base: "KAS", quote: "USDT", name: "Kaspa", category: "crypto", tvSymbol: "BINANCE:KASUSDT", binance: "KASUSDT", yahoo: "KAS-USD", okx: "KAS-USDT", seedPrice: 0.12, seedChange: 0, seedVol: 0, kind: "perp" },
  { id: "IOTA/USDT", base: "IOTA", quote: "USDT", name: "IOTA", category: "crypto", tvSymbol: "BINANCE:IOTAUSDT", binance: "IOTAUSDT", yahoo: "IOTA-USD", okx: "IOTA-USDT", seedPrice: 0.2, seedChange: 0, seedVol: 0, kind: "perp" },
  { id: "THETA/USDT", base: "THETA", quote: "USDT", name: "Theta Network", category: "crypto", tvSymbol: "BINANCE:THETAUSDT", binance: "THETAUSDT", yahoo: "THETA-USD", okx: "THETA-USDT", seedPrice: 1.5, seedChange: 0, seedVol: 0, kind: "perp" },
  { id: "COMP/USDT", base: "COMP", quote: "USDT", name: "Compound", category: "crypto", tvSymbol: "BINANCE:COMPUSDT", binance: "COMPUSDT", yahoo: "COMP-USD", okx: "COMP-USDT", seedPrice: 50, seedChange: 0, seedVol: 0, kind: "perp" },
  { id: "SNX/USDT", base: "SNX", quote: "USDT", name: "Synthetix", category: "crypto", tvSymbol: "BINANCE:SNXUSDT", binance: "SNXUSDT", yahoo: "SNX-USD", okx: "SNX-USDT", seedPrice: 2, seedChange: 0, seedVol: 0, kind: "perp" },
  { id: "DYDX/USDT", base: "DYDX", quote: "USDT", name: "dYdX", category: "crypto", tvSymbol: "BINANCE:DYDXUSDT", binance: "DYDXUSDT", yahoo: "DYDX-USD", okx: "DYDX-USDT", seedPrice: 1, seedChange: 0, seedVol: 0, kind: "perp" },
  { id: "NEO/USDT", base: "NEO", quote: "USDT", name: "Neo", category: "crypto", tvSymbol: "BINANCE:NEOUSDT", binance: "NEOUSDT", yahoo: "NEO-USD", okx: "NEO-USDT", seedPrice: 12, seedChange: 0, seedVol: 0, kind: "perp" },
  { id: "KAVA/USDT", base: "KAVA", quote: "USDT", name: "Kava", category: "crypto", tvSymbol: "BINANCE:KAVAUSDT", binance: "KAVAUSDT", yahoo: "KAVA-USD", okx: "KAVA-USDT", seedPrice: 0.6, seedChange: 0, seedVol: 0, kind: "perp" },
  { id: "EOS/USDT", base: "EOS", quote: "USDT", name: "EOS", category: "crypto", tvSymbol: "BINANCE:EOSUSDT", binance: "EOSUSDT", yahoo: "EOS-USD", okx: "EOS-USDT", seedPrice: 0.8, seedChange: 0, seedVol: 0, kind: "perp" },
  { id: "APE/USDT", base: "APE", quote: "USDT", name: "ApeCoin", category: "crypto", tvSymbol: "BINANCE:APEUSDT", binance: "APEUSDT", yahoo: "APE-USD", okx: "APE-USDT", seedPrice: 1, seedChange: 0, seedVol: 0, kind: "perp" },
  { id: "CHZ/USDT", base: "CHZ", quote: "USDT", name: "Chiliz", category: "crypto", tvSymbol: "BINANCE:CHZUSDT", binance: "CHZUSDT", yahoo: "CHZ-USD", okx: "CHZ-USDT", seedPrice: 0.08, seedChange: 0, seedVol: 0, kind: "perp" },
  { id: "1INCH/USDT", base: "1INCH", quote: "USDT", name: "1inch", category: "crypto", tvSymbol: "BINANCE:1INCHUSDT", binance: "1INCHUSDT", yahoo: "1INCH-USD", okx: "1INCH-USDT", seedPrice: 0.4, seedChange: 0, seedVol: 0, kind: "perp" },
  { id: "ZIL/USDT", base: "ZIL", quote: "USDT", name: "Zilliqa", category: "crypto", tvSymbol: "BINANCE:ZILUSDT", binance: "ZILUSDT", yahoo: "ZIL-USD", okx: "ZIL-USDT", seedPrice: 0.02, seedChange: 0, seedVol: 0, kind: "perp" },
  { id: "ROSE/USDT", base: "ROSE", quote: "USDT", name: "Oasis Network", category: "crypto", tvSymbol: "BINANCE:ROSEUSDT", binance: "ROSEUSDT", yahoo: "ROSE-USD", okx: "ROSE-USDT", seedPrice: 0.07, seedChange: 0, seedVol: 0, kind: "perp" },
  { id: "QTUM/USDT", base: "QTUM", quote: "USDT", name: "Qtum", category: "crypto", tvSymbol: "BINANCE:QTUMUSDT", binance: "QTUMUSDT", yahoo: "QTUM-USD", okx: "QTUM-USDT", seedPrice: 3, seedChange: 0, seedVol: 0, kind: "perp" },
  { id: "ANKR/USDT", base: "ANKR", quote: "USDT", name: "Ankr", category: "crypto", tvSymbol: "BINANCE:ANKRUSDT", binance: "ANKRUSDT", yahoo: "ANKR-USD", okx: "ANKR-USDT", seedPrice: 0.03, seedChange: 0, seedVol: 0, kind: "perp" },
  { id: "MASK/USDT", base: "MASK", quote: "USDT", name: "Mask Network", category: "crypto", tvSymbol: "BINANCE:MASKUSDT", binance: "MASKUSDT", yahoo: "MASK-USD", okx: "MASK-USDT", seedPrice: 3, seedChange: 0, seedVol: 0, kind: "perp" },
  { id: "BLUR/USDT", base: "BLUR", quote: "USDT", name: "Blur", category: "crypto", tvSymbol: "BINANCE:BLURUSDT", binance: "BLURUSDT", yahoo: "BLUR-USD", okx: "BLUR-USDT", seedPrice: 0.2, seedChange: 0, seedVol: 0, kind: "perp" },
  { id: "YFI/USDT", base: "YFI", quote: "USDT", name: "yearn.finance", category: "crypto", tvSymbol: "BINANCE:YFIUSDT", binance: "YFIUSDT", yahoo: "YFI-USD", okx: "YFI-USDT", seedPrice: 6500, seedChange: 0, seedVol: 0, kind: "perp" },
  { id: "SUSHI/USDT", base: "SUSHI", quote: "USDT", name: "SushiSwap", category: "crypto", tvSymbol: "BINANCE:SUSHIUSDT", binance: "SUSHIUSDT", yahoo: "SUSHI-USD", okx: "SUSHI-USDT", seedPrice: 1, seedChange: 0, seedVol: 0, kind: "perp" },
  { id: "LRC/USDT", base: "LRC", quote: "USDT", name: "Loopring", category: "crypto", tvSymbol: "BINANCE:LRCUSDT", binance: "LRCUSDT", yahoo: "LRC-USD", okx: "LRC-USDT", seedPrice: 0.2, seedChange: 0, seedVol: 0, kind: "perp" },
  { id: "WOO/USDT", base: "WOO", quote: "USDT", name: "WOO", category: "crypto", tvSymbol: "BINANCE:WOOUSDT", binance: "WOOUSDT", yahoo: "WOO-USD", okx: "WOO-USDT", seedPrice: 0.2, seedChange: 0, seedVol: 0, kind: "perp" },
  { id: "BAT/USDT", base: "BAT", quote: "USDT", name: "Basic Attention Token", category: "crypto", tvSymbol: "BINANCE:BATUSDT", binance: "BATUSDT", yahoo: "BAT-USD", okx: "BAT-USDT", seedPrice: 0.2, seedChange: 0, seedVol: 0, kind: "perp" },
  { id: "DASH/USDT", base: "DASH", quote: "USDT", name: "Dash", category: "crypto", tvSymbol: "BINANCE:DASHUSDT", binance: "DASHUSDT", yahoo: "DASH-USD", okx: "DASH-USDT", seedPrice: 30, seedChange: 0, seedVol: 0, kind: "perp" },
  { id: "XTZ/USDT", base: "XTZ", quote: "USDT", name: "Tezos", category: "crypto", tvSymbol: "BINANCE:XTZUSDT", binance: "XTZUSDT", yahoo: "XTZ-USD", okx: "XTZ-USDT", seedPrice: 1, seedChange: 0, seedVol: 0, kind: "perp" },
  { id: "KSM/USDT", base: "KSM", quote: "USDT", name: "Kusama", category: "crypto", tvSymbol: "BINANCE:KSMUSDT", binance: "KSMUSDT", yahoo: "KSM-USD", okx: "KSM-USDT", seedPrice: 25, seedChange: 0, seedVol: 0, kind: "perp" },
  { id: "CELO/USDT", base: "CELO", quote: "USDT", name: "Celo", category: "crypto", tvSymbol: "BINANCE:CELOUSDT", binance: "CELOUSDT", yahoo: "CELO-USD", okx: "CELO-USDT", seedPrice: 0.6, seedChange: 0, seedVol: 0, kind: "perp" },
  { id: "MINA/USDT", base: "MINA", quote: "USDT", name: "Mina", category: "crypto", tvSymbol: "BINANCE:MINAUSDT", binance: "MINAUSDT", yahoo: "MINA-USD", okx: "MINA-USDT", seedPrice: 0.7, seedChange: 0, seedVol: 0, kind: "perp" },
  { id: "GMX/USDT", base: "GMX", quote: "USDT", name: "GMX", category: "crypto", tvSymbol: "BINANCE:GMXUSDT", binance: "GMXUSDT", yahoo: "GMX-USD", okx: "GMX-USDT", seedPrice: 25, seedChange: 0, seedVol: 0, kind: "perp" },
  { id: "CAKE/USDT", base: "CAKE", quote: "USDT", name: "PancakeSwap", category: "crypto", tvSymbol: "BINANCE:CAKEUSDT", binance: "CAKEUSDT", yahoo: "CAKE-USD", okx: "CAKE-USDT", seedPrice: 2.5, seedChange: 0, seedVol: 0, kind: "perp" },
  { id: "RAY/USDT", base: "RAY", quote: "USDT", name: "Raydium", category: "crypto", tvSymbol: "BINANCE:RAYUSDT", binance: "RAYUSDT", yahoo: "RAY-USD", okx: "RAY-USDT", seedPrice: 3, seedChange: 0, seedVol: 0, kind: "perp" },
  { id: "JTO/USDT", base: "JTO", quote: "USDT", name: "Jito", category: "crypto", tvSymbol: "BINANCE:JTOUSDT", binance: "JTOUSDT", yahoo: "JTO-USD", okx: "JTO-USDT", seedPrice: 2, seedChange: 0, seedVol: 0, kind: "perp" },
  { id: "ONDO/USDT", base: "ONDO", quote: "USDT", name: "Ondo", category: "crypto", tvSymbol: "BINANCE:ONDOUSDT", binance: "ONDOUSDT", yahoo: "ONDO-USD", okx: "ONDO-USDT", seedPrice: 1, seedChange: 0, seedVol: 0, kind: "perp" },
  { id: "NOT/USDT", base: "NOT", quote: "USDT", name: "Notcoin", category: "crypto", tvSymbol: "BINANCE:NOTUSDT", binance: "NOTUSDT", yahoo: "NOT-USD", okx: "NOT-USDT", seedPrice: 0.01, seedChange: 0, seedVol: 0, kind: "perp" },
  { id: "TURBO/USDT", base: "TURBO", quote: "USDT", name: "Turbo", category: "crypto", tvSymbol: "BINANCE:TURBOUSDT", binance: "TURBOUSDT", yahoo: "TURBO-USD", okx: "TURBO-USDT", seedPrice: 0.004, seedChange: 0, seedVol: 0, kind: "perp" },
  { id: "ETHFI/USDT", base: "ETHFI", quote: "USDT", name: "ether.fi", category: "crypto", tvSymbol: "BINANCE:ETHFIUSDT", binance: "ETHFIUSDT", yahoo: "ETHFI-USD", okx: "ETHFI-USDT", seedPrice: 2, seedChange: 0, seedVol: 0, kind: "perp" },
  { id: "STRK/USDT", base: "STRK", quote: "USDT", name: "Starknet", category: "crypto", tvSymbol: "BINANCE:STRKUSDT", binance: "STRKUSDT", yahoo: "STRK-USD", okx: "STRK-USDT", seedPrice: 0.5, seedChange: 0, seedVol: 0, kind: "perp" },
  { id: "ZK/USDT", base: "ZK", quote: "USDT", name: "ZKsync", category: "crypto", tvSymbol: "BINANCE:ZKUSDT", binance: "ZKUSDT", yahoo: "ZK-USD", okx: "ZK-USDT", seedPrice: 0.15, seedChange: 0, seedVol: 0, kind: "perp" },
  { id: "MEME/USDT", base: "MEME", quote: "USDT", name: "Memecoin", category: "crypto", tvSymbol: "BINANCE:MEMEUSDT", binance: "MEMEUSDT", yahoo: "MEME-USD", okx: "MEME-USDT", seedPrice: 0.02, seedChange: 0, seedVol: 0, kind: "perp" },
  { id: "BOME/USDT", base: "BOME", quote: "USDT", name: "BOOK OF MEME", category: "crypto", tvSymbol: "BINANCE:BOMEUSDT", binance: "BOMEUSDT", yahoo: "BOME-USD", okx: "BOME-USDT", seedPrice: 0.007, seedChange: 0, seedVol: 0, kind: "perp" },
  { id: "PEOPLE/USDT", base: "PEOPLE", quote: "USDT", name: "ConstitutionDAO", category: "crypto", tvSymbol: "BINANCE:PEOPLEUSDT", binance: "PEOPLEUSDT", yahoo: "PEOPLE-USD", okx: "PEOPLE-USDT", seedPrice: 0.05, seedChange: 0, seedVol: 0, kind: "perp" },
  { id: "CFX/USDT", base: "CFX", quote: "USDT", name: "Conflux", category: "crypto", tvSymbol: "BINANCE:CFXUSDT", binance: "CFXUSDT", yahoo: "CFX-USD", okx: "CFX-USDT", seedPrice: 0.15, seedChange: 0, seedVol: 0, kind: "perp" },
  { id: "FLOW/USDT", base: "FLOW", quote: "USDT", name: "Flow", category: "crypto", tvSymbol: "BINANCE:FLOWUSDT", binance: "FLOWUSDT", yahoo: "FLOW-USD", okx: "FLOW-USDT", seedPrice: 0.7, seedChange: 0, seedVol: 0, kind: "perp" },
  { id: "ACH/USDT", base: "ACH", quote: "USDT", name: "Alchemy Pay", category: "crypto", tvSymbol: "BINANCE:ACHUSDT", binance: "ACHUSDT", yahoo: "ACH-USD", okx: "ACH-USDT", seedPrice: 0.03, seedChange: 0, seedVol: 0, kind: "perp" },
  { id: "HOT/USDT", base: "HOT", quote: "USDT", name: "Holo", category: "crypto", tvSymbol: "BINANCE:HOTUSDT", binance: "HOTUSDT", yahoo: "HOT-USD", okx: "HOT-USDT", seedPrice: 0.002, seedChange: 0, seedVol: 0, kind: "perp" },
  { id: "IO/USDT", base: "IO", quote: "USDT", name: "io.net", category: "crypto", tvSymbol: "BINANCE:IOUSDT", binance: "IOUSDT", yahoo: "IO-USD", okx: "IO-USDT", seedPrice: 2, seedChange: 0, seedVol: 0, kind: "perp" },
  { id: "DOGS/USDT", base: "DOGS", quote: "USDT", name: "DOGS", category: "crypto", tvSymbol: "BINANCE:DOGSUSDT", binance: "DOGSUSDT", yahoo: "DOGS-USD", okx: "DOGS-USDT", seedPrice: 0.001, seedChange: 0, seedVol: 0, kind: "perp" },
  { id: "BTC/USDC", base: "BTC", quote: "USDC", name: "Bitcoin", category: "crypto", tvSymbol: "BINANCE:BTCUSDC", binance: "BTCUSDC", yahoo: "BTC-USD", okx: "BTC-USDC", seedPrice: 78117, seedChange: 0, seedVol: 0, kind: "perp" },
  { id: "ETH/USDC", base: "ETH", quote: "USDC", name: "Ethereum", category: "crypto", tvSymbol: "BINANCE:ETHUSDC", binance: "ETHUSDC", yahoo: "ETH-USD", okx: "ETH-USDC", seedPrice: 2473, seedChange: 0, seedVol: 0, kind: "perp" },
  { id: "SOL/USDC", base: "SOL", quote: "USDC", name: "Solana", category: "crypto", tvSymbol: "BINANCE:SOLUSDC", binance: "SOLUSDC", yahoo: "SOL-USD", okx: "SOL-USDC", seedPrice: 101.28, seedChange: 0, seedVol: 0, kind: "perp" },
  { id: "XRP/USDC", base: "XRP", quote: "USDC", name: "XRP", category: "crypto", tvSymbol: "BINANCE:XRPUSDC", binance: "XRPUSDC", yahoo: "XRP-USD", okx: "XRP-USDC", seedPrice: 0.6124, seedChange: 0, seedVol: 0, kind: "perp" },
  { id: "BNB/USDC", base: "BNB", quote: "USDC", name: "BNB", category: "crypto", tvSymbol: "BINANCE:BNBUSDC", binance: "BNBUSDC", yahoo: "BNB-USD", okx: "BNB-USDC", seedPrice: 612.4, seedChange: 0, seedVol: 0, kind: "perp" },
  { id: "DOGE/USDC", base: "DOGE", quote: "USDC", name: "Dogecoin", category: "crypto", tvSymbol: "BINANCE:DOGEUSDC", binance: "DOGEUSDC", yahoo: "DOGE-USD", okx: "DOGE-USDC", seedPrice: 0.14268, seedChange: 0, seedVol: 0, kind: "perp" },
  { id: "ADA/USDC", base: "ADA", quote: "USDC", name: "Cardano", category: "crypto", tvSymbol: "BINANCE:ADAUSDC", binance: "ADAUSDC", yahoo: "ADA-USD", okx: "ADA-USDC", seedPrice: 0.4521, seedChange: 0, seedVol: 0, kind: "perp" },
  { id: "AVAX/USDC", base: "AVAX", quote: "USDC", name: "Avalanche", category: "crypto", tvSymbol: "BINANCE:AVAXUSDC", binance: "AVAXUSDC", yahoo: "AVAX-USD", okx: "AVAX-USDC", seedPrice: 38.62, seedChange: 0, seedVol: 0, kind: "perp" },
  { id: "LINK/USDC", base: "LINK", quote: "USDC", name: "Chainlink", category: "crypto", tvSymbol: "BINANCE:LINKUSDC", binance: "LINKUSDC", yahoo: "LINK-USD", okx: "LINK-USDC", seedPrice: 14.86, seedChange: 0, seedVol: 0, kind: "perp" },
  { id: "SUI/USDC", base: "SUI", quote: "USDC", name: "Sui", category: "crypto", tvSymbol: "BINANCE:SUIUSDC", binance: "SUIUSDC", yahoo: "SUI-USD", okx: "SUI-USDC", seedPrice: 1.84, seedChange: 0, seedVol: 0, kind: "perp" },
  { id: "LTC/USDC", base: "LTC", quote: "USDC", name: "Litecoin", category: "crypto", tvSymbol: "BINANCE:LTCUSDC", binance: "LTCUSDC", yahoo: "LTC-USD", okx: "LTC-USDC", seedPrice: 84.2, seedChange: 0, seedVol: 0, kind: "perp" },
  { id: "TRX/USDC", base: "TRX", quote: "USDC", name: "TRON", category: "crypto", tvSymbol: "BINANCE:TRXUSDC", binance: "TRXUSDC", yahoo: "TRX-USD", okx: "TRX-USDC", seedPrice: 0.1624, seedChange: 0, seedVol: 0, kind: "perp" },
  { id: "DOT/USDC", base: "DOT", quote: "USDC", name: "Polkadot", category: "crypto", tvSymbol: "BINANCE:DOTUSDC", binance: "DOTUSDC", yahoo: "DOT-USD", okx: "DOT-USDC", seedPrice: 7.18, seedChange: 0, seedVol: 0, kind: "perp" },
  { id: "NEAR/USDC", base: "NEAR", quote: "USDC", name: "NEAR", category: "crypto", tvSymbol: "BINANCE:NEARUSDC", binance: "NEARUSDC", yahoo: "NEAR-USD", okx: "NEAR-USDC", seedPrice: 4.86, seedChange: 0, seedVol: 0, kind: "perp" },
  { id: "APT/USDC", base: "APT", quote: "USDC", name: "Aptos", category: "crypto", tvSymbol: "BINANCE:APTUSDC", binance: "APTUSDC", yahoo: "APT-USD", okx: "APT-USDC", seedPrice: 9.42, seedChange: 0, seedVol: 0, kind: "perp" },
  { id: "PEPE/USDC", base: "PEPE", quote: "USDC", name: "Pepe", category: "crypto", tvSymbol: "BINANCE:PEPEUSDC", binance: "PEPEUSDC", yahoo: "PEPE-USD", okx: "PEPE-USDC", seedPrice: 0.00000912, seedChange: 0, seedVol: 0, kind: "perp" },
  { id: "SHIB/USDC", base: "SHIB", quote: "USDC", name: "Shiba Inu", category: "crypto", tvSymbol: "BINANCE:SHIBUSDC", binance: "SHIBUSDC", yahoo: "SHIB-USD", okx: "SHIB-USDC", seedPrice: 0.0000184, seedChange: 0, seedVol: 0, kind: "perp" },
  { id: "UNI/USDC", base: "UNI", quote: "USDC", name: "Uniswap", category: "crypto", tvSymbol: "BINANCE:UNIUSDC", binance: "UNIUSDC", yahoo: "UNI-USD", okx: "UNI-USDC", seedPrice: 8.42, seedChange: 0, seedVol: 0, kind: "perp" },
  { id: "ARB/USDC", base: "ARB", quote: "USDC", name: "Arbitrum", category: "crypto", tvSymbol: "BINANCE:ARBUSDC", binance: "ARBUSDC", yahoo: "ARB-USD", okx: "ARB-USDC", seedPrice: 0.72, seedChange: 0, seedVol: 0, kind: "perp" },
  { id: "OP/USDC", base: "OP", quote: "USDC", name: "Optimism", category: "crypto", tvSymbol: "BINANCE:OPUSDC", binance: "OPUSDC", yahoo: "OP-USD", okx: "OP-USDC", seedPrice: 1.48, seedChange: 0, seedVol: 0, kind: "perp" },
  { id: "BCH/USDC", base: "BCH", quote: "USDC", name: "Bitcoin Cash", category: "crypto", tvSymbol: "BINANCE:BCHUSDC", binance: "BCHUSDC", yahoo: "BCH-USD", okx: "BCH-USDC", seedPrice: 520, seedChange: 0, seedVol: 0, kind: "perp" },
  { id: "ETC/USDC", base: "ETC", quote: "USDC", name: "Ethereum Classic", category: "crypto", tvSymbol: "BINANCE:ETCUSDC", binance: "ETCUSDC", yahoo: "ETC-USD", okx: "ETC-USDC", seedPrice: 22.18, seedChange: 0, seedVol: 0, kind: "perp" },
  { id: "ATOM/USDC", base: "ATOM", quote: "USDC", name: "Cosmos", category: "crypto", tvSymbol: "BINANCE:ATOMUSDC", binance: "ATOMUSDC", yahoo: "ATOM-USD", okx: "ATOM-USDC", seedPrice: 6.42, seedChange: 0, seedVol: 0, kind: "perp" },
  { id: "FIL/USDC", base: "FIL", quote: "USDC", name: "Filecoin", category: "crypto", tvSymbol: "BINANCE:FILUSDC", binance: "FILUSDC", yahoo: "FIL-USD", okx: "FIL-USDC", seedPrice: 4, seedChange: 0, seedVol: 0, kind: "perp" },
  { id: "AAVE/USDC", base: "AAVE", quote: "USDC", name: "Aave", category: "crypto", tvSymbol: "BINANCE:AAVEUSDC", binance: "AAVEUSDC", yahoo: "AAVE-USD", okx: "AAVE-USDC", seedPrice: 160, seedChange: 0, seedVol: 0, kind: "perp" },
  { id: "XLM/USDC", base: "XLM", quote: "USDC", name: "Stellar", category: "crypto", tvSymbol: "BINANCE:XLMUSDC", binance: "XLMUSDC", yahoo: "XLM-USD", okx: "XLM-USDC", seedPrice: 0.13, seedChange: 0, seedVol: 0, kind: "perp" },

  { id: "EUR/USD", base: "EUR", quote: "USD", name: "Euro", category: "forex", tvSymbol: "FX:EURUSD", yahoo: "EURUSD=X", binance: "EURUSDT", seedPrice: 1.1638, seedChange: 0, seedVol: 92e9, kind: "perp" },
  { id: "GBP/USD", base: "GBP", quote: "USD", name: "Pound", category: "forex", tvSymbol: "FX:GBPUSD", yahoo: "GBPUSD=X", seedPrice: 1.2734, seedChange: 0.22, seedVol: 61e9, kind: "perp" },
  { id: "USD/JPY", base: "USD", quote: "JPY", name: "Yen", category: "forex", tvSymbol: "FX:USDJPY", yahoo: "JPY=X", seedPrice: 149.82, seedChange: -0.14, seedVol: 78e9, kind: "perp" },
  { id: "AUD/USD", base: "AUD", quote: "USD", name: "Aussie", category: "forex", tvSymbol: "FX:AUDUSD", yahoo: "AUDUSD=X", seedPrice: 0.6621, seedChange: 0.31, seedVol: 28e9, kind: "perp" },
  { id: "USD/CHF", base: "USD", quote: "CHF", name: "Swissie", category: "forex", tvSymbol: "FX:USDCHF", yahoo: "CHF=X", seedPrice: 0.8642, seedChange: -0.08, seedVol: 22e9, kind: "perp" },
  { id: "USD/CAD", base: "USD", quote: "CAD", name: "Loonie", category: "forex", tvSymbol: "FX:USDCAD", yahoo: "CAD=X", seedPrice: 1.3618, seedChange: 0.11, seedVol: 26e9, kind: "perp" },
  { id: "NZD/USD", base: "NZD", quote: "USD", name: "Kiwi", category: "forex", tvSymbol: "FX:NZDUSD", yahoo: "NZDUSD=X", seedPrice: 0.6014, seedChange: 0.27, seedVol: 8.4e9, kind: "perp" },
  { id: "EUR/GBP", base: "EUR", quote: "GBP", name: "Euro/Pound", category: "forex", tvSymbol: "FX:EURGBP", yahoo: "EURGBP=X", seedPrice: 0.8526, seedChange: -0.05, seedVol: 12e9, kind: "perp" },
  { id: "EUR/JPY", base: "EUR", quote: "JPY", name: "Euro/Yen", category: "forex", tvSymbol: "FX:EURJPY", yahoo: "EURJPY=X", seedPrice: 162.48, seedChange: 0.16, seedVol: 18e9, kind: "perp" },
  { id: "GBP/JPY", base: "GBP", quote: "JPY", name: "Pound/Yen", category: "forex", tvSymbol: "FX:GBPJPY", yahoo: "GBPJPY=X", seedPrice: 190.72, seedChange: 0.21, seedVol: 14e9, kind: "perp" },

  { id: "XAU/USD", base: "XAU", quote: "USD", name: "Gold", category: "metals", tvSymbol: "OANDA:XAUUSD", yahoo: "GC=F", okx: "XAU-USDT-SWAP", seedPrice: 4401, seedChange: 0, seedVol: 18.4e9, kind: "perp" },
  { id: "XAG/USD", base: "XAG", quote: "USD", name: "Silver", category: "metals", tvSymbol: "OANDA:XAGUSD", yahoo: "SI=F", okx: "XAG-USDT-SWAP", seedPrice: 67.1, seedChange: 0, seedVol: 4.2e9, kind: "perp" },
  { id: "XPT/USD", base: "XPT", quote: "USD", name: "Platinum", category: "metals", tvSymbol: "OANDA:XPTUSD", yahoo: "PL=F", okx: "XPT-USDT-SWAP", seedPrice: 1875, seedChange: 0, seedVol: 1.1e9, kind: "perp" },
  { id: "XPD/USD", base: "XPD", quote: "USD", name: "Palladium", category: "metals", tvSymbol: "OANDA:XPDUSD", yahoo: "PA=F", okx: "XPD-USDT-SWAP", seedPrice: 1355, seedChange: 0, seedVol: 0.86e9, kind: "perp" },
  { id: "XCU/USD", base: "XCU", quote: "USD", name: "Copper", category: "metals", tvSymbol: "COMEX:HG1!", yahoo: "HG=F", seedPrice: 4.62, seedChange: 0.54, seedVol: 6.8e9, kind: "perp" },
  { id: "ALU/USD", base: "ALU", quote: "USD", name: "Aluminum", category: "metals", tvSymbol: "COMEX:ALI1!", yahoo: "ALI=F", seedPrice: 1.18, seedChange: 0.22, seedVol: 1.9e9, kind: "perp" },
  { id: "NI/USD", base: "NI", quote: "USD", name: "Nickel", category: "metals", tvSymbol: "COMEX:NI1!", yahoo: "NICKEL.L", seedPrice: 16.84, seedChange: -0.41, seedVol: 1.4e9, kind: "perp" },
  { id: "ZNC/USD", base: "ZNC", quote: "USD", name: "Zinc", category: "metals", tvSymbol: "COMEX:ZN1!", yahoo: "ZNC=F", seedPrice: 2.86, seedChange: 0.33, seedVol: 1.1e9, kind: "perp" },
  { id: "PB/USD", base: "PB", quote: "USD", name: "Lead", category: "metals", tvSymbol: "COMEX:PB1!", yahoo: "LEAD.L", seedPrice: 0.94, seedChange: -0.12, seedVol: 0.72e9, kind: "perp" },
  { id: "SN/USD", base: "SN", quote: "USD", name: "Tin", category: "metals", tvSymbol: "COMEX:SN1!", yahoo: "TIN.L", seedPrice: 31.2, seedChange: 0.47, seedVol: 0.54e9, kind: "perp" },
];

export const MARKET_MAP = Object.fromEntries(MARKETS.map((m) => [m.id, m])) as Record<string, Market>;

export function getMarket(id: string): Market {
  return MARKET_MAP[id] ?? MARKETS[0];
}

export const LEVERAGE_OPTIONS = [1, 2, 5, 10, 20, 25, 50, 75, 100] as const;

export const TIMEFRAMES = [
  { id: "5s", label: "5s" },
  { id: "15s", label: "15s" },
  { id: "1m", label: "1m" },
  { id: "15m", label: "15m" },
  { id: "1h", label: "1h" },
  { id: "4h", label: "4h" },
  { id: "1D", label: "1D" },
] as const;

export type PriceTick = {
  price: number;
  change: number;
  open: number;
  high: number;
  low: number;
  close: number;
  vol: number;
};

export function seedPrices(): Record<string, PriceTick> {
  const out: Record<string, PriceTick> = {};
  for (const m of MARKETS) {
    const change = m.seedChange;
    const price = m.seedPrice;
    const open = price / (1 + change / 100);
    const high = Math.max(price, open) * 1.0024;
    const low = Math.min(price, open) * 0.9976;
    out[m.id] = { price, change, open, high, low, close: price, vol: m.seedVol };
  }
  return out;
}

export function sparkPoints(symbol: string, changePct: number, n = 28): number[] {
  let h = 2166136261;
  for (const c of symbol) h = Math.imul(h ^ c.charCodeAt(0), 16777619);
  const rng = () => {
    h = Math.imul(h ^ (h >>> 13), 1274126177);
    return ((h >>> 0) % 10000) / 10000;
  };
  const pts: number[] = [];
  const target = 100 * (1 + changePct / 100);
  for (let i = 0; i < n; i++) {
    const t = i / (n - 1);
    const drift = 100 + (target - 100) * t;
    const wave = Math.sin(t * 6.2 + (h % 10)) * 1.15;
    const noise = (rng() - 0.5) * 1.8;
    pts.push(drift + wave + noise);
  }
  pts[n - 1] = target;
  return pts;
}

export const HOLDING_SEEDS: { symbol: string; amount: number; name: string }[] = [
  { symbol: "BTC", amount: 12450.3 / 68247.59, name: "Bitcoin" },
  { symbol: "ETH", amount: 6245.8 / 3512.41, name: "Ethereum" },
  { symbol: "SOL", amount: 3420.15 / 174.36, name: "Solana" },
];

export const COPY_TRADERS = [
  { id: "nova", name: "Nova Capital", handle: "novacap", initials: "NC", winRate: 78.4, pnl30: 24.62, roi7: 4.2, roi30: 24.62, roi90: 61.4, pnlUsd: 18420, mdd: 11.2, aum: 2.4e6, copiers: 12840, copiersMax: 20000, share: 10, pair: "BTC/USDT", pairs: ["BTC/USDT", "ETH/USDT"], leverage: 10, style: "BTC momentum", days: 412, board: "yield" as const },
  { id: "aether", name: "Aether Labs", handle: "aetherlabs", initials: "AL", winRate: 71.2, pnl30: 18.14, roi7: 2.8, roi30: 18.14, roi90: 44.1, pnlUsd: 9210, mdd: 14.8, aum: 1.1e6, copiers: 8421, copiersMax: 10000, share: 12, pair: "ETH/USDT", pairs: ["ETH/USDT", "SOL/USDT"], leverage: 8, style: "ETH + SOL swing", days: 288, board: "copierPnl" as const },
  { id: "helix", name: "Helix Quant", handle: "helixq", initials: "HQ", winRate: 82.1, pnl30: 31.08, roi7: 6.1, roi30: 31.08, roi90: 88.2, pnlUsd: 41200, mdd: 19.4, aum: 5.8e6, copiers: 21034, copiersMax: 25000, share: 8, pair: "SOL/USDT", pairs: ["SOL/USDT", "BTC/USDT"], leverage: 12, style: "High-freq SOL", days: 640, board: "yield" as const },
  { id: "aurora", name: "Aurora Desk", handle: "aurora", initials: "AD", winRate: 69.5, pnl30: 12.44, roi7: 1.9, roi30: 12.44, roi90: 29.6, pnlUsd: 6400, mdd: 9.1, aum: 890000, copiers: 5102, copiersMax: 8000, share: 10, pair: "XAU/USD", pairs: ["XAU/USD", "XAG/USD"], leverage: 20, style: "Metals macro", days: 190, board: "copiers" as const },
  { id: "vector", name: "Vector FX", handle: "vectorfx", initials: "VF", winRate: 66.8, pnl30: 9.72, roi7: 1.4, roi30: 9.72, roi90: 22.5, pnlUsd: 3180, mdd: 8.4, aum: 420000, copiers: 3890, copiersMax: 5000, share: 15, pair: "EUR/USD", pairs: ["EUR/USD", "GBP/USD"], leverage: 25, style: "FX mean-reversion", days: 155, board: "copiers" as const },
  { id: "orbit", name: "Orbit Yield", handle: "orbity", initials: "OY", winRate: 74.0, pnl30: 16.91, roi7: 3.3, roi30: 16.91, roi90: 39.8, pnlUsd: 11240, mdd: 12.0, aum: 1.7e6, copiers: 9733, copiersMax: 12000, share: 10, pair: "BTC/USDT", pairs: ["BTC/USDT"], leverage: 5, style: "Low-lev BTC trend", days: 501, board: "copierPnl" as const },
  { id: "sigma", name: "Sigma Perp", handle: "sigmaperp", initials: "SP", winRate: 64.2, pnl30: 42.1, roi7: 8.4, roi30: 42.1, roi90: 110.0, pnlUsd: 62800, mdd: 28.6, aum: 3.2e6, copiers: 15402, copiersMax: 18000, share: 12, pair: "BTC/USDT", pairs: ["BTC/USDT", "ETH/USDT", "SOL/USDT"], leverage: 20, style: "Aggressive perps", days: 97, board: "yield" as const },
  { id: "lumen", name: "Lumen Gold", handle: "lumeng", initials: "LG", winRate: 77.0, pnl30: 14.2, roi7: 2.1, roi30: 14.2, roi90: 33.4, pnlUsd: 8700, mdd: 7.5, aum: 2.0e6, copiers: 6201, copiersMax: 9000, share: 8, pair: "XAU/USD", pairs: ["XAU/USD"], leverage: 15, style: "Gold swings", days: 340, board: "copierPnl" as const },
] as const;

export type CopyTrader = (typeof COPY_TRADERS)[number];

